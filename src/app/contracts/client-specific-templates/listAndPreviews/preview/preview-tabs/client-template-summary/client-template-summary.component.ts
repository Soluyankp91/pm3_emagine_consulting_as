import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { PreviewService } from 'src/app/contracts/master-templates/listAndPreviews/services/preview.service';
import { PREVIEW_LABEL_MAP } from 'src/app/contracts/shared/components/grid-table/master-templates/entities/master-templates.constants';
import { BaseMappedAgreementTemplatesListItemDto } from 'src/app/contracts/shared/entities/contracts.interfaces';

@Component({
	selector: 'app-client-template-summary',
	templateUrl: './client-template-summary.component.html',
	styleUrls: ['./client-template-summary.component.scss'],
})
export class ClientTemplateSummaryComponent implements OnInit {
	summary$: Observable<BaseMappedAgreementTemplatesListItemDto>;
	loading$: Observable<boolean>;
	previewMap = PREVIEW_LABEL_MAP;

	constructor(private readonly _previewService: PreviewService, private readonly _router: Router) {}

	ngOnInit(): void {
		this.summary$ = this._previewService.summary$;
		this.loading$ = this._previewService.contentLoading$;
	}

	navigateTemplate(templateId: number, isDuplicate: boolean) {
		let url: string;
		if (isDuplicate) {
			url = this._router.serializeUrl(
				this._router.createUrlTree(['/app/contracts/client-specific-templates'], { queryParams: { templateId } })
			);
		} else {
			url = this._router.serializeUrl(
				this._router.createUrlTree(['/app/contracts/master-templates'], { queryParams: { templateId } })
			);
		}
		window.open(url, '_blank');
	}
}
