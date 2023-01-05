import { take, pluck } from 'rxjs/operators';
import { Component, Inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { IFilter } from 'src/app/contracts/shared/components/grid-table/mat-grid.interfaces';
import { ContractsService } from 'src/app/contracts/shared/services/contracts.service';
import { FILTER_LABEL_MAP } from '../../entities/master-templates.constants';
import {
	ITemplatesService,
	TEMPLATE_SERVICE_PROVIDER,
	TEMPLATE_SERVICE_TOKEN,
} from 'src/app/contracts/shared/services/template-service-factory';

@Component({
	selector: 'app-sales-types-filter',
	templateUrl: './sales-types-filter.component.html',
	providers: [TEMPLATE_SERVICE_PROVIDER],
})
export class SalesTypesFilterComponent implements IFilter {
	salesTypes$ = this.contractsService.getSalesTypes$();
	filterFormControl: FormControl;

	tableFilter = 'salesTypeIds';

	labelMap = FILTER_LABEL_MAP;

	constructor(
		private contractsService: ContractsService,
		@Inject(TEMPLATE_SERVICE_TOKEN) private _templatesService: ITemplatesService
	) {
		this._templatesService
			.getTableFilters$()
			.pipe(take(1), pluck(this.tableFilter))
			.subscribe((salesTypes) => {
				this.filterFormControl = new FormControl(salesTypes);
			});
	}
}
