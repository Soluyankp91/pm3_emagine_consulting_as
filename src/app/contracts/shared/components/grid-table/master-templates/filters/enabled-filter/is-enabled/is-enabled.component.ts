import { Component, OnInit, Inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { take, pluck } from 'rxjs/operators';
import { ClientTemplatesService } from 'src/app/contracts/client-specific-templates/listAndPreviews/service/client-templates.service';
import { BASE_CONTRACT, contractsInjector } from 'src/app/contracts/contracts.module';
import { MasterTemplatesService } from 'src/app/contracts/master-templates/listAndPreviews/services/master-templates.service';
import { BaseContract } from 'src/app/contracts/shared/base/base-contract';
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

	constructor(@Inject(BASE_CONTRACT) masterTemplateService: BaseContract) {
		masterTemplateService
			.getTableFilters$()
			.pipe(take(1), pluck(this.tableFilter))
			.subscribe((enabled) => {
				this.filterFormControl = new FormControl(enabled);
			});
	}

	ngOnInit(): void {}
}
