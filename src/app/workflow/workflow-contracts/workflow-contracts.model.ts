import { FormArray, FormControl, FormGroup, Validators } from "@angular/forms";

export class WorkflowContractsMainForm extends FormGroup {
    constructor() {
        super({
            salesType: new FormControl(null),
            deliveryType: new FormControl(null),
            projectType: new FormControl(null),
            margin: new FormControl(null),
            projectDescription: new FormControl(null, Validators.required),
            projectCategory: new FormControl(null),
            projectName: new FormControl(null, Validators.required),
            discounts: new FormControl(null),
            remarks: new FormControl(null, Validators.required),
            noRemarks: new FormControl(false),
            customDebtorNumber: new FormControl(null)
        });
    }

    get salesType() {
        return this.get('salesType');
    }
    get deliveryType() {
        return this.get('deliveryType');
    }
    get projectType() {
        return this.get('projectType');
    }
    get margin() {
        return this.get('margin');
    }
    get projectDescription() {
        return this.get('projectDescription');
    }
    get projectCategory() {
        return this.get('projectCategory');
    }
    get projectName() {
        return this.get('projectName');
    }
    get discounts() {
        return this.get('discounts');
    }
    get remarks() {
        return this.get('remarks');
    }
    get noRemarks() {
        return this.get('noRemarks');
    }
    get customDebtorNumber() {
        return this.get('customDebtorNumber');
    }
}

export class WorkflowContractsSyncForm extends FormGroup {
    constructor() {
        super({
            manualCheckbox: new FormControl(false),
            newLegalContract: new FormControl(false),
            clientLegalContractDoneStatusId: new FormControl(null),
            enableLegalContractsButtons: new FormControl(false),
            showManualOption: new FormControl(false),
            isNewSyncNeeded: new FormControl(false),
            lastSyncedDate: new FormControl(null),
            consultants: new FormArray([], Validators.minLength(1))
        });
    }

    get manualCheckbox() {
        return this.get('manualCheckbox');
    }
    get newLegalContract() {
        return this.get('newLegalContract');
    }
    get clientLegalContractDoneStatusId() {
        return this.get('clientLegalContractDoneStatusId');
    }
    get enableLegalContractsButtons() {
        return this.get('enableLegalContractsButtons');
    }
    get showManualOption() {
        return this.get('showManualOption');
    }
    get isNewSyncNeeded() {
        return this.get('isNewSyncNeeded');
    }
    get lastSyncedDate() {
        return this.get('lastSyncedDate');
    }
    get consultants() {
        return this.get('consultants') as FormArray;
    }
}

export class WorkflowContractsClientDataForm extends FormGroup {
    constructor() {
        super({
            directClientId: new FormControl(null),
            pdcInvoicingEntityId: new FormControl(null),
            clientTimeReportingCapId: new FormControl(null),
            clientTimeReportingCapMaxValue: new FormControl(null),
            clientTimeReportingCapCurrencyId: new FormControl(null),
            rateUnitType: new FormControl(null),
            currency: new FormControl(null),
            clientRate: new FormControl(null),

            invoicingReferenceNumber: new FormControl(null),
            clientInvoicingRecipientIdValue: new FormControl(null),
            clientInvoicingRecipient: new FormControl(null),
            invoicingReferencePersonIdValue: new FormControl(null),
            invoicingReferencePerson: new FormControl(null),

            specialContractTerms: new FormControl(null, Validators.required),
            noSpecialContractTerms: new FormControl(null),
            clientRates: new FormArray([]),
            clientFees: new FormArray([]),

        });
    }

    get directClientId() {
        return this.get('directClientId');
    }
    get pdcInvoicingEntityId() {
        return this.get('pdcInvoicingEntityId');
    }
    get clientTimeReportingCapId() {
        return this.get('clientTimeReportingCapId');
    }
    get clientTimeReportingCapMaxValue() {
        return this.get('clientTimeReportingCapMaxValue');
    }
    get clientTimeReportingCapCurrencyId() {
        return this.get('clientTimeReportingCapCurrencyId');
    }
    get rateUnitType() {
        return this.get('rateUnitType');
    }
    get currency() {
        return this.get('currency');
    }
    get clientRate() {
        return this.get('clientRate');
    }
    get invoicingReferenceNumber() {
        return this.get('invoicingReferenceNumber');
    }
    get clientInvoicingRecipientIdValue() {
        return this.get('clientInvoicingRecipientIdValue');
    }
    get clientInvoicingRecipient() {
        return this.get('clientInvoicingRecipient');
    }
    get invoicingReferencePersonIdValue() {
        return this.get('invoicingReferencePersonIdValue');
    }
    get invoicingReferencePerson() {
        return this.get('invoicingReferencePerson');
    }
    get specialContractTerms() {
        return this.get('specialContractTerms');
    }
    get noSpecialContractTerms() {
        return this.get('noSpecialContractTerms');
    }
    get clientRates() {
        return this.get('clientRates') as FormArray;
    }
    get clientFees() {
        return this.get('clientFees') as FormArray;
    }
}

export class WorkflowContractsConsultantsDataForm extends FormGroup {
    constructor() {
        super({
            consultants: new FormArray([], Validators.minLength(1))
        })
    }
    get consultants() {
        return this.get('consultants') as FormArray;
    }
}

export class WorkflowConsultantsLegalContractForm extends FormGroup {
    constructor() {
        super({
            consultants: new FormArray([])
        })

    }
    get consultants() {
        return this.get('consultants') as FormArray;
    }
}


export class WorkflowContractsTerminationConsultantsDataForm extends FormGroup {
    constructor() {
        super({
            consultantTerminationContractData: new FormArray([])
        })

    }
    get consultantTerminationContractData() {
        return this.get('consultantTerminationContractData') as FormArray;
    }
}


export enum LegalContractStatus {
    NotAcceessible = 0,
    NotYetCreated = 1,
    SavedButNotGenerated = 2,
    Done = 10
}
