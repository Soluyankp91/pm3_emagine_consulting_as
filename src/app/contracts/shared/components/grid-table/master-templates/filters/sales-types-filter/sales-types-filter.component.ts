import { take, pluck } from 'rxjs/operators';
import { Component, Inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { IFilter } from 'src/app/contracts/shared/components/grid-table/mat-grid.interfaces';
import { ContractsService } from 'src/app/contracts/shared/services/contracts.service';
import { MasterTemplatesService } from 'src/app/contracts/master-templates/listAndPreviews/services/master-templates.service';
import { Router } from '@angular/router';
import {  BASE_CONTRACT, contractsInjector } from 'src/app/contracts/contracts.module';
import { BaseContract } from 'src/app/contracts/shared/base/base-contract';
import { ClientTemplatesService } from 'src/app/contracts/client-specific-templates/listAndPreviews/service/client-templates.service';

@Component({
	selector: 'app-sales-types-filter',
	templateUrl: './sales-types-filter.component.html',
})
export class SalesTypesFilterComponent implements IFilter {
	salesTypes$ = this.contractsService.getSalesTypes$();
	filterFormControl: FormControl;

	private tableFilter = 'salesTypeIds';

	constructor(private contractsService: ContractsService, @Inject(BASE_CONTRACT) masterTemplateService: BaseContract) {
		masterTemplateService
			.getTableFilters$()
			.pipe(take(1), pluck(this.tableFilter))
			.subscribe((salesTypes) => {
				this.filterFormControl = new FormControl(salesTypes);
			});
	}
}
