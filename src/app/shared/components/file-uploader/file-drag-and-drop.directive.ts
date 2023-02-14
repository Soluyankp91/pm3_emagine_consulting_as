import { Directive, Output, EventEmitter, HostListener, HostBinding, ElementRef } from '@angular/core';

export class FileDragAndDropEvent {
    Files: File[];

    constructor(files: File[]) {
        this.Files = files;
    }
}

@Directive({
    selector: '[file-drag-and-drop]'
})
export class FileDragAndDropDirective {
    highlightBgClr = 'rgba(197, 232, 229, 0.2)';
    borderClr = 'rgb(197, 232, 229)';
    @Output()
    onFileDropped: EventEmitter<FileDragAndDropEvent> = new EventEmitter<FileDragAndDropEvent>();
    @HostBinding('style.backgroundColor')
    @HostListener('dragenter', ['$event'])
    ondragenter(event: any) {
        event.preventDefault();
        event.stopPropagation();
        console.log('[dragenter]');
        this._highlight(this.highlightBgClr, this.borderClr);
    }

    @HostListener('dragover', ['$event'])
    onDragOver(event: any) {
        event.preventDefault();
        event.stopPropagation();
        console.log('[dragover]');
        this._highlight(this.highlightBgClr, this.borderClr);
    }

    @HostListener('dragleave', ['$event'])
    onDragLeave(event: any) {
        event.preventDefault();
        event.stopPropagation();
        console.log('[dragleave]');
        this._highlight('', '');
    }

    @HostListener('drop', ['$event'])
    onDrop(event: any) {
        event.preventDefault();
        event.stopPropagation();
        this._highlight('', '');
        let files = event.dataTransfer.files;
        if (files && files.length > 0) {
            this.onFileDropped.emit(new FileDragAndDropEvent(files))
        }
    }

    constructor(private el: ElementRef) { }

    private _highlight(color: string, borderColor: string) {
        this.el.nativeElement.style.backgroundColor = color;
        this.el.nativeElement.style.borderColor = borderColor;
    }
}
