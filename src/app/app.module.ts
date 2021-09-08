import { NgModule } from '@angular/core';
import { BrowserModule, DomSanitizer } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppCommonModule } from './shared/common/app-common.module';
import { MatIconRegistry } from '@angular/material/icon';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MainOverviewComponent } from './main-overview/main-overview.component';
import { ClientListComponent } from './client-list/client-list.component';
import { SourcingShortcutComponent } from './sourcing-shortcut/sourcing-shortcut.component';
import { WorkflowComponent } from './workflow/workflow.component';
import { StatisticsComponent } from './statistics/statistics.component';
import { TimeTrackingComponent } from './time-tracking/time-tracking.component';
import { EvaluationComponent } from './evaluation/evaluation.component';
import { InvoicingComponent } from './invoicing/invoicing.component';
import { ContractsComponent } from './contracts/contracts.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ServiceProxyModule } from 'src/shared/service-proxies/service-proxy.module';
import { API_BASE_URL } from 'src/shared/service-proxies/service-proxies';
import { AppConsts } from 'src/shared/AppConsts';
import { MsalBroadcastService, MsalGuard, MsalGuardConfiguration, MsalInterceptor, MsalInterceptorConfiguration, MsalModule, MsalRedirectComponent, MsalService, MSAL_GUARD_CONFIG, MSAL_INSTANCE, MSAL_INTERCEPTOR_CONFIG } from '@azure/msal-angular';
import { BrowserCacheLocation, InteractionType, IPublicClientApplication, LogLevel, PublicClientApplication } from '@azure/msal-browser';

const isIE = window.navigator.userAgent.indexOf("MSIE ") > -1 || window.navigator.userAgent.indexOf("Trident/") > -1; // Remove this line to use Angular Universal

export function loggerCallback(logLevel: LogLevel, message: string) {
  console.log(message);
}

export function MSALInstanceFactory(): IPublicClientApplication {
  return new PublicClientApplication({
    auth: {
      // clientId: '6226576d-37e9-49eb-b201-ec1eeb0029b6', // Prod enviroment. Uncomment to use.
      clientId: '54e44fbe-ca87-45be-9344-9a3bb6dd0dca', // PPE testing environment
      // authority: 'https://login.microsoftonline.com/common', // Prod environment. Uncomment to use.
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
  // protectedResourceMap.set('https://graph.microsoft.com/v1.0/me', ['user.read']); // Prod environment. Uncomment to use.
  protectedResourceMap.set('https://pm3-dev-app.azurewebsites.net', ['openid', 'profile', 'api://5f63a91e-8bfd-40ea-b562-3dad54244ff7/access_as_user']);

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
        DashboardComponent,
        MainOverviewComponent,
        ClientListComponent,
        SourcingShortcutComponent,
        WorkflowComponent,
        StatisticsComponent,
        TimeTrackingComponent,
        EvaluationComponent,
        InvoicingComponent,
        ContractsComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        HttpClientModule,
        AppCommonModule,
        FormsModule,
        ReactiveFormsModule,
        ServiceProxyModule,
        MsalModule
        // MsalModule.forRoot( new PublicClientApplication({
        //     auth: {
        //       clientId: '54e44fbe-ca87-45be-9344-9a3bb6dd0dca',
        //       authority: '',
        //       redirectUri: '/'
        //     },
        //     cache: {
        //       cacheLocation: 'localStorage',
        //       storeAuthStateInCookie: isIE,
        //     }
        //   }),
        //     {
        //         interactionType: InteractionType.Redirect, // MSAL Guard Configuration
        //         authRequest: {
        //             scopes: ['user.read']
        //         }
        //     },
        //     {
        //         interactionType: InteractionType.Redirect, // MSAL Interceptor Configuration
        //         protectedResourceMap: new Map([
        //             ['https://login.microsoftonline.com/0749517d-d788-4fc5-b761-0cb1a1112694/oauth2/v2.0/authorize', ['user.read']]
        //         ])
        //     })
        // MsalModule.forRoot( new PublicClientApplication({
        //     auth: {
        //       clientId: '54e44fbe-ca87-45be-9344-9a3bb6dd0dca', // This is your client ID
        //       authority: '', // This is your tenant ID
        //       redirectUri: '/'// This is your redirect URI
        //     },
        //     cache: {
        //       cacheLocation: 'localStorage',
        //       storeAuthStateInCookie: isIE, // Set to true for Internet Explorer 11
        //     }
        //   }),
        //   {
        //     interactionType: InteractionType.Redirect, // MSAL Guard Configuration
        //     authRequest: {
        //         scopes: ['user.read']
        //     }
        //   },{
        //     interactionType: InteractionType.Redirect, // MSAL Interceptor Configuration
        //     protectedResourceMap: new Map([
        //         ['Enter_the_Graph_Endpoint_Here/v1.0/me', ['user.read']]
        //     ])
        //  }
        // )
    ],
    providers: [
        {
            provide: API_BASE_URL, useFactory: getRemoteServiceBaseUrl
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
        // {
        //     provide: HTTP_INTERCEPTORS,
        //     useClass: MsalInterceptor,
        //     multi: true
        // }
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
    }
}
