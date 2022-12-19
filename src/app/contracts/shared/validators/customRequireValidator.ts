import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function RequiredValidator(parentControl: AbstractControl): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        if (!(control.value !== null && typeof control.value === 'object')) {
            let errors = {
                required: true,
            };
            parentControl.setErrors(errors);
            return errors;
        }
        return null;
    };
}
