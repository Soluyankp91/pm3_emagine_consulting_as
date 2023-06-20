import { Overlay } from '@angular/cdk/overlay';
import { Component, Injector, Input, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormArray, UntypedFormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { AppComponentBase, NotifySeverity } from 'src/shared/app-component-base';
import { MediumDialogConfig } from 'src/shared/dialog.configs';
import {
	ClientPeriodServiceProxy,
	ConsultantPeriodServiceProxy,
	EnvelopeStatus,
	AgreementServiceProxy,
	EnvelopePreviewDto,
	SendEmailEnvelopeCommand,
	SendDocuSignEnvelopeCommand,
	FileParameter,
	AgreementStatusHistoryDto,
	ClientPeriodAgreementsDto,
	ConsultantPeriodAgreementsDto,
	WorkflowPeriodAgreementDto,
} from 'src/shared/service-proxies/service-proxies';
import { LegalContractService } from './legal-contract.service';
import { ClientLegalContractsForm, IAgreementState, InitialAgreementState } from './legal-contracts.model';
import { SendEnvelopeDialogComponent } from './send-envelope-dialog/send-envelope-dialog.component';
import { SignersPreviewDialogComponent } from './signers-preview-dialog/signers-preview-dialog.component';
import { EDocuSignMenuOption, EEmailMenuOption } from './signers-preview-dialog/signers-preview-dialog.model';
import { AgreementSignalRApiService } from 'src/shared/common/services/agreement-signalr.service';
import { EAgreementEvents, IUpdateData } from 'src/shared/common/services/agreement-signalr.model';
import { BehaviorSubject, Subject } from 'rxjs';
import { NotificationDialogComponent } from '../../../contracts/shared/components/popUps/notification-dialog/notification-dialog.component';
import { EMPTY } from 'rxjs';

@Component({
	selector: 'legal-contracts-list',
	templateUrl: './legal-contracts.component.html',
	styleUrls: ['./legal-contracts.component.scss'],
})
export class LegalContractsComponent extends AppComponentBase implements OnInit, OnDestroy {
	@Input() clientPeriodId: string;
	@Input() consultantPeriodId: string;
	@Input() isClientContracts: boolean;
	@Input() isEmagineToEmagine: boolean = false;
	@Input() readOnlyMode: boolean;
	clientLegalContractsForm: ClientLegalContractsForm;
	agreementPendingCreation$ = new BehaviorSubject<IAgreementState>(InitialAgreementState);
	private _unsubscribe = new Subject();
	constructor(
		injector: Injector,
		private _fb: UntypedFormBuilder,
		private _clientPeriodService: ClientPeriodServiceProxy,
		private _consultantPeriodService: ConsultantPeriodServiceProxy,
		private _agreementService: AgreementServiceProxy,
		private _legalContractService: LegalContractService,
		private _overlay: Overlay,
		private _dialog: MatDialog,
		private _router: Router,
		private _agreementSignalRService: AgreementSignalRApiService
	) {
		super(injector);
		this.clientLegalContractsForm = new ClientLegalContractsForm();
	}

	ngOnInit(): void {
		this._getAgreementData();
		this._sub();
	}

	ngOnDestroy(): void {
		this._unsubscribe.next();
		this._unsubscribe.complete();
	}

	addLegalContract(legalContract?: WorkflowPeriodAgreementDto, statusHistory?: AgreementStatusHistoryDto[]) {
		const form = this._fb.group({
			selected: new UntypedFormControl(false),
			agreementId: new UntypedFormControl(legalContract?.agreementId ?? null),
			name: new UntypedFormControl(legalContract?.name ?? null),
			agreementStatus: new UntypedFormControl(legalContract?.agreementStatus ?? null),
			validity: new UntypedFormControl(legalContract?.validity ?? null),
			processingPath: new UntypedFormControl(legalContract?.processingPath ?? null),
			docuSignUrl: new UntypedFormControl(legalContract?.docuSignUrl ?? null),
			lastUpdatedBy: new UntypedFormControl(legalContract?.lastUpdatedBy ?? null),
			lastUpdateDateUtc: new UntypedFormControl(legalContract?.lastUpdateDateUtc ?? null),
			hasSignedDocumentFile: new UntypedFormControl(legalContract?.hasSignedDocumentFile ?? null),
			inEditByEmployeeDtos: new UntypedFormControl(legalContract?.inEditByEmployeeDtos ?? null),
			statusHistory: new UntypedFormControl(statusHistory ?? []),
			hasCurrentVersion: new UntypedFormControl(legalContract?.hasCurrentVersion ?? false),
		});
		this.clientLegalContractsForm.legalContracts.push(form);
	}

	public sendAgreement() {
		let selectedAgreements = this.legalContracts.value.filter((x) => x.selected);
		const agreementIds = selectedAgreements.map((x) => x.agreementId);
		let disableSendAllButton = false;

		if (
			selectedAgreements.some(
				(x) => x.agreementStatus !== EnvelopeStatus.Created && x.agreementStatus !== EnvelopeStatus.CreatedInDocuSign
			)
		) {
			this._openSendEnvelopeDialog(disableSendAllButton, agreementIds, true);
		} else {
			if (agreementIds.length > 1) {
				this.showMainSpinner();
				this._legalContractService.getTokenAndSignleEnvelopeCheck(agreementIds).subscribe({
					next: () => {
						this._openSendEnvelopeDialog(disableSendAllButton, agreementIds);
					},
					error: (error) => {
						if (error.status === 400) {
							disableSendAllButton = true;
						}
						this.hideMainSpinner();
						this._openSendEnvelopeDialog(disableSendAllButton, agreementIds);
					},
					complete: () => {
						this.hideMainSpinner();
					},
				});
			} else {
				this._getSignersPreview(agreementIds);
			}
		}
	}

	public redirectToCreateAgreement() {
		const url = this._router.serializeUrl(
			this._router.createUrlTree(
				[`/app/contracts/agreements/create`],
				this.isClientContracts
					? {
							queryParams: {
								clientPeriodId: this.clientPeriodId,
							},
					  }
					: {
							queryParams: {
								consultantPeriodId: this.consultantPeriodId,
								clientPeriodId: this.clientPeriodId,
							},
					  }
			)
		);
		window.open(url, '_blank');
	}

	public downloadEnvelopes() {
		this.showMainSpinner();
		let selectedAgreements = this.legalContracts.value.filter((x) => x.selected);
		const agreementIds = selectedAgreements.map((x) => x.agreementId);
		let url = `${this.apiUrl}/api/Agreement/files?`;

		if (agreementIds?.length > 0) {
			for (let id of agreementIds) {
				url += `agreementIds=${id}&`;
			}
			url = url.replace(/[?&]$/, '');
		} else {
			return;
		}
		this._legalContractService.processDownloadDocument(url);
	}

	private _getClientAgreements() {
		this._clientPeriodService.clientAgreements(this.clientPeriodId).subscribe((result: ClientPeriodAgreementsDto) => {
			this._resetForm();
			result.clientAgreements.forEach((item) => {
				this._getAgreementStatusAndAddLegalContract(item);
			});
		});
	}

	private _getConsultantAgreements() {
		this._consultantPeriodService
			.consultantAgreements(this.consultantPeriodId)
			.subscribe((result: ConsultantPeriodAgreementsDto) => {
				this._resetForm();
				if (this.isEmagineToEmagine) {
					result.emagineToEmagineAgreements.forEach((item) => {
						this._getAgreementStatusAndAddLegalContract(item);
					});
				} else {
					result.consultantAgreements.forEach((item) => {
						this._getAgreementStatusAndAddLegalContract(item);
					});
				}
			});
	}

	private _getAgreementStatusAndAddLegalContract(item: WorkflowPeriodAgreementDto) {
		this._agreementService.statusHistory(item.agreementId).subscribe((result) => {
			this.addLegalContract(item, result);
		});
	}

	private _getAgreementData() {
		if (this.isClientContracts) {
			this._getClientAgreements();
		} else {
			this._getConsultantAgreements();
		}
	}

	private _openSendEnvelopeDialog(disableSendAllButton: boolean, agreementIds: number[], showError = false) {
		const scrollStrategy = this._overlay.scrollStrategies.reposition();
		MediumDialogConfig.scrollStrategy = scrollStrategy;
		MediumDialogConfig.data = {
			disableSendAllButton: disableSendAllButton,
			showError: showError,
		};
		const dialogRef = this._dialog.open(SendEnvelopeDialogComponent, MediumDialogConfig);

		dialogRef.componentInstance.onConfirmed.subscribe((singleEmail: boolean) => {
			if (showError) {
				return;
			}
			this._getSignersPreview(agreementIds, singleEmail);
		});
	}

	private _getSignersPreview(agreementIds: number[], singleEmail = true) {
		this.showMainSpinner();
		this._agreementService
			.envelopeRecipientsPreview(agreementIds, singleEmail)
			.pipe(finalize(() => this.hideMainSpinner()))
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
			hasBackdrop: true,
			backdropClass: 'backdrop-modal--wrapper',
			data: {
				envelopePreviewList: envelopePreviewList,
				singleEmail: singleEmail,
			},
		});
		dialogRef.componentInstance.onSendViaEmail.subscribe((option: EEmailMenuOption) => {
			this._sendViaEmail(agreementIds, singleEmail, option);
		});
		dialogRef.componentInstance.onSendViaDocuSign.subscribe((option: EDocuSignMenuOption) => {
			this._sendViaDocuSign(agreementIds, singleEmail, option);
		});
	}

	private _sendViaEmail(agreementIds: number[], singleEmail: boolean, option: EEmailMenuOption) {
		this.showMainSpinner();
		let input = new SendEmailEnvelopeCommand({
			agreementIds: agreementIds,
			singleEmail: singleEmail,
			convertDocumentFileToPdf: option === EEmailMenuOption.AsPdfFile,
		});
		this._agreementService
			.sendEmailEnvelope(input)
			.pipe(finalize(() => this.hideMainSpinner()))
			.subscribe(() => {
				this.showNotify(NotifySeverity.Success, 'Agreement(s) sent via Email');
				this._getAgreementData();
			});
	}

	private _sendViaDocuSign(agreementIds: number[], singleEnvelope: boolean, option: EDocuSignMenuOption) {
		this.showMainSpinner();
		let input = new SendDocuSignEnvelopeCommand({
			agreementIds: agreementIds,
			singleEnvelope: singleEnvelope,
			createDraftOnly: option === EDocuSignMenuOption.CreateDocuSignDraft,
		});
		this._agreementService
			.sendDocusignEnvelope(input)
			.pipe(finalize(() => this.hideMainSpinner()))
			.subscribe(() => {
				this.showNotify(NotifySeverity.Success, 'Agreement(s) sent via DocuSign');
				this._getAgreementData();
			});
	}

	private _uploadSignedContract(agreementId: number, file: FileParameter, forceUpdate = false) {
		this.showMainSpinner();
		this._legalContractService
			.getTokenAndManuallyUpload(agreementId, forceUpdate, file)
			.pipe(finalize(() => this.hideMainSpinner()))
			.subscribe({
				next: () => {
					this.showNotify(NotifySeverity.Success, 'Signed contract uploaded');
					this._getAgreementData();
				},
				error: (error) => {
					const errorObj = JSON.parse(error.response);
					let message = errorObj?.error?.message;
					let code = errorObj?.error?.code;
					if (code && code === 'contracts.documents.cant.upload.completed.in.docusign') {
						this.hideMainSpinner();
						this._dialog.open(NotificationDialogComponent, {
							width: '500px',
							backdropClass: 'backdrop-modal--wrapper',
							data: {
								label: 'Upload contract',
								message: 'Cannot upload completed contract in DocuSign.',
							},
						});
						return EMPTY;
					}
					message = message?.length ? message : 'Forcing contract upload may result in envelope changes.';
					this._showForceUpdateDialog(message, agreementId, (forceUpdate = true), file);
				},
			});
	}

	private _showForceUpdateDialog(message: string, agreementId: number, forceUpdate: boolean, file: FileParameter) {
		const scrollStrategy = this._overlay.scrollStrategies.reposition();
		MediumDialogConfig.scrollStrategy = scrollStrategy;
		MediumDialogConfig.data = {
			confirmationMessageTitle: `Force contract upload`,
			confirmationMessage: `${message} \n
            Are you sure you want to upload the agreement manually?`,
			rejectButtonText: 'Cancel',
			confirmButtonText: 'Proceed',
			isNegative: false,
		};
		const dialogRef = this._dialog.open(ConfirmationDialogComponent, MediumDialogConfig);
		dialogRef.componentInstance.onConfirmed.subscribe(() => {
			this._uploadSignedContract(agreementId, file, forceUpdate);
		});
	}

	private _resetForm() {
		this.clientLegalContractsForm.legalContracts.controls = [];
	}

	private _sub() {
		this._agreementSignalRService.triggerAgreementState$
			.pipe(
				filter((value: IUpdateData) => {
					return (
						value.eventName === EAgreementEvents.PeriodAgreementCreationPendingState &&
						value.args?.periodId === (this.isClientContracts ? this.clientPeriodId : this.consultantPeriodId)
					);
				}),
				takeUntil(this._unsubscribe)
			)
			.subscribe((value: IUpdateData) => {
				if (value.args?.employees?.length) {
					this.agreementPendingCreation$.next({
						isCreating: true,
						employees: value.args?.employees,
					});
				} else {
					this.agreementPendingCreation$.next(InitialAgreementState);
				}
			});
	}

	get legalContracts(): UntypedFormArray {
		return this.clientLegalContractsForm.get('legalContracts') as UntypedFormArray;
	}
	get downloadEnvelopeAvailable() {
		return (
			this.legalContracts.value.some((x) => x.selected) &&
			this.legalContracts.value
				.filter((x) => x.selected)
				.every((item) => item.agreementStatus !== EnvelopeStatus.WaitingForOthers)
		);
	}
	get sendAgreementAvailable() {
		return this.legalContracts.value
			.filter((x) => x.selected)
			.some(
				(item) =>
					item.agreementStatus === EnvelopeStatus.Created || item.agreementStatus === EnvelopeStatus.CreatedInDocuSign
			);
	}
}
