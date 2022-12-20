import { UntypedFormGroup, UntypedFormArray } from "@angular/forms";

export class ClientSpecailRateForm extends UntypedFormGroup {
    constructor() {
        super({
            specialRates: new UntypedFormArray([])
        })

    }
    get specialRates() {
        return this.get('specialRates') as UntypedFormArray;
    }
}

export class ClientFeesForm extends UntypedFormGroup {
    constructor() {
        super({
            clientFees: new UntypedFormArray([])
        })

    }
    get clientFees() {
        return this.get('clientFees') as UntypedFormArray;
    }
}
