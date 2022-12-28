import { UntypedFormArray, UntypedFormControl, UntypedFormGroup } from "@angular/forms";

export class FinancesClientForm extends UntypedFormGroup {
    constructor() {
        super({
            clientCreatedInNavision: new UntypedFormControl(false),
            differentDebtorNumberForInvoicing: new UntypedFormControl(false),
            customDebtorNumber: new UntypedFormControl(null)
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

export class FinancesConsultantsForm extends UntypedFormGroup {
    constructor() {
        super({
            consultants: new UntypedFormArray([])
        });
    }

    get consultants() {
        return this.get('consultants') as UntypedFormArray;
    }
}
