import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class DirtyCheckService {
    initialFormValue$ = new BehaviorSubject({
        agreementType: '',
        recipientTypeId: '',
        name: '',
        agreementNameTemplate: '',
        definition: '',
        legalEntities: [],
        salesTypes: [],
        deliveryTypes: [],
        contractTypes: [],
        language: '',
        note: '',
        isSignatureRequired: false,
        isEnabled: false,
        attachments: {
            selectedInheritedFiles: [],
            uploadedFiles: [],
        },
    });
    constructor() {}
}
