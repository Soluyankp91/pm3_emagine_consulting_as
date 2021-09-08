import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { MSAL_GUARD_CONFIG, MsalGuardConfiguration, MsalService, MsalBroadcastService } from '@azure/msal-angular';
import { InteractionStatus, RedirectRequest, PopupRequest, AuthenticationResult } from '@azure/msal-browser';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

const GRAPH_ENDPOINT = 'Enter_the_Graph_Endpoint_Here/v1.0/me';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
    title = 'Angular 12 - Angular v2 Sample';
    isIframe = false;
    loginDisplay = false;
    private readonly _destroying$ = new Subject<void>();
    constructor(
        @Inject(MSAL_GUARD_CONFIG) private msalGuardConfig: MsalGuardConfiguration,
        private authService: MsalService,
        private msalBroadcastService: MsalBroadcastService
    ) { }

    ngOnInit(): void {
        // this.isIframe = window !== window.parent && !window.opener; // Remove this line to use Angular Universal
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
        // this.getProfile();
    }
    // getProfile() {
    //     this.http.get(GRAPH_ENDPOINT)
    //       .subscribe(profile => {
    //         this.profile = profile;
    //     });
    // }

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
                });
        } else {
            this.authService.loginPopup()
                .subscribe((response: AuthenticationResult) => {
                    this.authService.instance.setActiveAccount(response.account);
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
