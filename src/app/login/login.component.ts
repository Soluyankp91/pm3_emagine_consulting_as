import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MSAL_GUARD_CONFIG, MsalGuardConfiguration, MsalService, MsalBroadcastService } from '@azure/msal-angular';
import { InteractionStatus, RedirectRequest, PopupRequest, AuthenticationResult } from '@azure/msal-browser';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
    isIframe = false;
    loginDisplay = false;
    private readonly _destroying$ = new Subject<void>();
    constructor(
        @Inject(MSAL_GUARD_CONFIG) private msalGuardConfig: MsalGuardConfiguration,
        private authService: MsalService,
        private msalBroadcastService: MsalBroadcastService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.setLoginDisplay();

        this.msalBroadcastService.inProgress$
            .pipe(
                filter((status: InteractionStatus) => status === InteractionStatus.None),
                takeUntil(this._destroying$)
            )
            .subscribe(() => {
                this.setLoginDisplay();
                this.checkAndSetActiveAccount();
            })
    }

    setLoginDisplay() {
        this.loginDisplay = this.authService.instance.getAllAccounts().length > 0;
    }

    checkAndSetActiveAccount() {
        /**
         * If no active account set but there are accounts signed in, sets first account to active account
         * To use active account set here, subscribe to inProgress$ first in your component
         * Note: Basic usage demonstrated. Your app may require more complicated account selection logic
         */
        let activeAccount = this.authService.instance.getActiveAccount();

        if (!activeAccount && this.authService.instance.getAllAccounts().length > 0) {
            let accounts = this.authService.instance.getAllAccounts();
            this.authService.instance.setActiveAccount(accounts[0]);
        }
    }

    loginRedirect() {
        if (this.msalGuardConfig.authRequest) {
            this.authService.loginRedirect({ ...this.msalGuardConfig.authRequest } as RedirectRequest);
        } else {
            this.authService.loginRedirect();
        }
    }

    loginPopup() {
        if (this.msalGuardConfig.authRequest) {
            this.authService.loginPopup({ ...this.msalGuardConfig.authRequest } as PopupRequest)
                .subscribe((response: AuthenticationResult) => {
                    this.authService.instance.setActiveAccount(response.account);
                    this.router.navigate(['/main']);
                });
        } else {
            this.authService.loginPopup()
                .subscribe((response: AuthenticationResult) => {
                    this.authService.instance.setActiveAccount(response.account);
                    this.router.navigate(['/main']);
                });
        }
    }

    logout(popup?: boolean) {
        if (popup) {
            this.authService.logoutPopup({
                mainWindowRedirectUri: "/"
            });
        } else {
            this.authService.logoutRedirect();
        }
    }

    ngOnDestroy(): void {
        this._destroying$.next(undefined);
        this._destroying$.complete();
    }

}
