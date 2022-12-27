import { UntypedFormControl, FormGroupDirective, NgForm } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';

export class AutoNameErrorStateMatcher implements ErrorStateMatcher {
    constructor() {}
    isErrorState(
        control: UntypedFormControl | null,
        form: FormGroupDirective | NgForm | null
    ): boolean {
        return !!(control?.invalid && control.touched);
    }
}
