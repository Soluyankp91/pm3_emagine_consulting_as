import { ValidatorFn, AbstractControl } from '@angular/forms';

export class CustomValidators {
    static autocompleteValidator(id: string): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } | null => {
            if (!control.value) {
                // if control is empty return no error
                return null;
            }
            return typeof control.value === 'object' && control.value.hasOwnProperty(id) ? null : {optionNotSelected: control.value};
        };
    }
}
