import { Inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { MSAL_GUARD_CONFIG, MsalGuardConfiguration, MsalService } from '@azure/msal-angular';
import { AuthenticationResult, PopupRequest } from '@azure/msal-browser';
import { NgxSpinnerService } from 'ngx-spinner';

@Injectable()
export class AuthService {
	set encryptedAccessToken(token: string) {
		localStorage.setItem('enc_auth_token', token);
	}

	get encryptedAccessToken(): string {
		return localStorage.getItem('enc_auth_token') ?? '';
	}

	constructor(@Inject(MSAL_GUARD_CONFIG) private msalGuardConfig: MsalGuardConfiguration, private _msalService: MsalService, private _router: Router, private _spinnerService: NgxSpinnerService) {}

	signOut(): Observable<void> {
		return this._msalService.logoutPopup({ mainWindowRedirectUri: '/login' });
	}

	checkUserLogin(): boolean {
		return this._msalService.instance.getAllAccounts().length > 0;
	}

	loginWithMicrosoft() {
        const loader = document.getElementById('appLoader') as HTMLElement;
		if (this.msalGuardConfig.authRequest) {
            this._msalService.loginPopup({ ...this.msalGuardConfig.authRequest } as PopupRequest)
            .subscribe((response: AuthenticationResult) => {
                    loader.classList.remove('unvisible');
                    this._msalService.instance.setActiveAccount(response.account);
                    this.encryptedAccessToken = response.accessToken;
                    this._router.navigate(['/app']);
                });
        } else {
            this._msalService.loginPopup()
                .subscribe((response: AuthenticationResult) => {
                    loader.classList.remove('unvisible');
                    this._msalService.instance.setActiveAccount(response.account);
                    this._router.navigate(['/app']);
                });
        }
	}

	checkAndSetActiveAccount() {
		let activeAccount = this._msalService.instance.getActiveAccount();

        if (!activeAccount && this._msalService.instance.getAllAccounts().length > 0) {
            let accounts = this._msalService.instance.getAllAccounts();
            this._msalService.instance.setActiveAccount(accounts[0]);
        }
	}
}
