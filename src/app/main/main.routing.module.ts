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
import { WorkflowSecondComponent } from './workflow/workflow-second/workflow-second.component';
import { WorkflowThirdComponent } from './workflow/workflow-third/workflow-third.component';
import { WorkflowComponent } from './workflow/workflow.component';

@NgModule({
  imports: [RouterModule.forChild(
    [
        { path: '', component: MainComponent, children: [
            { path: 'dashboard', component: DashboardComponent, canActivate: [MsalGuard] },
            { path: 'overview', component: MainOverviewComponent, canActivate: [MsalGuard] },
            { path: 'clients', component: ClientListComponent, canActivate: [MsalGuard] },
            { path: 'clients/:id', component: ClientDetailsComponent, canActivate: [MsalGuard] },
            { path: 'sourcing-shortcut', component: SourcingShortcutComponent, canActivate: [MsalGuard] },
            { path: 'workflow', component: WorkflowComponent, canActivate: [MsalGuard] },
            { path: 'workflow/:id', component: WorkflowDetailsComponent, canActivate: [MsalGuard] },
            { path: 'workflow-test/:id', component: WorkflowSecondComponent, canActivate: [MsalGuard] },
            { path: 'workflow-new/:id', component: WorkflowThirdComponent, canActivate: [MsalGuard] },
            { path: 'statistics', component: StatisticsComponent, canActivate: [MsalGuard] },
            { path: 'time-tracking', component: TimeTrackingComponent, canActivate: [MsalGuard] },
            { path: 'evaluation', component: EvaluationComponent, canActivate: [MsalGuard] },
            { path: 'invoicing', component: InvoicingComponent, canActivate: [MsalGuard] },
            { path: 'contracts', component: ContractsComponent, canActivate: [MsalGuard] },
            { path: '**', redirectTo: 'dashboard' }
        ]},
    ]
  )],
  exports: [RouterModule]
})
export class MainRoutingModule { }
