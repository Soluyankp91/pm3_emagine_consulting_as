import { pluck, take } from 'rxjs/operators';
import { Component, Inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { IFilter } from 'src/app/contracts/shared/components/grid-table/mat-grid.interfaces';
import { ContractsService } from 'src/app/contracts/shared/services/contracts.service';
import {
	ITemplatesService,
	TEMPLATE_SERVICE_PROVIDER,
	TEMPLATE_SERVICE_TOKEN,
} from 'src/app/contracts/shared/services/template-service-factory';

@Component({
	selector: 'app-agreement-filter',
	styleUrls: ['./agreement-filter.component.scss'],
	templateUrl: './agreement-filter.component.html',
	providers: [TEMPLATE_SERVICE_PROVIDER],
})
export class AgreementLanguagesFilterComponent implements IFilter {
	agreementLanguages$ = this.contractsService.getAgreementLanguages$();
	filterFormControl: FormControl;

	private tableFilter = 'language';

	constructor(
		private readonly contractsService: ContractsService,
		@Inject(TEMPLATE_SERVICE_TOKEN) private masterTemplateService: ITemplatesService
	) {
		masterTemplateService
			.getTableFilters$()
			.pipe(take(1), pluck(this.tableFilter))
			.subscribe((agreementLanguages) => {
				this.filterFormControl = new FormControl(agreementLanguages);
			});
	}
}
