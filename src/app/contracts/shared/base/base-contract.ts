import { SortDirection } from '@angular/material/sort';
import { BehaviorSubject, combineLatest, Observable, ReplaySubject } from 'rxjs';
import { CountryDto, EmployeeServiceProxy } from 'src/shared/service-proxies/service-proxies';
import { switchMap, distinctUntilChanged, tap } from 'rxjs/operators';
import {
	DEFAULT_SIZE_OPTION,
	INITIAL_PAGE_INDEX,
} from '../../../shared/components/grid-table/master-templates/entities/master-templates.constants';
import { isEqual } from 'lodash';
import { PageDto, SortDto, TemplatePayload } from '../entities/contracts.interfaces';
import { MapTenantCountryCode, MapTenantNameFromId } from 'src/shared/helpers/tenantHelper';

export abstract class BaseContract {
	abstract tableFilters$: BehaviorSubject<any>;
	abstract sendPayload$(templatePayload: TemplatePayload<any>): Observable<any>;
	abstract tenantOptionKey: string;

	contractsLoading$$: ReplaySubject<boolean> = new ReplaySubject<boolean>(1);

	private _page$$: BehaviorSubject<{ pageIndex: number; pageSize: number }> = new BehaviorSubject<PageDto>({
		pageIndex: INITIAL_PAGE_INDEX,
		pageSize: DEFAULT_SIZE_OPTION,
	});

	private reload$ = new BehaviorSubject(false);

	private _tenantIds$$ = new BehaviorSubject<CountryDto[]>([]);
	private _searchFilter$$ = new BehaviorSubject<string>('');

	private _sort$: BehaviorSubject<SortDto> = new BehaviorSubject({ active: '', direction: '' as SortDirection });

	constructor(protected readonly _employeeServiceProxy: EmployeeServiceProxy) {}

	getContracts$(): Observable<any> {
		return combineLatest([
			this.getTableFilters$(),
			this.getSort$(),
			this.getPage$(),
			this.getTenants$(),
			this.getSearch$(),
			this.reload$,
		]).pipe(
			distinctUntilChanged((previous, current) => {
				return isEqual(previous, current);
			}),
			tap(() => this.contractsLoading$$.next(true)),
			switchMap((combined) => {
				return this.sendPayload$(combined);
			}),
			tap(() => this.contractsLoading$$.next(false))
		);
	}

	getTenants$() {
		return this._tenantIds$$.asObservable();
	}

	getTableFilters$() {
		return this.tableFilters$.asObservable();
	}

	getSort$() {
		return this._sort$.asObservable();
	}

	getPage$() {
		return this._page$$.asObservable();
	}

	getSearch$() {
		return this._searchFilter$$.asObservable();
	}

	updateTableFilters(data: any) {
		this.tableFilters$.next({ ...this.tableFilters$.value, ...data });
	}

	updateTenantFilter(data: CountryDto[]) {
		this._tenantIds$$.next(data);
	}

	updateSearchFilter(data: string) {
		this._searchFilter$$.next(data);
	}

	updateSort(data: SortDto) {
		this._sort$.next(data);
	}

	updatePage(page: { pageIndex: number; pageSize: number }) {
		this._page$$.next(page);
	}

	reloadTable() {
		this.reload$.next(!this.reload$.value);
	}

	setIdFilter(id: number[]) {
		this.tableFilters$.next({
			...this.tableFilters$.value,
			id,
		});
	}

	_preselectTenants() {
		const localStorageTenants = localStorage.getItem(this.tenantOptionKey);
		if (localStorageTenants) {
			this.updateTenantFilter(this.getCountryDtoFromIds(JSON.parse(localStorageTenants)));
		} else {
			this._employeeServiceProxy.current().subscribe(({ tenantId }) => {
				const name = MapTenantNameFromId(tenantId);
				this.updateTenantFilter([new CountryDto({ id: tenantId, name: name, code: MapTenantCountryCode(name) })]);
			});
		}
	}

	getCountryDtoFromIds(ids: number[]) {
		return ids.map((tenantId) => {
			const name = MapTenantNameFromId(tenantId);
			return new CountryDto({ id: tenantId, name: name, code: MapTenantCountryCode(name) });
		});
	}
}
