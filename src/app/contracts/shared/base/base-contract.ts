import { SortDirection } from '@angular/material/sort';
import { BehaviorSubject, Observable, ReplaySubject } from 'rxjs';
import { CountryDto } from 'src/shared/service-proxies/service-proxies';
import {
	DEFAULT_SIZE_OPTION,
	INITIAL_PAGE_INDEX,
} from '../components/grid-table/master-templates/entities/master-templates.constants';

export abstract class BaseContract<T> {
	contractsLoading$: ReplaySubject<boolean> = new ReplaySubject<boolean>(1);

	private page$: BehaviorSubject<{ pageIndex: number; pageSize: number }> = new BehaviorSubject<{
		pageIndex: number;
		pageSize: number;
	}>({ pageIndex: INITIAL_PAGE_INDEX, pageSize: DEFAULT_SIZE_OPTION });

	abstract tableFilters$: BehaviorSubject<T>;

	private tenantIds$$ = new BehaviorSubject<CountryDto[]>([]);
	private searchFilter$$ = new BehaviorSubject<string>('');

	private sort$: BehaviorSubject<{
		active: string;
		direction: SortDirection;
	}> = new BehaviorSubject({ active: '', direction: '' as SortDirection });

    abstract getContracts$(): Observable<any>;

	getTenats$() {
		return this.tenantIds$$.asObservable();
	}

	getTableFilters$() {
		return this.tableFilters$.asObservable();
	}

	getSort$() {
		return this.sort$.asObservable();
	}

	getPage$() {
		return this.page$.asObservable();
	}

    getSearch$() {
        return this.searchFilter$$.asObservable();
    }

	updateTableFilters(data: any) {
		this.tableFilters$.next(data);
	}

	updateTenantFilter(data: any) {
		this.tenantIds$$.next(data);
	}

	updateSearchFilter(data: any) {
		this.searchFilter$$.next(data);
	}

	updateSort(data: any) {
		this.sort$.next(data);
	}

	updatePage(page: { pageIndex: number; pageSize: number }) {
		this.page$.next(page);
	}


	_enabledToSend(enabled: number[]) {
		if (!enabled.length || enabled.length === 2) {
			return undefined;
		}
		if (enabled[0] === 1 || enabled[1] === 1) {
			return true;
		}
		return false;
	}
}
