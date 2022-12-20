import { Directive, Input } from '@angular/core';

@Directive({
    selector: '[appImageFallback]',
    host: {
        '(error)': 'updateImageOnError()',
        '[src]': 'src'
    }
})
export class ImageFallbackDirective {
    @Input() src: string;
    defaultSrc = 'https://web-sourcing-qa.prodataconsult.com/api/shared-assets/EmployeePicture/da71d494-6678-4e1d-9002-5fb50e7050e1.jpg';
    internalSrc: string;
    constructor() { }

    updateImageOnError() {
        this.src = this.defaultSrc;
    }

}
