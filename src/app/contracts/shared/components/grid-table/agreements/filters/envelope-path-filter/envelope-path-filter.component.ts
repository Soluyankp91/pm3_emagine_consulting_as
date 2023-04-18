import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AgreementService } from 'src/app/contracts/agreements/listAndPreviews/services/agreement.service';
import { pluck, take } from 'rxjs/operators';
import { FILTER_LABEL_MAP } from 'src/app/contracts/shared/entities/contracts.constants';
import { TEMPLATE_SERVICE_PROVIDER, TEMPLATE_SERVICE_TOKEN } from 'src/app/contracts/shared/services/template-service-factory';
import { ENVELOPEPATH_FILTER_OPTIONS } from '../../entities/agreements.constants';

@Component({
	selector: 'app-envelope-path-filter',
	templateUrl: './envelope-path-filter.component.html',
	styleUrls: ['./envelope-path-filter.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [TEMPLATE_SERVICE_PROVIDER],
})
export class EnvelopePathFilterComponent {
	filterFormControl: FormControl;
	tableFilter = 'envelopeProcessingPath';

	labelMap = FILTER_LABEL_MAP;
	options = ENVELOPEPATH_FILTER_OPTIONS;

	constructor(@Inject(TEMPLATE_SERVICE_TOKEN) private readonly _agreementService: AgreementService) {
		this._agreementService
			.getTableFilters$()
			.pipe(take(1), pluck(this.tableFilter))
			.subscribe((envelopeProcessingPath) => {
				this.filterFormControl = new FormControl(envelopeProcessingPath);
			});
	}
}
