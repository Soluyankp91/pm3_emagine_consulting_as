import { Component, Injector, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
	ELegalContractModeIcon,
	ELegalContractModeText,
	ELegalContractSourceIcon,
	ELegalContractSourceText,
	ELegalContractStatusIcon,
	ELegalContractStatusText,
    IAgreementState,
    InitialAgreementState,
} from '../legal-contracts.model';
import { EnvelopeStatus, EnvelopeProcessingPath, AgreementServiceProxy, FileParameter } from 'src/shared/service-proxies/service-proxies';
import { MediumDialogConfig } from 'src/shared/dialog.configs';
import { RemoveOrUploadAgrementDialogComponent } from '../remove-or-upload-agrement-dialog/remove-or-upload-agrement-dialog.component';
import { ERemoveOrOuploadDialogMode } from '../remove-or-upload-agrement-dialog/remove-or-upload-agrement-dialog.model';
import { Overlay } from '@angular/cdk/overlay';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AgreementSignalRApiService } from 'src/shared/common/services/agreement-signalr.service';
import { LegalContractService } from '../legal-contract.service';
import { MatMenuTrigger } from '@angular/material/menu';
import { filter, finalize, take, takeUntil } from 'rxjs/operators';
import { AppComponentBase, NotifySeverity } from 'src/shared/app-component-base';
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { EAgreementEvents, IUpdateData } from 'src/shared/common/services/agreement-signalr.model';
import { BehaviorSubject, Subject } from 'rxjs';

@Component({
	selector: 'legal-contract',
	templateUrl: './legal-contract-item.component.html',
	styleUrls: ['../legal-contracts.component.scss'],
})
export class LegalContractItemComponent extends AppComponentBase implements OnInit, OnDestroy {
	@ViewChild('menuTrigger', { static: false }) menuTrigger: MatMenuTrigger;
	@Input() contract: any;
    @Input() first: boolean;
    @Input() readOnlyMode: boolean;
    @Input() isClientContracts: boolean;
    @Input() clientPeriodId: string;
    @Input() consultantPeriodId: string;
	eLegalContractStatusIcon = ELegalContractStatusIcon;
	eLegalContractStatusText = ELegalContractStatusText;
	eLegalContractModeIcon = ELegalContractModeIcon;
	eLegalContractModeText = ELegalContractModeText;
	legalContractStatus = EnvelopeStatus;
	eLegalContractSourceText = ELegalContractSourceText;
	eLegalContractSourceIcon = ELegalContractSourceIcon;
	legalContractPath = EnvelopeProcessingPath;
    agreementInEdit$ = new BehaviorSubject<IAgreementState>(InitialAgreementState);
    private _unsubscribe = new Subject();
	constructor(
        injector: Injector,
		private _agreementService: AgreementServiceProxy,
		private _legalContractService: LegalContractService,
		private _overlay: Overlay,
		private _dialog: MatDialog,
		private _router: Router,
		private _agreementSignalRService: AgreementSignalRApiService
	) {
        super(injector);
    }

	ngOnInit(): void {
        this._agreementSignalRService.triggerAgreementState$
			.pipe(
				filter((value: IUpdateData) => {
					return value.eventName === EAgreementEvents.InEditState && value.args.agreementId === this.contract.value.agreementId;
				}),
				takeUntil(this._unsubscribe)
			)
			.subscribe((value: IUpdateData) => {
                if (value.args?.employees.length) {
                    this.agreementInEdit$.next({
                        isEditing: true,
                        employees: value.args?.employees
                    });
                } else {
                    this.agreementInEdit$.next(InitialAgreementState);
                }
			});
    }

    ngOnDestroy(): void {
        this._unsubscribe.next();
        this._unsubscribe.complete();
    }

	public openVoidAgreementDialog(agreementId: number) {
		this._closeMenu();
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

    public openDeleteAgreementDialog(agreementId: number) {
		this._closeMenu();
		const scrollStrategy = this._overlay.scrollStrategies.reposition();
		MediumDialogConfig.scrollStrategy = scrollStrategy;
		MediumDialogConfig.data = {
			dialogMode: ERemoveOrOuploadDialogMode.Delete,
			hideReason: true,
		};
		const dialogRef = this._dialog.open(RemoveOrUploadAgrementDialogComponent, MediumDialogConfig);

		dialogRef.componentInstance.onConfirmed.subscribe(() => {
			this._deleteAgreement(agreementId);
		});
	}

    public tryToEditAgreement(agreementId: number) {
        this.agreementInEdit$.asObservable().pipe(take(1)).subscribe((state: IAgreementState) => {
            if (state.isEditing) {
                const scrollStrategy = this._overlay.scrollStrategies.reposition();
                MediumDialogConfig.scrollStrategy = scrollStrategy;
                MediumDialogConfig.data = {
                    confirmationMessageTitle: `Editing in progress`,
                    confirmationMessage: `Agreement is beeing edited by ${state.employees.map(x => x.name).join(', ') }. \n
                    Are you sure you want to proceed?`,
                    rejectButtonText: 'Cancel',
                    confirmButtonText: 'Proceed',
                    isNegative: true,
                };
                const dialogRef = this._dialog.open(ConfirmationDialogComponent, MediumDialogConfig);
                dialogRef.componentInstance.onRejected.subscribe(() => {
                    this._closeMenu();
                });
                dialogRef.componentInstance.onConfirmed.subscribe(() => {
                    this.editAgreement(agreementId);
                });
            } else {
                this.editAgreement(agreementId);
            }
        });
    }

    public editAgreement(agreementId: number) {
		const routerUrl = this._router.serializeUrl(
			this._router.createUrlTree(
				[`/app/contracts/agreements/${agreementId}/settings`],
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
		this._closeMenu();
		window.open(routerUrl, '_blank');
	}

    public openInDocuSign(docuSignUrl: string) {
		this._closeMenu();
		window.open(docuSignUrl, '_blank');
	}

    public openUploadSignedContractDialog(agreementId: number, overrideDocument: boolean) {
		this._closeMenu();
		const scrollStrategy = this._overlay.scrollStrategies.reposition();
		MediumDialogConfig.scrollStrategy = scrollStrategy;
		MediumDialogConfig.data = {
			dialogMode: ERemoveOrOuploadDialogMode.UploadNewDocument,
			hideReason: true,
			message: overrideDocument
				? 'The agreement you try to upload has already been added and marked as completed. The existing file will be replaced with the new one, and will no longer be accessible. Are you sure you want to proceed?'
				: null,
		};
		const dialogRef = this._dialog.open(RemoveOrUploadAgrementDialogComponent, MediumDialogConfig);

		dialogRef.componentInstance.onConfirmed.subscribe((file: File) => {
			let fileInput: FileParameter;
			fileInput = {
				fileName: file.name,
				data: file,
			};
			this._uploadSignedContract(agreementId, fileInput);
		});
	}

	public downloadPdf(agreementId: number) {
		this._closeMenu();
		this.showMainSpinner();
		const url = `${this.apiUrl}/api/Agreement/${agreementId}/document-file/pdf`;
		this._legalContractService.processDownloadDocument(url);
	}

	public downloadDoc(agreementId: number) {
		this._closeMenu();
		this.showMainSpinner();
		const getDraftIfAvailable = false; // NB: hardcoded false as for now, BE requirement
		const url = `${this.apiUrl}/api/Agreement/${agreementId}/document-file/latest-agreement-version/${getDraftIfAvailable}`;
		this._legalContractService.processDownloadDocument(url);
	}

	public downloadFile(agreementId: number) {
		this._closeMenu();
		this.showMainSpinner();
		const url = `${this.apiUrl}/api/Agreement/${agreementId}/signed-document`;
		this._legalContractService.processDownloadDocument(url);
	}

    private _deleteAgreement(agreementId: number) {
		this.showMainSpinner();
		this._agreementService
			.agreementDELETE(agreementId)
			.pipe(finalize(() => this.hideMainSpinner()))
			.subscribe(() => {
				this.showNotify(NotifySeverity.Success, 'Agreement deleted');
				this._getAgreementData();
			});
	}

    private _voidAgreement(agreementId: number, reason: string) {
		this.showMainSpinner();
		this._agreementService
			.voidEnvelope(agreementId, reason)
			.pipe(finalize(() => this.hideMainSpinner()))
			.subscribe(() => {
				this.showNotify(NotifySeverity.Success, 'Agreement voided');
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

    _getAgreementData() {

    }


	private _closeMenu() {
		this.menuTrigger.closeMenu();
	}
}
