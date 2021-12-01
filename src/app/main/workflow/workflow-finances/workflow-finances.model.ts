import { FormArray, FormControl, FormGroup } from "@angular/forms";

export class FinancesClientForm extends FormGroup {
    constructor() {
        super({
            clientCreatedInNavision: new FormControl(null),
            clientNumberTypeForInvoicing: new FormControl('Custom'),
            clientNumberForInvoicing: new FormControl(null)
        });
    }

    get clientCreatedInNavision() {
        return this.get('clientCreatedInNavision');
    }
    get clientNumberTypeForInvoicing() {
        return this.get('clientNumberTypeForInvoicing');
    }
    get clientNumberForInvoicing() {
        return this.get('clientNumberForInvoicing');
    }
}

export class FinancesConsultantsForm extends FormGroup {
    constructor() {
        super({
            consultants: new FormArray([])
        });
    }

    get consultants() {
        return this.get('consultants') as FormArray;
    }
}
