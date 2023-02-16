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
} from 'src/shared/service-proxies/service-proxies';
import { LegalContractService } from './legal-contract.service';
import { ClientLegalContractsForm, ELegalContractModeIcon, ELegalContractStatusIcon, ELegalContractStatusText, LegalContractsMockedData } from './legal-contracts.model';
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
        LegalContractsMockedData.forEach(item => {
            this.addLegalContract(item);
        })
    }

    private _getClientAgreements() {
		this._clientPeriodService.clientAgreements(this.periodId)
            .pipe(finalize(() => {}))
            .subscribe((result: WorkflowAgreementsDto) => {
                result.agreements.forEach(item => {
                    this.addLegalContract(item);
                })
            });
	}

    private _getConsultantAgreements() {
		this._consultantPeriodService.consultantAgreements(this.periodId)
            .pipe(finalize(() => {}))
            .subscribe((result: WorkflowAgreementsDto) => {
                result.agreements.forEach(item => {
                    this.addLegalContract(item);
                })
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
			inEditByEmployeeDtos: new UntypedFormControl(legalContract?.inEditByEmployeeDtos ?? null)
		});
		this.clientLegalContractsForm.legalContracts.push(form);
	}

    public sendAgreement() {
        const agreementIds = this.clientLegalContractsForm.value.legalContracts.map(x => {
            return x.selected ? x.agreementId : ''
        }).filter(Boolean);
        if (agreementIds.length > 1) {
            let disableSendAllButton = false;
            this._legalContractService.getTokenBeforeCheck(agreementIds)
                .subscribe({
                    next: (result) => {
                        this._openSendEnvelopeDialog(disableSendAllButton, agreementIds);
                    },
                    error: (error) => {
                        if (error.status === 400) {
                            disableSendAllButton = true;
                        }
                        console.log(disableSendAllButton);
                        this._openSendEnvelopeDialog(disableSendAllButton, agreementIds);
                    }
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
        this._agreementService.envelopeRecipientsPreview(agreementIds, singleEmail)
            .pipe(finalize(() => {}))
            .subscribe(result => {
                this._openSignersPreviewDialog(singleEmail, result, agreementIds);
            })
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
                envelopePreviewList: envelopePreviewList
            }
        });
        dialogRef.componentInstance.onSendViaEmail.subscribe(() => {
            this._sendViaEmail(agreementIds, singleEmail);
        });
        dialogRef.componentInstance.onSendViaDocuSign.subscribe(() => {
            this._sendViaDocuSign(agreementIds, singleEmail);
        })
    }

    private _sendViaEmail(agreementIds: number[], singleEmail: boolean) {
        let input = new SendEmailEnvelopeCommand({
            agreementIds: agreementIds,
            singleEmail: singleEmail
        })
        this._agreementService.sendEmailEnvelope(input)
            .subscribe(() => {})
    }

    private _sendViaDocuSign(agreementIds: number[], singleEnvelope: boolean) {
        let input = new SendDocuSignEnvelopeCommand({
            agreementIds: agreementIds,
            singleEnvelope: singleEnvelope
        })
        this._agreementService.sendDocusignEnvelope(input)
            .subscribe(() => {})
    }

    public uploadSignedContract(agreement: any, index: number) {

    }

    public downloadPdf(agreement: any, index: number) {

    }

    public downloadDoc(agreement: any, index: number) {

    }

    public openInDocuSign(agreement: any, index: number) {

    }

    public editAgreement(agreement: any, index: number) {

    }

    public removeAgreement(agreement: any, index: number) {

    }

public (agreement: any, index: number) {

}
	get legalContracts(): UntypedFormArray {
		return this.clientLegalContractsForm.get('legalContracts') as UntypedFormArray;
	}
}
