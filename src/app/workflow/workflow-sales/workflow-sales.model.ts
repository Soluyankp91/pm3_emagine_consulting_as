import { UntypedFormArray, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { CustomValidators } from "src/shared/utils/custom-validators";

export class WorkflowSalesMainForm extends UntypedFormGroup {
    constructor() {
        super({
            salesType: new UntypedFormControl(null, Validators.required),
            deliveryType: new UntypedFormControl(null, Validators.required),
            projectType: new UntypedFormControl(null, Validators.required),
            margin: new UntypedFormControl(null, Validators.required),
            projectCategory: new UntypedFormControl(null, Validators.required),
            projectDescription: new UntypedFormControl(null, [Validators.required, Validators.maxLength(4000)]),
            projectName: new UntypedFormControl(null, [Validators.required, Validators.maxLength(100)]),

            discounts: new UntypedFormControl(null),

            commissions: new UntypedFormArray([]),
            commissionedUsers: new UntypedFormArray([]),

            salesAccountManagerIdValue: new UntypedFormControl(null, [Validators.required, CustomValidators.autocompleteValidator(['id'])]),
            commissionAccountManagerIdValue: new UntypedFormControl(null),
            contractExpirationNotification: new UntypedFormControl(null),
            customContractExpirationNotificationDate: new UntypedFormControl(null),

            remarks: new UntypedFormControl(null),
            noRemarks: new UntypedFormControl(false)
        });
    }

    get salesType() {
        return this.get('salesType');
    }
    get projectType() {
        return this.get('projectType');
    }
    get deliveryType() {
        return this.get('deliveryType');
    }
    get margin() {
        return this.get('margin');
    }
    get projectCategory() {
        return this.get('projectCategory');
    }
    get projectDescription() {
        return this.get('projectDescription');
    }
    get projectName() {
        return this.get('projectName');
    }
    get discounts() {
        return this.get('discounts');
    }
    get commissions() {
        return this.get('commissions') as UntypedFormArray;
    }
    get commissionedUsers() {
        return this.get('commissionedUsers') as UntypedFormArray;
    }
    get salesAccountManagerIdValue () {
        return this.get('salesAccountManagerIdValue');
    }
    get commissionAccountManagerIdValue () {
        return this.get('commissionAccountManagerIdValue');
    }
    get contractExpirationNotification() {
        return this.get('contractExpirationNotification');
    }
    get customContractExpirationNotificationDate() {
        return this.get('customContractExpirationNotificationDate');
    }
    get remarks() {
        return this.get('remarks');
    }
    get noRemarks() {
        return this.get('noRemarks');
    }
}

export class WorkflowSalesClientDataForm extends UntypedFormGroup {
    constructor() {
        super({
            // Client
            differentEndClient: new UntypedFormControl(true),
            directClientIdValue: new UntypedFormControl(null, [Validators.required, CustomValidators.autocompleteValidator(['clientId'])]),
            endClientIdValue: new UntypedFormControl(null, CustomValidators.autocompleteValidator(['clientId'])),

            // PDC Invoicing Entity (client)

            // Client Invoicing Recipient
            pdcInvoicingEntityId: new UntypedFormControl(null, Validators.required),
            clientInvoicingRecipientSameAsDirectClient: new UntypedFormControl(false, Validators.required),
            invoicingReferenceNumber: new UntypedFormControl(null),
            clientInvoicingRecipientIdValue: new UntypedFormControl(null, [Validators.required, CustomValidators.autocompleteValidator(['clientId'])]),

            // Client Invoicing Reference Person
            invoicePaperworkContactIdValue: new UntypedFormControl(null, [Validators.required, CustomValidators.autocompleteValidator(['id'])]),

            // Client Evaluations - Consultant
            evaluationsReferencePersonIdValue: new UntypedFormControl(null, CustomValidators.autocompleteValidator(['id'])),
            evaluationsDisabled: new UntypedFormControl(false),
            evaluationsDisabledReason: new UntypedFormControl(null),

            // Client Contract Signers
            contractSigners: new UntypedFormArray([]),

            // Client Special Contract Terms
            specialContractTerms: new UntypedFormControl(null, Validators.required),
            noSpecialContractTerms: new UntypedFormControl(false),

            // Client Rate & Invoicing
            clientRateAndInvoicing: new UntypedFormControl(null),
            clientPrice: new UntypedFormControl(null, Validators.required),
            clientCurrency: new UntypedFormControl(null, Validators.required),
            rateUnitTypeId: new UntypedFormControl(null),
            clientInvoiceCurrency: new UntypedFormControl(null, Validators.required),
            clientInvoiceFrequency: new UntypedFormControl(null),
            clientInvoiceTime: new UntypedFormControl(null),
            clientInvoicingDate: new UntypedFormControl(null),

            // clientRatesNFees
            clientFees: new UntypedFormArray([]),
            clientRates: new UntypedFormArray([]),

            // Client Contract Duration
            clientContractStartDate: new UntypedFormControl(null, Validators.required),
            clientContractEndDate: new UntypedFormControl(null, Validators.required),
            clientContractNoEndDate: new UntypedFormControl(false),

            // Client Extension Option
            clientExtensionDuration: new UntypedFormControl(null),
            clientExtensionEndDate: new UntypedFormControl(null),
            clientExtensionDeadline: new UntypedFormControl(null),
            noClientExtensionOption: new UntypedFormControl(false),

            // Client project
            capOnTimeReporting: new UntypedFormControl(false),
            capOnTimeReportingValue: new UntypedFormControl(null)
        });
    }

    // Client
    get differentEndClient() {
        return this.get('differentEndClient');
    }
    get directClientIdValue() {
        return this.get('directClientIdValue');
    }
    get endClientIdValue() {
        return this.get('endClientIdValue');
    }

    // PDC Invoicing Entity (client)
    get pdcInvoicingEntityId() {
        return this.get('pdcInvoicingEntityId');
    }
    get clientInvoicingRecipientSameAsDirectClient() {
        return this.get('clientInvoicingRecipientSameAsDirectClient');
    }
    get invoicingReferenceNumber() {
        return this.get('invoicingReferenceNumber');
    }
    get clientInvoicingRecipientIdValue() {
        return this.get('clientInvoicingRecipientIdValue');
    }
    get invoicePaperworkContactIdValue() {
        return this.get('invoicePaperworkContactIdValue');
    }
    get evaluationsReferencePersonIdValue() {
        return this.get('evaluationsReferencePersonIdValue');
    }
    get evaluationsDisabled() {
        return this.get('evaluationsDisabled');
    }
    get evaluationsDisabledReason() {
        return this.get('evaluationsDisabledReason');
    }
    get contractSigners() {
        return this.get('contractSigners') as UntypedFormArray;
    }
    get specialContractTerms() {
        return this.get('specialContractTerms');
    }
    get noSpecialContractTerms() {
        return this.get('noSpecialContractTerms');
    }

    // CLient rate and invoicing
    get clientRateAndInvoicing() {
        return this.get('clientRateAndInvoicing');
    }
    get clientPrice() {
        return this.get('clientPrice');
    }
    get clientCurrency() {
        return this.get('clientCurrency');
    }
    get rateUnitTypeId() {
        return this.get('rateUnitTypeId');
    }
    get clientInvoiceCurrency() {
        return this.get('clientInvoiceCurrency');
    }
    get clientInvoiceFrequency() {
        return this.get('clientInvoiceFrequency');
    }
    get clientInvoiceTime() {
        return this.get('clientInvoiceTime');
    }
    get clientInvoicingDate() {
        return this.get('clientInvoicingDate');
    }
    get clientSpecialRatePrice() {
        return this.get('clientSpecialRatePrice');
    }
    get clientSpecialRateCurrency() {
        return this.get('clientSpecialRateCurrency');
    }

    //clientFees

    get clientFees() {
        return this.get('clientFees') as UntypedFormArray;
    }

    get clientRates() {
        return this.get('clientRates') as UntypedFormArray;
    }

    // Client Contract Duration
    get clientContractStartDate() {
        return this.get('clientContractStartDate');
    }
    get clientContractEndDate() {
        return this.get('clientContractEndDate');
    }
    get clientContractNoEndDate() {
        return this.get('clientContractNoEndDate');
    }

    // Client Extension Option
    get clientExtensionDuration() {
        return this.get('clientExtensionDuration');
    }
    get clientExtensionEndDate() {
        return this.get('clientExtensionEndDate');
    }
    get clientExtensionDeadline() {
        return this.get('clientExtensionDeadline');
    }
    get noClientExtensionOption() {
        return this.get('noClientExtensionOption');
    }

    // Client Porject

    get capOnTimeReporting() {
        return this.get('capOnTimeReporting');
    }
    get capOnTimeReportingValue() {
        return this.get('capOnTimeReportingValue');
    }

}

export class WorkflowSalesConsultantsForm extends UntypedFormGroup {
    constructor() {
        super({
            consultantData: new UntypedFormArray([], Validators.minLength(1))
        })

    }
    get consultantData() {
        return this.get('consultantData') as UntypedFormArray;
    }
}

export enum ConsultantDiallogAction {
    Change = 1,
    Extend = 2,
    Terminate = 3
}

export class SalesTerminateConsultantForm extends UntypedFormGroup {
    constructor() {
        super({
            finalEvaluationReferencePerson: new UntypedFormControl(null),
            noEvaluation: new UntypedFormControl(null),
            causeOfNoEvaluation: new UntypedFormControl(null),
            terminationTime: new UntypedFormControl(null),
            endDate: new UntypedFormControl(null),
            terminationReason: new UntypedFormControl(null),
            causeOfNonStandardTerminationTime: new UntypedFormControl(null),
            additionalComments: new UntypedFormControl(null)
        });
    }

    get finalEvaluationReferencePerson() {
        return this.get('finalEvaluationReferencePerson');
    }
    get noEvaluation() {
        return this.get('noEvaluation');
    }
    get causeOfNoEvaluation() {
        return this.get('causeOfNoEvaluation');
    }
    get terminationTime() {
        return this.get('terminationTime');
    }
    get endDate() {
        return this.get('endDate');
    }
    get terminationReason() {
        return this.get('terminationReason');
    }
    get causeOfNonStandardTerminationTime() {
        return this.get('causeOfNonStandardTerminationTime');
    }
    get additionalComments() {
        return this.get('additionalComments');
    }
}

export const TenantList = [
    {
        id: 1,
        name: "Denmark",
        code: 'DK'
    },
    {
        id: 27,
        name: "France",
        code: 'FR'
    },
    {
        id: 10,
        name: "Germany",
        code: 'DE'
    },
    {
        id: 25,
        name: "International",
        code: 'EU'
    },
    {
        id: 8,
        name: "Netherlands",
        code: 'NL'
    },
    {
        id: 17,
        name: "Norway",
        code: 'NO'
    },
    {
        id: 4,
        name: "Poland",
        code: 'PL'
    },
    {
        id: 2,
        name: "Sweden",
        code: 'SE'
    }
];
