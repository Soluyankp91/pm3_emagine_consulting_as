import {
    AbstractControl,
    FormControl,
    FormGroup,
    ValidatorFn,
    Validators,
} from '@angular/forms';

export class ClientTemplatesModel extends FormGroup {
    constructor() {
        super({
            agreementType: new FormControl('', [Validators.required]),
            recipientTypeId: new FormControl('', [Validators.required]),
            clientId: new FormControl('', [Validators.required]),
            name: new FormControl('', [Validators.required]),
            agreementNameTemplate: new FormControl('', [Validators.required]),
            definition: new FormControl('', []),
            legalEntities: new FormControl([], [Validators.required]),
            salesTypes: new FormControl([], [Validators.required]),
            deliveryTypes: new FormControl([], [Validators.required]),
            contractTypes: new FormControl([], [Validators.required]),
            language: new FormControl('', [Validators.required]),
            note: new FormControl('', []),
            isSignatureRequired: new FormControl(false, []),
            isEnabled: new FormControl(false, []),
            attachments: new FormControl({
                selectedInheritedFiles: [],
                uploadedFiles: [],
            }),
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
    get attachments() {
        return this.get('attachments');
    }
}
