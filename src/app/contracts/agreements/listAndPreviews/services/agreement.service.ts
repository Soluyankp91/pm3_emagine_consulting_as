import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { BaseContract } from 'src/app/contracts/shared/base/base-contract';
import { AgreementFiltersEnum, TemplatePayload } from 'src/app/contracts/shared/entities/contracts.interfaces';
import {
	AgreementListItemDtoPaginatedList,
	AgreementServiceProxy,
	EmployeeServiceProxy,
} from 'src/shared/service-proxies/service-proxies';

const TENANT_OPTION_KEY = 'ContractsTENANTS_3';

@Injectable()
export class AgreementService extends BaseContract {
	override tenantOptionKey: string = TENANT_OPTION_KEY;
	override tableFilters$ = new BehaviorSubject<AgreementFiltersEnum>({
		language: [],
		id: [],
		legalEntityId: [],
		agreementType: [],
		recipientTypeId: [],
		salesTypeIds: [],
		deliveryTypeIds: [],
		contractTypeIds: [],
		mode: [],
		status: [],
		saleManager: [],
		contractManager: [],
	});

	constructor(
		private readonly _agreementService: AgreementServiceProxy,
		protected readonly _employeeServiceProxy: EmployeeServiceProxy
	) {
		super(_employeeServiceProxy);
		this._preselectTenants();
	}

	override updateTenantFilter(data) {
		localStorage.setItem(this.tenantOptionKey, JSON.stringify(data.map((country) => country.id)));
		super.updateTenantFilter(data);
	}

	override sendPayload$([
		tableFilters,
		sort,
		page,
		tenantIds,
		search,
	]: TemplatePayload<AgreementFiltersEnum>): Observable<AgreementListItemDtoPaginatedList> {
		return this._agreementService.list(
			tableFilters.id[0], //agreementId
			undefined, //agreement name
			tableFilters.language.map((item) => item.id as number),
			undefined, //clientName
			undefined, //consultantName
			undefined, //companyName
			undefined, //actualRecipientName
			tableFilters.legalEntityId.map((item) => item.id), //legalEntities
			undefined, //tenantIds
			tableFilters.agreementType.map((item) => item.id as number),
			tableFilters.recipientTypeId.map((item) => item.id as number),
			tableFilters.salesTypeIds.map((item) => item.id as number), // salesTypes,
			tableFilters.deliveryTypeIds.map((item) => item.id as number), // deliveryTypes
			tableFilters.contractTypeIds.map((item) => item.id as number), // contractTypes
			tableFilters.mode.map((item) => item.id as number),
			tableFilters.status.map((item) => item.id as number),
			tableFilters.saleManager.map((saleManager) => saleManager.id as number),
			tableFilters.contractManager.map((contractManager) => contractManager.id as number),
			search,
			undefined, //isWorkflowRelated
			undefined, //envelopeProcessingPath
			page.pageIndex + 1,
			page.pageSize,
			sort.direction.length ? sort.active + ' ' + sort.direction : ''
		);
	}
}
