import { Component, OnInit, Input } from '@angular/core';
import { EnvelopeStatus } from 'src/shared/service-proxies/service-proxies';

@Component({
	selector: 'emg-agreement-status',
	templateUrl: './agreement-status.component.html',
	styleUrls: ['./agreement-status.component.scss'],
})
export class AgreementStatusComponent implements OnInit {
	@Input() agreementStatus: EnvelopeStatus;

	envelopeStatuses = EnvelopeStatus;

	constructor() {}

	ngOnInit(): void {}
}
