import { FormControl, FormGroupDirective, NgForm } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';

export class AutoNameErrorStateMatcher implements ErrorStateMatcher {
    constructor() {}
    isErrorState(
        control: FormControl | null,
        form: FormGroupDirective | NgForm | null
    ): boolean {
        return !!(control?.invalid && control.touched);
    }
}
