import { take, pluck } from 'rxjs/operators';
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ContractsService } from 'src/app/contracts/contracts.service';
import { IFilter } from 'src/app/contracts/shared/components/grid-table/mat-grid.interfaces';
import { MasterTemplatesService } from 'src/app/contracts/components/master-templates/master-templates.service';

@Component({
    selector: 'app-delivery-types-filter',
    templateUrl: './delivery-types-filter.component.html',
    styleUrls: ['./delivery-types-filter.component.scss'],
})
export class DeliveryTypesFilterComponent implements IFilter {
    constructor(
        private contractService: ContractsService,
        private masterTemplateService: MasterTemplatesService
    ) {
        this.masterTemplateService
            .getTableFilters$()
            .pipe(take(1), pluck(this.tableFilter))
            .subscribe((deliveryTypes) => {
                this.filterFormControl = new FormControl(deliveryTypes);
            });
    }

    deliveryTypes$ = this.contractService.getDeliveryTypes$();
    filterFormControl: FormControl;
    private tableFilter = 'deliveryTypes';
}
