import { FormArray, FormControl, FormGroup } from "@angular/forms";

export class WorkflowSalesMainForm extends FormGroup {
    constructor() {
        super({
            salesType: new FormControl(null),
            nearshoreOffshore: new FormControl(null),
            salesAccountManager: new FormControl(null),
            commissionAccountManager: new FormControl(null),
            intracompanyAccountManager: new FormControl(null),
            PDCIntracompanyUnit: new FormControl(null)
        });
    }

    get salesType() {
        return this.get('salesType');
    }
    get nearshoreOffshore() {
        return this.get('nearshoreOffshore');
    }
    get salesAccountManager () {
        return this.get('salesAccountManager');
    }
    get commissionAccountManager () {
        return this.get('commissionAccountManager');
    }
    get intracompanyAccountManager () {
        return this.get('intracompanyAccountManager');
    }
    get PDCIntracompanyUnit () {
        return this.get('PDCIntracompanyUnit');
    }
}

export class WorkflowSalesClientDataForm extends FormGroup {
    constructor() {
        super({
            // Client
            directClient: new FormControl(null),
            сustomer: new FormControl(null),
            endCustomer: new FormControl(null),

            // PDC Invoicing Entity (client)

            // Client Invoicing Recipient
            invoicingProDataEntity: new FormControl(null),
            sameAsDirectClient: new FormControl(false),

            // Client Invoicing Reference Person
            clientInvoicingReferencePerson: new FormControl(null),
            isClientInvoicingNone: new FormControl(false),

            // Client Evaluations - Consultant
            evaluationReferencePerson: new FormControl(null),
            disableEvaluations: new FormControl(false),
            disableEvaluationsReason: new FormControl(null),

            // Client Contract Signers
            clientSigners: new FormArray([]),

            // Client Special Contract Terms
            specialContractTerms: new FormControl(null),
            isSpecialContractTermsNone: new FormControl(false),
            invoicingReferenceNumber: new FormControl(null),

            // Client Rate & Invoicing
            clientRateAndInvoicing: new FormControl(null),
            clientPrice: new FormControl(null),
            clientCurrency: new FormControl(null),
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
            clientExtensionNoEndDate: new FormControl(false)
        });
    }

    // Client
    get directClient() {
        return this.get('directClient');
    }
    get сustomer() {
        return this.get('сustomer');
    }
    get endCustomer() {
        return this.get('endCustomer');
    }

    // PDC Invoicing Entity (client)
    get invoicingProDataEntity() {
        return this.get('invoicingProDataEntity');
    }
    get sameAsDirectClient() {
        return this.get('sameAsDirectClient');
    }
    get clientInvoicingReferencePerson() {
        return this.get('clientInvoicingReferencePerson');
    }
    get isClientInvoicingNone() {
        return this.get('isClientInvoicingNone');
    }
    get evaluationReferencePerson() {
        return this.get('evaluationReferencePerson');
    }
    get disableEvaluations() {
        return this.get('disableEvaluations');
    }
    get disableEvaluationsReason() {
        return this.get('disableEvaluationsReason');
    }
    get clientSigners() {
        return this.get('clientSigners') as FormArray;
    }
    get specialContractTerms() {
        return this.get('specialContractTerms');
    }
    get isSpecialContractTermsNone() {
        return this.get('isSpecialContractTermsNone');
    }
    get invoicingReferenceNumber() {
        return this.get('invoicingReferenceNumber');
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
    get clientExtensionNoEndDate() {
        return this.get('clientExtensionNoEndDate');
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
