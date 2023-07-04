import { Component, Inject, ChangeDetectionStrategy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { take, pluck } from 'rxjs/operators';
import { FILTER_LABEL_MAP } from 'src/app/contracts/shared/entities/contracts.constants';
import {
	ITemplatesService,
	TEMPLATE_SERVICE_PROVIDER,
	TEMPLATE_SERVICE_TOKEN,
} from 'src/app/contracts/shared/services/template-service-factory';

@Component({
	selector: 'app-is-enabled',
	templateUrl: './is-enabled.component.html',
	styleUrls: ['./is-enabled.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [TEMPLATE_SERVICE_PROVIDER],
})
export class IsEnabledComponent {
	options = [
		{
			id: true,
			name: 'Enabled',
		},
		{
			id: false,
			name: 'Disabled',
		},
	];

	filterFormControl = new FormControl();
	tableFilter = 'isEnabled';

	labelMap = FILTER_LABEL_MAP;

	constructor(@Inject(TEMPLATE_SERVICE_TOKEN) private _templatesService: ITemplatesService) {
		this._templatesService
			.getTableFilters$()
			.pipe(take(1), pluck(this.tableFilter))
			.subscribe((enabled) => {
				this.filterFormControl = new FormControl(enabled);
			});
	}
}
