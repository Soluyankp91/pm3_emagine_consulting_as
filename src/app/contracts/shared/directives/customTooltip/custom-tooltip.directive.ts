import { Directive, Input, TemplateRef, ElementRef, HostListener, ViewContainerRef, OnDestroy, Injector } from '@angular/core';
import { ComponentPortal } from '@angular/cdk/portal';
import { OverlayRef, Overlay } from '@angular/cdk/overlay';
import { CustomTooltipComponent, TooltipData, TOOLTIP_DATA } from './custom-tooltip.component';

@Directive({
	selector: '[customTooltip]',
})
export class CustomTooltipDirective implements OnDestroy {
	@Input('customTooltip') tooltipTemplate: TooltipData;

	@HostListener('mouseout')
	private _hide(): void {
		if (this._overlayRef) {
			this._overlayRef.detach();
		}
	}

	@HostListener('mouseenter')
	private _show(): void {
		this._createOverlay();
		const injector = Injector.create({
			providers: [
				{
					provide: TOOLTIP_DATA,
					useValue: this.tooltipTemplate,
				},
			],
		});
		const containerPortal = new ComponentPortal(CustomTooltipComponent, this.viewContainerRef, injector);
		this._overlayRef.attach(containerPortal);
	}

	private _overlayRef: OverlayRef;

	constructor(private overlay: Overlay, private elementRef: ElementRef, private viewContainerRef: ViewContainerRef) {}

	ngOnDestroy() {
		if (this._overlayRef) {
			this._overlayRef.detach();
		}
	}

	private _createOverlay() {
		const position = this.overlay
			.position()
			.flexibleConnectedTo(this.elementRef)
			.withPositions([
				{
					originX: 'end',
					originY: 'bottom',
					overlayX: 'start',
					overlayY: 'top',
					offsetX: -20,
					offsetY: 0,
				},
			]);

		this._overlayRef = this.overlay.create({
			positionStrategy: position,
		});
	}
}
