import { take, pluck } from 'rxjs/operators';
import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { IFilter } from 'src/app/contracts/shared/components/grid-table/mat-grid.interfaces';
import { ContractsService } from 'src/app/contracts/shared/services/contracts.service';
import { MasterTemplatesService } from 'src/app/contracts/master-templates/listAndPreviews/services/master-templates.service';

@Component({
    selector: 'app-agreement-types-filter',
    templateUrl: './agreement-types-filter.component.html',
    styleUrls: ['./agreement-types-filter.component.scss'],
})
export class AgreementTypesFilterComponent implements IFilter {
    constructor(
        private contractsService: ContractsService,
        private masterTemplateService: MasterTemplatesService
    ) {
        this.masterTemplateService
            .getTableFilters$()
            .pipe(take(1), pluck(this.tableFilter))
            .subscribe((agreementTypes) => {
                this.filterFormControl = new FormControl(agreementTypes);
            });
    }

    agreementTypes$ = this.contractsService.getAgreementTypes$();
    filterFormControl: FormControl;
    private tableFilter = 'agreementTypes';
}
