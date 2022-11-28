import { FormControl, FormGroupDirective, NgForm } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';

export class SingleAutoErrorStateMatcher implements ErrorStateMatcher {
    constructor() {}
    isErrorState(
        control: FormControl | null,
        form: FormGroupDirective | NgForm | null
    ): boolean {
        // console.log(control?.touched, control?.invalid);
        return !!(control?.touched && control?.invalid);
    }
}
