import { ChangeDetectionStrategy, Component, Input, TemplateRef } from '@angular/core';
import { TooltipPosition } from './custom-tooltip.enums';

@Component({
	selector: 'app-custom-tooltip',
	templateUrl: './custom-tooltip.component.html',
	styleUrls: ['./custom-tooltip.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomTooltipComponent {
	@Input() text: string;
	@Input() contentTemplate: TemplateRef<any>;
	constructor() {}
}
