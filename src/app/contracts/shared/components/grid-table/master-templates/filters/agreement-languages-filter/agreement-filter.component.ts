import { pluck, take } from 'rxjs/operators';
import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { IFilter } from 'src/app/contracts/shared/components/grid-table/mat-grid.interfaces';
import { ContractsService } from 'src/app/contracts/shared/services/contracts.service';
import {
	ITemplatesService,
	TEMPLATE_SERVICE_PROVIDER,
	TEMPLATE_SERVICE_TOKEN,
} from 'src/app/contracts/shared/services/template-service-factory';
import { AgreementService } from 'src/app/contracts/agreements/listAndPreviews/services/agreement.service';

@Component({
	selector: 'app-agreement-filter',
	styleUrls: ['./agreement-filter.component.scss'],
	templateUrl: './agreement-filter.component.html',
	providers: [TEMPLATE_SERVICE_PROVIDER],
    encapsulation: ViewEncapsulation.None
})
export class AgreementLanguagesFilterComponent implements IFilter {
	agreementLanguages$ = this.contractsService.getAgreementLanguages$();
	filterFormControl: FormControl;

	private _tableFilter = 'language';

	constructor(
		private readonly contractsService: ContractsService,
		@Inject(TEMPLATE_SERVICE_TOKEN) private _templatesService: ITemplatesService
	) {
        if(_templatesService instanceof AgreementService) {
            this._tableFilter = 'languageId'
        }
		this._templatesService
			.getTableFilters$()
			.pipe(take(1), pluck(this._tableFilter))
			.subscribe((agreementLanguages) => {
				this.filterFormControl = new FormControl(agreementLanguages);
			});
	}
}
