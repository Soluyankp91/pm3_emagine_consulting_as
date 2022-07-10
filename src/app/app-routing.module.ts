import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';

@NgModule({
  imports: [RouterModule.forChild(
    [
      {
        path: '',
        component: AppComponent,
        // canActivate: [MsalGuard],
        // canActivateChild: [MsalGuard],
        children: [
          {
            path: '', redirectTo: 'overview', pathMatch: 'full'
          },
          // {
          //   path: 'dashboard', component: DashboardComponent
          // },
          {
            path: 'overview',
            loadChildren:() => import('../app/overview/overview.module').then(m => m.OverviewModule),
            data: {preload: true},
            // canLoad: [MsalGuard]
          },
          {
            path: 'clients',
            loadChildren:() => import('../app/client/client.module').then(m => m.ClientModule),
            data: {preload: true},
            // canLoad: [MsalGuard]
          },
          {
            path: 'workflow',
            loadChildren:() => import('../app/workflow/workflow.module').then(m => m.WorkflowModule),
            data: {preload: true},
            // canLoad: [MsalGuard]
          },
          {
            path: 'notifications',
            loadChildren:() => import('../app/notification/notifications.module').then(m => m.NotificationsModule),
            data: {preload: true},
            // canLoad: [MsalGuard]
          },
          {
            path: '',
            children: [
                { path: '', redirectTo: '/app/overview', pathMatch: 'full' }

            ]
          },
          {
              path: '**', redirectTo: ''
          }
        ]
      }
    ]
  )],
  exports: [RouterModule]
})
export class AppRoutingModule { }
