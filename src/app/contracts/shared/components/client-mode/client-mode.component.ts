import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { AgreementTemplateParentChildLinkState } from 'src/shared/service-proxies/service-proxies';

@Component({
	selector: 'emg-client-template-mode',
	templateUrl: './client-mode.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientTemplateModeComponent {
	@Input() linkState: AgreementTemplateParentChildLinkState;
	@Input() iconWidth: number;
	@Input() iconHeight: number;

	constructor() {}
}
