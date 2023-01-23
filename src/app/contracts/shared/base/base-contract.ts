import { SortDirection } from '@angular/material/sort';
import { BehaviorSubject, combineLatest, Observable, ReplaySubject } from 'rxjs';
import { AgreementTemplatesListItemDtoPaginatedList, CountryDto } from 'src/shared/service-proxies/service-proxies';
import { switchMap, debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import {
	DEFAULT_SIZE_OPTION,
	INITIAL_PAGE_INDEX,
} from '../components/grid-table/master-templates/entities/master-templates.constants';
import { isEqual } from 'lodash';
import { PageDto, SortDto, MasterFiltersEnum, TemplatePayload, ClientFiltersEnum } from '../entities/contracts.interfaces';
export type IFilterEnum = MasterFiltersEnum | ClientFiltersEnum;
export abstract class BaseContract {
	abstract tableFilters$: BehaviorSubject<IFilterEnum>;
	abstract sendPayload$(templatePayload: TemplatePayload): Observable<AgreementTemplatesListItemDtoPaginatedList>;

	contractsLoading$$: ReplaySubject<boolean> = new ReplaySubject<boolean>(1);

	private _page$$: BehaviorSubject<{ pageIndex: number; pageSize: number }> = new BehaviorSubject<PageDto>({
		pageIndex: INITIAL_PAGE_INDEX,
		pageSize: DEFAULT_SIZE_OPTION,
	});

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
		]).pipe(
			distinctUntilChanged((previous, current) => isEqual(previous, current)),
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

	updateTableFilters(data: IFilterEnum) {
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

	setIdFilter(id: number[]) {
		this.tableFilters$.next({
			...this.tableFilters$.value,
			id,
		});
	}

	enabledToSend(enabled: number[]) {
		if (!enabled.length || enabled.length === 2) {
			return undefined;
		}
		if (enabled[0] === 1 || enabled[1] === 1) {
			return true;
		}
		return false;
	}
}
