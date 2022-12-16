import { FormArray, FormControl, FormGroup, Validators } from "@angular/forms";

export class FinancesClientForm extends FormGroup {
    constructor() {
        super({
            clientCreatedInNavision: new FormControl(false),
            differentDebtorNumberForInvoicing: new FormControl(false),
            customDebtorNumber: new FormControl(null)
        });
    }

    get clientCreatedInNavision() {
        return this.get('clientCreatedInNavision');
    }
    get differentDebtorNumberForInvoicing() {
        return this.get('differentDebtorNumberForInvoicing');
    }
    get customDebtorNumber() {
        return this.get('customDebtorNumber');
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

export class DocumentForm extends FormGroup {
    constructor() {
        super({
            documents: new FormArray([])
        })

    }
    get documents() {
        return this.get('documents') as FormArray;
    }
}
