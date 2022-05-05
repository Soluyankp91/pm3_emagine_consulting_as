import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppCommonModule } from '../shared/common/app-common.module';
import { ClientComponent } from './client.component';
import { ClientDetailsComponent } from './client-details/client-details.component';
import { ClientRoutingModule } from './client-routing.module';
import { ClientConsultantsComponent } from './client-consultants/client-consultants.component';
import { ClientConsultantTrackComponent } from './client-consultant-track/client-consultant-track.component';
import { ClientContactsComponent } from './client-contacts/client-contacts.component';
import { ClientDocumentsComponent } from './client-documents/client-documents.component';
import { ClientInvoicingComponent } from './client-invoicing/client-invoicing.component';
import { ClientRatesAndFeesComponent } from './client-rates-and-fees/client-rates-and-fees.component';
import { ClientRequestTrackComponent } from './client-request-track/client-request-track.component';
import { ClientWorkflowTrackComponent } from './client-workflow-track/client-workflow-track.component';
import { AddFolderDialogComponent } from './client-documents/add-folder-dialog/add-folder-dialog.component';
import { AddFileDialogComponent } from './client-documents/add-file-dialog/add-file-dialog.component';

@NgModule({
    declarations: [
        ClientComponent,
        ClientDetailsComponent,
        ClientConsultantsComponent,
        ClientConsultantTrackComponent,
        ClientContactsComponent,
        ClientDetailsComponent,
        ClientDocumentsComponent,
        ClientInvoicingComponent,
        ClientRatesAndFeesComponent,
        ClientRequestTrackComponent,
        ClientWorkflowTrackComponent,
        AddFolderDialogComponent,
        AddFileDialogComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ClientRoutingModule,
        AppCommonModule
    ],
    exports: [],
    providers: [],
})
export class ClientModule {}