import { UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";

export class PurchaseOrderForm extends UntypedFormGroup {
    constructor() {
        super({
            id: new UntypedFormControl(null),
            number: new UntypedFormControl('', Validators.required),
            receiveDate: new UntypedFormControl(null),
            numberMissingButRequired: new UntypedFormControl(false),
            capForInvoicing: new CapForInvoicingForm()
        });
    }

    get id() {
        return this.get('id');
    }
    get number() {
        return this.get('number');
    }
    get receiveDate() {
        return this.get('receiveDate');
    }
    get numberMissingButRequired() {
        return this.get('numberMissingButRequired');
    }
    get capForInvoicing() {
        return this.get('capForInvoicing') as CapForInvoicingForm;
    }
}

export class CapForInvoicingForm extends UntypedFormGroup {
    constructor() {
        super({
            type: new UntypedFormControl(null),
            maxAmount: new UntypedFormControl(null, Validators.required),
            valueUnitTypeId: new UntypedFormControl(null),
            currencyId: new UntypedFormControl(null),
            amountUsed: new UntypedFormControl(null),
        })
    }

    get type() {
        return this.get('type');
    }
    get maxAmount() {
        return this.get('maxAmount');
    }
}
