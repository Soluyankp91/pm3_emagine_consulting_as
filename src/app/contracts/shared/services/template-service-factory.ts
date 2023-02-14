import { Injector, Provider, InjectionToken } from '@angular/core';
import { Router } from '@angular/router';
import { AgreementService } from '../../agreements/listAndPreviews/services/agreement.service';
import { ClientTemplatesService } from '../../client-specific-templates/listAndPreviews/service/client-templates.service';
import { MasterTemplatesService } from '../../master-templates/listAndPreviews/services/master-templates.service';
import { BaseContract } from '../base/base-contract';

export const TEMPLATE_SERVICE_TOKEN = new InjectionToken<ITemplatesService>('TemplateServiceToken');
export type ITemplatesService = BaseContract;

export const TemplatesServiceFactory = (router: Router, injector: Injector): ITemplatesService | undefined => {
	const { url } = router;
	const isMasterTemplates: boolean = url.includes('/master-templates');
	const isClientTemplates: boolean = url.includes('/client-specific-templates');
	const isAgreements: boolean = url.includes('/agreements');
	if (isMasterTemplates) {
		return injector.get(MasterTemplatesService);
	}
	if (isClientTemplates) {
		return injector.get(ClientTemplatesService);
	}
	if (isAgreements) {
		return injector.get(AgreementService);
	}

	if (!isMasterTemplates && !isClientTemplates && !isAgreements) {
		throw new Error('Invalid usage of TableFilterComponent');
	}
};

export const TEMPLATE_SERVICE_PROVIDER: Provider = {
	provide: TEMPLATE_SERVICE_TOKEN,
	useFactory: TemplatesServiceFactory,
	deps: [Router, Injector],
};
