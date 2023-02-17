import { Injector, Provider, InjectionToken } from '@angular/core';
import { Router } from '@angular/router';
import { AgreementPreviewService } from '../../agreements/listAndPreviews/services/agreemen-preview.service';
import { PreviewService } from '../../master-templates/listAndPreviews/services/preview.service';
import { BasePreview } from '../base/base-preview';

export const PREVIEW_SERVICE_TOKEN = new InjectionToken<IPreviewService>('TemplateServiceToken');
export type IPreviewService = BasePreview;

export const PreviewServiceFactory = (router: Router, injector: Injector): IPreviewService | undefined => {
	const { url } = router;
	const isMasterTemplates: boolean = url.includes('/master-templates');
	const isClientTemplates: boolean = url.includes('/client-specific-templates');
	const isAgreements: boolean = url.includes('/agreements');
	if (isMasterTemplates || isClientTemplates) {
		return injector.get(PreviewService);
	}
	if (isAgreements) {
		return injector.get(AgreementPreviewService);
	}

	if (!(isMasterTemplates || isClientTemplates) && !isAgreements) {
		throw new Error('Invalid usage of TableFilterComponent');
	}
};

export const PREVIEW_SERVICE_PROVIDER: Provider = {
	provide: PREVIEW_SERVICE_TOKEN,
	useFactory: PreviewServiceFactory,
	deps: [Router, Injector],
};
