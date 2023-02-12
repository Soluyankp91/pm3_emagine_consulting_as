import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { TEMPLATE_SERVICE_PROVIDER, TEMPLATE_SERVICE_TOKEN } from 'src/app/contracts/shared/services/template-service-factory';
import { FormControl } from '@angular/forms';
import { FILTER_LABEL_MAP } from 'src/app/contracts/shared/entities/contracts.constants';
import { MODE_FILTER_OPTIONS } from '../../entities/agreements.constants';
import { AgreementService } from 'src/app/contracts/agreements/listAndPreviews/services/agreement.service';
import { pluck, take } from 'rxjs/operators';

@Component({
	selector: 'app-agreement-mode-filter',
	templateUrl: './mode-filter.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [TEMPLATE_SERVICE_PROVIDER],
})
export class AgreementModeFilterComponent {
	filterFormControl: FormControl;
	tableFilter = 'mode';

	labelMap = FILTER_LABEL_MAP;
	options = MODE_FILTER_OPTIONS;

	constructor(@Inject(TEMPLATE_SERVICE_TOKEN) private readonly _agreementService: AgreementService) {
		this._agreementService
			.getTableFilters$()
			.pipe(take(1), pluck(this.tableFilter))
			.subscribe((mode) => {
				this.filterFormControl = new FormControl(mode);
			});
	}
}
