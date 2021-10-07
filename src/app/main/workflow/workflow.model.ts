import { FormArray, FormControl, FormGroup } from "@angular/forms";

export class WorkflowSalesMainForm extends FormGroup {
    constructor() {
        super({
            salesType: new FormControl(null),
            nearshoreOffshore: new FormControl(null)
        });
    }

    get salesType() {
        return this.get('salesType');
    }
    get nearshoreOffshore() {
        return this.get('nearshoreOffshore');
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
            // array
            clientSigners: new FormArray([]),
            // WorkflowMainClientSignersForm
            // clientName: new FormControl(null),
            // clientRole: new FormControl(null),
            // clientSigvens: new FormControl(null),
            // WorkflowMainClientSignersForm
            // array
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

