import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BaseContract } from 'src/app/contracts/shared/base/base-contract';
import { TableFiltersEnum, TemplatePayload } from 'src/app/contracts/shared/entities/contracts.interfaces';
import { AgreementTemplateServiceProxy } from 'src/shared/service-proxies/service-proxies';

@Injectable()
export class MasterTemplatesService extends BaseContract {
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

	override sendPayload$([tableFilters, sort, page, tenantIds, search]: TemplatePayload) {
		return this.agreementTemplateServiceProxy.list2(
			false, //isClientTemplate
			search, //search
			tenantIds.map((item) => item.id as number), // tenantId []
			tableFilters.legalEntityIds.map((item) => item.id as number), //legalEntities []
			'', // name
			[], // client id []
			tableFilters.language.map((item) => item.id as number), //  languages []
			tableFilters.agreementType.map((item) => item.id as number), // agreementTypes []
			tableFilters.recipientTypeId.map((item) => item.id as number), //recipientTypes [],
			tableFilters.contractTypeIds.map((item) => item.id as number), //contract types,
			tableFilters.salesTypeIds.map((item) => item.id as number),
			tableFilters.deliveryTypeIds.map((item) => item.id as number),
			tableFilters.lastUpdatedByLowerCaseInitials.map((item) => item.id as number),
			this._enabledToSend(tableFilters.isEnabled.map((item) => item.id as number)), //isEnabled,
			undefined,
			undefined,
			page.pageIndex + 1, //pageIndex
			page.pageSize, //pageSize,
			sort.direction.length ? sort.active + ' ' + sort.direction : ''
		);
	}
}
