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
	selector: 'app-sales-types-filter',
	templateUrl: './sales-types-filter.component.html',
	styleUrls: ['sales-types-filter.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
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
