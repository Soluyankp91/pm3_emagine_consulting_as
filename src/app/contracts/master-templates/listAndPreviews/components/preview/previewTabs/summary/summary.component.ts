import { Component, OnInit, Input } from '@angular/core';
import { PREVIEW_LABEL_MAP } from 'src/app/contracts/shared/components/grid-table/master-templates/entities/master-templates.constants';
import { BaseMappedAgreementTemplatesListItemDto } from 'src/app/contracts/shared/entities/contracts.interfaces';

@Component({
	selector: 'app-summary',
	templateUrl: './summary.component.html',
	styleUrls: ['./summary.component.scss'],
})
export class SummaryComponent implements OnInit {
	@Input() summaryItem: BaseMappedAgreementTemplatesListItemDto;

	previewMap = PREVIEW_LABEL_MAP;

	constructor() {}

	ngOnInit(): void {}
}
