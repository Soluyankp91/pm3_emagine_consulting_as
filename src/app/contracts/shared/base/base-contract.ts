import { SortDirection } from '@angular/material/sort';
import { BehaviorSubject, combineLatest, Observable, ReplaySubject } from 'rxjs';
import { CountryDto } from 'src/shared/service-proxies/service-proxies';
import { switchMap, distinctUntilChanged, tap } from 'rxjs/operators';
import {
	DEFAULT_SIZE_OPTION,
	INITIAL_PAGE_INDEX,
} from '../components/grid-table/master-templates/entities/master-templates.constants';
import { isEqual } from 'lodash';
import { PageDto, SortDto, TemplatePayload } from '../entities/contracts.interfaces';
export abstract class BaseContract {
	abstract tableFilters$: BehaviorSubject<any>;
	abstract sendPayload$(templatePayload: TemplatePayload<any>): Observable<any>;

	contractsLoading$$: ReplaySubject<boolean> = new ReplaySubject<boolean>(1);

	private _page$$: BehaviorSubject<{ pageIndex: number; pageSize: number }> = new BehaviorSubject<PageDto>({
		pageIndex: INITIAL_PAGE_INDEX,
		pageSize: DEFAULT_SIZE_OPTION,
	});

	private reload$ = new BehaviorSubject(false);

	private _tenantIds$$ = new BehaviorSubject<CountryDto[]>([]);
	private _searchFilter$$ = new BehaviorSubject<string>('');

	private _sort$: BehaviorSubject<SortDto> = new BehaviorSubject({ active: '', direction: '' as SortDirection });

	getContracts$() {
		return combineLatest([
			this.getTableFilters$(),
			this.getSort$(),
			this.getPage$(),
			this.getTenants$(),
			this.getSearch$(),
			this.reload$,
		]).pipe(
			distinctUntilChanged((previous, current) => {
				console.log(previous, current);
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
		this.tableFilters$.next(data);
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
}
