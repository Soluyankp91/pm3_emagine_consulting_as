import { Component, EventEmitter, Inject, Injector, OnInit, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { forkJoin } from 'rxjs';
import { InternalLookupService } from 'src/app/shared/common/internal-lookup.service';
import { AppComponentBase } from 'src/shared/app-component-base';
import { EnumEntityTypeDto } from 'src/shared/service-proxies/service-proxies';
import { EPOCaps, POSources, PurchaseOrderForm } from './add-or-edit-po-dialog.model';

@Component({
	selector: 'app-add-or-edit-po-dialog',
	templateUrl: './add-or-edit-po-dialog.component.html',
	styleUrls: ['./add-or-edit-po-dialog.component.scss'],
})
export class AddOrEditPoDialogComponent extends AppComponentBase implements OnInit {
	@Output() onConfirmed: EventEmitter<any> = new EventEmitter<any>();
	@Output() onRejected: EventEmitter<any> = new EventEmitter<any>();
    purchaseOrderForm: PurchaseOrderForm;
    capTypes: { [key: string]: string; };
    currencies: EnumEntityTypeDto[];
    unitTypes: EnumEntityTypeDto[];
    poSources = POSources;
    ePOCaps = EPOCaps;
	constructor(
		injector: Injector,
		@Inject(MAT_DIALOG_DATA)
		public data: {
			isEdit: boolean;
		},
		private dialogRef: MatDialogRef<AddOrEditPoDialogComponent>,
        private readonly _internalLookupService: InternalLookupService
	) {
		super(injector);
        this.purchaseOrderForm = new PurchaseOrderForm();
	}

	ngOnInit(): void {
        this._getEnums();
    }

	reject() {
		this.onRejected.emit();
		this.closeInternal();
	}

	confirm() {
        console.log(this.purchaseOrderForm.value);
		// let outputData = {

		// };
		// this.onConfirmed.emit(outputData);
		// this.closeInternal();
	}

	private closeInternal(): void {
		this.dialogRef.close();
	}

    private _getEnums() {
        forkJoin({
            capTypes: this._internalLookupService.getPurchaseOrderCapTypes(),
            currencies: this._internalLookupService.getCurrencies(),
            unitTypes: this._internalLookupService.getUnitTypes(),
        })
        .subscribe(result => {
            this.capTypes = result.capTypes;
            this.currencies = result.currencies;
            this.unitTypes = result.unitTypes;
        })
    }
}
