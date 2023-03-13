import { Component, EventEmitter, Inject, Injector, OnInit, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { forkJoin } from 'rxjs';
import { InternalLookupService } from 'src/app/shared/common/internal-lookup.service';
import { AppComponentBase } from 'src/shared/app-component-base';
import { EnumEntityTypeDto, PurchaseOrderCapDto, PurchaseOrderCapType, PurchaseOrderDto, PurchaseOrderServiceProxy } from 'src/shared/service-proxies/service-proxies';
import { EPOSource, POSources, PurchaseOrderForm } from './add-or-edit-po-dialog.model';

@Component({
	selector: 'app-add-or-edit-po-dialog',
	templateUrl: './add-or-edit-po-dialog.component.html',
	styleUrls: ['./add-or-edit-po-dialog.component.scss'],
})
export class AddOrEditPoDialogComponent extends AppComponentBase implements OnInit {
	@Output() onConfirmed: EventEmitter<PurchaseOrderDto> = new EventEmitter<PurchaseOrderDto>();
	@Output() onRejected: EventEmitter<any> = new EventEmitter<any>();
    purchaseOrderForm: PurchaseOrderForm;
    capTypes: { [key: string]: string; };
    currencies: EnumEntityTypeDto[];
    unitTypes: EnumEntityTypeDto[];
    poSources = POSources;
    ePOSource = EPOSource;
    ePOCaps = PurchaseOrderCapType;
    purchaseOrders: PurchaseOrderDto[];
	constructor(
		injector: Injector,
		@Inject(MAT_DIALOG_DATA)
		public data: {
			isEdit: boolean,
            clientPeriodId: string,
            directClientId?: number
		},
		private dialogRef: MatDialogRef<AddOrEditPoDialogComponent>,
        private readonly _internalLookupService: InternalLookupService,
        private readonly _purchaseOrderService: PurchaseOrderServiceProxy
	) {
		super(injector);
        this.purchaseOrderForm = new PurchaseOrderForm();
	}

	ngOnInit(): void {
        this._getPurchaseOrders();
        this._getEnums();
    }

	reject() {
		this.onRejected.emit();
		this.closeInternal();
	}

	confirm() {
        console.log(this.purchaseOrderForm.value);
        const form = this.purchaseOrderForm.value;
        let input = new PurchaseOrderDto();
        input.number = form.number;
        input.numberMissingButRequired = form.numberMissingButRequired;
        input.workflowsIdsReferencingThisPo = [];
        input.receiveDate = form.receiveDate;
        input.number = form.number;
        input.capForInvoicing = new PurchaseOrderCapDto(form.capForInvoicing);
        console.log(input);
        this._purchaseOrderService.purchaseOrderPOST(input).subscribe(result => {
            this.onConfirmed.emit(result);
            this.closeInternal();
        });

	}

	private closeInternal(): void {
		this.dialogRef.close();
	}

    private _getPurchaseOrders() {
        this._purchaseOrderService.getPurchaseOrdersAvailableForClientPeriod(this.data?.clientPeriodId, this.data?.directClientId)
            .subscribe(result => {
                this.purchaseOrders = result;
            });
    }

    private _getEnums() {
        forkJoin({
            capTypes: this._internalLookupService.getPurchaseOrderCapTypes(),
            currencies: this._internalLookupService.getCurrencies(),
            unitTypes: this._internalLookupService.getValueUnitTypes(),
        })
        .subscribe(result => {
            this.capTypes = result.capTypes;
            this.currencies = result.currencies;
            this.unitTypes = result.unitTypes;
        })
    }
}
