import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';

export interface ErrorData {
	agreementTemplateId: number;
	templateName: string;
	overlappingLegalEntities: string[];
	overlappingSalesTypes: string[];
	overlappingDeliveryTypes: string[];
	overlappingContractTypes: string[];
}
@Component({
	selector: 'app-default-template',
	templateUrl: './default-template.component.html',
	styleUrls: ['./default-template.component.scss'],
})
export class DefaultTemplateComponent {
	tableData: ErrorData[] = [];
	displayedColumns: string[] = [
		'agreementTemplateId',
		'templateName',
		'overlappingLegalEntities',
		'overlappingSalesTypes',
		'overlappingDeliveryTypes',
		'overlappingContractTypes',
		'link',
	];

	constructor(
		@Inject(MAT_DIALOG_DATA) matDialogData: ErrorData[],
		private readonly _route: ActivatedRoute,
		private readonly _router: Router
	) {
		this.tableData = matDialogData;
	}

	navigateToTemplate(agreementTemplateId: number) {
		const currentUrl = this._router.url;
		const isMasterTemplates = currentUrl.includes('/master-templates');
		const isClientTemplates = currentUrl.includes('/client-specific-templates');
		if (isMasterTemplates) {
			const url = this._router.serializeUrl(
				this._router.createUrlTree(['/app/contracts/master-templates'], {
					queryParams: { templateId: agreementTemplateId },
				})
			);
			window.open(url, '_blank');
		}
		if (isClientTemplates) {
			const url = this._router.serializeUrl(
				this._router.createUrlTree(['/app/contracts/client-specific-templates'], {
					queryParams: { templateId: agreementTemplateId },
				})
			);
			window.open(url, '_blank');
		}
	}
}
