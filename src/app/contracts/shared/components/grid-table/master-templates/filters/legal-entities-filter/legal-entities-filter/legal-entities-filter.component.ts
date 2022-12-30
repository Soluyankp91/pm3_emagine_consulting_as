import { take, pluck, map, withLatestFrom } from 'rxjs/operators';
import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { IFilter } from 'src/app/contracts/shared/components/grid-table/mat-grid.interfaces';
import { ContractsService } from 'src/app/contracts/shared/services/contracts.service';
import { MasterTemplatesService } from 'src/app/contracts/master-templates/listAndPreviews/services/master-templates.service';
import { FILTER_LABEL_MAP } from '../../../entities/master-templates.constants';
import { LegalEntityDto } from 'src/shared/service-proxies/service-proxies';
import { contractsInjector } from 'src/app/contracts/contracts.module';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
	selector: 'app-legal-entities-filter',
	templateUrl: './legal-entities-filter.component.html',
})
export class LegalEntitiesFilterComponent implements IFilter {
	legalEntities$ = this.contractsService.getLegalEntities$().pipe(
		withLatestFrom(this.contractsService.getEnumMap$()),
		map(([legalEntities, maps]) =>
			legalEntities.map((i) => <LegalEntityDto>{ ...i, name: maps.legalEntityIds[i.id as number] })
		)
	);
	filterFormControl: FormControl;

	labelMap = FILTER_LABEL_MAP;

	tableFilter = 'legalEntityIds';

	constructor(private contractsService: ContractsService, private masterTemplateService: MasterTemplatesService) {
		this.masterTemplateService
			.getTableFilters$()
			.pipe(take(1), pluck(this.tableFilter))
			.subscribe((legalEntities) => {
				this.filterFormControl = new FormControl(legalEntities);
			});
	}
}
