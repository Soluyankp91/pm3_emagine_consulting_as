import { Component, OnInit, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { BasePreview } from 'src/app/contracts/shared/base/base-preview';
import { PREVIEW_LABEL_MAP } from 'src/app/shared/components/grid-table/master-templates/entities/master-templates.constants';
import { AgreementTemplate } from 'src/app/contracts/shared/entities/contracts.interfaces';
import { PREVIEW_SERVICE_PROVIDER, PREVIEW_SERVICE_TOKEN } from 'src/app/contracts/shared/services/preview-factory';

@Component({
	selector: 'app-summary',
	templateUrl: './summary.component.html',
	styleUrls: ['./summary.component.scss'],
	providers: [PREVIEW_SERVICE_PROVIDER],
})
export class SummaryComponent implements OnInit {
	summary$: Observable<AgreementTemplate>;
	loading$: Observable<boolean>;
	previewMap = PREVIEW_LABEL_MAP;

	constructor(@Inject(PREVIEW_SERVICE_TOKEN) private readonly _previewService: BasePreview, private readonly _router: Router) {}

	ngOnInit(): void {
		this.summary$ = this._previewService.summary$;
		this.loading$ = this._previewService.contentLoading$;
	}

	navigateToDuplicatedTemplate(summaryItem: AgreementTemplate) {
		let url: string;
		if ('duplicationSourceAgreementId' in summaryItem) {
			url = this._router.serializeUrl(
				this._router.createUrlTree(['/app/contracts/agreements'], {
					queryParams: { agreementId: summaryItem.duplicationSourceAgreementId },
				})
			);
		}
		if ('duplicationSourceAgreementTemplateId' in summaryItem) {
			const currentUrl = this._router.url;
			const isMasterTemplates = currentUrl.includes('/master-templates');
			const isClientTemplates = currentUrl.includes('/client-specific-templates');
			let urlCommand: string;
			if (isMasterTemplates) {
				urlCommand = '/app/contracts/master-templates';
			}
			if (isClientTemplates) {
				urlCommand = '/app/contracts/client-specific-templates';
			}
			url = this._router.serializeUrl(
				this._router.createUrlTree([urlCommand], {
					queryParams: { templateId: summaryItem.duplicationSourceAgreementTemplateId },
				})
			);
		}
		window.open(url, '_blank');
	}

	navigateToParentTemplate(summaryItem: AgreementTemplate) {
		const currentUrl = this._router.url;
		const isAgreements = currentUrl.includes('/agreements');
		let urlCommand: string;
		if (isAgreements) {
			if (summaryItem.parentAgreementTemplateIsMasterTemplate) {
				urlCommand = '/app/contracts/master-templates';
			} else {
				urlCommand = '/app/contracts/client-specific-templates';
			}
		} else {
			urlCommand = '/app/contracts/master-templates';
		}
        const url = this._router.serializeUrl(
            this._router.createUrlTree([urlCommand], {
                queryParams: { templateId: summaryItem.parentAgreementTemplateId },
            })
        );
        window.open(url, '_blank');
	}
}
