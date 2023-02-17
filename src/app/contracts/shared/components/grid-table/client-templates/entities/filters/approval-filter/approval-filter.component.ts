import { Component, Inject, ChangeDetectionStrategy} from '@angular/core';
import {
	ITemplatesService,
	TEMPLATE_SERVICE_PROVIDER,
	TEMPLATE_SERVICE_TOKEN,
} from 'src/app/contracts/shared/services/template-service-factory';
import { FormControl } from '@angular/forms';
import { FILTER_LABEL_MAP } from 'src/app/contracts/shared/entities/contracts.constants';
import { take, pluck } from 'rxjs/operators';
import { APPROVAL_FILTER_OPTIONS } from '../../client-template.constants';
@Component({
	selector: 'app-approval-filter',
	templateUrl: './approval-filter.component.html',
    styleUrls: ['./approval-filter.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [TEMPLATE_SERVICE_PROVIDER],
})
export class ApprovalFilterComponent {
	filterFormControl: FormControl;
	tableFilter = 'linkStateAccepted';

	labelMap = FILTER_LABEL_MAP;
	options = APPROVAL_FILTER_OPTIONS;

	constructor(@Inject(TEMPLATE_SERVICE_TOKEN) private _templatesService: ITemplatesService) {
		this._templatesService
			.getTableFilters$()
			.pipe(take(1), pluck(this.tableFilter))
			.subscribe((approval) => {
				this.filterFormControl = new FormControl(approval);
			});
	}
}
