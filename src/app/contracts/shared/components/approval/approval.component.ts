import { Component, Input, ChangeDetectionStrategy, TemplateRef } from '@angular/core';
import { APPROVAL_FILTER_OPTIONS } from 'src/app/shared/components/grid-table/client-templates/entities/client-template.constants';

@Component({
	selector: 'emg-approval',
	templateUrl: './approval.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApprovalComponent {
	@Input() linkStateAccepted: boolean;
	@Input() tooltip?: TemplateRef<any>;
	@Input() iconWidth: number;
	@Input() iconHeight: number;

	approvalEnum = APPROVAL_FILTER_OPTIONS.reduce((acc, cur) => {
		acc.set(cur.id, cur.name);
		return acc;
	}, new Map());
}
