import { Injectable } from '@angular/core';
import { SortDirection } from '@angular/material/sort';
import { isEqual } from 'lodash';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { switchMap, debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { BaseContract } from 'src/app/contracts/shared/base/base-contract';
import { TableFiltersEnum } from 'src/app/contracts/shared/components/grid-table/master-templates/entities/master-templates.interfaces';
import {
	AgreementTemplateServiceProxy,
	CountryDto,
} from 'src/shared/service-proxies/service-proxies';

@Injectable()
export class ClientTemplatesService extends BaseContract {
	constructor(private readonly agreementTemplateServiceProxy: AgreementTemplateServiceProxy) {
		super();
	}
	override tableFilters$ = new BehaviorSubject<TableFiltersEnum>(<TableFiltersEnum>{
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
	override sendPayload$([tableFilters, sort, page, tenantIds, search]: [
		TableFiltersEnum,
		{
			active: string;
			direction: SortDirection;
		},
		{
			pageIndex: number;
			pageSize: number;
		},
		CountryDto[],
		string
	]) {
		const filters: any = Object.entries({
			...tableFilters,
			tenantIds,
		}).reduce((acc, current) => {
			acc[current[0]] = current[1].map((item) => item.id);
			return acc;
		}, {} as any);
		filters.isEnabled = this._enabledToSend(filters.isEnabled);
		return this.agreementTemplateServiceProxy.list2(
			true, //isClientTemplate
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
	}
}
