import { take, pluck } from 'rxjs/operators';
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { IFilter } from 'src/app/contracts/shared/components/grid-table/mat-grid.interfaces';
import { ContractsService } from 'src/app/contracts/shared/services/contracts.service';
import { MasterTemplatesService } from 'src/app/contracts/master-templates/listAndPreviews/services/master-templates.service';

@Component({
    selector: 'app-recipient-types-filter',
    templateUrl: './recipient-types-filter.component.html',
    styleUrls: ['./recipient-types-filter.component.scss'],
})
export class RecipientTypesFilterComponent implements IFilter {
    constructor(
        private contractsService: ContractsService,
        private masterTemplateService: MasterTemplatesService
    ) {
        this.masterTemplateService
            .getTableFilters$()
            .pipe(take(1), pluck(this.tableFilter))
            .subscribe((recipientTypes) => {
                this.filterFormControl = new FormControl(recipientTypes);
            });
    }
    recipientTypes$ = this.contractsService.getRecipientTypes$();
    filterFormControl: FormControl;
    private tableFilter = 'recipientTypes';
}
