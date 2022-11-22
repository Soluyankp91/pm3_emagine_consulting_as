import { FormControl, FormGroup } from '@angular/forms';

export class MasterTemplateModel extends FormGroup {
    constructor() {
        super({
            agreementType: new FormControl({}),
            recipientTypeId: new FormControl({}),
            name: new FormControl(''),
            agreementNameTemplate: new FormControl(''),
            definition: new FormControl(''),
            legalEntities: new FormControl([]),
            salesTypes: new FormControl([]),
            deliveryTypes: new FormControl([]),
            contractTypes: new FormControl([]),
            language: new FormControl({}),
            note: new FormControl(''),
            isSignatureRequired: new FormControl(false),
            isEnabled: new FormControl(false),
            attachments: new FormControl([]),
        });
    }

    get agreementType() {
        return this.get('agreementType');
    }

    get recipientTypeId() {
        return this.get('recipientTypeId');
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
