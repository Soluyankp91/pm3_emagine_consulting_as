import { FormGroup, FormArray } from "@angular/forms";

export class ClientSpecailRateForm extends FormGroup {
    constructor() {
        super({
            specialRates: new FormArray([])
        })

    }
    get specialRates() {
        return this.get('specialRates') as FormArray;
    }
}

export class ClientFeesForm extends FormGroup {
    constructor() {
        super({
            clientFees: new FormArray([])
        })

    }
    get clientFees() {
        return this.get('clientFees') as FormArray;
    }
}
