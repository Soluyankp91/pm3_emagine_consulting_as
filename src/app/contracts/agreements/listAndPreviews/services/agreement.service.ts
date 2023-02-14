import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { BaseContract } from 'src/app/contracts/shared/base/base-contract';
import { AgreementFiltersEnum, TemplatePayload } from 'src/app/contracts/shared/entities/contracts.interfaces';
import {
	AgreementListItemDtoPaginatedList,
	AgreementServiceProxy,
	EnumEntityTypeDto,
} from 'src/shared/service-proxies/service-proxies';

@Injectable()
export class AgreementService extends BaseContract {
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
            undefined,
			page.pageIndex,
			page.pageSize,
			sort.direction.length ? sort.active + ' ' + sort.direction : ''
		);
	}
}
