import { Overlay } from '@angular/cdk/overlay';
import { Component, Injector, Input, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormArray, UntypedFormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { finalize } from 'rxjs/operators';
import { AppComponentBase } from 'src/shared/app-component-base';
import { MediumDialogConfig } from 'src/shared/dialog.configs';
import {
	WorkflowAgreementDto,
	ClientPeriodServiceProxy,
	ConsultantPeriodServiceProxy,
	WorkflowAgreementsDto,
	EnvelopeStatus,
	AgreementServiceProxy,
	EnvelopePreviewDto,
	SendEmailEnvelopeCommand,
	SendDocuSignEnvelopeCommand,
	FileParameter,
} from 'src/shared/service-proxies/service-proxies';
import { LegalContractService } from './legal-contract.service';
import {
	ClientLegalContractsForm,
	ELegalContractModeIcon,
	ELegalContractModeText,
	ELegalContractStatusIcon,
	ELegalContractStatusText,
	LegalContractsMockedData,
} from './legal-contracts.model';
import { RemoveOrUploadAgrementDialogComponent } from './remove-or-upload-agrement-dialog/remove-or-upload-agrement-dialog.component';
import { ERemoveOrOuploadDialogMode } from './remove-or-upload-agrement-dialog/remove-or-upload-agrement-dialog.model';
import { SendEnvelopeDialogComponent } from './send-envelope-dialog/send-envelope-dialog.component';
import { SignersPreviewDialogComponent } from './signers-preview-dialog/signers-preview-dialog.component';

@Component({
	selector: 'legal-contracts-list',
	templateUrl: './legal-contracts.component.html',
	styleUrls: ['./legal-contracts.component.scss'],
})
export class LegalContractsComponent extends AppComponentBase implements OnInit {
	@Input() periodId: string;
	@Input() isClientContracts: boolean;
	@Input() readOnlyMode: boolean;
	clientLegalContractsForm: ClientLegalContractsForm;
	eLegalContractStatusIcon = ELegalContractStatusIcon;
	eLegalContractStatusText = ELegalContractStatusText;
	eLegalContractModeIcon = ELegalContractModeIcon;
	eLegalContractModeText = ELegalContractModeText;
	legalContractStatus = EnvelopeStatus;
	constructor(
		injector: Injector,
		private _fb: UntypedFormBuilder,
		private _clientPeriodService: ClientPeriodServiceProxy,
		private _consultantPeriodService: ConsultantPeriodServiceProxy,
		private _agreementService: AgreementServiceProxy,
		private _legalContractService: LegalContractService,
		private _overlay: Overlay,
		private _dialog: MatDialog
	) {
		super(injector);
		this.clientLegalContractsForm = new ClientLegalContractsForm();
	}

	ngOnInit(): void {
		if (this.isClientContracts) {
			this._getClientAgreements();
		} else {
			this._getConsultantAgreements();
		}
		LegalContractsMockedData.forEach((item) => {
			this.addLegalContract(item);
		});
	}

	private _getClientAgreements() {
		this._clientPeriodService
			.clientAgreements(this.periodId)
			.pipe(finalize(() => {}))
			.subscribe((result: WorkflowAgreementsDto) => {
				result.agreements.forEach((item) => {
					this.addLegalContract(item);
				});
			});
	}

	private _getConsultantAgreements() {
		this._consultantPeriodService
			.consultantAgreements(this.periodId)
			.pipe(finalize(() => {}))
			.subscribe((result: WorkflowAgreementsDto) => {
				result.agreements.forEach((item) => {
					this.addLegalContract(item);
				});
			});
	}

	addLegalContract(legalContract?: WorkflowAgreementDto) {
		const form = this._fb.group({
			selected: new UntypedFormControl(false),
			agreementId: new UntypedFormControl(legalContract?.agreementId ?? null),
			name: new UntypedFormControl(legalContract?.name ?? null),
			agreementStatus: new UntypedFormControl(legalContract?.agreementStatus ?? null),
			validity: new UntypedFormControl(legalContract?.validity ?? null),
			lastUpdatedBy: new UntypedFormControl(legalContract?.lastUpdatedBy ?? null),
			lastUpdateDateUtc: new UntypedFormControl(legalContract?.lastUpdateDateUtc ?? null),
			hasSignedDocumentFile: new UntypedFormControl(legalContract?.hasSignedDocumentFile ?? null),
			inEditByEmployeeDtos: new UntypedFormControl(legalContract?.inEditByEmployeeDtos ?? null),
		});
		this.clientLegalContractsForm.legalContracts.push(form);
	}

	public sendAgreement() {
		const agreementIds = this.clientLegalContractsForm.value.legalContracts
			.map((x) => {
				if (x.selected) {
					return x.agreementId;
				}
			})
			.filter(Boolean);
		if (agreementIds.length > 1) {
			let disableSendAllButton = false;
			this._legalContractService.getTokenAndSignleEnvelopeCheck(agreementIds).subscribe({
				next: () => {
					this._openSendEnvelopeDialog(disableSendAllButton, agreementIds);
				},
				error: (error) => {
					if (error.status === 400) {
						disableSendAllButton = true;
					}
					console.log(disableSendAllButton);
					this._openSendEnvelopeDialog(disableSendAllButton, agreementIds);
				},
			});
		} else {
			this._getSignersPreview(agreementIds);
		}
	}

	private _openSendEnvelopeDialog(disableSendAllButton: boolean, agreementIds: number[]) {
		const scrollStrategy = this._overlay.scrollStrategies.reposition();
		MediumDialogConfig.scrollStrategy = scrollStrategy;
		MediumDialogConfig.data = {
			disableSendAllButton: disableSendAllButton,
		};
		const dialogRef = this._dialog.open(SendEnvelopeDialogComponent, MediumDialogConfig);

		dialogRef.componentInstance.onConfirmed.subscribe((singleEmail: boolean) => {
			this._getSignersPreview(agreementIds, singleEmail);
		});
	}

	private _getSignersPreview(agreementIds: number[], singleEmail = true) {
		this._agreementService
			.envelopeRecipientsPreview(agreementIds, singleEmail)
			.pipe(finalize(() => {}))
			.subscribe((result) => {
				this._openSignersPreviewDialog(singleEmail, result, agreementIds);
			});
	}

	private _openSignersPreviewDialog(singleEmail: boolean, envelopePreviewList: EnvelopePreviewDto[], agreementIds: number[]) {
		const dialogRef = this._dialog.open(SignersPreviewDialogComponent, {
			width: '100vw',
			maxWidth: '100vw',
			height: 'calc(100vh - 115px)',
			panelClass: 'signers-preview--modal',
			autoFocus: false,
			hasBackdrop: false,
			data: {
				envelopePreviewList: envelopePreviewList,
			},
		});
		dialogRef.componentInstance.onSendViaEmail.subscribe(() => {
			this._sendViaEmail(agreementIds, singleEmail);
		});
		dialogRef.componentInstance.onSendViaDocuSign.subscribe(() => {
			this._sendViaDocuSign(agreementIds, singleEmail);
		});
	}

	private _sendViaEmail(agreementIds: number[], singleEmail: boolean) {
		let input = new SendEmailEnvelopeCommand({
			agreementIds: agreementIds,
			singleEmail: singleEmail,
		});
		this._agreementService.sendEmailEnvelope(input).subscribe(() => {});
	}

	private _sendViaDocuSign(agreementIds: number[], singleEnvelope: boolean) {
		let input = new SendDocuSignEnvelopeCommand({
			agreementIds: agreementIds,
			singleEnvelope: singleEnvelope,
		});
		this._agreementService.sendDocusignEnvelope(input).subscribe(() => {});
	}

	onFileAdded($event: EventTarget | null, agreementId: number) {
		if ($event) {
			let files = ($event as HTMLInputElement).files as FileList;
			const file = files[0] as File;
			this._openUploadSignedContractDialog(agreementId, file);
			($event as HTMLInputElement).value = '';
		}
	}

	private _openUploadSignedContractDialog(agreementId: number, file: File) {
		const scrollStrategy = this._overlay.scrollStrategies.reposition();
		MediumDialogConfig.scrollStrategy = scrollStrategy;
		MediumDialogConfig.data = {
			dialogMode: ERemoveOrOuploadDialogMode.UploadNewDocument,
			file: file,
		};
		const dialogRef = this._dialog.open(RemoveOrUploadAgrementDialogComponent, MediumDialogConfig);

		dialogRef.componentInstance.onConfirmed.subscribe((result: any) => {
			let fileInput: FileParameter;
			fileInput = {
				fileName: file.name,
				data: file,
			};
			this._uploadSignedContract(agreementId, fileInput);
		});
	}

	private _uploadSignedContract(agreementId: number, file: FileParameter) {
		const forceUpdate = false; // NB: hardcoded false as for now, BE requirement
		this._agreementService
			.uploadSigned(agreementId, forceUpdate, file)
			.pipe(finalize(() => {}))
			.subscribe();
	}

	public downloadPdf(agreementId: number) {
		// FIXME: change url once BE implemented
		// const url = `${this.apiUrl}/api/Agreement/${agreementId}/document-file/latest-agreement-version/${getDraftIfAvailable}/false`;
		// this._legalContractService.processDownloadDocument(url);
	}

	public downloadDoc(agreementId: number) {
		const getDraftIfAvailable = false; // NB: hardcoded false as for now, BE requirement
		const url = `${this.apiUrl}/api/Agreement/${agreementId}/document-file/latest-agreement-version/${getDraftIfAvailable}/false`;
		this._legalContractService.processDownloadDocument(url);
	}

	public openInDocuSign(agreementId: number) {}

	public editAgreement(agreementId: number) {}

	public openDeleteAgreementDialog(agreementId: number) {
		const scrollStrategy = this._overlay.scrollStrategies.reposition();
		MediumDialogConfig.scrollStrategy = scrollStrategy;
		MediumDialogConfig.data = {
			dialogMode: ERemoveOrOuploadDialogMode.Delete,
		};
		const dialogRef = this._dialog.open(RemoveOrUploadAgrementDialogComponent, MediumDialogConfig);

		dialogRef.componentInstance.onConfirmed.subscribe((reason: string) => {
			this._deleteAgreement(agreementId, reason);
		});
	}

	private _deleteAgreement(agreementId: number, reason?: string) {
		// TODO: call delete API once implemented
	}

	public openVoidAgreementDialog(agreementId: number) {
		const scrollStrategy = this._overlay.scrollStrategies.reposition();
		MediumDialogConfig.scrollStrategy = scrollStrategy;
		MediumDialogConfig.data = {
			dialogMode: ERemoveOrOuploadDialogMode.Void,
		};
		const dialogRef = this._dialog.open(RemoveOrUploadAgrementDialogComponent, MediumDialogConfig);

		dialogRef.componentInstance.onConfirmed.subscribe((reason: string) => {
			this._voidAgreement(agreementId, reason);
		});
	}

	private _voidAgreement(agreementId: number, reason?: string) {
		this.showMainSpinner();
		this._agreementService
			.voidEnvelope(agreementId, reason)
			.pipe(finalize(() => this.hideMainSpinner()))
			.subscribe();
	}

	get legalContracts(): UntypedFormArray {
		return this.clientLegalContractsForm.get('legalContracts') as UntypedFormArray;
	}
}
