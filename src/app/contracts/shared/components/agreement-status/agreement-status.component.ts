import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { EnvelopeStatus } from 'src/shared/service-proxies/service-proxies';

@Component({
	selector: 'emg-agreement-status',
	templateUrl: './agreement-status.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AgreementStatusComponent {
	@Input() agreementStatus: EnvelopeStatus;

	envelopeStatuses = EnvelopeStatus;

	constructor() {}
}
