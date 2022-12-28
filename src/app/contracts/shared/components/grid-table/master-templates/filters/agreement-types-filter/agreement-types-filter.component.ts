import { take, pluck } from 'rxjs/operators';
import { Component, Inject, Injector } from '@angular/core';
import { FormControl } from '@angular/forms';
import { IFilter } from 'src/app/contracts/shared/components/grid-table/mat-grid.interfaces';
import { ContractsService } from 'src/app/contracts/shared/services/contracts.service';
import { MasterTemplatesService } from 'src/app/contracts/master-templates/listAndPreviews/services/master-templates.service';
import { FILTER_LABEL_MAP } from '../../entities/master-templates.constants';
import { Router } from '@angular/router';
import { BASE_CONTRACT, contractsInjector } from 'src/app/contracts/contracts.module';
import { ClientTemplatesService } from 'src/app/contracts/client-specific-templates/listAndPreviews/service/client-templates.service';
import { BaseContract } from 'src/app/contracts/shared/base/base-contract';

@Component({
    selector: 'app-agreement-types-filter',
    templateUrl: './agreement-types-filter.component.html',
})
export class AgreementTypesFilterComponent implements IFilter {
    agreementTypes$ = this.contractsService.getAgreementTypes$();
    filterFormControl: FormControl;

    labelMap = FILTER_LABEL_MAP;

    tableFilter = 'agreementType';

    constructor(
        private contractsService: ContractsService,
        @Inject(BASE_CONTRACT) masterTemplateService: BaseContract
    ) {
        masterTemplateService
            .getTableFilters$()
            .pipe(take(1),pluck(this.tableFilter))
            .subscribe((agreementTypes) => {
                this.filterFormControl = new FormControl(agreementTypes);
            });
    }
}
