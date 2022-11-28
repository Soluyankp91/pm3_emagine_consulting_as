import { take, pluck } from 'rxjs/operators';
import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { IFilter } from 'src/app/contracts/shared/components/grid-table/mat-grid.interfaces';
import { ContractsService } from 'src/app/contracts/shared/services/contracts.service';
import { MasterTemplatesService } from 'src/app/contracts/master-templates/listAndPreviews/services/master-templates.service';

@Component({
    selector: 'app-employment-types-filter',
    templateUrl: './employment-types-filter.component.html',
})
export class EmploymentTypesFilterComponent implements IFilter {
    constructor(
        private contractsService: ContractsService,
        private masterTemplateService: MasterTemplatesService
    ) {
        this.masterTemplateService
            .getTableFilters$()
            .pipe(take(1), pluck(this.tableFilter))
            .subscribe((employmentTypes) => {
                this.filterFormControl = new FormControl(employmentTypes);
            });
    }

    employmentTypes$ = this.contractsService.getEmploymentTypes$();
    filterFormControl: FormControl;
    private tableFilter = 'employmentTypes';
}
