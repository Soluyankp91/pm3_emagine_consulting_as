import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MsalGuard } from '@azure/msal-angular';
import { LoginComponent } from './app/login/login.component';
import { LoginGuard } from './app/login/login.guard';

@NgModule({
  imports: [RouterModule.forRoot(
    [
        { path: '', redirectTo: 'login', pathMatch: 'full' },
        { path: 'login', component: LoginComponent, canActivate: [LoginGuard] },
        {
            path: 'app',
            loadChildren: () => import('./app/app.module').then(m => m.AppModule),
            data: { preload: true },
            canLoad: [MsalGuard]
        },
        {
            path: 'shared/clients',
            loadChildren:() => import('./app/client/client.module').then(m => m.ClientModule),
            data: {preload: true},
            canLoad: [MsalGuard]
        },
        { path: '**', redirectTo: '/app' }
    ]
  )],
  exports: [RouterModule]
})
export class RootRoutingModule { }
