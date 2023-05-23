import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { MsalBroadcastService } from '@azure/msal-angular';
import { InteractionStatus } from '@azure/msal-browser';
import { Observable, of } from 'rxjs';

import { AuthService } from './auth.service';
import { filter, switchMap } from 'rxjs/operators';

@Injectable()
export class AuthRedirectGuard implements CanActivate {
	constructor(
		private _router: Router,
		private _msalBroadcastService: MsalBroadcastService,
		private _authService: AuthService
	) {}

	canActivate(): Observable<boolean> | Promise<boolean> | boolean {
		return this._msalBroadcastService.inProgress$.pipe(
			filter((status: InteractionStatus) => status === InteractionStatus.None),
			switchMap(() => {
				if (this._authService.checkUserLogin()) {
					return of(true);
				}
				this._router.navigate(['/login']);
				return of(false);
			})
		);
	}
}
