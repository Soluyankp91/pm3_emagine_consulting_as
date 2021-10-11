import { NgModule } from '@angular/core';
import { MainRoutingModule } from './main.routing.module';
import { MainComponent } from './main.component';
import { AppCommonModule } from '../shared/common/app-common.module';
import { ClientDetailsComponent } from './client-list/client-details/client-details.component';
import { ClientListComponent } from './client-list/client-list.component';
import { ContractsComponent } from './contracts/contracts.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { EvaluationComponent } from './evaluation/evaluation.component';
import { InvoicingComponent } from './invoicing/invoicing.component';
import { MainOverviewComponent } from './main-overview/main-overview.component';
import { SourcingShortcutComponent } from './sourcing-shortcut/sourcing-shortcut.component';
import { StatisticsComponent } from './statistics/statistics.component';
import { TimeTrackingComponent } from './time-tracking/time-tracking.component';
import { WorkflowComponent } from './workflow/workflow.component';
import { CommonModule } from '@angular/common';
import { ClientDocumentsComponent } from './client-list/client-documents/client-documents.component';
import { ClientConsultantsComponent } from './client-list/client-consultants/client-consultants.component';
import { ClientInvoicingComponent } from './client-list/client-invoicing/client-invoicing.component';
import { ClientConsultantTrackComponent } from './client-list/client-consultant-track/client-consultant-track.component';
import { ClientRequestTrackComponent } from './client-list/client-request-track/client-request-track.component';
import { AddFolderDialogComponent } from './client-list/client-documents/add-folder-dialog/add-folder-dialog.component';
import { AddFileDialogComponent } from './client-list/client-documents/add-file-dialog/add-file-dialog.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@NgModule({
    declarations: [
        MainComponent,
        ClientDetailsComponent,
        ClientListComponent,
        ContractsComponent,
        DashboardComponent,
        EvaluationComponent,
        InvoicingComponent,
        MainOverviewComponent,
        SourcingShortcutComponent,
        StatisticsComponent,
        TimeTrackingComponent,
        WorkflowComponent,
        ClientDocumentsComponent,
        ContractsComponent,
        ClientDetailsComponent,
        ClientRequestTrackComponent,
        ClientConsultantTrackComponent,
        ClientInvoicingComponent,
        ClientConsultantsComponent,
        AddFolderDialogComponent,
        AddFileDialogComponent
    ],
    imports: [
        CommonModule,
        MainRoutingModule,
        AppCommonModule,
        FormsModule,
        ReactiveFormsModule
    ]
})
export class MainModule { }