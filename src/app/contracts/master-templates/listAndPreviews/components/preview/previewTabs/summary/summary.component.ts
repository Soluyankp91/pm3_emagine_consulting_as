import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { PREVIEW_LABEL_MAP } from 'src/app/contracts/shared/components/grid-table/master-templates/entities/master-templates.constants';
import { BaseMappedAgreementTemplatesListItemDto } from 'src/app/contracts/shared/entities/contracts.interfaces';
import { PreviewService } from '../../../../services/preview.service';

@Component({
	selector: 'app-summary',
	templateUrl: './summary.component.html',
	styleUrls: ['./summary.component.scss'],
})
export class SummaryComponent implements OnInit {
	summary$: Observable<BaseMappedAgreementTemplatesListItemDto>;
	loading$: Observable<boolean>;
	previewMap = PREVIEW_LABEL_MAP;

	constructor(private readonly _previewService: PreviewService, private readonly _router: Router) {}

	ngOnInit(): void {
		this.summary$ = this._previewService.summary$;
		this.loading$ = this._previewService.contentLoading$;
	}

	navigateToTemplate(templateId: number) {
		const url = this._router.serializeUrl(
			this._router.createUrlTree(['/app/contracts/master-templates'], { queryParams: { templateId } })
		);
		window.open(url, '_blank');
	}
}
