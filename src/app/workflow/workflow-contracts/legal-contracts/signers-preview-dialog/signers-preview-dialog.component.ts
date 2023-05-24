import { Component, EventEmitter, Inject, Injector, OnInit, Output } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { AppComponentBase } from 'src/shared/app-component-base';
import { EnvelopePreviewDto, SignerType } from 'src/shared/service-proxies/service-proxies';
import {
	DocuSignMenuItem,
	EDocuSignMenuOption,
	EEmailMenuOption,
	EmailMenuItems,
	ESignerRole,
	ESignerTypeName,
} from './signers-preview-dialog.model';
import { NotificationDialogComponent } from 'src/app/contracts/shared/components/popUps/notification-dialog/notification-dialog.component';
import { EmailBodyComponent } from 'src/app/contracts/shared/components/popUps/email-body/email-body.component';

@Component({
	selector: 'app-signers-preview-dialog',
	templateUrl: './signers-preview-dialog.component.html',
	styleUrls: ['./signers-preview-dialog.component.scss'],
})
export class SignersPreviewDialogComponent extends AppComponentBase implements OnInit {
	@Output() onSendViaEmail = new EventEmitter<EEmailMenuOption>(); //EEmailMenuOption
	@Output() onSendViaDocuSign = new EventEmitter<{ option: EDocuSignMenuOption; emailSubject: string; emailBody: string }>();
	envelopePreviewList: EnvelopePreviewDto[];
	signerType = SignerType;
	signerTypeName = ESignerTypeName;
	signerRole = ESignerRole;
	docuSignMenuItem = DocuSignMenuItem;
	emailMenuItems = EmailMenuItems;
	constructor(
		injector: Injector,
		@Inject(MAT_DIALOG_DATA)
		public data: {
			envelopePreviewList: EnvelopePreviewDto[];
			singleEmail: boolean;
		},
		private _dialogRef: MatDialogRef<SignersPreviewDialogComponent>,
		private readonly _dialog: MatDialog
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
		const dialogRef = this._dialog.open(EmailBodyComponent, {
			width: '800px',
			height: '555px',
			backdropClass: 'backdrop-modal--wrapper',
			panelClass: 'app-email-body',
		});
		dialogRef.afterClosed().subscribe((proceed) => {
			if (!proceed) {
				return;
			}
			this.onSendViaDocuSign.emit({
				option: option,
				emailBody: dialogRef.componentInstance.emailBodyControl.value,
				emailSubject: dialogRef.componentInstance.templateControl.value.emailSubject,
			});
			this._closeInternal();
		});
	}

	private _closeInternal() {
		this._dialogRef.close();
	}
}
