import { Component, OnInit, ViewEncapsulation, Input, Output, EventEmitter } from '@angular/core';
import { BaseMappedAgreementTemplatesListItemDto } from 'src/app/contracts/shared/entities/contracts.interfaces';
import {
	AgreementTemplateDetailsAttachmentDto,
	AgreementTemplateMetadataLogListItemDto,
} from 'src/shared/service-proxies/service-proxies';

@Component({
	selector: 'app-preview-tabs',
	templateUrl: './preview.component.html',
	styleUrls: ['./preview.component.scss'],
	encapsulation: ViewEncapsulation.None,
})
export class PreviewTabsComponent implements OnInit {
	@Input() summaryItem: BaseMappedAgreementTemplatesListItemDto;
	@Input() attachments: AgreementTemplateDetailsAttachmentDto[];
	@Input() logs: AgreementTemplateMetadataLogListItemDto[];
	@Output() closePanel = new EventEmitter();
	@Output() logFilterEmitter = new EventEmitter<boolean>();

	constructor() {}

	ngOnInit(): void {}
}
