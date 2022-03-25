import { FormArray, FormControl, FormGroup } from "@angular/forms";

export class WorkflowContractsMainForm extends FormGroup {
    constructor() {
        super({
            salesType: new FormControl(null),
            deliveryType: new FormControl(null),
            projectType: new FormControl(null),
            margin: new FormControl(null),
            projectDescription: new FormControl(null),
            discounts: new FormControl(null),
            remarks: new FormControl(null),
            noRemarks: new FormControl(false)
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
    get discounts() {
        return this.get('discounts');
    }
    get remarks() {
        return this.get('remarks');
    }
    get noRemarks() {
        return this.get('noRemarks');
    }
}

export class WorkflowContractsSyncForm extends FormGroup {
    constructor() {
        super({
            salesType: new FormControl(null),
            deliveryType: new FormControl(null),
            projectDescription: new FormControl(null),
            discounts: new FormControl(null),
            remarks: new FormControl(null),
            manualCheckbox: new FormControl(false)
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
    get manualCheckbox() {
        return this.get('manualCheckbox');
    }
}

export class WorkflowContractsClientDataForm extends FormGroup {
    constructor() {
        super({
            capOnTimeReporting: new FormControl(null),

            specialContractTerms: new FormControl(null),
            isSpecialContractTermsNone: new FormControl(null),
            clientRates: new FormArray([]),
            clientFees: new FormArray([]),

        });
    }

    get capOnTimeReporting() {
        return this.get('capOnTimeReporting');
    }
    get specialContractTerms() {
        return this.get('specialContractTerms');
    }
    get isSpecialContractTermsNone() {
        return this.get('isSpecialContractTermsNone');
    }
    get clientRates() {
        return this.get('clientRates') as FormArray;
    }
    get clientFees() {
        return this.get('clientFees') as FormArray;
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
