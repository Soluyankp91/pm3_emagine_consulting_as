import { FormArray, FormControl, FormGroup } from "@angular/forms";

export class WorkflowSalesMainForm extends FormGroup {
    constructor() {
        super({
            salesType: new FormControl(null),
            deliveryType: new FormControl(null),
            projectType: new FormControl(null),
            margin: new FormControl(null),
            projectCategory: new FormControl(null),
            projectDescription: new FormControl(null),

            discounts: new FormControl(null),

            commissions: new FormArray([]),

            salesAccountManagerIdValue: new FormControl(null),
            commissionAccountManagerIdValue: new FormControl(null),
            contractExpirationNotification: new FormControl(null),
            customContractExpirationNotificationDate: new FormControl(null),

            remarks: new FormControl(null),
            noRemarks: new FormControl(false)
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
    get discounts() {
        return this.get('discounts');
    }
    get commissions() {
        return this.get('commissions') as FormArray;
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

export class WorkflowSalesClientDataForm extends FormGroup {
    constructor() {
        super({
            // Client
            differentEndClient: new FormControl(true),
            directClientIdValue: new FormControl(null),
            endClientIdValue: new FormControl(null),

            // PDC Invoicing Entity (client)

            // Client Invoicing Recipient
            pdcInvoicingEntityId: new FormControl(null),
            clientInvoicingRecipientSameAsDirectClient: new FormControl(false),
            invoicingReferenceNumber: new FormControl(null),
            clientInvoicingRecipientIdValue: new FormControl(null),

            // Client Invoicing Reference Person
            invoicingReferencePersonIdValue: new FormControl(null),
            noInvoicingReferencePerson: new FormControl(false),

            // Client Evaluations - Consultant
            evaluationsReferencePersonIdValue: new FormControl(null),
            evaluationsDisabled: new FormControl(false),
            evaluationsDisabledReason: new FormControl(null),

            // Client Contract Signers
            contractSigners: new FormArray([]),

            // Client Special Contract Terms
            specialContractTerms: new FormControl(null),
            noSpecialContractTerms: new FormControl(false),

            // Client Rate & Invoicing
            clientRateAndInvoicing: new FormControl(null),
            clientPrice: new FormControl(null),
            clientCurrency: new FormControl(null),
            rateUnitTypeId: new FormControl(null),
            clientInvoiceCurrency: new FormControl(null),
            clientInvoiceFrequency: new FormControl(null),
            clientInvoicingDate: new FormControl(null),
            //client special rates
            clientSpecialRatePrice: new FormControl(null),
            clientSpecialRateCurrency: new FormControl(null),

            // clientFees
            clientFees: new FormArray([]),
            clientRates: new FormArray([]),

            // Client Contract Duration
            clientContractStartDate: new FormControl(null),
            clientContractEndDate: new FormControl(null),
            clientContractNoEndDate: new FormControl(false),

            // Client Extension Option
            clientExtensionDuration: new FormControl(null),
            clientExtensionEndDate: new FormControl(null),
            clientExtensionDeadline: new FormControl(null),
            noClientExtensionOption: new FormControl(false),

            // Client project
            capOnTimeReporting: new FormControl(false),
            capOnTimeReportingValue: new FormControl(null)
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
    get invoicingReferencePersonIdValue() {
        return this.get('invoicingReferencePersonIdValue');
    }
    get noInvoicingReferencePerson() {
        return this.get('noInvoicingReferencePerson');
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
        return this.get('contractSigners') as FormArray;
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
        return this.get('clientFees') as FormArray;
    }

    get clientRates() {
        return this.get('clientRates') as FormArray;
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

export class WorkflowSalesConsultantsForm extends FormGroup {
    constructor() {
        super({
            consultantData: new FormArray([])
        })

    }
    get consultantData() {
        return this.get('consultantData') as FormArray;
    }
}

export class WorkflowSalesAdditionalDataForm extends FormGroup {
    constructor() {
        super({
            notification: new FormControl(null),
            projectCategory: new FormControl(null),
            projectDescription: new FormControl(null),
            workplace: new FormControl(null),
            expectedWorkloadHours: new FormControl(null),
            expectedWorkloadPeriod: new FormControl(null),
            expectedWorkloadNA: new FormControl(false),
            timeReportingCap: new FormControl(null),
            timeReportingNoCap: new FormControl(false),
            highLowMargin: new FormControl(null),
            discounts: new FormControl(null),
            isDiscounts: new FormControl(false),
            fees: new FormControl(null),
            isFees: new FormControl(false),
            comission: new FormControl(null),
            isComission: new FormControl(false),
            remarks: new FormControl(null),
            noRemarks: new FormControl(false),
        })

    }
    get notification() {
        return this.get('notification');
    }
    get projectCategory() {
        return this.get('projectCategory');
    }
    get projectDescription() {
        return this.get('projectDescription');
    }
    get workplace() {
        return this.get('workplace');
    }
    get expectedWorkloadHours() {
        return this.get('expectedWorkloadHours');
    }
    get expectedWorkloadPeriod() {
        return this.get('expectedWorkloadPeriod');
    }
    get expectedWorkloadNA() {
        return this.get('expectedWorkloadNA');
    }
    get timeReportingCap() {
        return this.get('timeReportingCap');
    }
    get timeReportingNoCap() {
        return this.get('timeReportingNoCap');
    }
    get highLowMargin() {
        return this.get('highLowMargin');
    }
    get discounts() {
        return this.get('discounts');
    }
    get isDiscounts() {
        return this.get('isDiscounts');
    }
    get fees() {
        return this.get('fees');
    }
    get isFees() {
        return this.get('isFees');
    }
    get comission() {
        return this.get('comission');
    }
    get isComission() {
        return this.get('isComission');
    }
    get remarks() {
        return this.get('remarks');
    }
    get noRemarks() {
        return this.get('noRemarks');
    }
}

export const InputReadonlyState = {
    deliveryType: true,
    salesType: true,
    margin: true,
    // all inputs
}

export const InputReadonlyStates = [
    {
        name: "deliveryType",
        readonly: true,
    },
    {
        name: "salesType",
        readonly: true,
    }
];


export enum ConsultantDiallogAction {
    Change = 1,
    Extend = 2,
    Terminate = 3
}

export class SalesTerminateConsultantForm extends FormGroup {
    constructor() {
        super({
            finalEvaluationReferencePersonId: new FormControl(null),
            noEvaluation: new FormControl(null),
            causeOfNoEvaluation: new FormControl(null),
            terminationBeforeEndOfContract: new FormControl(null),
            endDate: new FormControl(null),
            terminationReason: new FormControl(null),
            causeOfTerminationBeforeEndOfContract: new FormControl(null),
            additionalComments: new FormControl(null)
        });
    }

    get finalEvaluationReferencePersonId() {
        return this.get('finalEvaluationReferencePersonId');
    }
    get noEvaluation() {
        return this.get('noEvaluation');
    }
    get causeOfNoEvaluation() {
        return this.get('causeOfNoEvaluation');
    }
    get terminationBeforeEndOfContract() {
        return this.get('terminationBeforeEndOfContract');
    }
    get endDate() {
        return this.get('endDate');
    }
    get terminationReason() {
        return this.get('terminationReason');
    }
    get causeOfTerminationBeforeEndOfContract() {
        return this.get('causeOfTerminationBeforeEndOfContract');
    }
    get additionalComments() {
        return this.get('additionalComments');
    }
}
