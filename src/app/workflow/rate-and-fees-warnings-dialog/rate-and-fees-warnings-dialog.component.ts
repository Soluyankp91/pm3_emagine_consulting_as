import { Component, Injector, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AppComponentBase } from 'src/shared/app-component-base';

@Component({
    selector: 'app-rate-and-fees-warnings-dialog',
    templateUrl: './rate-and-fees-warnings-dialog.component.html',
    styleUrls: ['./rate-and-fees-warnings-dialog.component.scss']
})
export class RateAndFeesWarningsDialogComponent extends AppComponentBase {

    constructor(
        injector: Injector,
        @Inject(MAT_DIALOG_DATA)
        public data: {
            specialRatesWarnings: string[] | undefined,
            specialFeesWarnings: string[] | undefined
        },
        private dialogRef: MatDialogRef<RateAndFeesWarningsDialogComponent>
    ) {
        super(injector);
    }

    close() {
        this.dialogRef.close();
    }

}
