import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function requiredValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        return !(control.value !== null && typeof control.value === 'object')
            ? { required: true }
            : null;
    };
}
