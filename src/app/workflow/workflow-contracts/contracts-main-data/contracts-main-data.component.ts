import { Component, Injector, Input, OnDestroy, OnInit } from '@angular/core';
import { InternalLookupService } from 'src/app/shared/common/internal-lookup.service';
import { AppComponentBase } from 'src/shared/app-component-base';
import { WorkflowDataService } from '../../workflow-data.service';
import { DeliveryTypes, SalesTypes, WorkflowContractsMainForm } from '../workflow-contracts.model';
import { forkJoin, Subject } from 'rxjs';
import { EnumEntityTypeDto } from 'src/shared/service-proxies/service-proxies';


@Component({
	selector: 'app-contracts-main-data',
	templateUrl: './contracts-main-data.component.html',
	styleUrls: ['../workflow-contracts.component.scss'],
})
export class ContractsMainDataComponent extends AppComponentBase implements OnInit, OnDestroy {
    @Input() readOnlyMode: boolean;
	contractsMainForm: WorkflowContractsMainForm;
    deliveryTypesEnum = DeliveryTypes;
	salesTypesEnum = SalesTypes;
    saleTypes: EnumEntityTypeDto[];
    deliveryTypes: EnumEntityTypeDto[];
    projectCategories: EnumEntityTypeDto[];
    projectTypes: EnumEntityTypeDto[];
    margins: EnumEntityTypeDto[];
    discounts: EnumEntityTypeDto[];
    private _unsubscribe = new Subject();
	constructor(
		injector: Injector,
		private _workflowDataService: WorkflowDataService,
		private _internalLookupService: InternalLookupService
	) {
		super(injector);
		this.contractsMainForm = new WorkflowContractsMainForm();
	}

	ngOnInit(): void {
        this._getEnums();
    }

    ngOnDestroy(): void {
        this._unsubscribe.next();
        this._unsubscribe.complete();
    }

    private _getEnums() {
        forkJoin({
            saleTypes: this._internalLookupService.getSaleTypes(),
            deliveryTypes: this._internalLookupService.getDeliveryTypes(),
            projectCategories: this._internalLookupService.getProjectCategory(),
            projectTypes: this._internalLookupService.getProjectTypes(),
            margins: this._internalLookupService.getMargins(),
            discounts: this._internalLookupService.getDiscounts()
        })
        .subscribe(result => {
            this.saleTypes = result.saleTypes;
            this.deliveryTypes = result.deliveryTypes;
            this.projectCategories = result.projectCategories;
            this.projectTypes = result.projectTypes;
            this.margins = result.margins;
            this.discounts = result.discounts;
        });
    }
}
