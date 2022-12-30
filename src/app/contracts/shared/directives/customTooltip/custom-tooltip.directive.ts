import { Directive, Input, TemplateRef, ElementRef, HostListener, ViewContainerRef, OnDestroy } from '@angular/core';
import { TemplatePortal } from '@angular/cdk/portal';
import { OverlayRef, Overlay, OverlayPositionBuilder } from '@angular/cdk/overlay';

@Directive({
	selector: '[customTooltip]',
})
export class CustomTooltipDirective implements OnDestroy {
	@Input('customTooltip') tooltipTemplate: TemplateRef<any>;

    @HostListener('mouseout')
	private _hide(): void {
		if (this._overlayRef) {
			this._overlayRef.detach();
		}
	}

    @HostListener('mouseenter')
	private _show(): void {
		this._createOverlay();
		const containerPortal = new TemplatePortal(this.tooltipTemplate, this.viewContainerRef);
		this._overlayRef.attach(containerPortal);
	}

	private _overlayRef: OverlayRef;

	constructor(
		private overlay: Overlay,
		private overlayPositionBuilder: OverlayPositionBuilder,
		private elementRef: ElementRef,
		private viewContainerRef: ViewContainerRef
	) {}


	ngOnDestroy() {
		if (this._overlayRef) {
			this._overlayRef.detach();
		}
	}

	private _createOverlay() {
		const position = this.overlayPositionBuilder.flexibleConnectedTo(this.elementRef).withPositions([
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
			scrollStrategy: this.overlay.scrollStrategies.close(),
			panelClass: 'custom-tooltip',
		});
	}
}
