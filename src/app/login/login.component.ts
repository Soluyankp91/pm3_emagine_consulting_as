import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MSAL_GUARD_CONFIG, MsalGuardConfiguration, MsalService, MsalBroadcastService } from '@azure/msal-angular';
import { InteractionStatus, RedirectRequest, PopupRequest, AuthenticationResult } from '@azure/msal-browser';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { PmValues } from './entities/login.entities';
@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
    isIframe = false;
    loginDisplay = false;
    pmValues = PmValues;

    private readonly _destroying$ = new Subject<void>();
    constructor(
        @Inject(MSAL_GUARD_CONFIG) private msalGuardConfig: MsalGuardConfiguration,
        private _msalService: MsalService,
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
        const loader = document.getElementById('appLoader') as HTMLElement;
        loader.classList.add('unvisible');
        this.loginDisplay = this._msalService.instance.getAllAccounts().length > 0;
    }

    checkAndSetActiveAccount() {
        /**
         * If no active account set but there are accounts signed in, sets first account to active account
         * To use active account set here, subscribe to inProgress$ first in your component
         * Note: Basic usage demonstrated. Your app may require more complicated account selection logic
         */
        let activeAccount = this._msalService.instance.getActiveAccount();

        if (!activeAccount && this._msalService.instance.getAllAccounts().length > 0) {
            let accounts = this._msalService.instance.getAllAccounts();
            this._msalService.instance.setActiveAccount(accounts[0]);
        }
    }

    loginRedirect() {
        if (this.msalGuardConfig.authRequest) {
            this._msalService.loginRedirect({ ...this.msalGuardConfig.authRequest } as RedirectRequest);
        } else {
            this._msalService.loginRedirect();
        }
    }

    loginPopup() {
        const loader = document.getElementById('appLoader') as HTMLElement;
        if (this.msalGuardConfig.authRequest) {
            this._msalService.loginPopup({ ...this.msalGuardConfig.authRequest } as PopupRequest)
            .subscribe((response: AuthenticationResult) => {
                loader.classList.remove('unvisible');
                this._msalService.instance.setActiveAccount(response.account);
                    this.router.navigate(['/app']);
                });
        } else {
            this._msalService.loginPopup()
                .subscribe((response: AuthenticationResult) => {
                    loader.classList.remove('unvisible');
                    this._msalService.instance.setActiveAccount(response.account);
                    this.router.navigate(['/app']);
                });
        }
    }

    logout(popup?: boolean) {
        if (popup) {
            this._msalService.logoutPopup({
                mainWindowRedirectUri: "/"
            });
        } else {
            this._msalService.logoutRedirect();
        }
    }

    ngOnDestroy(): void {
        this._destroying$.next(undefined);
        this._destroying$.complete();
    }

    trackById(index: number, item: any) {
		return item.id;
	}

}
