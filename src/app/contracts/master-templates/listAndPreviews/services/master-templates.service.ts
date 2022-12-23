import { Injectable } from '@angular/core';
import { SortDirection } from '@angular/material/sort';
import { Observable, BehaviorSubject, combineLatest, EMPTY } from 'rxjs';
import { switchMap, debounceTime, tap } from 'rxjs/operators';
import {
	DEFAULT_SIZE_OPTION,
	INITIAL_PAGE_INDEX,
} from 'src/app/contracts/shared/components/grid-table/master-templates/entities/master-templates.constants';
import { TableFiltersEnum } from 'src/app/contracts/shared/components/grid-table/master-templates/entities/master-templates.interfaces';
import {
	AgreementTemplateServiceProxy,
	AgreementTemplatesListItemDtoPaginatedList,
	CountryDto,
} from 'src/shared/service-proxies/service-proxies';

@Injectable()
export class MasterTemplatesService {
	contractsLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	private contractsData$: Observable<any>;

	private page$: BehaviorSubject<{ pageIndex: number; pageSize: number }> = new BehaviorSubject<{
		pageIndex: number;
		pageSize: number;
	}>({
		pageIndex: INITIAL_PAGE_INDEX,
		pageSize: DEFAULT_SIZE_OPTION,
	});

	private tableFilters$ = new BehaviorSubject<TableFiltersEnum>({
		language: [],
		agreementType: [],
		recipientTypeId: [],
		legalEntityIds: [],
		salesTypeIds: [],
		deliveryTypeIds: [],
		contractTypeIds: [],
		lastUpdatedByLowerCaseInitials: [],
		isEnabled: [],
	});

	private tenantIds$$ = new BehaviorSubject<CountryDto[]>([]);
	private searchFilter$$ = new BehaviorSubject<string>('');

	private sort$: BehaviorSubject<{
		active: string;
		direction: SortDirection;
	}> = new BehaviorSubject({ active: '', direction: '' as SortDirection });

	getCountries$() {
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

	updateTableFilters(data: any) {
		this.tableFilters$.next(data);
	}

	updateCountryFilter(data: any) {
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

	constructor(private readonly agreementTemplateServiceProxy: AgreementTemplateServiceProxy) {
		this.contractsData$ = this.getContracts$();
	}

	getContracts$(): Observable<AgreementTemplatesListItemDtoPaginatedList> {
		return combineLatest([this.tableFilters$, this.sort$, this.page$, this.tenantIds$$, this.searchFilter$$]).pipe(
			debounceTime(300),
			switchMap(([tableFilters, sort, page, tenantIds, search]) => {
				const filters = Object.entries({
					...tableFilters,
					tenantIds,
				}).reduce((acc, current) => {
					acc[current[0]] = current[1].map((item) => item.id);
					return acc;
				}, {} as any);
                filters.isEnabled = this._enabledToSend(filters.isEnabled);
				return this.agreementTemplateServiceProxy.list2(
					false, //isClientTemplate
					search, //search
					filters.tenantIds, // tenantId []
					filters.legalEntityIds, //legalEntities []
					'', // name
					[], // client id []
					filters.language, //  languages []
					filters.agreementType, // agreementTypes []
					filters.recipientTypeId, //recipientTypes [],
					filters.contractTypeIds, //contract types,
					filters.salesTypeIds,
					filters.deliveryTypeIds,
					filters.lastUpdatedByLowerCaseInitials,
					filters.isEnabled, //isEnabled,
					undefined,
					undefined,
					page.pageIndex + 1, //pageIndex
					page.pageSize, //pageSize,
					sort.direction.length ? sort.active + ' ' + sort.direction : ''
				);
			}),
			tap(() => {
				this.contractsLoading$.next(true);
			})
		);
	}

    private _enabledToSend(enabled: number []) {
        if( !enabled.length || enabled.length === 2) {
            return undefined
        }
        if(enabled[0] === 1 || enabled[1] === 1) {
            return true;
        }
        return false
    }
}
