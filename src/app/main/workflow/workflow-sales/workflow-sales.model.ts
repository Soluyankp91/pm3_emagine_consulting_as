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
            directClient: new FormControl(null),
            clientInvoicingRecipient: new FormControl(null),
            sameAsDirectClient: new FormControl(false),
            clientInvoicingReferencePerson: new FormControl(null),
            isClientInvoicingNone: new FormControl(false),
            evaluationReferencePerson: new FormControl(null),
            disableEvaluations: new FormControl(false),
            disableEvaluationsReason: new FormControl(null),
            clientSigners: new FormArray([]),
            specialContractTerms: new FormControl(null),
            isSpecialContractTermsNone: new FormControl(false),
            invoicingReferenceNumber: new FormControl(null),
            // client price
            clientRateAndInvoicing: new FormControl(null),
            clientPrice: new FormControl(null),
            clientCurrency: new FormControl(null),
            clientInvoiceCurrency: new FormControl(null),
            clientInvoicingTime: new FormControl(null),
            clientInvoicingDate: new FormControl(null),
            //client special rates
            clientSpecialRatePrice: new FormControl(null),
            clientSpecialRateCurrency: new FormControl(null),
            //client fees
            // TODO: TBD
            clientProjectStartDate: new FormControl(null),
            clientProjectEndDate: new FormControl(null),
            clientProjectNoEndDate: new FormControl(false),
            clientExtensionStartDate: new FormControl(null),
            clientExtensionEndDate: new FormControl(null),
            clientExtensionNoEndDate: new FormControl(false)
        });
    }

    get directClient() {
        return this.get('directClient');
    }
    get clientInvoicingRecipient() {
        return this.get('clientInvoicingRecipient');
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
    get clientProjectStartDate() {
        return this.get('clientProjectStartDate');
    }
    get clientSpecialRatePrice() {
        return this.get('clientSpecialRatePrice');
    }
    get clientSpecialRateCurrency() {
        return this.get('clientSpecialRateCurrency');
    }
    get clientProjectEndDate() {
        return this.get('clientProjectEndDate');
    }
    get clientProjectNoEndDate() {
        return this.get('clientProjectNoEndDate');
    }
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
