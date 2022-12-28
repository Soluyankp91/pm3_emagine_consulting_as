import { pluck, take } from 'rxjs/operators';
import { Component, Inject, Injector } from '@angular/core';
import { FormControl } from '@angular/forms';
import { IFilter } from 'src/app/contracts/shared/components/grid-table/mat-grid.interfaces';
import { ContractsService } from 'src/app/contracts/shared/services/contracts.service';
import { BaseContract } from 'src/app/contracts/shared/base/base-contract';
import { Router } from '@angular/router';
import { MasterTemplatesService } from 'src/app/contracts/master-templates/listAndPreviews/services/master-templates.service';
import { ClientTemplatesService } from 'src/app/contracts/client-specific-templates/listAndPreviews/service/client-templates.service';
import { BASE_CONTRACT, contractsInjector } from 'src/app/contracts/contracts.module';

@Component({
	selector: 'app-agreement-filter',
	styleUrls: ['./agreement-filter.component.scss'],
	templateUrl: './agreement-filter.component.html',
})
export class AgreementLanguagesFilterComponent implements IFilter {
	agreementLanguages$ = this.contractsService.getAgreementLanguages$();
	filterFormControl: FormControl;

	private tableFilter = 'language';

	constructor(
		private readonly contractsService: ContractsService,
		@Inject(BASE_CONTRACT) masterTemplateService: BaseContract
	) {
        console.log(masterTemplateService);
		masterTemplateService
			.getTableFilters$()
			.pipe(take(1), pluck(this.tableFilter))
			.subscribe((agreementLanguages) => {
				this.filterFormControl = new FormControl(agreementLanguages);
			});
	}
}
