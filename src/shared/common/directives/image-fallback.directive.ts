import { Directive, ElementRef, Input } from '@angular/core';

@Directive({
    selector: '[appImageFallback]',
    host: {
        '(error)': 'updateImageUrl()',
        '(load)': 'onImageLoaded()',
        '[src]': 'src'
    }
})
export class ImageFallbackDirective {
    @Input() src: string;
    defaultSrc = 'https://web-sourcing-qa.prodataconsult.com/api/shared-assets/EmployeePicture/da71d494-6678-4e1d-9002-5fb50e7050e1.jpg';
    internalSrc: string;
    constructor(private elementRef: ElementRef) { }

    updateImageUrl() {
        this.src = this.defaultSrc;
        this.internalSrc = this.src;
    }

    onImageLoaded() {
        if (!this.elementRef.nativeElement.error) {
            this.src = this.internalSrc;
        }
    }

}
