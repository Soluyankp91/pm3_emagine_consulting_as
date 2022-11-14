import { ValidatorFn, AbstractControl } from '@angular/forms';

export class CustomValidators {
    static autocompleteValidator(ids: string[]): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } | null => {
            if (!control.value) {
                // if control is empty return no error
                return null;
            }
            if (typeof control.value === 'object') {
                return ids?.some(id => control.value.hasOwnProperty(id)) ? null : {optionNotSelected: control.value};
            } else {
                return {optionNotSelected: control.value};
            }
        };
    }

    static autocompleteConsultantValidator(): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } | null => {
            if (!control.value) {
                // if control is empty return no error
                return null;
            }
            if (control.value.consultant === undefined) {
                return {required: control.value};
            }
            if (typeof control.value === 'object') {
                return control.value.consultant?.hasOwnProperty('id') ? null : {optionNotSelected: control.value};
            } else {
                return {optionNotSelected: control.value};
            }
        };
    }
}
