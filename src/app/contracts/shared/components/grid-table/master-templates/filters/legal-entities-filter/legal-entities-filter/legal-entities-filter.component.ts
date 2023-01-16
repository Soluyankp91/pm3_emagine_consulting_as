import { take, pluck, map, withLatestFrom } from 'rxjs/operators';
import { Component, Inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { IFilter } from 'src/app/contracts/shared/components/grid-table/mat-grid.interfaces';
import { ContractsService } from 'src/app/contracts/shared/services/contracts.service';
import { LegalEntityDto } from 'src/shared/service-proxies/service-proxies';
import {
	ITemplatesService,
	TEMPLATE_SERVICE_PROVIDER,
	TEMPLATE_SERVICE_TOKEN,
} from 'src/app/contracts/shared/services/template-service-factory';
import { Observable } from 'rxjs';
import { FILTER_LABEL_MAP } from 'src/app/contracts/shared/entities/contracts.constants';

@Component({
	selector: 'app-legal-entities-filter',
	templateUrl: './legal-entities-filter.component.html',
	providers: [TEMPLATE_SERVICE_PROVIDER],
})
export class LegalEntitiesFilterComponent implements IFilter {
	legalEntities$: Observable<LegalEntityDto[]>;
	filterFormControl: FormControl;

	labelMap = FILTER_LABEL_MAP;

	tableFilter = 'legalEntityIds';

	constructor(
		private contractsService: ContractsService,
		@Inject(TEMPLATE_SERVICE_TOKEN) private _templatesService: ITemplatesService
	) {
		this.legalEntities$ = this.contractsService.getLegalEntities$().pipe(
			withLatestFrom(this.contractsService.getEnumMap$()),
			map(([legalEntities, maps]) =>
				legalEntities.map((i) => <LegalEntityDto>{ ...i, name: maps.legalEntityIds[i.id as number] })
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
