import { take, pluck } from 'rxjs/operators';
import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { IFilter } from 'src/app/contracts/shared/components/grid-table/mat-grid.interfaces';
import { ContractsService } from 'src/app/contracts/shared/services/contracts.service';
import { MasterTemplatesService } from 'src/app/contracts/master-templates/listAndPreviews/services/master-templates.service';

@Component({
    selector: 'app-delivery-types-filter',
    templateUrl: './delivery-types-filter.component.html',
})
export class DeliveryTypesFilterComponent implements IFilter {
    deliveryTypes$ = this.contractService.getDeliveryTypes$();
    filterFormControl: FormControl;

    private tableFilter = 'deliveryTypeIds';

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
}
