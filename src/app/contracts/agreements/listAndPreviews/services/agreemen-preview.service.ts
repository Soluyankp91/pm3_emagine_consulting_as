import { Injectable } from '@angular/core';
import { BasePreview } from 'src/app/contracts/shared/base/base-preview';
import { MappedTableCells } from 'src/app/contracts/shared/entities/contracts.interfaces';
import { ContractsService } from 'src/app/contracts/shared/services/contracts.service';
import {
	AgreementAttachmentServiceProxy,
	AgreementServiceProxy,
	AgreementTemplateDetailsDto,
} from 'src/shared/service-proxies/service-proxies';

@Injectable()
export class AgreementPreviewService extends BasePreview {
	downloadAttachment = this._agreementAttachmentServiceProxy.agreementAttachment.bind(this._agreementAttachmentServiceProxy);
	entityGet = this._agreementServiceProxy.agreementGET.bind(this._agreementServiceProxy);
	entityMetadataLog = this._agreementServiceProxy.logs.bind(this._agreementServiceProxy);

	constructor(
		private readonly _agreementServiceProxy: AgreementServiceProxy,
		private readonly _agreementAttachmentServiceProxy: AgreementAttachmentServiceProxy,
		protected readonly _contractService: ContractsService
	) {
		super(_contractService);
	}

	_mapEntityToSummary(row: AgreementTemplateDetailsDto, maps: MappedTableCells) {}
}
