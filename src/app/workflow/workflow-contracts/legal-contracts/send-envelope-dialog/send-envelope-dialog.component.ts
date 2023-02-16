import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
	selector: 'app-send-envelope-dialog',
	templateUrl: './send-envelope-dialog.component.html',
	styleUrls: ['./send-envelope-dialog.component.scss'],
})
export class SendEnvelopeDialogComponent implements OnInit {
	@Output() onConfirmed: EventEmitter<any> = new EventEmitter<any>();
	@Output() onRejected: EventEmitter<any> = new EventEmitter<any>();
    singleEmail = new UntypedFormControl(false);
	constructor(
		@Inject(MAT_DIALOG_DATA)
		public data: {
			disableSendAllButton: boolean
		},
		private _dialogRef: MatDialogRef<SendEnvelopeDialogComponent>
	) {}

	ngOnInit(): void {}

	reject() {
		this.onRejected.emit();
		this._closeInternal();
	}

	confirm() {
		this.onConfirmed.emit(this.singleEmail.value);
		this._closeInternal();
	}

	private _closeInternal(): void {
		this._dialogRef.close();
	}
}
