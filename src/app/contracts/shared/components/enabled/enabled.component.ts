import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
	selector: 'emg-enabled',
	templateUrl: './enabled.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EnabledComponent {
	@Input() isEnabled: boolean;
    @Input() displayText: boolean = false;

	constructor() {}
}
