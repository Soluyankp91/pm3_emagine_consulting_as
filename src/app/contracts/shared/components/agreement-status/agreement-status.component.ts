import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { STATUTES } from 'src/app/shared/components/grid-table/agreements/entities/agreements.constants';
import { EnvelopeStatus } from 'src/shared/service-proxies/service-proxies';

@Component({
	selector: 'emg-agreement-status',
	templateUrl: './agreement-status.component.html',
	styleUrls: ['./agreement-status.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AgreementStatusComponent {
	@Input() agreementStatus: EnvelopeStatus;
	@Input() displayText: boolean = false;

	envelopeStatuses = EnvelopeStatus;

	statusEnum = STATUTES.reduce((acc, cur) => ({ ...acc, [cur.id]: { name: cur.name, color: cur.color, icon: cur.icon } }), {});
}
