import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MsalGuard } from '@azure/msal-angular';
import { ClientDetailsComponent } from './client-list/client-details/client-details.component';
import { ClientListComponent } from './client-list/client-list.component';
import { ContractsComponent } from './contracts/contracts.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { EvaluationComponent } from './evaluation/evaluation.component';
import { InvoicingComponent } from './invoicing/invoicing.component';
import { MainOverviewComponent } from './main-overview/main-overview.component';
import { MainComponent } from './main.component';
import { SourcingShortcutComponent } from './sourcing-shortcut/sourcing-shortcut.component';
import { StatisticsComponent } from './statistics/statistics.component';
import { TimeTrackingComponent } from './time-tracking/time-tracking.component';
import { WorkflowDetailsComponent } from './workflow/workflow-details/workflow-details.component';
import { WorkflowComponent } from './workflow/workflow.component';

@NgModule({
  imports: [RouterModule.forChild(
    [
        { path: '', component: MainComponent, children: [
            { path: 'dashboard', component: DashboardComponent },
            { path: 'overview', component: MainOverviewComponent },
            { path: 'clients', component: ClientListComponent },
            { path: 'clients/:id', component: ClientDetailsComponent },
            { path: 'sourcing-shortcut', component: SourcingShortcutComponent },
            { path: 'workflow', component: WorkflowComponent },
            { path: 'workflow/:id', component: WorkflowDetailsComponent },
            { path: 'statistics', component: StatisticsComponent },
            { path: 'time-tracking', component: TimeTrackingComponent },
            { path: 'evaluation', component: EvaluationComponent },
            { path: 'invoicing', component: InvoicingComponent },
            { path: 'contracts', component: ContractsComponent },
            { path: '**', redirectTo: 'dashboard' }
        ]},
    ]
  )],
  exports: [RouterModule]
})
export class MainRoutingModule { }
