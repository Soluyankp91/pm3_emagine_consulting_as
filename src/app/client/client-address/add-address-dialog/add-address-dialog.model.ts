import { UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { ClientAddressDto, CountryDto } from "src/shared/service-proxies/service-proxies";

export class ClientAddressForm extends UntypedFormGroup {
    constructor(address?: ClientAddressDto) {
        super({
            id: new UntypedFormControl(address?.id ?? null),
            isMainAddress: new UntypedFormControl(address?.isMainAddress ?? false),
            country: new UntypedFormControl(address?.countryId ? new CountryDto({id: address?.countryId, code: address?.countryCode, name: address?.countryName}) : null, Validators.required),
            address: new UntypedFormControl(address?.address ?? null, Validators.required),
            address2: new UntypedFormControl(address?.address2 ?? null),
            postCode: new UntypedFormControl(address?.postCode ?? null, Validators.required),
            city: new UntypedFormControl(address?.city ?? null, Validators.required),
            region: new UntypedFormControl(address?.region ?? null),
            isWorkplaceAddress: new UntypedFormControl(address?.isWorkplaceAddress ?? false),
            isInvoiceAddress: new UntypedFormControl(address?.isInvoiceAddress ?? false),
            debtorNumberForInvoiceAddress: new UntypedFormControl(address?.debtorNumberForInvoiceAddress ?? null)
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
    get address() {
        return this.get('address');
    }
    get address2() {
        return this.get('address2');
    }
    get postCode() {
        return this.get('postCode');
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
    get debtorNumberForInvoiceAddress() {
        return this.get('debtorNumberForInvoiceAddress');
    }
}
