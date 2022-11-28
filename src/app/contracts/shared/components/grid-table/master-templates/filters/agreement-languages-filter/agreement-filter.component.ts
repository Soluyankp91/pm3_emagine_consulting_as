import { pluck, take } from 'rxjs/operators';
import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { IFilter } from 'src/app/contracts/shared/components/grid-table/mat-grid.interfaces';
import { ContractsService } from 'src/app/contracts/shared/services/contracts.service';
import { MasterTemplatesService } from 'src/app/contracts/master-templates/listAndPreviews/services/master-templates.service';

@Component({
    selector: 'app-agreement-filter',
    templateUrl: './agreement-filter.component.html',
})
export class AgreementLanguagesFilterComponent implements IFilter {
    agreementLanguages$ = this.contractsService.getAgreementLanguages$();
    filterFormControl: FormControl;

    private tableFilter = 'agreementLanguages';

    constructor(
        private readonly contractsService: ContractsService,
        private readonly masterTemplatesService: MasterTemplatesService
    ) {
        this.masterTemplatesService
            .getTableFilters$()
            .pipe(take(1), pluck(this.tableFilter))
            .subscribe((agreementLanguages) => {
                this.filterFormControl = new FormControl(agreementLanguages);
            });
    }
}
