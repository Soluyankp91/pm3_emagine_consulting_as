import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BasePreview } from 'src/app/contracts/shared/base/base-preview';
import { BaseMappedAgreementListItemDto, MappedTableCells } from 'src/app/contracts/shared/entities/contracts.interfaces';
import { ContractsService } from 'src/app/contracts/shared/services/contracts.service';
import { GetCountryCodeByLanguage } from 'src/shared/helpers/tenantHelper';
import {
	AgreementAttachmentServiceProxy,
	AgreementDetailsDto,
	AgreementLanguage,
	AgreementServiceProxy,
	AgreementType,
	EnumServiceProxy,
	LookupServiceProxy,
} from 'src/shared/service-proxies/service-proxies';

@Injectable()
export class AgreementPreviewService extends BasePreview {
	downloadAttachment = this._agreementAttachmentServiceProxy.agreementAttachment.bind(this._agreementAttachmentServiceProxy);
	entityGet = this._agreementServiceProxy.agreementGET.bind(this._agreementServiceProxy);
	entityMetadataLog = this._agreementServiceProxy.logs.bind(this._agreementServiceProxy);

	constructor(
		private readonly _agreementServiceProxy: AgreementServiceProxy,
		private readonly _agreementAttachmentServiceProxy: AgreementAttachmentServiceProxy,
		private readonly _lookupService: LookupServiceProxy,
		private readonly _enumService: EnumServiceProxy,
		protected readonly _contractService: ContractsService
	) {
		super(_contractService);
	}

	_mapEntityToSummary(row: AgreementDetailsDto, maps: MappedTableCells) {
		return <BaseMappedAgreementListItemDto>{
			agreementName: row.name,
			definition: row.definition,
			agreementStatus: row.agreementStatus,
			agreementType: maps.agreementType[row.agreementType as AgreementType],
			recipientTypeId: maps.recipientTypeId[row.recipientTypeId as number],
			actualRecipient$: this._actualRecipient$(row.recipientTypeId, row.recipientId),
			consultantName: row.consultantName,
			companyName: row.companyName,

			legalEntityId: maps.legalEntityIds[row.legalEntityId],
			saleManager: row.saleManager ? row.saleManager.name : row.saleManager,
			contractManager: row.contractManager ? row.contractManager.name : row.contractManager,
			salesTypeIds: row.salesTypeIds?.map((i) => maps.salesTypeIds[i]),
			deliveryTypeIds: row.deliveryTypeIds?.map((i) => maps.deliveryTypeIds[i]),
			contractTypeIds: row.contractTypeIds?.map((i) => maps.contractTypeIds[i]),
			language: AgreementLanguage[row.language as AgreementLanguage],
			countryCode: GetCountryCodeByLanguage(AgreementLanguage[row.language as AgreementLanguage]),
			note: row.note,

			agreementId: row.agreementId,
			createdDateUtc: moment(row.createdDateUtc).format('DD.MM.YYYY'),
			createdBy: row.createdBy?.name,
			lastUpdateDateUtc: moment(row.lastUpdateDateUtc).format('DD.MM.YYYY'),
			lastUpdatedBy: row.lastUpdatedBy?.name,
			startDate: moment(row.startDate).format('DD.MM.YYYY'),
			endDate: moment(row.endDate).format('DD.MM.YYYY'),
			validity: row.validity,
			duplicationSourceAgreementId: row.duplicationSourceAgreementId,
			duplicationSourceAgreementName: row.duplicationSourceAgreementName,

			parentAgreementTemplateId: row.parentAgreementTemplateId,
			parentAgreementTemplateName: row.parentAgreementTemplateName,
		};
	}

	private _actualRecipient$(recipientTypeId: number, recipientId: number) {
		switch (recipientTypeId) {
			case 1:
				return this._lookupService.suppliers(String(recipientId), 1).pipe(map((suppliers) => suppliers[0].supplierName));
			case 2:
				return this._lookupService.consultants(String(recipientId), 1).pipe(map((consultants) => consultants[0].name));
			case 3:
				return this._lookupService.clientsAll(String(recipientId), 1).pipe(map((clients) => clients[0].clientName));
			case 4:
				return this._enumService.legalEntities().pipe(
					map((legalEntities) => {
						return legalEntities.find((legalEntity) => legalEntity.id === recipientId).name;
					})
				);
		}
	}
}
