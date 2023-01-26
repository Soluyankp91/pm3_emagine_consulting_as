import { UntypedFormArray, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";

export class WorkflowContractsMainForm extends UntypedFormGroup {
    constructor() {
        super({
            salesType: new UntypedFormControl(null),
            deliveryType: new UntypedFormControl(null),
            projectType: new UntypedFormControl(null),
            margin: new UntypedFormControl(null),
            projectDescription: new UntypedFormControl(null, Validators.required),
            projectCategory: new UntypedFormControl(null),
            primaryCategoryArea: new UntypedFormControl(null),
            primaryCategoryType: new UntypedFormControl(null),
            primaryCategoryRole: new UntypedFormControl(null),
            projectName: new UntypedFormControl(null, Validators.required),
            discounts: new UntypedFormControl(null),
            remarks: new UntypedFormControl(null, Validators.required),
            noRemarks: new UntypedFormControl(false),
            customDebtorNumber: new UntypedFormControl(null)
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
    get primaryCategoryArea() {
        return this.get('primaryCategoryArea');
    }
    get primaryCategoryType() {
        return this.get('primaryCategoryType');
    }
    get primaryCategoryRole() {
        return this.get('primaryCategoryRole');
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

export class WorkflowContractsSyncForm extends UntypedFormGroup {
    constructor() {
        super({
            contractLinesDoneManuallyInOldPm: new UntypedFormControl(false),
            newLegalContract: new UntypedFormControl(false),
            clientLegalContractDoneStatusId: new UntypedFormControl(null),
            enableLegalContractsButtons: new UntypedFormControl(false),
            showManualOption: new UntypedFormControl(false),
            isNewSyncNeeded: new UntypedFormControl(false),
            lastSyncedDate: new UntypedFormControl(null),
            consultants: new UntypedFormArray([], Validators.minLength(1))
        });
    }

    get contractLinesDoneManuallyInOldPm() {
        return this.get('contractLinesDoneManuallyInOldPm');
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
        return this.get('consultants') as UntypedFormArray;
    }
}

export class WorkflowContractsClientDataForm extends UntypedFormGroup {
    constructor() {
        super({
            directClientId: new UntypedFormControl(null),
            pdcInvoicingEntityId: new UntypedFormControl(null),
            clientTimeReportingCapId: new UntypedFormControl(null),
            clientTimeReportingCapMaxValue: new UntypedFormControl(null),
            clientTimeReportingCapCurrencyId: new UntypedFormControl(null),
            rateUnitType: new UntypedFormControl(null),
            currency: new UntypedFormControl(null),
            clientRate: new UntypedFormControl(null),

            invoicingReferenceNumber: new UntypedFormControl(null),
            clientInvoicingRecipientIdValue: new UntypedFormControl(null),
            clientInvoicingRecipient: new UntypedFormControl(null),
            invoicingReferencePersonIdValue: new UntypedFormControl(null),
            invoicingReferencePerson: new UntypedFormControl(null),
            invoicingReferencePersonDontShowOnInvoice: new UntypedFormControl(false),

            specialContractTerms: new UntypedFormControl(null, Validators.required),
            noSpecialContractTerms: new UntypedFormControl(null),
            clientRates: new UntypedFormArray([]),
            clientFees: new UntypedFormArray([]),

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
    get invoicingReferencePersonDontShowOnInvoice() {
        return this.get('invoicingReferencePersonDontShowOnInvoice');
    }
    get specialContractTerms() {
        return this.get('specialContractTerms');
    }
    get noSpecialContractTerms() {
        return this.get('noSpecialContractTerms');
    }
    get clientRates() {
        return this.get('clientRates') as UntypedFormArray;
    }
    get clientFees() {
        return this.get('clientFees') as UntypedFormArray;
    }
}

export class WorkflowContractsConsultantsDataForm extends UntypedFormGroup {
    constructor() {
        super({
            consultants: new UntypedFormArray([], Validators.minLength(1))
        })
    }
    get consultants() {
        return this.get('consultants') as UntypedFormArray;
    }
}

export class WorkflowConsultantsLegalContractForm extends UntypedFormGroup {
    constructor() {
        super({
            consultants: new UntypedFormArray([])
        })

    }
    get consultants() {
        return this.get('consultants') as UntypedFormArray;
    }
}


export class WorkflowContractsTerminationConsultantsDataForm extends UntypedFormGroup {
    constructor() {
        super({
            consultantTerminationContractData: new UntypedFormArray([])
        })

    }
    get consultantTerminationContractData() {
        return this.get('consultantTerminationContractData') as UntypedFormArray;
    }
}


export enum LegalContractStatus {
    NotAcceessible = 0,
    NotYetCreated = 1,
    SavedButNotGenerated = 2,
    Done = 10
}


export enum ClientTimeReportingCaps {
    CapOnUnits = 1,
    CapOnValue = 2,
    IndividualCap = 3,
    NoCap = 4
}

export enum DeliveryTypes {
    ManagedService = 1,
    Normal = 2,
    Offshore = 3,
    Nearshore = 4
}

export enum SalesTypes {
    TimeAndMaterial = 1,
    ThirdPartyMgmt = 2 ,
    ManagedService = 3,
    FeeOnly = 4,
    Recruitment = 5,
    Other = 6
}
