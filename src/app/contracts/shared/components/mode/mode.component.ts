import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { AgreementTemplateParentChildLinkState } from 'src/shared/service-proxies/service-proxies';

@Component({
	selector: 'emg-mode',
	templateUrl: './mode.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModeComponent {
	@Input() linkState: AgreementTemplateParentChildLinkState;
	@Input() iconWidth: number;
	@Input() iconHeight: number;

	constructor() {}
}
