import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { MsalService } from '@azure/msal-angular';

@Injectable()
export class LoginGuard implements CanActivate {

    constructor(
        private _router: Router,
        private _authService: MsalService
    ) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        if (this._authService.instance.getAllAccounts().length > 0) {
            this._router.navigate(['/main/dashboard']);
            return false;
        }

        return true;
    }
}
