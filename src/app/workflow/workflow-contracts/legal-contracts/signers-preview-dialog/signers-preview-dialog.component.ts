import { Component, EventEmitter, Inject, Injector, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AppComponentBase } from 'src/shared/app-component-base';
import { EnvelopePreviewDto, SignerType } from 'src/shared/service-proxies/service-proxies';
import { ESignerRole, ESignerTypeName, RecipientMockedList } from './signers-preview-dialog.model';

@Component({
	selector: 'app-signers-preview-dialog',
	templateUrl: './signers-preview-dialog.component.html',
	styleUrls: ['./signers-preview-dialog.component.scss'],
})
export class SignersPreviewDialogComponent extends AppComponentBase implements OnInit {
	@Output() onSendViaEmail = new EventEmitter();
	@Output() onSendViaDocuSign = new EventEmitter<boolean>();
	envelopePreviewList: EnvelopePreviewDto[];
    signerType = SignerType;
	signerTypeName = ESignerTypeName;
	signerRole = ESignerRole;
    createDocuSignDraft = new FormControl<boolean>(false);
	constructor(
		injector: Injector,
		@Inject(MAT_DIALOG_DATA)
		public data: {
			envelopePreviewList: EnvelopePreviewDto[];
            singleEmail: boolean
		},
		private _dialogRef: MatDialogRef<SignersPreviewDialogComponent>
	) {
		super(injector);
		// this.envelopePreviewList = data.envelopePreviewList;
        this.envelopePreviewList = RecipientMockedList;
	}

	ngOnInit(): void {}

	public close() {
		this._closeInternal();
	}

	public sendViaEmail() {
		this.onSendViaEmail.emit();
		this._closeInternal();
	}

	public sendViaDocuSign() {
		this.onSendViaDocuSign.emit(this.createDocuSignDraft.value);
		this._closeInternal();
	}

	private _closeInternal() {
		this._dialogRef.close();
	}
}
