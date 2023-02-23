import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
	selector: 'emg-approval',
	templateUrl: './approval.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApprovalComponent {
	@Input() linkStateAccepted: boolean;
	@Input() iconWidth: number;
	@Input() iconHeight: number;

	constructor() {}
}
