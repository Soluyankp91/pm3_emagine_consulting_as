import { FormControl, FormGroup, Validators } from '@angular/forms';

export class ClientTemplatesModel extends FormGroup {
    constructor() {
        super({
            agreementType: new FormControl(null, [Validators.required]),
            recipientTypeId: new FormControl(null, [Validators.required]),
            clientId: new FormControl(null, [Validators.required]),
            name: new FormControl(null, [Validators.required]),
            agreementNameTemplate: new FormControl(null, [Validators.required]),
            definition: new FormControl(null, []),
            legalEntities: new FormControl(null, [Validators.required]),
            salesTypes: new FormControl(null, [Validators.required]),
            deliveryTypes: new FormControl(null, [Validators.required]),
            contractTypes: new FormControl(null, [Validators.required]),
            language: new FormControl(null, [Validators.required]),
            note: new FormControl(null, []),
            isSignatureRequired: new FormControl(null, []),
            isEnabled: new FormControl(null, []),
            selectedInheritedFiles: new FormControl(),
            uploadedFiles: new FormControl(),
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
