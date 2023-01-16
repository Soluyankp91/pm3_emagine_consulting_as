import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { LegalEntityDto } from 'src/shared/service-proxies/service-proxies';

@Component({
	selector: 'emg-tenants',
	templateUrl: './tenants.component.html',
	styleUrls: ['./tenants.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TenantsComponent {
	@Input() tenants: (LegalEntityDto & { code: string })[];
	constructor() {}

	countryLimit = 3;

	trackByLegalEntity(index: number, legalEntity: LegalEntityDto) {
		return legalEntity.id;
	}
}
