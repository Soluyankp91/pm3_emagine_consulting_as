import { Directive, Input } from '@angular/core';

@Directive({
    selector: '[appImageFallback]',
    host: {
        '(error)': 'updateImageOnError()',
        '[ngSrc]': 'ngSrc'
    }
})
export class ImageFallbackDirective {
    @Input() ngSrc: string;
    defaultSrc = 'https://web-sourcing-qa.prodataconsult.com/api/shared-assets/EmployeePicture/da71d494-6678-4e1d-9002-5fb50e7050e1.jpg';
    internalSrc: string;
    constructor() { }

    updateImageOnError() {
        this.ngSrc = this.defaultSrc;
    }

}
