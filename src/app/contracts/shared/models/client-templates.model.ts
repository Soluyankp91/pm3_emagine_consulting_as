import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';

export class ClientTemplatesModel extends UntypedFormGroup {
    constructor() {
        super({
            agreementType: new UntypedFormControl(null, [Validators.required]),
            recipientTypeId: new UntypedFormControl(null, [Validators.required]),
            clientId: new UntypedFormControl(null, [Validators.required]),
            name: new UntypedFormControl(null, [Validators.required]),
            agreementNameTemplate: new UntypedFormControl(null, [Validators.required]),
            definition: new UntypedFormControl(null, []),
            legalEntities: new UntypedFormControl(null, [Validators.required]),
            salesTypes: new UntypedFormControl(null, [Validators.required]),
            deliveryTypes: new UntypedFormControl(null, [Validators.required]),
            contractTypes: new UntypedFormControl(null, [Validators.required]),
            language: new UntypedFormControl(null, [Validators.required]),
            note: new UntypedFormControl(null, []),
            isSignatureRequired: new UntypedFormControl(null, []),
            isEnabled: new UntypedFormControl(null, []),
            selectedInheritedFiles: new UntypedFormControl(),
            uploadedFiles: new UntypedFormControl(),
        });
    }
    get agreementType() {
        return this.get('agreementType');
    }

    get recipientTypeId() {
        return this.get('recipientTypeId');
    }

    get clientId() {
        return this.get('clientId');
    }

    get name() {
        return this.get('name');
    }

    get agreementNameTemplate() {
        return this.get('agreementNameTemplate');
    }

    get definition() {
        return this.get('definition');
    }

    get legalEntities() {
        return this.get('legalEntities');
    }

    get salesTypes() {
        return this.get('salesTypes');
    }

    get deliveryTypes() {
        return this.get('deliveryTypes');
    }

    get contractTypes() {
        return this.get('contractTypes');
    }

    get language() {
        return this.get('language');
    }

    get note() {
        return this.get('note');
    }

    get isSignatureRequired() {
        return this.get('isSignatureRequired');
    }

    get isEnabled() {
        return this.get('isEnabled');
    }
    get selectedInheritedFiles() {
        return this.get('selectedInheritedFiles');
    }
    get uploadedFiles() {
        return this.get('uploadedFiles');
    }
}

export const INITIAL_CLIENT_TEMPLATE_FORM_VALUE = {
    agreementType: null,
    recipientTypeId: null,
    clientId: null,
    name: null,
    agreementNameTemplate: null,
    definition: null,
    legalEntities: null,
    salesTypes: null,
    deliveryTypes: null,
    contractTypes: null,
    language: null,
    note: null,
    isSignatureRequired: null,
    isEnabled: null,
    selectedInheritedFiles: null,
    uploadedFiles: null,
};
