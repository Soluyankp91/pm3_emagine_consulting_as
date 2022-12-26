import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { take, pluck } from 'rxjs/operators';
import { MasterTemplatesService } from 'src/app/contracts/master-templates/listAndPreviews/services/master-templates.service';
import { FILTER_LABEL_MAP } from '../../../entities/master-templates.constants';

@Component({
	selector: 'app-is-enabled',
	templateUrl: './is-enabled.component.html',
})
export class IsEnabledComponent implements OnInit {
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

	constructor(private masterTemplateService: MasterTemplatesService) {
		this.masterTemplateService
			.getTableFilters$()
			.pipe(take(1), pluck(this.tableFilter))
			.subscribe((enabled) => {
				this.filterFormControl = new FormControl(enabled);
			});
	}

	ngOnInit(): void {}
}
