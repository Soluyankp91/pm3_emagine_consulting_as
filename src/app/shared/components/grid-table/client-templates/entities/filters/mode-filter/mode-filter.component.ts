import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import {
	ITemplatesService,
	TEMPLATE_SERVICE_PROVIDER,
	TEMPLATE_SERVICE_TOKEN,
} from 'src/app/contracts/shared/services/template-service-factory';
import { take, pluck } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { FILTER_LABEL_MAP } from 'src/app/contracts/shared/entities/contracts.constants';
import { MODE_FILTER_OPTIONS } from '../../client-template.constants';

@Component({
	selector: 'app-client-mode-filter',
	templateUrl: './mode-filter.component.html',
	styleUrls: ['./mode-filter.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [TEMPLATE_SERVICE_PROVIDER],
})
export class ClientModeFilterComponent {
	filterFormControl: FormControl;
	tableFilter = 'linkState';

	labelMap = FILTER_LABEL_MAP;
	options = MODE_FILTER_OPTIONS;

	constructor(@Inject(TEMPLATE_SERVICE_TOKEN) private _templatesService: ITemplatesService) {
		this._templatesService
			.getTableFilters$()
			.pipe(take(1), pluck(this.tableFilter))
			.subscribe((mode) => {
				this.filterFormControl = new FormControl(mode);
			});
	}
}
