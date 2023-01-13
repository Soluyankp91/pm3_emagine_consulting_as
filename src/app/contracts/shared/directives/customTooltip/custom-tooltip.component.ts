import { Component, TemplateRef, Inject, InjectionToken } from '@angular/core';

export type TooltipData = string | TemplateRef<void>;
export const TOOLTIP_DATA = new InjectionToken<TooltipData>('');
@Component({
	selector: 'app-custom-tooltip',
	templateUrl: './custom-tooltip.component.html',
	styleUrls: ['./custom-tooltip.component.scss'],
})
export class CustomTooltipComponent {
	get asString(): string | false {
		return typeof this.tooltipData === 'string' ? this.tooltipData : false;
	}
	get asTemplate(): TemplateRef<void> | false {
		return this.tooltipData instanceof TemplateRef ? this.tooltipData : false;
	}

	constructor(@Inject(TOOLTIP_DATA) public tooltipData: TooltipData) {}
}
