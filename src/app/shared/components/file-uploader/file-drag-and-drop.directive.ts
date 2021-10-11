import { Directive, Output, EventEmitter, HostBinding, HostListener, Input } from '@angular/core';

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

    @Output()
    onFileDropped: EventEmitter<FileDragAndDropEvent> = new EventEmitter<FileDragAndDropEvent>();

    @HostListener('dragenter', ['$event'])
    ondragenter(event: any) {
        event.preventDefault();
        event.stopPropagation();
    }

    @HostListener('dragover', ['$event'])
    onDragOver(event: any) {
        event.preventDefault();
        event.stopPropagation();
    }

    @HostListener('dragleave', ['$event'])
    onDragLeave(event: any) {
        event.preventDefault();
        event.stopPropagation();
    }

    @HostListener('drop', ['$event'])
    onDrop(event: any) {
        event.preventDefault();
        event.stopPropagation();
        let files = event.dataTransfer.files;
        if (files && files.length > 0) {
            this.onFileDropped.emit(new FileDragAndDropEvent(files))
        }
    }
}
