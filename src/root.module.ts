import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ServiceProxyModule } from 'src/shared/service-proxies/service-proxy.module';
import { API_BASE_URL } from 'src/shared/service-proxies/service-proxies';
import { AppConsts } from 'src/shared/AppConsts';
import { MsalBroadcastService, MsalGuard, MsalGuardConfiguration, MsalInterceptor, MsalInterceptorConfiguration, MsalModule, MsalService, MSAL_GUARD_CONFIG, MSAL_INSTANCE, MSAL_INTERCEPTOR_CONFIG } from '@azure/msal-angular';
import { BrowserCacheLocation, InteractionType, IPublicClientApplication, LogLevel, PublicClientApplication } from '@azure/msal-browser';
import { environment } from 'src/environments/environment';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { RootComponent } from './root.component';
import { RootRoutingModule } from './root-routing.module';
import { LoginGuard } from './app/login/login.guard';
import { AppModule } from './app/app.module';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { metaReducers, ROOT_REDUCERS } from 'src/app/store/reducers';
import { effects } from 'src/app/store/effects';

const isIE = window.navigator.userAgent.indexOf("MSIE ") > -1 || window.navigator.userAgent.indexOf("Trident/") > -1; // Remove this line to use Angular Universal

export function loggerCallback(logLevel: LogLevel, message: string) {
    // console.log(message);
}

export function MSALInstanceFactory(): IPublicClientApplication {
    return new PublicClientApplication({
        auth: {
            clientId: environment.msalClientId,
            authority: environment.msalAuthorityUrl,
            redirectUri: '/',
            postLogoutRedirectUri: '/'
        },
        cache: {
            cacheLocation: BrowserCacheLocation.LocalStorage,
            storeAuthStateInCookie: isIE, // set to true for IE 11. Remove this line to use Angular Universal
        },
        system: {
            loggerOptions: {
                loggerCallback,
                logLevel: LogLevel.Info,
                piiLoggingEnabled: false
            }
        }
    });
}

export function MSALInterceptorConfigFactory(): MsalInterceptorConfiguration {
    const protectedResourceMap = new Map<string, Array<string>>();
    protectedResourceMap.set(environment.apiUrl, ['openid', 'profile', environment.msalInterceptorConfigUrl]);
    return {
        interactionType: InteractionType.Redirect,
        protectedResourceMap
    };
}

export function MSALGuardConfigFactory(): MsalGuardConfiguration {
    return {
        interactionType: InteractionType.Redirect,
        authRequest: {
            scopes: ['openid', 'profile', environment.msalInterceptorConfigUrl]
        },
        loginFailedRoute: '/login'
    };
}

export function getRemoteServiceBaseUrl(): string {
    return AppConsts.remoteServiceBaseUrl;
}

@NgModule({
    declarations: [
        RootComponent
    ],
    imports: [
        BrowserModule,
        RootRoutingModule,
        BrowserAnimationsModule,
        HttpClientModule,
        AppModule,
        ServiceProxyModule,
        MsalModule,
        NgxSpinnerModule,
        StoreModule.forRoot(ROOT_REDUCERS, { metaReducers }),
        EffectsModule.forRoot(effects),
    ],
    providers: [
        LoginGuard,
        {
            provide: API_BASE_URL,
            useFactory: getRemoteServiceBaseUrl
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: MsalInterceptor,
            multi: true
        },
        {
            provide: MSAL_INSTANCE,
            useFactory: MSALInstanceFactory
        },
        {
            provide: MSAL_GUARD_CONFIG,
            useFactory: MSALGuardConfigFactory
        },
        {
            provide: MSAL_INTERCEPTOR_CONFIG,
            useFactory: MSALInterceptorConfigFactory
        },
        MsalService,
        MsalGuard,
        MsalBroadcastService,
        NgxSpinnerService
    ],
    bootstrap: [RootComponent]
})
export class RootModule {
    constructor() {

    }
}
