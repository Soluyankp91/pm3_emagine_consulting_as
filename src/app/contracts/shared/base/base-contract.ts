import { SortDirection } from '@angular/material/sort';
import { BehaviorSubject, combineLatest, EMPTY, Observable, ReplaySubject } from 'rxjs';
import { AgreementTemplatesListItemDtoPaginatedList, CountryDto } from 'src/shared/service-proxies/service-proxies';
import { switchMap, debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import {
	DEFAULT_SIZE_OPTION,
	INITIAL_PAGE_INDEX,
} from '../components/grid-table/master-templates/entities/master-templates.constants';
import { isEqual } from 'lodash';
import { PageDto, SortDto, TableFiltersEnum, TemplatePayload } from '../entities/contracts.interfaces';

export abstract class BaseContract {
	constructor() {}

	contractsLoading$: ReplaySubject<boolean> = new ReplaySubject<boolean>(1);

	abstract tableFilters$: BehaviorSubject<TableFiltersEnum>;
	abstract sendPayload$(templatePayload: TemplatePayload): Observable<AgreementTemplatesListItemDtoPaginatedList>;

	private page$: BehaviorSubject<{ pageIndex: number; pageSize: number }> = new BehaviorSubject<PageDto>({
		pageIndex: INITIAL_PAGE_INDEX,
		pageSize: DEFAULT_SIZE_OPTION,
	});

	private tenantIds$$ = new BehaviorSubject<CountryDto[]>([]);

	private searchFilter$$ = new BehaviorSubject<string>('');

	private sort$: BehaviorSubject<SortDto> = new BehaviorSubject({ active: '', direction: '' as SortDirection });

	getContracts$() {
		return combineLatest([
			this.getTableFilters$(),
			this.getSort$(),
			this.getPage$(),
			this.getTenants$(),
			this.getSearch$(),
		]).pipe(
			debounceTime(300),
			distinctUntilChanged((previous, current) => isEqual(previous, current)),
			tap(() => this.contractsLoading$.next(true)),
			switchMap((combined) => {
				return this.sendPayload$(combined);
			}),
			tap(() => this.contractsLoading$.next(false))
		);
	}

	getTenants$() {
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

	updateTableFilters(data: TableFiltersEnum) {
		this.tableFilters$.next(data);
	}

	updateTenantFilter(data: CountryDto[]) {
		this.tenantIds$$.next(data);
	}

	updateSearchFilter(data: string) {
		this.searchFilter$$.next(data);
	}

	updateSort(data: SortDto) {
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
