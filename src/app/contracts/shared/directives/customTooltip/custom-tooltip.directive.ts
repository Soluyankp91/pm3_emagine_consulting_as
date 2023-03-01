import { Directive, Input, ElementRef, HostListener, ViewContainerRef, OnDestroy, Injector } from '@angular/core';
import { ComponentPortal } from '@angular/cdk/portal';
import { OverlayRef, Overlay } from '@angular/cdk/overlay';
import { CustomTooltipComponent, TooltipData, TOOLTIP_DATA } from './custom-tooltip.component';

@Directive({
	selector: '[customTooltip]',
})
export class CustomTooltipDirective implements OnDestroy {
	@Input('customTooltip') tooltipTemplate: TooltipData;
	@Input('showAlways') showAlways: boolean = false;

	@HostListener('mouseleave')
	private _hide(): void {
		if (this._overlayRef) {
			this._overlayRef.detach();
		}
	}

	@HostListener('mouseenter')
	private _show(): void {
		if (!this.showAlways && this._elementRef.nativeElement.scrollWidth <= this._elementRef.nativeElement.clientWidth) {
			return;
		}
		this._createOverlay();
		const injector = Injector.create({
			providers: [
				{
					provide: TOOLTIP_DATA,
					useValue: this.tooltipTemplate,
				},
			],
		});
		const containerPortal = new ComponentPortal(CustomTooltipComponent, this._viewContainerRef, injector);
		this._overlayRef.attach(containerPortal);
	}

	private _overlayRef: OverlayRef;

	constructor(private _overlay: Overlay, private _elementRef: ElementRef, private _viewContainerRef: ViewContainerRef) {}

	ngOnDestroy() {
		if (this._overlayRef) {
			this._overlayRef.detach();
		}
	}

	private _createOverlay() {
		const position = this._overlay
			.position()
			.flexibleConnectedTo(this._elementRef)
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

		this._overlayRef = this._overlay.create({
			positionStrategy: position,
		});
	}
}
