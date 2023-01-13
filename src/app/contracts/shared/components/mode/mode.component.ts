import { Component, OnInit, Input } from '@angular/core';
import { AgreementTemplateParentChildLinkState } from 'src/shared/service-proxies/service-proxies';

@Component({
	selector: 'emg-mode',
	templateUrl: './mode.component.html',
})
export class ModeComponent implements OnInit {
	@Input() linkState: AgreementTemplateParentChildLinkState;
	@Input() iconWidth: number;
	@Input() iconHeight: number;

	constructor() {}

	ngOnInit(): void {}
}
