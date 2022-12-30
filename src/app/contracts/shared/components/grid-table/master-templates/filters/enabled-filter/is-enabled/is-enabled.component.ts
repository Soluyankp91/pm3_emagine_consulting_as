import { Component, Inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { take, pluck } from 'rxjs/operators';
import {
	ITemplatesService,
	TEMPLATE_SERVICE_PROVIDER,
	TEMPLATE_SERVICE_TOKEN,
} from 'src/app/contracts/shared/services/template-service-factory';
import { FILTER_LABEL_MAP } from '../../../entities/master-templates.constants';

@Component({
	selector: 'app-is-enabled',
	templateUrl: './is-enabled.component.html',
	providers: [TEMPLATE_SERVICE_PROVIDER],
})
export class IsEnabledComponent {
	options = [
		{
			id: 1,
			name: 'Enabled',
		},
		{
			id: 2,
			name: 'Disabled',
		},
	];

	filterFormControl = new FormControl();
	tableFilter = 'isEnabled';

	labelMap = FILTER_LABEL_MAP;

	constructor(@Inject(TEMPLATE_SERVICE_TOKEN) private _templatesService: ITemplatesService) {
		_templatesService
			.getTableFilters$()
			.pipe(take(1), pluck(this.tableFilter))
			.subscribe((enabled) => {
				this.filterFormControl = new FormControl(enabled);
			});
	}
}
