import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { GlobalHttpInterceptorService } from './global-http-interceptor.service';
import * as ApiServiceProxies from './service-proxies';

@NgModule({
	providers: [
		ApiServiceProxies.AccountServiceProxy,
		ApiServiceProxies.ClientsServiceProxy,
		ApiServiceProxies.EnumServiceProxy,
		ApiServiceProxies.HubSpotContractFetchServiceProxy,
		ApiServiceProxies.HubSpotInstallServiceProxy,
		ApiServiceProxies.HubSpotSyncServiceProxy,
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
		{
			provide: HTTP_INTERCEPTORS,
			useClass: GlobalHttpInterceptorService,
			multi: true,
		},
	],
})
export class ServiceProxyModule {}
