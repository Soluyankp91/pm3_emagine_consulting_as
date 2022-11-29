import {
    Directive,
    HostListener,
    HostBinding,
    Output,
    EventEmitter,
} from '@angular/core';

@Directive({
    selector: '[appNewFileUploader]',
})
export class NewFileUploaderDirective {
    @Output() filesEmitter = new EventEmitter();

    @HostBinding('style.backgroundColor')
    @HostListener('dragover', ['$event'])
    onDragOver(evt: Event) {
        evt.stopPropagation();
        evt.preventDefault();
        this._colorRgb = this._hoveredColor;
    }

    @HostListener('dragleave', ['$event']) onDragLeave(evt: Event) {
        evt.preventDefault();
        evt.stopPropagation();
        this._colorRgb = 'unset';
    }

    @HostListener('drop', ['$event']) onDrop(evt: DragEvent) {
        evt.preventDefault();
        evt.stopPropagation();
        this._colorRgb = 'unset';
        const files = evt.dataTransfer;
        this.filesEmitter.emit(files);
    }

    get backgroundColor() {
        return this._colorRgb;
    }

    private _colorRgb = 'unset';
    private _hoveredColor = 'rgb(245,245,245)';

    constructor() {}
}
