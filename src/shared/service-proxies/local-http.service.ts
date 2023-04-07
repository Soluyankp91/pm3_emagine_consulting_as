import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MsalService } from '@azure/msal-angular';
import { AuthenticationResult, SilentRequest } from '@azure/msal-browser';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable()
export class LocalHttpService {
    constructor(
        private httpClient: HttpClient,
        private _authService: MsalService
    ) { }

    getTokenPromise(): Promise<AuthenticationResult> {
        const params = {
            scopes: ['openid', 'profile', environment.msalInterceptorConfigUrl],
            redirectUri: '',
            extraQueryParameters: undefined,
            authority: environment.msalAuthorityUrl,
            account: this._authService.instance.getActiveAccount()!,
            correlationId: '',
            forceRefresh: false
        }
        return this._authService.instance.acquireTokenSilent(params);
    }

    getTokenSilent(): Observable<AuthenticationResult> {
        const params = {
            scopes: ['openid', 'profile', environment.msalInterceptorConfigUrl],
            redirectUri: '',
            extraQueryParameters: undefined,
            authority: environment.msalAuthorityUrl,
            account: this._authService.instance.getActiveAccount()!,
            correlationId: '',
            forceRefresh: false
        }
        // this._authService.instance.getTokenCache(params);
        return this._authService.acquireTokenSilent(params)
    }

    getToken(): string | any {
        const params = {
            scopes: ['openid', 'profile', environment.msalInterceptorConfigUrl],
            redirectUri: '',
            extraQueryParameters: undefined,
            authority: environment.msalAuthorityUrl,
            account: this._authService.instance.getActiveAccount()!,
            correlationId: '',
            forceRefresh: false
        }
        this._authService.instance.acquireTokenSilent(params)
            .then((result: AuthenticationResult) => {
                return result.accessToken;
            })
            .catch(e => {
                return 'error'
            });
    }

}
