import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from './material/material.module';
import { ErrorDialogComponent } from './errors/error-dialog/error-dialog.component';
import { ErrorDialogService } from './errors/error-dialog.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ConfirmationDialogComponent } from '../components/confirmation-dialog/confirmation-dialog.component';
import { FileUploaderComponent } from '../components/file-uploader/file-uploader.component';
import { FileDragAndDropDirective } from '../components/file-uploader/file-drag-and-drop.directive';
import { ScrollToModule } from '@nicky-lenaers/ngx-scroll-to';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { InternalLookupService } from './internal-lookup.service';

@NgModule({
    declarations: [
        ErrorDialogComponent,
        FileDragAndDropDirective,
        FileUploaderComponent,
        ConfirmationDialogComponent,
    ],
    imports: [
        CommonModule,
        MaterialModule,
        FormsModule,
        ReactiveFormsModule,
        ScrollToModule.forRoot(),
        NgScrollbarModule
    ],
    exports: [
        MaterialModule,
        FormsModule,
        ReactiveFormsModule,
        FileDragAndDropDirective,
        FileUploaderComponent,
        ConfirmationDialogComponent,
        ScrollToModule,
        NgScrollbarModule
    ],
    providers: [
        ErrorDialogService,
        InternalLookupService
    ],
    entryComponents: [
        ErrorDialogComponent
    ]
})
export class AppCommonModule { }
