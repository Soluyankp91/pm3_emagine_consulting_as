import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
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

const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent, data: { permission: null } },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'dashboard' }
];

@NgModule({
  imports: [RouterModule.forRoot(
    [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent, data: { permission: null } },
      { path: 'overview', component: MainOverviewComponent, data: { permission: null } },
      { path: 'clients', component: ClientListComponent, data: { permission: null } },
      { path: 'sourcing-shortcut', component: SourcingShortcutComponent, data: { permission: null } },
      { path: 'workflow', component: WorkflowComponent, data: { permission: null } },
      { path: 'statistics', component: StatisticsComponent, data: { permission: null } },
      { path: 'time-tracking', component: TimeTrackingComponent, data: { permission: null } },
      { path: 'evaluation', component: EvaluationComponent, data: { permission: null } },
      { path: 'invoicing', component: InvoicingComponent, data: { permission: null } },
      { path: 'contracts', component: ContractsComponent, data: { permission: null } },
      { path: '**', redirectTo: 'dashboard' }
    ]
  )],
  exports: [RouterModule]
})
export class AppRoutingModule { }
