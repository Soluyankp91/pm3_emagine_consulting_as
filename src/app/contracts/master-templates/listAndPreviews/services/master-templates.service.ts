import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BaseContract } from 'src/app/contracts/shared/base/base-contract';
import { MasterFiltersEnum, TemplatePayload } from 'src/app/contracts/shared/entities/contracts.interfaces';
import { AgreementTemplateServiceProxy, EmployeeServiceProxy } from 'src/shared/service-proxies/service-proxies';
const TENANT_OPTION_KEY = 'ContractsTENANTS_1';
@Injectable()
export class MasterTemplatesService extends BaseContract {
	override tenantOptionKey: string = TENANT_OPTION_KEY;
	override tableFilters$ = new BehaviorSubject<MasterFiltersEnum>({
		language: [],
		id: [],
		agreementType: [],
		recipientTypeId: [],
		legalEntityIds: [],
		salesTypeIds: [],
		deliveryTypeIds: [],
		contractTypeIds: [],
		lastUpdatedByLowerCaseInitials: [],
		isEnabled: [],
	});

	constructor(
		private readonly _agreementTemplateServiceProxy: AgreementTemplateServiceProxy,
		protected readonly _employeeServiceProxy: EmployeeServiceProxy
	) {
		super(_employeeServiceProxy);
		this._preselectTenants();
	}

	override updateTenantFilter(data) {
		localStorage.setItem(this.tenantOptionKey, JSON.stringify(data.map((country) => country.id)));
		super.updateTenantFilter(data);
	}

	override sendPayload$([tableFilters, sort, page, tenantIds, search]: TemplatePayload<MasterFiltersEnum>) {
		return this._agreementTemplateServiceProxy.list2(
			false, //isClientTemplate
			tableFilters.id ? tableFilters.id[0] : undefined,
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
			tableFilters.isEnabled.map((item) => item.id as boolean),
			undefined,
			undefined,
			page.pageIndex + 1, //pageIndex
			page.pageSize, //pageSize,
			sort.direction.length ? sort.active + ' ' + sort.direction : ''
		);
	}
}
