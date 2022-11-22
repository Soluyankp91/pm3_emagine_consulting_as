import { pluck, take } from 'rxjs/operators';
import { ContractsService } from '../../../../../../contracts.service';
import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { IFilter } from 'src/app/contracts/shared/components/grid-table/mat-grid.interfaces';
import { MasterTemplatesService } from 'src/app/contracts/components/master-templates/master-templates.service';

@Component({
    selector: 'app-agreement-filter',
    templateUrl: './agreement-filter.component.html',
    styleUrls: ['./agreement-filter.component.scss'],
})
export class AgreementLanguagesFilterComponent implements IFilter {
    agreementLanguages$ = this.contractsService.getAgreementLanguages$();
    fc: FormControl;

    private tableFilter = 'agreementLanguages';

    constructor(
        private readonly contractsService: ContractsService,
        private readonly masterTemplatesService: MasterTemplatesService
    ) {
        this.masterTemplatesService
            .getTableFilters$()
            .pipe(take(1), pluck(this.tableFilter))
            .subscribe(agreementLanguages => {
                this.fc = new FormControl(agreementLanguages);
            });
    }
}
