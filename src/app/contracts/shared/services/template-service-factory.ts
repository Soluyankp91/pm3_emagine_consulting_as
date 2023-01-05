import { Injector, Provider, InjectionToken } from '@angular/core';
import { Router } from '@angular/router';
import { ClientTemplatesService } from '../../client-specific-templates/listAndPreviews/service/client-templates.service';
import { MasterTemplatesService } from '../../master-templates/listAndPreviews/services/master-templates.service';

export const TEMPLATE_SERVICE_TOKEN = new InjectionToken<ITemplatesService>('TemplateServiceToken');
export type ITemplatesService = MasterTemplatesService | ClientTemplatesService;

export const TemplatesServiceFactory = (router: Router, injector: Injector): ITemplatesService | undefined => {
	const { url } = router;
	const isMasterTemplates: boolean = url.includes('/master-templates');
	const isClientTemplates: boolean = url.includes('client-specific-templates');

	if (isMasterTemplates) {
		return injector.get(MasterTemplatesService);
	}
	if (isClientTemplates) {
		return injector.get(ClientTemplatesService);
	}

	if (!isMasterTemplates && !isClientTemplates) {
		throw new Error('Invalid usage of TableFilterComponent');
	}
};

export const TEMPLATE_SERVICE_PROVIDER: Provider = {
	provide: TEMPLATE_SERVICE_TOKEN,
	useFactory: TemplatesServiceFactory,
	deps: [Router, Injector],
};
