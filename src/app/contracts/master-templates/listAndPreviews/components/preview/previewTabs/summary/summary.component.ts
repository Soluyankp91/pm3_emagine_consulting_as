import { Component, OnInit, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { BasePreview } from 'src/app/contracts/shared/base/base-preview';
import { PREVIEW_LABEL_MAP } from 'src/app/contracts/shared/components/grid-table/master-templates/entities/master-templates.constants';
import {
	AgreementTemplate,
} from 'src/app/contracts/shared/entities/contracts.interfaces';
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

	navigateToTemplate(templateId: any, isDuplicate: boolean) {
        //need update on BackEnd
		return;
	}
}
