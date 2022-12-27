import {
    AbstractControl,
    UntypedFormControl,
    UntypedFormGroup,
    Validators,
} from '@angular/forms';
import { BehaviorSubject } from 'rxjs';

export class MasterTemplateModel extends UntypedFormGroup {
    constructor() {
        super({
            agreementType: new UntypedFormControl(null, [Validators.required]),
            recipientTypeId: new UntypedFormControl(null, [Validators.required]),
            name: new UntypedFormControl(null, [Validators.required]),
            agreementNameTemplate: new UntypedFormControl(''),
            definition: new UntypedFormControl(null),
            legalEntities: new UntypedFormControl(null, [Validators.required]),
            salesTypes: new UntypedFormControl(null, [Validators.required]),
            deliveryTypes: new UntypedFormControl(null, [Validators.required]),
            contractTypes: new UntypedFormControl(null, [Validators.required]),
            language: new UntypedFormControl(null, [Validators.required]),
            note: new UntypedFormControl(null),
            isSignatureRequired: new UntypedFormControl(null),
            isEnabled: new UntypedFormControl(null),
            selectedInheritedFiles: new UntypedFormControl(null),
            uploadedFiles: new UntypedFormControl(null),
        });
    }

    addControl(
        name: string,
        control: AbstractControl,
        options?: { emitEvent?: boolean }
    ): void {
        let currentValue = this.INITIAL_MASTER_TEMPLATE_FORM_VALUE$.value;
        let updatedValue = Object.assign(
            {},
            {
                ...currentValue,
                [name]: control.value,
            }
        );
        this.INITIAL_MASTER_TEMPLATE_FORM_VALUE$.next(updatedValue);
        super.addControl(name, control, options);
    }

    removeControl(name: string, options?: { emitEvent?: boolean }): void {
        let updatedValue = {
            ...this.INITIAL_MASTER_TEMPLATE_FORM_VALUE$.value,
        };
        delete updatedValue[name];
        this.INITIAL_MASTER_TEMPLATE_FORM_VALUE$.next(updatedValue);
        super.removeControl(name, options);
    }

    reset(
        formState?: any,
        options?: { onlySelf?: boolean; emitEvent?: boolean }
    ): void {
        super.reset(
            formState
                ? formState
                : this.INITIAL_MASTER_TEMPLATE_FORM_VALUE$.value,
            options
        );
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

    get selectedInheritedFiles() {
        return this.get('selectedInheritedFiles');
    }

    get uploadedFiles() {
        return this.get('uploadedFiles');
    }

    get initial$() {
        return this.INITIAL_MASTER_TEMPLATE_FORM_VALUE$.asObservable();
    }

    private INITIAL_MASTER_TEMPLATE_FORM_VALUE$ = new BehaviorSubject<{
        [key: string]: any;
    }>({
        agreementType: null,
        recipientTypeId: null,
        name: null,
        agreementNameTemplate: '',
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
    });
}
