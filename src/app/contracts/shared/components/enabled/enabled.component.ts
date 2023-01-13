import { Component, OnInit, Input } from '@angular/core';

@Component({
	selector: 'emg-enabled',
	templateUrl: './enabled.component.html',
	styleUrls: ['./enabled.component.scss'],
})
export class EnabledComponent implements OnInit {
	@Input() isEnabled: boolean;

	constructor() {}

	ngOnInit(): void {}
}
