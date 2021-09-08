import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MsalGuard } from '@azure/msal-angular';
import { AppComponent } from './app.component';
import { ClientListComponent } from './client-list/client-list.component';
import { ContractsComponent } from './contracts/contracts.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { EvaluationComponent } from './evaluation/evaluation.component';
import { InvoicingComponent } from './invoicing/invoicing.component';
import { LoginComponent } from './login/login.component';
import { MainOverviewComponent } from './main-overview/main-overview.component';
import { SourcingShortcutComponent } from './sourcing-shortcut/sourcing-shortcut.component';
import { StatisticsComponent } from './statistics/statistics.component';
import { TimeTrackingComponent } from './time-tracking/time-tracking.component';
import { WorkflowComponent } from './workflow/workflow.component';

const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent, canActivate: [MsalGuard] },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'dashboard' }
];

@NgModule({
  imports: [RouterModule.forRoot(
    [
        { path: '', redirectTo: 'login', pathMatch: 'full' },
        { path: 'login', component: LoginComponent },
        { path: 'dashboard', component: DashboardComponent, canActivate: [MsalGuard] },
        { path: 'overview', component: MainOverviewComponent, canActivate: [MsalGuard] },
        { path: 'clients', component: ClientListComponent, canActivate: [MsalGuard] },
        { path: 'sourcing-shortcut', component: SourcingShortcutComponent, canActivate: [MsalGuard] },
        { path: 'workflow', component: WorkflowComponent, canActivate: [MsalGuard] },
        { path: 'statistics', component: StatisticsComponent, canActivate: [MsalGuard] },
        { path: 'time-tracking', component: TimeTrackingComponent, canActivate: [MsalGuard] },
        { path: 'evaluation', component: EvaluationComponent, canActivate: [MsalGuard] },
        { path: 'invoicing', component: InvoicingComponent, canActivate: [MsalGuard] },
        { path: 'contracts', component: ContractsComponent, canActivate: [MsalGuard] },
        { path: '**', redirectTo: 'dashboard' }
    ]
  )],
  exports: [RouterModule]
})
export class AppRoutingModule { }
