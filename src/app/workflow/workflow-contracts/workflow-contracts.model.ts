import { UntypedFormArray, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";

export class WorkflowContractsMainForm extends UntypedFormGroup {
    constructor() {
        super({
            salesTypeId: new UntypedFormControl(null),
            deliveryTypeId: new UntypedFormControl(null),
            projectTypeId: new UntypedFormControl(null),
            marginId: new UntypedFormControl(null),
            projectDescription: new UntypedFormControl(null, Validators.required),
            projectCategory: new UntypedFormControl(null),
            primaryCategoryArea: new UntypedFormControl(null),
            primaryCategoryType: new UntypedFormControl(null),
            primaryCategoryRole: new UntypedFormControl(null),
            projectName: new UntypedFormControl(null, Validators.required),
            discountId: new UntypedFormControl(null),
            remarks: new UntypedFormControl(null, [Validators.required, Validators.maxLength(4000)]),
            noRemarks: new UntypedFormControl(false),
            customDebtorNumber: new UntypedFormControl(null)
        });
    }

    get salesTypeId() {
        return this.get('salesTypeId');
    }
    get deliveryTypeId() {
        return this.get('deliveryTypeId');
    }
    get projectTypeId() {
        return this.get('projectTypeId');
    }
    get marginId() {
        return this.get('marginId');
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
    get discountId() {
        return this.get('discountId');
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
            endClientId: new UntypedFormControl(null),
            pdcInvoicingEntityId: new UntypedFormControl(null),
            clientTimeReportingCapId: new UntypedFormControl(null),
            timeReportingCaps: new UntypedFormArray([]),
            rateUnitTypeId: new UntypedFormControl(null),
            currencyId: new UntypedFormControl(null),
            normalRate: new UntypedFormControl(null),
            clientRateTypeId: new UntypedFormControl(null),
            frameAgreementId: new UntypedFormControl(null),
            invoiceCurrencyId: new UntypedFormControl(null),
            invoiceFrequencyId: new UntypedFormControl(null),
            invoicingTimeId: new UntypedFormControl(null),
            manualDate: new UntypedFormControl(null),
            invoicingReferenceNumber: new UntypedFormControl(null),
            clientInvoicingRecipientIdValue: new UntypedFormControl(null),
            clientInvoicingRecipientAddress: new UntypedFormControl(null),
            clientInvoicingRecipient: new UntypedFormControl(null),
            invoicingReferencePersonIdValue: new UntypedFormControl(null),
            invoicingReferencePerson: new UntypedFormControl(null),
            invoicingReferencePersonDontShowOnInvoice: new UntypedFormControl(false),
            clientInvoicingRecipientSameAsDirectClient: new UntypedFormControl(false),

            specialContractTerms: new UntypedFormControl(null),
            noSpecialContractTerms: new UntypedFormControl(null),
            clientRates: new UntypedFormArray([]),
            clientFees: new UntypedFormArray([]),
        });
    }

    get directClientId() {
        return this.get('directClientId');
    }
    get endClientId() {
        return this.get('endClientId');
    }
    get pdcInvoicingEntityId() {
        return this.get('pdcInvoicingEntityId');
    }
    get clientTimeReportingCapId() {
        return this.get('clientTimeReportingCapId');
    }
    get timeReportingCaps() {
        return this.get('timeReportingCaps') as UntypedFormArray;
    }
    get rateUnitTypeId() {
        return this.get('rateUnitTypeId');
    }
    get currencyId() {
        return this.get('currencyId');
    }
    get normalRate() {
        return this.get('normalRate');
    }
    get clientRateTypeId() {
        return this.get('clientRateTypeId');
    }
    get frameAgreementId() {
        return this.get('frameAgreementId');
    }
    get invoiceCurrencyId() {
        return this.get('invoiceCurrencyId');
    }
    get invoiceFrequencyId() {
        return this.get('invoiceFrequencyId');
    }
    get invoicingTimeId() {
        return this.get('invoicingTimeId');
    }
    get manualDate() {
        return this.get('manualDate');
    }
    get invoicingReferenceNumber() {
        return this.get('invoicingReferenceNumber');
    }
    get clientInvoicingRecipientIdValue() {
        return this.get('clientInvoicingRecipientIdValue');
    }
    get clientInvoicingRecipientAddress() {
        return this.get('clientInvoicingRecipientAddress');
    }
    get clientInvoicingRecipientSameAsDirectClient() {
        return this.get('clientInvoicingRecipientSameAsDirectClient');
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
        });
    }
    get consultants() {
        return this.get('consultants') as UntypedFormArray;
    }
}

export class WorkflowConsultantsLegalContractForm extends UntypedFormGroup {
    constructor() {
        super({
            consultants: new UntypedFormArray([])
        });

    }
    get consultants() {
        return this.get('consultants') as UntypedFormArray;
    }
}


export class WorkflowContractsTerminationConsultantsDataForm extends UntypedFormGroup {
    constructor() {
        super({
            consultantTerminationContractData: new UntypedFormArray([])
        });

    }
    get consultantTerminationContractData() {
        return this.get('consultantTerminationContractData') as UntypedFormArray;
    }
}
export class DocumentForm extends UntypedFormGroup {
    constructor() {
        super({
            documents: new UntypedFormArray([])
        })

    }
    get documents() {
        return this.get('documents') as UntypedFormArray;
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
