import {
	ApplicationRef,
	ComponentFactoryResolver,
	ComponentRef,
	Directive,
	ElementRef,
	EmbeddedViewRef,
	HostListener,
	Injector,
	Input,
	TemplateRef,
} from '@angular/core';
import { CustomTooltipComponent } from './custom-tooltip.component';
import { TooltipPosition } from './custom-tooltip.enums';

@Directive({
	selector: '[emgCustomTooltip]',
})
export class CustomTooltipDirective {
	@Input() emgCustomTooltip: TemplateRef<any>;
	@Input() position: TooltipPosition = TooltipPosition.BELOW;

	private componentRef: ComponentRef<any> | null = null;

	constructor(
		private elementRef: ElementRef,
		private appRef: ApplicationRef,
		private componentFactoryResolver: ComponentFactoryResolver,
		private injector: Injector
	) {}

	@HostListener('mouseenter')
	private _onMouseEnter(): void {
		this._initializeTooltip();
	}

	@HostListener('mouseleave')
	private _onMouseLeave(): void {
		this._destroy();
	}

	@HostListener('mousemove', ['$event'])
	private _onMouseMove($event: MouseEvent): void {
		if (this.componentRef !== null && this.position === TooltipPosition.DYNAMIC) {
			this.componentRef.instance.left = $event.clientX;
			this.componentRef.instance.top = $event.clientY;
			this.componentRef.instance.tooltip = this.emgCustomTooltip;
		}
	}

	private _initializeTooltip() {
		if (this.componentRef === null) {
			const componentFactory = this.componentFactoryResolver.resolveComponentFactory(CustomTooltipComponent);
			this.componentRef = componentFactory.create(this.injector);

			this.appRef.attachView(this.componentRef.hostView);
			const [tooltipDOMElement] = (this.componentRef.hostView as EmbeddedViewRef<any>).rootNodes;

			this._setTooltipComponentProperties();

			document.body.appendChild(tooltipDOMElement);
			this._showTooltip();
		}
	}

	private _setTooltipComponentProperties() {
		if (this.componentRef !== null) {
			this.componentRef.instance.tooltip = this.emgCustomTooltip;
			this.componentRef.instance.position = this.position;
			const { left, right, top, bottom } = this.elementRef.nativeElement.getBoundingClientRect();
			switch (this.position) {
				case TooltipPosition.BELOW: {
					this.componentRef.instance.left = Math.round(left + 60);
					if (document.body.scrollHeight - top < 120) {
						this.componentRef.instance.bottom = Math.round(document.body.scrollHeight - top + 10);
						this.componentRef.instance.top = 'unset';
					} else {
						this.componentRef.instance.top = Math.round(bottom);
						this.componentRef.instance.bottom = 'unset';
					}
					break;
				}
				case TooltipPosition.ABOVE: {
					this.componentRef.instance.left = Math.round(left + 60);
					if (document.body.scrollHeight - bottom < 120) {
						this.componentRef.instance.top = Math.round(document.body.scrollHeight - bottom + 10);
						this.componentRef.instance.bottom = 'unset';
					} else {
						this.componentRef.instance.bottom = Math.round(top);
						this.componentRef.instance.top = 'unset';
					}
					break;
				}
				case TooltipPosition.RIGHT: {
					this.componentRef.instance.left = Math.round(right);
					this.componentRef.instance.top = Math.round(top + (bottom - top) / 2);
					break;
				}
				case TooltipPosition.LEFT: {
					this.componentRef.instance.left = Math.round(left);
					this.componentRef.instance.top = Math.round(top + (bottom - top) / 2);
					break;
				}
				default: {
					break;
				}
			}
		}
	}

	private _showTooltip() {
		if (this.componentRef !== null) {
			this.componentRef.instance.visible = true;
		}
	}

	ngOnDestroy(): void {
		this._destroy();
	}

	private _destroy(): void {
		if (this.componentRef !== null) {
			this.componentRef.instance.visible = false;
			this.appRef.detachView(this.componentRef.hostView);
			this.componentRef.destroy();
			this.componentRef = null;
		}
	}
}
