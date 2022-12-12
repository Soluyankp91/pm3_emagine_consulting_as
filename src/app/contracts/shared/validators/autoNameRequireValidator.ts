import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function autoNameRequiredValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        return control.value && !control.value.length
            ? { required: true }
            : null;
    };
}
