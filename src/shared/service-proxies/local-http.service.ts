import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MsalService } from '@azure/msal-angular';
import { AuthenticationResult } from '@azure/msal-browser';

@Injectable()
export class LocalHttpService {
    constructor(
        private httpClient: HttpClient,
        private _authService: MsalService
    ) { }

    getToken(): Promise<AuthenticationResult> {
        const params = {
            scopes: ['openid', 'profile', 'api://5f63a91e-8bfd-40ea-b562-3dad54244ff7/access_as_user'],
            redirectUri: '',
            extraQueryParameters: undefined,
            authority: 'https://login.microsoftonline.com/0749517d-d788-4fc5-b761-0cb1a1112694/',
            account: this._authService.instance.getActiveAccount()!,
            correlationId: '',
            forceRefresh: false
        }
        let bearerToken: string;
        return this._authService.instance.acquireTokenSilent(params);
    }

}