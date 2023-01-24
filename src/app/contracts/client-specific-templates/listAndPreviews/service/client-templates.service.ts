import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BaseContract, IFilterEnum } from 'src/app/contracts/shared/base/base-contract';
import { ClientFiltersEnum, TemplatePayload } from 'src/app/contracts/shared/entities/contracts.interfaces';
import { AgreementTemplateServiceProxy } from 'src/shared/service-proxies/service-proxies';

@Injectable()
export class ClientTemplatesService extends BaseContract {
	constructor(private readonly _agreementTemplateServiceProxy: AgreementTemplateServiceProxy) {
		super();
	}

	override tableFilters$ = new BehaviorSubject<IFilterEnum>({
		language: [],
		id: [],
		agreementType: [],
		recipientTypeId: [],
		legalEntityIds: [],
		salesTypeIds: [],
		deliveryTypeIds: [],
		contractTypeIds: [],
		lastUpdatedByLowerCaseInitials: [],
		linkState: [],
		isEnabled: [],
	});

	override sendPayload$([tableFilters, sort, page, tenantIds, search]: TemplatePayload) {
		return this._agreementTemplateServiceProxy.list2(
			true, //isClientTemplate,
			undefined,
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
            undefined, // FIXME: commented out because of errors after proxies update //  this.enabledToSend(tableFilters.isEnabled.map((item) => item.id as number)),
			(tableFilters as ClientFiltersEnum).linkState.map((item) => item.id as number), //linkState
			undefined, //linkStateAccepted
			page.pageIndex + 1, //pageIndex
			page.pageSize, //pageSize,
			sort.direction.length ? sort.active + ' ' + sort.direction : ''
		);
	}
}
