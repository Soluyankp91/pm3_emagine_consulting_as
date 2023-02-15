import { Component, Injector, Input, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormArray, UntypedFormBuilder } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { AppComponentBase } from 'src/shared/app-component-base';
import {
	WorkflowAgreementDto,
    ClientPeriodServiceProxy,
    ConsultantPeriodServiceProxy,
    WorkflowAgreementsDto,
} from 'src/shared/service-proxies/service-proxies';
import { ClientLegalContractsForm, ELegalContractModeIcon, ELegalContractStatusIcon, ELegalContractStatusText, LegalContractsMockedData } from './legal-contracts.model';

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
	constructor(
        injector: Injector,
        private _fb: UntypedFormBuilder,
        private _clientPeriodService: ClientPeriodServiceProxy,
        private _consultantPeriodService: ConsultantPeriodServiceProxy,
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

	get legalContracts(): UntypedFormArray {
		return this.clientLegalContractsForm.get('legalContracts') as UntypedFormArray;
	}
}
