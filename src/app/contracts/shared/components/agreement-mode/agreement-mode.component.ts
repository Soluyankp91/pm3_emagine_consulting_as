import { Component, OnInit, Input } from '@angular/core';
import { AgreementValidityState } from 'src/shared/service-proxies/service-proxies';

@Component({
	selector: 'emg-agreement-mode',
	templateUrl: './agreement-mode.component.html',
})
export class AgreementModeComponent implements OnInit {
	@Input() agreementValidityState: AgreementValidityState;
	@Input() iconWidth: number;
	@Input() iconHeight: number;

	constructor() {}

	ngOnInit(): void {}
}
