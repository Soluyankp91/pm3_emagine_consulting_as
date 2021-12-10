import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule, DomSanitizer } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppCommonModule } from './shared/common/app-common.module';
import { MatIconRegistry } from '@angular/material/icon';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ServiceProxyModule } from 'src/shared/service-proxies/service-proxy.module';
import { API_BASE_URL } from 'src/shared/service-proxies/service-proxies';
import { AppConsts } from 'src/shared/AppConsts';
import { MsalBroadcastService, MsalGuard, MsalGuardConfiguration, MsalInterceptor, MsalInterceptorConfiguration, MsalModule, MsalService, MSAL_GUARD_CONFIG, MSAL_INSTANCE, MSAL_INTERCEPTOR_CONFIG } from '@azure/msal-angular';
import { BrowserCacheLocation, InteractionType, IPublicClientApplication, LogLevel, PublicClientApplication } from '@azure/msal-browser';
import { LoginGuard } from './login/login.guard';
import { LoginComponent } from './login/login.component';
import { environment } from 'src/environments/environment';

const isIE = window.navigator.userAgent.indexOf("MSIE ") > -1 || window.navigator.userAgent.indexOf("Trident/") > -1; // Remove this line to use Angular Universal

export function loggerCallback(logLevel: LogLevel, message: string) {
    // console.log(message);
}

export function MSALInstanceFactory(): IPublicClientApplication {
    return new PublicClientApplication({
        auth: {
            clientId: '54e44fbe-ca87-45be-9344-9a3bb6dd0dca', // PPE testing environment
            authority: 'https://login.microsoftonline.com/0749517d-d788-4fc5-b761-0cb1a1112694/', // PPE testing environment.
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
    protectedResourceMap.set(environment.apiUrl, ['openid', 'profile', 'api://5f63a91e-8bfd-40ea-b562-3dad54244ff7/access_as_user']);
    // if (environment.dev) {
    //     protectedResourceMap.set('https://pm3-dev-app.azurewebsites.net', ['openid', 'profile', 'api://5f63a91e-8bfd-40ea-b562-3dad54244ff7/access_as_user']);
    // }
    // if (environment.qa) {
    //     protectedResourceMap.set('https://pm3-qa-app.azurewebsites.net', ['openid', 'profile', 'api://5f63a91e-8bfd-40ea-b562-3dad54244ff7/access_as_user']);
    // }
    // if (environment.production) {
    //     protectedResourceMap.set('https://pm3-prod-app.azurewebsites.net', ['openid', 'profile', 'api://5f63a91e-8bfd-40ea-b562-3dad54244ff7/access_as_user']);
    // }

    return {
        interactionType: InteractionType.Redirect,
        protectedResourceMap
    };
}

export function MSALGuardConfigFactory(): MsalGuardConfiguration {
    return {
        interactionType: InteractionType.Redirect,
        authRequest: {
            scopes: ['openid', 'profile', 'api://5f63a91e-8bfd-40ea-b562-3dad54244ff7/access_as_user']
        },
        loginFailedRoute: '/login'
    };
}

export function getRemoteServiceBaseUrl(): string {
    return AppConsts.remoteServiceBaseUrl;
}

@NgModule({
    declarations: [
        AppComponent,
        LoginComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        HttpClientModule,
        AppCommonModule,
        ServiceProxyModule,
        MsalModule,
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
        MsalBroadcastService
    ],
    bootstrap: [
        AppComponent
    ]
})
export class AppModule {
    constructor(iconRegistry: MatIconRegistry, sanitizer: DomSanitizer) {
        // MENU ICONS REGISRTY
        iconRegistry.addSvgIcon(
            'evaluation-menu',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/menu/achievement-menu.svg'
            )
        );

        iconRegistry.addSvgIcon(
            'contracts-menu',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/menu/agreement-menu.svg'
            )
        );

        iconRegistry.addSvgIcon(
            'dashboard-menu',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/menu/dashboard-menu.svg'
            )
        );

        iconRegistry.addSvgIcon(
            'overview-menu',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/menu/list-menu.svg'
            )
        );

        iconRegistry.addSvgIcon(
            'time-tracking-menu',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/menu/location-menu.svg'
            )
        );

        iconRegistry.addSvgIcon(
            'invoicing-menu',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/menu/reports-menu.svg'
            )
        );

        iconRegistry.addSvgIcon(
            'sourcing-shortcut-menu',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/menu/script-menu.svg'
            )
        );

        iconRegistry.addSvgIcon(
            'statistic-menu',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/menu/statistic-menu.svg'
            )
        );

        iconRegistry.addSvgIcon(
            'client-list-menu',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/menu/users-menu.svg'
            )
        );

        iconRegistry.addSvgIcon(
            'workflow-menu',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/menu/value-chain-menu.svg'
            )
        );

        // COUNTRY FLAGS ICON REGISTRY

        iconRegistry.addSvgIcon(
            'Denmark-flag',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/country-flags/dk-flag.svg'
            )
        );

        iconRegistry.addSvgIcon(
            'Denmark-flag-selected',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/country-flags/dk-flag-selected.svg'
            )
        );

        iconRegistry.addSvgIcon(
            'Germany-flag',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/country-flags/de-flag.svg'
            )
        );

        iconRegistry.addSvgIcon(
            'Germany-flag-selected',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/country-flags/de-flag-selected.svg'
            )
        );

        iconRegistry.addSvgIcon(
            'International-flag',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/country-flags/en-flag.svg'
            )
        );

        iconRegistry.addSvgIcon(
            'International-flag-selected',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/country-flags/en-flag-selected.svg'
            )
        );

        iconRegistry.addSvgIcon(
            'Netherlands-flag',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/country-flags/ne-flag.svg'
            )
        );

        iconRegistry.addSvgIcon(
            'Netherlands-flag-selected',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/country-flags/ne-flag-selected.svg'
            )
        );

        iconRegistry.addSvgIcon(
            'Norway-flag',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/country-flags/no-flag.svg'
            )
        );

        iconRegistry.addSvgIcon(
            'Norway-flag-selected',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/country-flags/no-flag-selected.svg'
            )
        );

        iconRegistry.addSvgIcon(
            'Poland-flag',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/country-flags/pl-flag.svg'
            )
        );

        iconRegistry.addSvgIcon(
            'Poland-flag-selected',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/country-flags/pl-flag-selected.svg'
            )
        );

        iconRegistry.addSvgIcon(
            'Sweden-flag',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/country-flags/se-flag.svg'
            )
        );

        iconRegistry.addSvgIcon(
            'Sweden-flag-selected',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/country-flags/se-flag-selected.svg'
            )
        );

        iconRegistry.addSvgIcon(
            'arrow',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/arrow.svg'
            )
        );

        // File uploader
        iconRegistry.addSvgIcon(
            'folderCustom',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/file-uploader/folder.svg'
            )
        );


        iconRegistry.addSvgIcon(
            'file-folder',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/file-uploader/file-folder.svg'
            )
        );

        iconRegistry.addSvgIcon(
            'file-uploader-icon',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/file-uploader/file-uploader-icon.svg'
            )
        );

        iconRegistry.addSvgIcon(
            'file-drag-and-drop',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/file-uploader/file-drag-and-drop.svg'
            )
        );

        iconRegistry.addSvgIcon(
            'pdf',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/file-uploader/pdf.svg'
            )
        );
        iconRegistry.addSvgIcon(
            'doc',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/file-uploader/doc.svg'
            )
        );

        iconRegistry.addSvgIcon(
            'xls',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/file-uploader/xls.svg'
            )
        );

        iconRegistry.addSvgIcon(
            'txt',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/file-uploader/txt.svg'
            )
        );

        iconRegistry.addSvgIcon(
            'raw',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/file-uploader/raw.svg'
            )
        );

        iconRegistry.addSvgIcon(
            'jpg',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/file-uploader/jpg.svg'
            )
        );

        iconRegistry.addSvgIcon(
            'svg',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/file-uploader/svg.svg'
            )
        );

        iconRegistry.addSvgIcon(
            'png',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/file-uploader/png.svg'
            )
        );

        iconRegistry.addSvgIcon(
            'calendar',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/calendar.svg'
            )
        );

        iconRegistry.addSvgIcon(
            'workflow-intracompany',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/workflow-intracompany.svg'
            )
        );

        iconRegistry.addSvgIcon(
            'workflow-direct-company',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/workflow-direct-company.svg'
            )
        );

        iconRegistry.addSvgIcon(
            'overview-icon',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/overview-icon.svg'
            )
        );

        iconRegistry.addSvgIcon(
            'remove-icon',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/remove-icon.svg'
            )
        );

        // WORKFLOW ICONS
        iconRegistry.addSvgIcon(
            'workflowAdd',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/workflow-icons/add-workflow.svg'
            )
        );

        iconRegistry.addSvgIcon(
            'workflowEdit',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/workflow-icons/edit-workflow.svg'
            )
        );

        iconRegistry.addSvgIcon(
            'workflowStartOrExtend',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/workflow-icons/start-workflow.svg'
            )
        );

        iconRegistry.addSvgIcon(
            'workflowTerminate',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/workflow-icons/terminate-workflow.svg'
            )
        );

    }
}
