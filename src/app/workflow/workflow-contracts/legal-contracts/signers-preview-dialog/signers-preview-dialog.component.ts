import { Component, EventEmitter, Inject, Injector, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AppComponentBase } from 'src/shared/app-component-base';
import { EnvelopePreviewDto, SignerType } from 'src/shared/service-proxies/service-proxies';
import { DocuSignMenuItems, EDocuSignMenuOption, EEmailMenuOption, EmailMenuItems, ESignerRole, ESignerTypeName, RecipientMockedList } from './signers-preview-dialog.model';

@Component({
	selector: 'app-signers-preview-dialog',
	templateUrl: './signers-preview-dialog.component.html',
	styleUrls: ['./signers-preview-dialog.component.scss'],
})
export class SignersPreviewDialogComponent extends AppComponentBase implements OnInit {
	@Output() onSendViaEmail = new EventEmitter<EEmailMenuOption>();
	@Output() onSendViaDocuSign = new EventEmitter<EDocuSignMenuOption>();
	envelopePreviewList: EnvelopePreviewDto[];
    signerType = SignerType;
	signerTypeName = ESignerTypeName;
	signerRole = ESignerRole;
    docuSignMenuItems = DocuSignMenuItems;
    emailMenuItems = EmailMenuItems;
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
		this.envelopePreviewList = data.envelopePreviewList;
        // NB: needed for tests
        // this.envelopePreviewList = RecipientMockedList;
	}

	ngOnInit(): void {}

	public close() {
		this._closeInternal();
	}

	public sendViaEmail(option: EEmailMenuOption) {
		this.onSendViaEmail.emit(option);
		this._closeInternal();
	}

	public sendViaDocuSign(option: EDocuSignMenuOption) {
		this.onSendViaDocuSign.emit(option);
		this._closeInternal();
	}

	private _closeInternal() {
		this._dialogRef.close();
	}
}
