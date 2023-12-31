import { Directive, Input } from '@angular/core';

@Directive({
    selector: '[ngSrc]',
    host: {
        '(error)': 'updateImageOnError()',
        '[ngSrc]': 'ngSrc'
    }
})
export class ImageFallbackDirective {
    @Input() ngSrc: string;
    defaultSrc = '../../../assets/common/images/no-img.jpg';
    internalSrc: string;
    constructor() { }

    updateImageOnError() {
        this.ngSrc = this.defaultSrc;
    }

}
