import { take, pluck, map, withLatestFrom } from 'rxjs/operators';
import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ContractsService } from 'src/app/contracts/shared/services/contracts.service';
import { LegalEntityDto } from 'src/shared/service-proxies/service-proxies';
import {
	ITemplatesService,
	TEMPLATE_SERVICE_PROVIDER,
	TEMPLATE_SERVICE_TOKEN,
} from 'src/app/contracts/shared/services/template-service-factory';
import { Observable } from 'rxjs';
import { FILTER_LABEL_MAP } from 'src/app/contracts/shared/entities/contracts.constants';
import { AgreementService } from 'src/app/contracts/agreements/listAndPreviews/services/agreement.service';
import { MapTenantCountryCode } from 'src/shared/helpers/tenantHelper';
import { IFilter } from '../../../mat-grid.interfaces';

export type ExtendedLegalEntity = LegalEntityDto & { prefix: string };
@Component({
	selector: 'app-legal-entities-filter',
	templateUrl: './legal-entities-filter.component.html',
	styleUrls: ['./legal-entities-filter.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [TEMPLATE_SERVICE_PROVIDER],
})
export class LegalEntitiesFilterComponent implements IFilter {
	legalEntities$: Observable<ExtendedLegalEntity[]>;
	filterFormControl: FormControl;

	labelMap = FILTER_LABEL_MAP;

	tableFilter = 'legalEntityIds';

	constructor(
		private contractsService: ContractsService,
		@Inject(TEMPLATE_SERVICE_TOKEN) private _templatesService: ITemplatesService
	) {
		if (_templatesService instanceof AgreementService) {
			this.tableFilter = 'legalEntityId';
		}
		this.legalEntities$ = this.contractsService
			.getLegalEntities$()
			.pipe(
				map((legalEntities: LegalEntityDto[]) =>
					legalEntities.map((i) => Object.assign({ prefix: MapTenantCountryCode(i.tenantName) }, i))
				)
			);
		this._templatesService
			.getTableFilters$()
			.pipe(take(1), pluck(this.tableFilter))
			.subscribe((legalEntities) => {
				this.filterFormControl = new FormControl(legalEntities);
			});
	}
}
