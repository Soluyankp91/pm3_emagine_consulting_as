import { Directive, ElementRef, HostListener } from '@angular/core';
import { MatTooltip } from '@angular/material/tooltip';

@Directive({
    selector: '[matTooltip][appShowIfTruncated]'
  })
  export class ShowIfTruncatedDirective{
    constructor(
      private _matTooltip: MatTooltip,
      private _elementRef: ElementRef<HTMLElement>
    ) {
    }

    @HostListener("mouseenter", ["$event.target"])
    private _truncateOrNot() {
        // Wait for DOM update
        setTimeout(() => {
            const element = this._elementRef.nativeElement;
            this._matTooltip.disabled = element.scrollWidth <= element.clientWidth;
        }, 0);
    }
  }
