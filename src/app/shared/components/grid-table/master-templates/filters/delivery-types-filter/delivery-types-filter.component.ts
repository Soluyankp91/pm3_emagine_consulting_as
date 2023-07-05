import { take, pluck } from 'rxjs/operators';
import { Component, Inject } from '@angular/core';
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
	selector: 'app-delivery-types-filter',
	templateUrl: './delivery-types-filter.component.html',
	styleUrls: ['./delivery-types-filter.component.scss'],
	providers: [TEMPLATE_SERVICE_PROVIDER],
})
export class DeliveryTypesFilterComponent implements IFilter {
	deliveryTypes$ = this.contractService.getDeliveryTypes$();
	filterFormControl: FormControl;

	labelMap = FILTER_LABEL_MAP;

	tableFilter = 'deliveryTypeIds';

	constructor(
		private contractService: ContractsService,
		@Inject(TEMPLATE_SERVICE_TOKEN) private _templatesService: ITemplatesService
	) {
		this._templatesService
			.getTableFilters$()
			.pipe(take(1), pluck(this.tableFilter))
			.subscribe((deliveryTypes) => {
				this.filterFormControl = new FormControl(deliveryTypes);
			});
	}
}
