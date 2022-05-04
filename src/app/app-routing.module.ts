import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MsalGuard, MsalRedirectComponent } from '@azure/msal-angular';
import { LoginComponent } from './login/login.component';
import { LoginGuard } from './login/login.guard';

@NgModule({
  imports: [RouterModule.forRoot(
    [
        { path: '', redirectTo: 'login', pathMatch: 'full' },
        { path: 'login', component: LoginComponent, canActivate: [LoginGuard] },
        {
            path: 'main',
            loadChildren: () => import('../app/main/main.module').then(m => m.MainModule),
            data: { preload: true },
            canLoad: [MsalGuard]
        },
        { path: '**', redirectTo: 'login' }
    ]
  )],
  exports: [RouterModule]
})
export class AppRoutingModule { }
