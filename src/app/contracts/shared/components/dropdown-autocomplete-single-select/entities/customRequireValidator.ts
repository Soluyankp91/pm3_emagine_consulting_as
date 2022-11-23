import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function customRequiredValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        return !(typeof control.value === 'object')
            ? { customRequired: true }
            : null;
    };
}
