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

            salesAccountManagerIdValue: new FormControl(null),
            commissionAccountManagerIdValue: new FormControl(null),
            contractExpirationNotification: new FormControl(null),

            remarks: new FormControl(null),
            isRemarks: new FormControl(false)
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
    get salesAccountManagerIdValue () {
        return this.get('salesAccountManagerIdValue');
    }
    get commissionAccountManagerIdValue () {
        return this.get('commissionAccountManagerIdValue');
    }
    get contractExpirationNotification() {
        return this.get('contractExpirationNotification');
    }

    get remarks() {
        return this.get('remarks');
    }
    get isRemarks() {
        return this.get('isRemarks');
    }
}

export class WorkflowSalesClientDataForm extends FormGroup {
    constructor() {
        super({
            // Client
            isDirectClient: new FormControl(true),
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
            clientInvoicingTime: new FormControl(null),
            clientInvoicingDate: new FormControl(null),
            //client special rates
            clientSpecialRatePrice: new FormControl(null),
            clientSpecialRateCurrency: new FormControl(null),

            // clientFees
            clientFees: new FormControl(null),
            clientFeesCurrency: new FormControl(null),

            // Client Contract Duration
            clientContractStartDate: new FormControl(null),
            clientContractEndDate: new FormControl(null),
            clientContractNoEndDate: new FormControl(false),

            // Client Extension Option
            clientExtensionStartDate: new FormControl(null),
            clientExtensionEndDate: new FormControl(null),
            clientExtensionDeadline: new FormControl(null),
            clientExtensionNoEndDate: new FormControl(false),

            // Client project
            capOnTimeReporting: new FormControl(false),
            capOnTimeReportingValue: new FormControl(null)
        });
    }

    // Client
    get isDirectClient() {
        return this.get('isDirectClient');
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
    get clientInvoicingTime() {
        return this.get('clientInvoicingTime');
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
        return this.get('clientFees');
    }
    get clientFeesCurrency() {
        return this.get('clientFeesCurrency');
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
    get clientExtensionStartDate() {
        return this.get('clientExtensionStartDate');
    }
    get clientExtensionEndDate() {
        return this.get('clientExtensionEndDate');
    }
    get clientExtensionDeadline() {
        return this.get('clientExtensionDeadline');
    }
    get clientExtensionNoEndDate() {
        return this.get('clientExtensionNoEndDate');
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
            isRemarks: new FormControl(false),
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
    get isRemarks() {
        return this.get('isRemarks');
    }
}

export const ConsultantTypes = [
    {
        id: 1,
        name: 'Freelance'
    },
    {
        id: 2,
        name: 'Freelance low margin'
    },
    {
        id: 3,
        name: 'Project employment'
    },
    {
        id: 4,
        name: 'Temporary worker'
    },
    {
        id: 5,
        name: 'Nearshore'
    },
    {
        id: 6,
        name: 'VMS/Referred'
    },
    {
        id: 7,
        name: 'Permanent employee'
    },
    {
        id: 8,
        name: '48E consultant'
    },
    {
        id: 9,
        name: 'Fee only'
    }
];



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
            finalEvaluationReferencePerson: new FormControl(null),
            isEvaluation: new FormControl(null),
            finalEvaluationCause: new FormControl(null),
            endOfContract: new FormControl(null),
            endClientContractEndDate: new FormControl(null),
            endClientContractCause: new FormControl(null)
        });
    }

    get finalEvaluationReferencePerson() {
        return this.get('finalEvaluationReferencePerson');
    }
    get isEvaluation() {
        return this.get('isEvaluation');
    }
    get finalEvaluationCause() {
        return this.get('finalEvaluationCause');
    }
    get endOfContract() {
        return this.get('endOfContract');
    }
    get endClientContractEndDate() {
        return this.get('endClientContractEndDate');
    }
    get endClientContractCause() {
        return this.get('endClientContractCause');
    }
}
