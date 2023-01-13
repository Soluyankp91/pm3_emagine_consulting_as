import { Component, Inject, OnInit } from '@angular/core';
import {
	ITemplatesService,
	TEMPLATE_SERVICE_PROVIDER,
	TEMPLATE_SERVICE_TOKEN,
} from 'src/app/contracts/shared/services/template-service-factory';
import { FILTER_LABEL_MAP } from '../../client-template.constants';
import { take, pluck } from 'rxjs/operators';
import { FormControl } from '@angular/forms';

@Component({
	selector: 'app-mode-filter',
	templateUrl: './mode-filter.component.html',
	styleUrls: ['./mode-filter.component.scss'],
	providers: [TEMPLATE_SERVICE_PROVIDER],
})
export class ModeFilterComponent implements OnInit {
	options = [
		{
			id: 7,
			name: 'Fully linked',
		},
		{
			id: 5,
			name: 'Summary unlinked',
		},
		{
			id: 3,
			name: 'Document unlinked',
		},
		{
			id: 1,
			name: 'Fully unlinked',
		},
		{
			id: 0,
			name: 'Not applicable',
		},
	];

	filterFormControl: FormControl;
	tableFilter = 'linkState';

	labelMap = FILTER_LABEL_MAP;

	constructor(@Inject(TEMPLATE_SERVICE_TOKEN) private _templatesService: ITemplatesService) {
		this._templatesService
			.getTableFilters$()
			.pipe(take(1), pluck(this.tableFilter))
			.subscribe((enabled) => {
				this.filterFormControl = new FormControl(enabled);
			});
	}

	ngOnInit(): void {}
}
