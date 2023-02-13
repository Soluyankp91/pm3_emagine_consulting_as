import { NgModule } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AppCommonModule } from './shared/common/app-common.module';
import { MatIconRegistry } from '@angular/material/icon';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ServiceProxyModule } from 'src/shared/service-proxies/service-proxy.module';
import { API_BASE_URL } from 'src/shared/service-proxies/service-proxies';
import { AppConsts } from 'src/shared/AppConsts';
import {
    MsalBroadcastService,
    MsalGuard,
    MsalGuardConfiguration,
    MsalInterceptor,
    MsalInterceptorConfiguration,
    MsalModule,
    MsalService,
    MSAL_GUARD_CONFIG,
    MSAL_INSTANCE,
    MSAL_INTERCEPTOR_CONFIG,
} from '@azure/msal-angular';
import {
    BrowserCacheLocation,
    InteractionType,
    IPublicClientApplication,
    LogLevel,
    PublicClientApplication,
} from '@azure/msal-browser';
import { LoginGuard } from './login/login.guard';
import { LoginComponent } from './login/login.component';
import { environment } from 'src/environments/environment';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { CommonModule } from '@angular/common';
import { LocalHttpService } from 'src/shared/service-proxies/local-http.service';

const isIE =
    window.navigator.userAgent.indexOf('MSIE ') > -1 ||
    window.navigator.userAgent.indexOf('Trident/') > -1; // Remove this line to use Angular Universal

export function loggerCallback(logLevel: LogLevel, message: string) {
    // console.log(message);
}

export function MSALInstanceFactory(): IPublicClientApplication {
    return new PublicClientApplication({
        auth: {
            clientId: environment.msalClientId,
            authority: environment.msalAuthorityUrl,
            redirectUri: '/',
            postLogoutRedirectUri: '/',
        },
        cache: {
            cacheLocation: BrowserCacheLocation.LocalStorage,
            storeAuthStateInCookie: isIE, // set to true for IE 11. Remove this line to use Angular Universal
        },
        system: {
            loggerOptions: {
                loggerCallback,
                logLevel: LogLevel.Info,
                piiLoggingEnabled: false,
            },
        },
    });
}

export function MSALInterceptorConfigFactory(): MsalInterceptorConfiguration {
    const protectedResourceMap = new Map<string, Array<string>>();
    protectedResourceMap.set(environment.apiUrl, [
        'openid',
        'profile',
        environment.msalInterceptorConfigUrl,
    ]);

    return {
        interactionType: InteractionType.Redirect,
        protectedResourceMap,
    };
}

export function MSALGuardConfigFactory(): MsalGuardConfiguration {
    return {
        interactionType: InteractionType.Redirect,
        authRequest: {
            scopes: ['openid', 'profile', environment.msalInterceptorConfigUrl],
        },
        loginFailedRoute: '/login',
    };
}

export function getRemoteServiceBaseUrl(): string {
    return AppConsts.remoteServiceBaseUrl;
}

@NgModule({
    declarations: [AppComponent, LoginComponent],
    imports: [
        CommonModule,
        AppRoutingModule,
        HttpClientModule,
        AppCommonModule,
        ServiceProxyModule,
        MsalModule,
        NgxSpinnerModule
    ],
    providers: [
        LoginGuard,
        {
            provide: API_BASE_URL,
            useFactory: getRemoteServiceBaseUrl,
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: MsalInterceptor,
            multi: true,
        },
        {
            provide: MSAL_INSTANCE,
            useFactory: MSALInstanceFactory,
        },
        {
            provide: MSAL_GUARD_CONFIG,
            useFactory: MSALGuardConfigFactory,
        },
        {
            provide: MSAL_INTERCEPTOR_CONFIG,
            useFactory: MSALInterceptorConfigFactory,
        },
        MsalService,
        MsalGuard,
        MsalBroadcastService,
        NgxSpinnerService,
        LocalHttpService,
    ],
    bootstrap: [AppComponent],
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

        iconRegistry.addSvgIcon(
            'notification-menu',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/menu/notification-menu.svg'
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
            'France-flag',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/country-flags/fr-flag.svg'
            )
        );

        iconRegistry.addSvgIcon(
            'France-flag-selected',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/country-flags/fr-flag-selected.svg'
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
            'India-flag-selected',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/country-flags/ind-flag-selected.svg'
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
            'file',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/file-uploader/default_file.svg'
            )
        );

        iconRegistry.addSvgIcon(
            'eml',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/file-uploader/eml.svg'
            )
        );

        iconRegistry.addSvgIcon(
            'ppt',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/file-uploader/ppt.svg'
            )
        );

        iconRegistry.addSvgIcon(
            'xml',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/file-uploader/xml.svg'
            )
        );

        iconRegistry.addSvgIcon(
            'loading-icon',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/file-uploader/loading-icon.svg'
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
            'overview-icon-inactive',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/overview-icon-inactive.svg'
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

        iconRegistry.addSvgIcon(
            'in-progress-icon',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/in-progress-icon.svg'
            )
        );

        iconRegistry.addSvgIcon(
            'completed-icon',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/completed-icon.svg'
            )
        );

        iconRegistry.addSvgIcon(
            'upcoming-icon',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/upcoming-icon.svg'
            )
        );

        iconRegistry.addSvgIcon(
            'info_icon',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/info_icon.svg'
            )
        );

        iconRegistry.addSvgIcon(
            'icon-show',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/icon-show.svg'
            )
        );

        iconRegistry.addSvgIcon(
            'icon-hide',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/icon-hide.svg'
            )
        );

        iconRegistry.addSvgIcon(
            'plus-button-icon',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/plus-button-icon.svg'
            )
        );

        iconRegistry.addSvgIcon(
            'filter-icon',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/filter-icon.svg'
            )
        );

        iconRegistry.addSvgIcon(
            'Country-filter-flag',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/country-filter-flag.svg'
            )
        );

        iconRegistry.addSvgIcon(
            'CAM-icon',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/CAM-icon.svg'
            )
        );

        iconRegistry.addSvgIcon(
            'HUBSPOT-icon',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/HUBSPOT-icon.svg'
            )
        );

        iconRegistry.addSvgIcon(
            'check-circle',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/check-circle.svg'
            )
        );
        iconRegistry.addSvgIcon(
            'check-circle-fill',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/check-circle-fill.svg'
            )
        );
        iconRegistry.addSvgIcon(
            'cancel',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/cancel.svg'
            )
        );
        iconRegistry.addSvgIcon(
            'cancel-fill',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/cancel-fill.svg'
            )
        );
        iconRegistry.addSvgIcon(
            'cancel-termination',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/cancel-termination.svg'
            )
        );
        iconRegistry.addSvgIcon(
            'schedule',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/schedule.svg'
            )
        );
        iconRegistry.addSvgIcon(
            'warning',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/warning.svg'
            )
        );

        iconRegistry.addSvgIcon(
            'notes-icon',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/notes-icon.svg'
            )
        );

        iconRegistry.addSvgIcon(
            'sourcing-deeplink',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/sourcing-deeplink.svg'
            )
        );

        iconRegistry.addSvgIcon(
            'empty-notes-icon',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/empty_notes_icon.svg'
            )
        );

        iconRegistry.addSvgIcon(
            'what-next-icon',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/what-next-icon.svg'
            )
        );

        iconRegistry.addSvgIcon(
            'link-to-client-icon',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/link-to-client-icon.svg'
            )
        );

        iconRegistry.addSvgIcon(
            'hubspot-sync-icon',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/hubspot-sync-icon.svg'
            )
        );

        iconRegistry.addSvgIcon(
            'link-to-client-hubspot-icon',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/link-to-client-hubspot.svg'
            )
        );

        iconRegistry.addSvgIcon(
            'edit-icon',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/edit-icon.svg'
            )
        );

        iconRegistry.addSvgIcon(
            'edit-icon-green',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/edit-icon-green.svg'
            )
        );

        iconRegistry.addSvgIcon(
            'return-icon',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/return-icon.svg'
            )
        );

        iconRegistry.addSvgIcon(
            'add-icon',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/add-icon.svg'
            )
        );

        iconRegistry.addSvgIcon(
            'add-icon-green',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/add-icon-green.svg'
            )
        );

        iconRegistry.addSvgIcon(
            '3-dots',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/3-dots.svg'
            )
        );

        iconRegistry.addSvgIcon(
            '3-dots-green',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/3-dots-green.svg'
            )
        );

        iconRegistry.addSvgIcon(
            'logout-icon',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/logout-icon.svg'
            )
        );

        iconRegistry.addSvgIcon(
            'no-sync-icon',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/no-sync-icon.svg'
            )
        );

        iconRegistry.addSvgIcon(
            'new-sync-needed-icon',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/new-sync-needed-icon.svg'
            )
        );

        iconRegistry.addSvgIcon(
            'synced-icon',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/synced-icon.svg'
            )
        );

        iconRegistry.addSvgIcon(
            'close-icon',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/close-icon.svg'
            )
        );

        iconRegistry.addSvgIcon(
            'duplicate-icon-green',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/duplicate-icon-green.svg'
            )
        );

        iconRegistry.addSvgIcon(
            'rates-cancel-icon',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/rates-cancel-icon.svg'
            )
        );

        iconRegistry.addSvgIcon(
            'rates-save-icon',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/rates-save-icon.svg'
            )
        );

        iconRegistry.addSvgIcon(
            'contracts-icon',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/contracts-icon.svg'
            )
        );

        iconRegistry.addSvgIcon(
            'restore-icon',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/restore-icon.svg'
            )
        );

        iconRegistry.addSvgIcon(
            'supplier-icon',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/supplier-icon.svg'
            )
        );

        iconRegistry.addSvgIcon(
            'dialog-close-icon',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/dialog-close-icon.svg'
            )
        );
        iconRegistry.addSvgIcon(
            'download-icon',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/download-icon.svg'
            )
        );
        iconRegistry.addSvgIcon(
            'no-docs-icon',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/no-docs.svg'
            )
        );
        iconRegistry.addSvgIcon(
			'chevron-grey',
			sanitizer.bypassSecurityTrustResourceUrl('assets/common/images/chevron-grey.svg')
		);
        iconRegistry.addSvgIcon(
            'chevron-green',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/chevron-green.svg'
            )
        );
        iconRegistry.addSvgIcon(
            'chevron-green-big',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/chevron-green-big.svg'
            )
        );
    }
}
