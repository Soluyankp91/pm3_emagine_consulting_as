import { Component, Inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { pluck, take } from 'rxjs/operators';
import { AgreementService } from 'src/app/contracts/agreements/listAndPreviews/services/agreement.service';
import { FILTER_LABEL_MAP } from 'src/app/contracts/shared/entities/contracts.constants';
import { TEMPLATE_SERVICE_PROVIDER, TEMPLATE_SERVICE_TOKEN } from 'src/app/contracts/shared/services/template-service-factory';
import { STATUTES } from '../../entities/agreements.constants';

@Component({
	selector: 'app-agreement-statuses-filter',
	templateUrl: './statuses-filter.component.html',
	providers: [TEMPLATE_SERVICE_PROVIDER],
})
export class StatusesFilterComponent {
	filterFormControl: FormControl;
	tableFilter = 'status';

	labelMap = FILTER_LABEL_MAP;
	options = STATUTES;

	constructor(@Inject(TEMPLATE_SERVICE_TOKEN) private readonly _agreementService: AgreementService) {
		this._agreementService
			.getTableFilters$()
			.pipe(take(1), pluck(this.tableFilter))
			.subscribe((statuses) => {
				this.filterFormControl = new FormControl(statuses);
			});
	}
}
