import { take, pluck } from 'rxjs/operators';
import { Component, Inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { IFilter } from 'src/app/contracts/shared/components/grid-table/mat-grid.interfaces';
import { ContractsService } from 'src/app/contracts/shared/services/contracts.service';
import {
	ITemplatesService,
	TEMPLATE_SERVICE_PROVIDER,
	TEMPLATE_SERVICE_TOKEN,
} from 'src/app/contracts/shared/services/template-service-factory';
import { FILTER_LABEL_MAP } from 'src/app/contracts/shared/entities/contracts.constants';

@Component({
	selector: 'app-recipient-types-filter',
	templateUrl: './recipient-types-filter.component.html',
	styleUrls: ['./recipient-types-filter.component.scss'],
	providers: [TEMPLATE_SERVICE_PROVIDER],
})
export class RecipientTypesFilterComponent implements IFilter {
	recipientTypes$ = this.contractsService.getRecipientTypes$();
	filterFormControl: FormControl;

	labelMap = FILTER_LABEL_MAP;

	tableFilter = 'recipientTypeId';

	constructor(
		private contractsService: ContractsService,
		@Inject(TEMPLATE_SERVICE_TOKEN) private _templatesService: ITemplatesService
	) {
		this._templatesService
			.getTableFilters$()
			.pipe(take(1), pluck(this.tableFilter))
			.subscribe((recipientTypes) => {
				this.filterFormControl = new FormControl(recipientTypes);
			});
	}
}
