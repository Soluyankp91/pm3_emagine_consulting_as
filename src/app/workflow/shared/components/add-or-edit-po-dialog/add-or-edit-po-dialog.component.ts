import { Component, EventEmitter, Inject, Injector, OnInit, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AppComponentBase } from 'src/shared/app-component-base';
import { PurchaseOrderForm } from './add-or-edit-po-dialog.model';

@Component({
	selector: 'app-add-or-edit-po-dialog',
	templateUrl: './add-or-edit-po-dialog.component.html',
	styleUrls: ['./add-or-edit-po-dialog.component.scss'],
})
export class AddOrEditPoDialogComponent extends AppComponentBase implements OnInit {
	@Output() onConfirmed: EventEmitter<any> = new EventEmitter<any>();
	@Output() onRejected: EventEmitter<any> = new EventEmitter<any>();
    purchaseOrderForm: PurchaseOrderForm;
	constructor(
		injector: Injector,
		@Inject(MAT_DIALOG_DATA)
		public data: {
			requestId: number;
			requestConsultantId: number;
		},
		private dialogRef: MatDialogRef<AddOrEditPoDialogComponent>
	) {
		super(injector);
        this.purchaseOrderForm = new PurchaseOrderForm();
	}

	ngOnInit(): void {}

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
}
