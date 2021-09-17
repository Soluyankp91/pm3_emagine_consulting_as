import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from './material/material.module';
import { ErrorDialogComponent } from './errors/error-dialog/error-dialog.component';
import { ErrorDialogService } from './errors/error-dialog.service';

@NgModule({
    declarations: [
        ErrorDialogComponent
    ],
    imports: [
        CommonModule,
        MaterialModule
    ],
    exports: [
        MaterialModule
    ],
    providers: [
        ErrorDialogService
    ],
    entryComponents: [
        ErrorDialogComponent
    ]
})
export class AppCommonModule { }
