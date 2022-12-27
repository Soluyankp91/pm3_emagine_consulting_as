import { Injectable } from '@angular/core';
import { isEqual } from 'lodash';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { switchMap, debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { BaseContract } from 'src/app/contracts/shared/base/base-contract';
import { TableFiltersEnum } from 'src/app/contracts/shared/components/grid-table/master-templates/entities/master-templates.interfaces';
import {
	AgreementTemplateServiceProxy,
	AgreementTemplatesListItemDtoPaginatedList,
	CountryDto,
} from 'src/shared/service-proxies/service-proxies';

@Injectable()
export class MasterTemplatesService extends BaseContract<TableFiltersEnum> {
	constructor(private readonly agreementTemplateServiceProxy: AgreementTemplateServiceProxy) {
		super();
	}
    tableFilters$ = new BehaviorSubject<TableFiltersEnum>(<TableFiltersEnum>{
        
    })
	getContracts$(): Observable<AgreementTemplatesListItemDtoPaginatedList> {
		return combineLatest([
			this.getTableFilters$(),
			this.getSort$(),
			this.getPage$(),
			this.getTenats$(),
			this.getSearch$(),
		]).pipe(
			debounceTime(300),
			distinctUntilChanged((previous, current) => isEqual(previous, current)),
			tap(() => this.contractsLoading$.next(true)),
			switchMap(([tableFilters, sort, page, tenantIds, search]) => {
				const filters: any = Object.entries({
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
			tap(() => this.contractsLoading$.next(false))
		);
	}
}
