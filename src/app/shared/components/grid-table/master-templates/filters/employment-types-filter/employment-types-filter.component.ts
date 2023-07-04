import { take, pluck } from 'rxjs/operators';
import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ContractsService } from 'src/app/contracts/shared/services/contracts.service';
import {
	ITemplatesService,
	TEMPLATE_SERVICE_PROVIDER,
	TEMPLATE_SERVICE_TOKEN,
} from 'src/app/contracts/shared/services/template-service-factory';
import { FILTER_LABEL_MAP } from 'src/app/contracts/shared/entities/contracts.constants';
import { IFilter } from '../../../mat-grid.interfaces';

@Component({
	selector: 'app-employment-types-filter',
	templateUrl: './employment-types-filter.component.html',
	styleUrls: ['./employment-types-filter.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
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
