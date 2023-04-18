import { UntypedFormArray, UntypedFormGroup } from "@angular/forms";

export class ClientContactForm extends UntypedFormGroup {
    constructor() {
        super({
            addresses: new UntypedFormArray([]),
        })
    }
    get addresses() {
        return this.get('addresses') as UntypedFormArray;
    }
}

