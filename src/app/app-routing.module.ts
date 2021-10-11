import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MsalGuard } from '@azure/msal-angular';
import { LoginComponent } from './login/login.component';
import { LoginGuard } from './login/login.guard';

@NgModule({
  imports: [RouterModule.forRoot(
    [
        { path: '', redirectTo: 'login', pathMatch: 'full' },
        { path: 'login', component: LoginComponent, canActivate: [LoginGuard] },
        {
            path: 'main',
            loadChildren: () => import('../app/main/main.module').then(m => m.MainModule), // Lazy load of main module
            data: { preload: true },
            canLoad: [MsalGuard]
        },
        // { path: 'dashboard', component: DashboardComponent, canActivate: [MsalGuard] },
        // { path: 'overview', component: MainOverviewComponent, canActivate: [MsalGuard] },
        // { path: 'clients', component: ClientListComponent, canActivate: [MsalGuard] },
        // { path: 'clients/:id', component: ClientDetailsComponent, canActivate: [MsalGuard] },
        // { path: 'sourcing-shortcut', component: SourcingShortcutComponent, canActivate: [MsalGuard] },
        // { path: 'workflow', component: WorkflowComponent, canActivate: [MsalGuard] },
        // { path: 'statistics', component: StatisticsComponent, canActivate: [MsalGuard] },
        // { path: 'time-tracking', component: TimeTrackingComponent, canActivate: [MsalGuard] },
        // { path: 'evaluation', component: EvaluationComponent, canActivate: [MsalGuard] },
        // { path: 'invoicing', component: InvoicingComponent, canActivate: [MsalGuard] },
        // { path: 'contracts', component: ContractsComponent, canActivate: [MsalGuard] },
        { path: '**', redirectTo: 'login' }
    ]
  )],
  exports: [RouterModule]
})
export class AppRoutingModule { }
