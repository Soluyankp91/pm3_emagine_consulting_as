import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { EnvelopeStatus } from 'src/shared/service-proxies/service-proxies';
import { STATUTES } from '../grid-table/agreements/entities/agreements.constants';

@Component({
	selector: 'emg-agreement-status',
	templateUrl: './agreement-status.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AgreementStatusComponent {
	@Input() agreementStatus: EnvelopeStatus;

	envelopeStatuses = EnvelopeStatus;

    statusEnum = STATUTES.reduce((acc, cur) => ({ ...acc, [cur.id]: cur.name }), {});
}
