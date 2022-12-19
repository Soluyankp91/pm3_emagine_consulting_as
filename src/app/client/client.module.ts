import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppCommonModule } from '../shared/common/app-common.module';
import { ClientComponent } from './client.component';
import { ClientDetailsComponent } from './client-details/client-details.component';
import { ClientRoutingModule } from './client-routing.module';
import { ClientContactsComponent } from './client-contacts/client-contacts.component';
import { ClientDocumentsComponent } from './client-documents/client-documents.component';
import { ClientRatesAndFeesComponent } from './client-rates-and-fees/client-rates-and-fees.component';
import { ClientRequestTrackComponent } from './client-request-track/client-request-track.component';
import { ClientWorkflowTrackComponent } from './client-workflow-track/client-workflow-track.component';
import { AddFileDialogComponent } from './client-documents/add-file-dialog/add-file-dialog.component';
import { HubspotSyncModalComponent } from './client-details/hubspot-sync-modal/hubspot-sync-modal.component';
import { WfResponsibleComponent } from './wf-responsible/wf-responsible.component';

@NgModule({
    declarations: [
        ClientComponent,
        ClientDetailsComponent,
        ClientContactsComponent,
        ClientDetailsComponent,
        ClientDocumentsComponent,
        ClientRatesAndFeesComponent,
        ClientRequestTrackComponent,
        ClientWorkflowTrackComponent,
        AddFileDialogComponent,
        HubspotSyncModalComponent,
        WfResponsibleComponent
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