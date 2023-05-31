import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { GlobalHttpInterceptorService } from './global-http-interceptor.service';
import * as ApiServiceProxies from './service-proxies';
import { SignalRService } from '../common/services/signal-r.service';
import { AgreementSignalRApiService } from '../common/services/agreement-signalr.service';

@NgModule({
    providers: [
        ApiServiceProxies.AccountServiceProxy,
        ApiServiceProxies.ClientsServiceProxy,
        ApiServiceProxies.EnumServiceProxy,
        ApiServiceProxies.HubSpotContractFetchServiceProxy,
        ApiServiceProxies.HubSpotInstallServiceProxy,
        ApiServiceProxies.LookupServiceProxy,
        ApiServiceProxies.WorkflowServiceProxy,
        ApiServiceProxies.ClientPeriodServiceProxy,
        ApiServiceProxies.EmployeeNotificationServiceProxy,
        ApiServiceProxies.ClientDocumentsServiceProxy,
        ApiServiceProxies.ConsultantPeriodServiceProxy,
        ApiServiceProxies.MainOverviewServiceProxy,
        ApiServiceProxies.EmployeeServiceProxy,
        ApiServiceProxies.ContractSyncServiceProxy,
        ApiServiceProxies.TenantConfigServiceProxy,
        ApiServiceProxies.ConfigurationServiceProxy,
        ApiServiceProxies.WorkflowDocumentServiceProxy,
        ApiServiceProxies.FileServiceProxy,
        ApiServiceProxies.AgreementServiceProxy,
        ApiServiceProxies.ClientAddressesServiceProxy,
        ApiServiceProxies.PurchaseOrderServiceProxy,
        ApiServiceProxies.FrameAgreementServiceProxy,
        ApiServiceProxies.HistoryServiceProxy,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: GlobalHttpInterceptorService,
            multi: true
        },
        SignalRService,
        {
            provide: APP_INITIALIZER,
            useFactory: (signalRService: SignalRService) => () => signalRService.init(),
            deps: [AgreementSignalRApiService],
            multi: true
        }
    ]
})
export class ServiceProxyModule { }
