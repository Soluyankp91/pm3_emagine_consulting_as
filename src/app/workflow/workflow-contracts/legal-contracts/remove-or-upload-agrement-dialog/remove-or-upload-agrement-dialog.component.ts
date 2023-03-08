import { Component, EventEmitter, Inject, Output } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FileUploaderFile } from 'src/app/shared/components/file-uploader/file-uploader.model';
import { WFDocument } from 'src/app/workflow/shared/components/wf-documents/wf-documents.model';
import { SendEnvelopeDialogComponent } from '../send-envelope-dialog/send-envelope-dialog.component';
import { ERemoveOrOuploadDialogMode, RemoveOrUploadDialogConfig } from './remove-or-upload-agrement-dialog.model';

@Component({
	selector: 'app-remove-or-upload-agrement-dialog',
	templateUrl: './remove-or-upload-agrement-dialog.component.html',
	styleUrls: ['./remove-or-upload-agrement-dialog.component.scss'],
})
export class RemoveOrUploadAgrementDialogComponent {
	@Output() onConfirmed: EventEmitter<any> = new EventEmitter<any>();
	@Output() onRejected: EventEmitter<any> = new EventEmitter<any>();
	reasonForChange = new FormControl<string>('', Validators.required);
	dialogConfig = RemoveOrUploadDialogConfig[this.data.dialogMode];
	dialogModes = ERemoveOrOuploadDialogMode;
	icon: string;
	isFileUploading = false;
	file: File;
	isFileAdded = false;
	constructor(
		@Inject(MAT_DIALOG_DATA)
		public data: {
			dialogMode: ERemoveOrOuploadDialogMode;
			hideReason?: boolean;
		},
		private _dialogRef: MatDialogRef<SendEnvelopeDialogComponent>
	) {}

	reject() {
		this.onRejected.emit();
		this._closeInternal();
	}

	confirm() {
        switch (this.data.dialogMode) {
            case ERemoveOrOuploadDialogMode.Void:
                this.onConfirmed.emit(this.reasonForChange.value);
                break;
            case ERemoveOrOuploadDialogMode.UploadNewDocument:
                this.onConfirmed.emit(this.file);
                break;
            case ERemoveOrOuploadDialogMode.Delete:
                this.onConfirmed.emit();
                break;
        }
		this._closeInternal();
	}

	private _closeInternal(): void {
		this._dialogRef.close();
	}

	public fileAdded(files: FileUploaderFile[]) {
		this.file = files[0].internalFile;
		this.icon = WFDocument.getIcon(this.file.name);
		this.isFileUploading = true;
		setTimeout(() => {
			this.isFileUploading = false;
			this.isFileAdded = true;
		}, 1500);
	}
}
