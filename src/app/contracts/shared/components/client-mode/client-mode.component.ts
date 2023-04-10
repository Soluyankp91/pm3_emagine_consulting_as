import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { AgreementTemplateParentChildLinkState } from 'src/shared/service-proxies/service-proxies';
import { MODE_FILTER_OPTIONS } from '../grid-table/client-templates/entities/client-template.constants';

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

    modeEnum = MODE_FILTER_OPTIONS.reduce((acc, cur) => ({ ...acc, [cur.id]: cur.name }), {});
}
