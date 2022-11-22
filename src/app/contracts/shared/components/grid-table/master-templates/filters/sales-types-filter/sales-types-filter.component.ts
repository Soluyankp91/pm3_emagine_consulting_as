import { take, pluck } from 'rxjs/operators';
import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ContractsService } from 'src/app/contracts/contracts.service';
import { IFilter } from 'src/app/contracts/shared/components/grid-table/mat-grid.interfaces';
import { MasterTemplatesService } from 'src/app/contracts/components/master-templates/master-templates.service';

@Component({
    selector: 'app-sales-types-filter',
    templateUrl: './sales-types-filter.component.html',
    styleUrls: ['./sales-types-filter.component.scss'],
})
export class SalesTypesFilterComponent implements IFilter {
    constructor(
        private contractsService: ContractsService,
        private masterTemplateService: MasterTemplatesService
    ) {
        this.masterTemplateService
            .getTableFilters$()
            .pipe(take(1), pluck(this.tableFilter))
            .subscribe(salesTypes => {
                this.fc = new FormControl(salesTypes);
            });
    }

    salesTypes$ = this.contractsService.getSalesTypes$();
    fc: FormControl;
    private tableFilter = 'salesTypes';
}
