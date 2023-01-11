import { take, pluck } from 'rxjs/operators';
import { Component, Inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { IFilter } from 'src/app/contracts/shared/components/grid-table/mat-grid.interfaces';
import { ContractsService } from 'src/app/contracts/shared/services/contracts.service';
import { FILTER_LABEL_MAP } from '../../../entities/master-templates.constants';
import {
	ITemplatesService,
	TEMPLATE_SERVICE_PROVIDER,
	TEMPLATE_SERVICE_TOKEN,
} from 'src/app/contracts/shared/services/template-service-factory';

@Component({
	selector: 'app-employment-types-filter',
	templateUrl: './employment-types-filter.component.html',
	providers: [TEMPLATE_SERVICE_PROVIDER],
})
export class EmploymentTypesFilterComponent implements IFilter {
	employmentTypes$ = this.contractsService.getEmploymentTypes$();
	filterFormControl: FormControl;

	tableFilter = 'contractTypeIds';

	labelMap = FILTER_LABEL_MAP;

	constructor(
		private contractsService: ContractsService,
		@Inject(TEMPLATE_SERVICE_TOKEN) private _templatesService: ITemplatesService
	) {
		this._templatesService
			.getTableFilters$()
			.pipe(take(1), pluck(this.tableFilter))
			.subscribe((employmentTypes) => {
				this.filterFormControl = new FormControl(employmentTypes);
			});
	}
}
