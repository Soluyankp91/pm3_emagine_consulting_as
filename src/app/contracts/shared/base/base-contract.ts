import { SortDirection } from '@angular/material/sort';
import { BehaviorSubject, Observable, ReplaySubject } from 'rxjs';
import { CountryDto } from 'src/shared/service-proxies/service-proxies';
import {
	DEFAULT_SIZE_OPTION,
	INITIAL_PAGE_INDEX,
} from '../components/grid-table/master-templates/entities/master-templates.constants';

export abstract class BaseContract<T> {
	contractsLoading$: ReplaySubject<boolean> = new ReplaySubject<boolean>(1);

	private _page$: BehaviorSubject<{ pageIndex: number; pageSize: number }> = new BehaviorSubject<{
		pageIndex: number;
		pageSize: number;
	}>({ pageIndex: INITIAL_PAGE_INDEX, pageSize: DEFAULT_SIZE_OPTION });

	abstract tableFilters$: BehaviorSubject<T>;

	private _tenantIds$$ = new BehaviorSubject<CountryDto[]>([]);
	private _searchFilter$$ = new BehaviorSubject<string>('');

	private _sort$: BehaviorSubject<{
		active: string;
		direction: SortDirection;
	}> = new BehaviorSubject({ active: '', direction: '' as SortDirection });

	abstract getContracts$(): Observable<any>;

	getTenats$() {
		return this._tenantIds$$.asObservable();
	}

	getTableFilters$() {
		return this.tableFilters$.asObservable();
	}

	getSort$() {
		return this._sort$.asObservable();
	}

	getPage$() {
		return this._page$.asObservable();
	}

	getSearch$() {
		return this._searchFilter$$.asObservable();
	}

	updateTableFilters(data: any) {
		this.tableFilters$.next(data);
	}

	updateTenantFilter(data: any) {
		this._tenantIds$$.next(data);
	}

	updateSearchFilter(data: any) {
		this._searchFilter$$.next(data);
	}

	updateSort(data: any) {
		this._sort$.next(data);
	}

	updatePage(page: { pageIndex: number; pageSize: number }) {
		this._page$.next(page);
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
