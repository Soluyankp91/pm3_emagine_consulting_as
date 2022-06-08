import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { GlobalHttpInterceptorService } from './global-http-interceptor.service';
import * as ApiServiceProxies from './service-proxies';

@NgModule({
    providers: [
        ApiServiceProxies.AccountServiceProxy,
        ApiServiceProxies.ApiServiceProxy,
        ApiServiceProxies.ClientsServiceProxy,
        ApiServiceProxies.EnumServiceProxy,
        ApiServiceProxies.HubSpotContractFetchServiceProxy,
        ApiServiceProxies.HubSpotInstallServiceProxy,
        ApiServiceProxies.HubSpotTestServiceProxy,
        ApiServiceProxies.LookupServiceProxy,
        ApiServiceProxies.WorkflowServiceProxy,
        ApiServiceProxies.ClientPeriodServiceProxy,
        ApiServiceProxies.SpecialRatesServiceProxy,
        ApiServiceProxies.SpecialFeesServiceProxy,
        ApiServiceProxies.ClientSalesServiceProxy,
        ApiServiceProxies.ClientContractsServiceProxy,
        ApiServiceProxies.EmployeeNotificationServiceProxy,
        ApiServiceProxies.ClientDocumentsServiceProxy,
        ApiServiceProxies.ConsultantPeriodServiceProxy,
        ApiServiceProxies.ConsultantSalesServiceProxy,
        ApiServiceProxies.ConsultantContractsServiceProxy,
        ApiServiceProxies.MainOverviewServiceProxy,
        ApiServiceProxies.ClientFinanceServiceProxy,
        ApiServiceProxies.ConsultantFinanceServiceProxy,
        ApiServiceProxies.EmployeeServiceProxy,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: GlobalHttpInterceptorService,
            multi: true
        }
    ]
})
export class ServiceProxyModule { }
