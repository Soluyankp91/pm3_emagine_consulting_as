import { UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";

export class ClientAddressForm extends UntypedFormGroup {
    constructor() {
        super({
            id: new UntypedFormControl(null),
            isMainAddress: new UntypedFormControl(false),
            country: new UntypedFormControl(null),
            streetAndNumber: new UntypedFormControl(null),
            addressLine2: new UntypedFormControl(null),
            zipCode: new UntypedFormControl(null),
            city: new UntypedFormControl(null),
            region: new UntypedFormControl(null),
            isWorkplaceAddress: new UntypedFormControl(false),
            isInvoiceAddress: new UntypedFormControl(false),
            debitorNumber: new UntypedFormControl(null)
        })
    }
    get id() {
        return this.get('id');
    }
    get isMainAddress() {
        return this.get('isMainAddress');
    }
    get country() {
        return this.get('country');
    }
    get streetAndNumber() {
        return this.get('streetAndNumber');
    }
    get addressLine2() {
        return this.get('addressLine2');
    }
    get zipCode() {
        return this.get('zipCode');
    }
    get city() {
        return this.get('city');
    }
    get region() {
        return this.get('region');
    }
    get isWorkplaceAddress() {
        return this.get('isWorkplaceAddress');
    }
    get isInvoiceAddress() {
        return this.get('isInvoiceAddress');
    }
    get debitorNumber() {
        return this.get('debitorNumber');
    }
}
