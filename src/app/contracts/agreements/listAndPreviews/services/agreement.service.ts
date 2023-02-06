import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { BaseContract } from 'src/app/contracts/shared/base/base-contract';
import { AgreementFiltersEnum, TemplatePayload } from 'src/app/contracts/shared/entities/contracts.interfaces';
import { AgreementListItemDtoPaginatedList, AgreementServiceProxy } from 'src/shared/service-proxies/service-proxies';

@Injectable()
export class AgreementService extends BaseContract {
	override tableFilters$ = new BehaviorSubject<AgreementFiltersEnum>({
		language: [],
		id: [],
		//consultantName ???
		//companyName ???
		// legalEntityIds: [],
		agreementType: [],
		recipientTypeId: [],
		// salesTypeIds: EnumEntityTypeDto [],
		// deliveryTypesIds: EnumEntityTypeDto [],
		// contractTypeIds: EnumEntityTypeDto [],
		mode: [],
		status: [],
		saleManager: [],
		contractManager: [],
	});

	constructor(private readonly _agreementService: AgreementServiceProxy) {
		super();
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
			undefined, //legalEntities,
			undefined,
			tableFilters.agreementType.map((item) => item.id as number),
			tableFilters.recipientTypeId.map((item) => item.id as number),
			undefined, // salesTypes,
			undefined, // deliveryTypes
			undefined, // contractTypes
			tableFilters.mode.map((item) => item.id as number),
			tableFilters.status.map((item) => item.id as number),
			tableFilters.saleManager.map((saleManager) => saleManager.id as number),
			tableFilters.contractManager.map((contractManager) => contractManager.id as number),
			search,
			page.pageIndex,
			page.pageSize,
			sort.direction.length ? sort.active + ' ' + sort.direction : ''
		);
	}
}
