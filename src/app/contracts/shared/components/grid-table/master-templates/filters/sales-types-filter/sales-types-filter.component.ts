import { take, pluck } from 'rxjs/operators';
import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { IFilter } from 'src/app/contracts/shared/components/grid-table/mat-grid.interfaces';
import { ContractsService } from 'src/app/contracts/shared/services/contracts.service';
import { MasterTemplatesService } from 'src/app/contracts/master-templates/listAndPreviews/services/master-templates.service';

@Component({
    selector: 'app-sales-types-filter',
    templateUrl: './sales-types-filter.component.html',
})
export class SalesTypesFilterComponent implements IFilter {
    constructor(
        private contractsService: ContractsService,
        private masterTemplateService: MasterTemplatesService
    ) {
        this.masterTemplateService
            .getTableFilters$()
            .pipe(take(1), pluck(this.tableFilter))
            .subscribe((salesTypes) => {
                this.filterFormControl = new FormControl(salesTypes);
            });
    }

    salesTypes$ = this.contractsService.getSalesTypes$();
    filterFormControl: FormControl;
    private tableFilter = 'salesTypes';
}
