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
import { ExtensionSalesComponent } from './workflow/extension-sales/extension-sales.component';
import { WorkflowSalesComponent } from './workflow/workflow-sales/workflow-sales.component';
import { WorkflowDetailsComponent } from './workflow/workflow-details/workflow-details.component';
import { WorkflowContractsComponent } from './workflow/workflow-contracts/workflow-contracts.component';
import { WorkflowOverviewComponent } from './workflow/workflow-overview/workflow-overview.component';
import { PrimaryWorkflowComponent } from './workflow/primary-workflow/primary-workflow.component';
import { DynamicComponentLoaderComponent } from './workflow/dynamic-component-loader/dynamic-component-loader.component';
import { WorkflowFinancesComponent } from './workflow/workflow-finances/workflow-finances.component';


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
        AddFileDialogComponent,
        ExtensionSalesComponent,
        WorkflowSalesComponent,
        WorkflowDetailsComponent,
        WorkflowContractsComponent,
        WorkflowOverviewComponent,
        PrimaryWorkflowComponent,
        DynamicComponentLoaderComponent,
        WorkflowFinancesComponent
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
