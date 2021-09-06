import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import * as ApiServiceProxies from './service-proxies';

@NgModule({
    providers: [
        ApiServiceProxies.AccountServiceProxy,
        ApiServiceProxies.ApiServiceProxy,
        ApiServiceProxies.ClientsServiceProxy,
        ApiServiceProxies.ConsultantsServiceProxy,
        ApiServiceProxies.EnumServiceProxy,
        ApiServiceProxies.HubSpotContractFetchServiceProxy,
        ApiServiceProxies.HubSpotInstallServiceProxy,
        ApiServiceProxies.HubSpotTestServiceProxy
    ]
})
export class ServiceProxyModule { }
