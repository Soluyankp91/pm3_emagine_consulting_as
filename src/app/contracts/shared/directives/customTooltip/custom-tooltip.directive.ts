import {
    Directive,
    Input,
    TemplateRef,
    OnInit,
    ElementRef,
    HostListener,
    ViewContainerRef,
    Renderer2,
} from '@angular/core';
import { TemplatePortal } from '@angular/cdk/portal';
import {
    OverlayRef,
    Overlay,
    OverlayPositionBuilder,
} from '@angular/cdk/overlay';

@Directive({
    selector: '[customTooltip]',
})
export class CustomTooltipDirective implements OnInit {
    @Input('customTooltip') tooltipTemplate: TemplateRef<any>;

    private _overlayRef: OverlayRef;

    constructor(
        private renderer: Renderer2,
        private overlay: Overlay,
        private overlayPositionBuilder: OverlayPositionBuilder,
        private elementRef: ElementRef,
        private viewContainerRef: ViewContainerRef
    ) {}

    ngOnInit(): void {
        if (this.tooltipTemplate) {
            const position = this.overlayPositionBuilder
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
                scrollStrategy: this.overlay.scrollStrategies.close(),
                panelClass: 'custom-tooltip',
            });
        }
    }

    @HostListener('mouseenter')
    private _show($event: MouseEvent): void {
        if (this._overlayRef) {
            const containerPortal = new TemplatePortal(
                this.tooltipTemplate,
                this.viewContainerRef
            );
            this._overlayRef.detach();
            this._overlayRef.attach(containerPortal);
        }
    }

    @HostListener('mouseleave', ['$event'])
    private _hide($event: MouseEvent): void {
        const newTarget = ($event as MouseEvent).relatedTarget as Node | null;
        if (!this._overlayRef?.overlayElement.contains(newTarget)) {
            this._overlayRef.detach();
            return;
        }
        this.renderer.listen(
            this._overlayRef.overlayElement,
            'mouseleave',
            () => {
                this._overlayRef.detach();
            }
        );
    }
}
