import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { WFDocument } from 'src/app/workflow/shared/components/wf-documents/wf-documents.model';
import { SendEnvelopeDialogComponent } from '../send-envelope-dialog/send-envelope-dialog.component';
import { ERemoveOrOuploadDialogMode, RemoveOrUploadDialogConfig } from './remove-or-upload-agrement-dialog.model';

@Component({
	selector: 'app-remove-or-upload-agrement-dialog',
	templateUrl: './remove-or-upload-agrement-dialog.component.html',
	styleUrls: ['./remove-or-upload-agrement-dialog.component.scss'],
})
export class RemoveOrUploadAgrementDialogComponent implements OnInit {
	@Output() onConfirmed: EventEmitter<any> = new EventEmitter<any>();
	@Output() onRejected: EventEmitter<any> = new EventEmitter<any>();
    reasonForChange = new FormControl<string>('');
    dialogConfig = RemoveOrUploadDialogConfig[this.data.dialogMode]
    icon: string;
	constructor(
		@Inject(MAT_DIALOG_DATA)
		public data: {
			dialogMode: ERemoveOrOuploadDialogMode,
            file?: File
		},
		private _dialogRef: MatDialogRef<SendEnvelopeDialogComponent>
	) {}

	ngOnInit(): void {
        if (this.data?.file) {
            this.icon = WFDocument.getIcon(this.data.file.name)
        }
    }

	reject() {
		this.onRejected.emit();
		this._closeInternal();
	}

	confirm() {
		this.onConfirmed.emit();
		this._closeInternal();
	}

	private _closeInternal(): void {
		this._dialogRef.close();
	}
}
