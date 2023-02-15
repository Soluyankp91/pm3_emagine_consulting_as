import { OverlayRef, Overlay, OverlayPositionBuilder } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { ComponentRef, Directive, ElementRef, HostListener, Input, TemplateRef } from '@angular/core';
import { CustomTooltipComponent } from './custom-tooltip.component';

@Directive({
	selector: '[emgCustomTooltip]',
})
export class CustomTooltipDirective {
	@Input() showToolTip: boolean = true;
	@Input(`emgCustomTooltip`) text: string;
	@Input() contentTemplate: TemplateRef<any>;

	private _overlayRef: OverlayRef;

	constructor(
		private _overlay: Overlay,
		private _overlayPositionBuilder: OverlayPositionBuilder,
		private _elementRef: ElementRef
	) {}

	ngOnInit() {
		if (!this.showToolTip) {
			return;
		}

		const positionStrategy = this._overlayPositionBuilder.flexibleConnectedTo(this._elementRef).withPositions([
			{
				originX: 'center',
				originY: 'bottom',
				overlayX: 'center',
				overlayY: 'top',
				offsetY: 10,
			},
		]);

		this._overlayRef = this._overlay.create({ positionStrategy });
	}

	@HostListener('mouseenter')
	private _show() {
		if (this._overlayRef && !this._overlayRef.hasAttached()) {
			const tooltipRef: ComponentRef<CustomTooltipComponent> = this._overlayRef.attach(
				new ComponentPortal(CustomTooltipComponent)
			);
			tooltipRef.instance.text = this.text;
			tooltipRef.instance.contentTemplate = this.contentTemplate;
		}
	}

	@HostListener('mouseleave')
	private _hide() {
		this._closeToolTip();
	}

	ngOnDestroy() {
		this._closeToolTip();
	}

	private _closeToolTip() {
		if (this._overlayRef) {
			this._overlayRef.detach();
		}
	}
}
