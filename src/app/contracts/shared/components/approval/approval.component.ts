import { Component, OnInit, Input } from '@angular/core';

@Component({
	selector: 'emg-approval',
	templateUrl: './approval.component.html',
})
export class ApprovalComponent implements OnInit {
	@Input() linkStateAccepted: boolean;

	constructor() {}

	ngOnInit(): void {}
}
