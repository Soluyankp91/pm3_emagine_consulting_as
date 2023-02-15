import { ChangeDetectionStrategy, Component, TemplateRef } from '@angular/core';
import { TooltipPosition } from './custom-tooltip.enums';

@Component({
	selector: 'app-custom-tooltip',
	templateUrl: './custom-tooltip.component.html',
	styleUrls: ['./custom-tooltip.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomTooltipComponent {
	position: TooltipPosition = TooltipPosition.BELOW;
	tooltip: TemplateRef<any>;
	left = 0;
	top = 'unset';
	bottom = 0;
	visible = false;
	constructor() {}
}
