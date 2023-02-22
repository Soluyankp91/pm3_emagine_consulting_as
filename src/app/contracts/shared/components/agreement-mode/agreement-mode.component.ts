import { Component, OnInit, Input } from '@angular/core';
import { AgreementValidityState } from 'src/shared/service-proxies/service-proxies';
import { MODE_FILTER_OPTIONS } from '../grid-table/agreements/entities/agreements.constants';

@Component({
	selector: 'emg-agreement-mode',
	templateUrl: './agreement-mode.component.html',
})
export class AgreementModeComponent {
	@Input() agreementValidityState: AgreementValidityState;
	@Input() iconWidth: number;
	@Input() iconHeight: number;

	modeEnum = MODE_FILTER_OPTIONS.reduce((acc, cur) => ({ ...acc, [cur.id]: cur.name }), {});
}
