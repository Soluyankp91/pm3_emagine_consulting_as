import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { take, pluck } from 'rxjs/operators';
import { MasterTemplatesService } from 'src/app/contracts/master-templates/listAndPreviews/services/master-templates.service';

@Component({
	selector: 'app-is-enabled',
	templateUrl: './is-enabled.component.html',
	styleUrls: ['./is-enabled.component.scss'],
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
	private tableFilter = 'isEnabled';

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
