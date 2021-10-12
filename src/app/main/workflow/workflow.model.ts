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
            clientSigners: new FormArray([]),
            specialContractTerms: new FormControl(null),
            isSpecialContractTermsNone: new FormControl(false),
            invoicingReferenceNumber: new FormControl(null),
            clientRateAndInvoicing: new FormControl(null),
            clientInvoicingPeriod: new FormControl(null),
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
    get clientSigners() {
        return this.get('clientSigners') as FormArray;
    }
    // get clientName() {
    //     return this.get('clientName');
    // }
    // get clientRole() {
    //     return this.get('clientRole');
    // }
    // get clientSigvens() {
    //     return this.get('clientSigvens');
    // }
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
    get clientInvoicingPeriod() {
        return this.get('clientInvoicingPeriod');
    }
    get clientProjectStartDate() {
        return this.get('clientProjectStartDate');
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

export class WorkflowContractsSummaryForm extends FormGroup {
    constructor() {
        super({
            contractData: new FormArray([])
        })

    }
    get contractData() {
        return this.get('contractData') as FormArray;
    }
}

export class WorkflowSalesExtensionForm extends FormGroup {
    constructor() {
        super({
            extensionEndDate: new FormControl(null),
            noExtensionEndDate: new FormControl(false),
            workflowInformation: new FormControl(null)
        })

    }
    get extensionEndDate() {
        return this.get('extensionEndDate');
    }
    get noExtensionEndDate() {
        return this.get('noExtensionEndDate');
    }
    get workflowInformation() {
        return this.get('workflowInformation');
    }
}

export class WorkflowTerminationSalesForm extends FormGroup {
    constructor() {
        super({
            cause: new FormControl(null),
            comments: new FormControl(null),
            clientEvaluationConsultant: new FormControl(null),
            clientEvaluationProData: new FormControl(null),
            endDate: new FormControl(null)
        })

    }
    get cause() {
        return this.get('cause');
    }
    get comments() {
        return this.get('comments');
    }
    get clientEvaluationConsultant() {
        return this.get('clientEvaluationConsultant');
    }
    get clientEvaluationProData() {
        return this.get('clientEvaluationProData');
    }
    get endDate() {
        return this.get('endDate');
    }
}

