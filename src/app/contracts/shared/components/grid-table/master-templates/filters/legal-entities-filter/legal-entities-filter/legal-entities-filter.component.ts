import { take, pluck } from 'rxjs/operators';
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ContractsService } from 'src/app/contracts/contracts.service';
import { IFilter } from 'src/app/contracts/shared/components/grid-table/mat-grid.interfaces';
import { MasterTemplatesService } from 'src/app/contracts/components/master-templates/master-templates.service';

@Component({
    selector: 'app-legal-entities-filter',
    templateUrl: './legal-entities-filter.component.html',
    styleUrls: ['./legal-entities-filter.component.scss'],
})
export class LegalEntitiesFilterComponent implements IFilter {
    constructor(
        private contractsService: ContractsService,
        private masterTemplateService: MasterTemplatesService
    ) {
        this.masterTemplateService
            .getTableFilters$()
            .pipe(take(1), pluck(this.tableFilter))
            .subscribe(legalEntities => {
                this.fc = new FormControl(legalEntities);
            });
    }

    legalEntities$ = this.contractsService.getLegalEntities$();
    fc: FormControl;
    private tableFilter = 'legalEntities';
}
