import { FormArray, FormControl, FormGroup } from "@angular/forms";

export class WorkflowContractsMainForm extends FormGroup {
    constructor() {
        super({
            salesType: new FormControl(null),
            deliveryType: new FormControl(null),
            projectDescription: new FormControl(null),
            discounts: new FormControl(null),
            remarks: new FormControl(null),
            isRemarks: new FormControl(false)
        });
    }

    get salesType() {
        return this.get('salesType');
    }
    get deliveryType() {
        return this.get('deliveryType');
    }
    get projectDescription() {
        return this.get('projectDescription');
    }
    get discounts() {
        return this.get('discounts');
    }
    get remarks() {
        return this.get('remarks');
    }
    get isRemarks() {
        return this.get('isRemarks');
    }
}

export class WorkflowContractsClientDataForm extends FormGroup {
    constructor() {
        super({
            specialContractTerms: new FormControl(null),
            isSpecialContractTermsNone: new FormControl(null),
            clientSpecialRates: new FormArray([]),
            clientFees: new FormArray([]),

            projectDescription: new FormControl(null),
            discounts: new FormControl(null),
            remarks: new FormControl(null),
            isRemarks: new FormControl(false)
        });
    }

    get specialContractTerms() {
        return this.get('specialContractTerms');
    }
    get isSpecialContractTermsNone() {
        return this.get('isSpecialContractTermsNone');
    }
    get clientSpecialRates() {
        return this.get('clientSpecialRates') as FormArray;
    }
    get clientFees() {
        return this.get('clientFees') as FormArray;
    }

    get projectDescription() {
        return this.get('projectDescription');
    }
    get discounts() {
        return this.get('discounts');
    }
    get remarks() {
        return this.get('remarks');
    }
    get isRemarks() {
        return this.get('isRemarks');
    }
}

export class WorkflowContractsConsultantsDataForm extends FormGroup {
    constructor() {
        super({
            consultantData: new FormArray([])
        })

    }
    get consultantData() {
        return this.get('consultantData') as FormArray;
    }
}
