import { Component, Input, Inject, HostListener } from '@angular/core';

import { FilePreviewRef } from './file-preview-ref';
import { FILE_PREVIEW_DIALOG_DATA } from './file-preview.tokens';
import { Source } from './file-preview.service';
import { fade } from './animations';

const ESCAPE = 27;

@Component({
	selector: 'file-preview-overlay',
	templateUrl: './file-preview.component.html',
	styleUrls: ['file-preview.component.scss'],
	animations: [fade(100)],
})
export class FilePreviewComponent {
	@HostListener('click', ['$event']) onClick($event: Event) {
		$event.stopPropagation();
	}

	@HostListener('document:keydown', ['$event']) private handleKeydown(event: KeyboardEvent) {
		if (event.keyCode === ESCAPE) {
			this.dialogRef.close();
		}
	}

	constructor(public dialogRef: FilePreviewRef, @Inject(FILE_PREVIEW_DIALOG_DATA) public source: Source) {}

	close() {
		this.dialogRef.close();
	}

	downloadSource(source: Source) {
		const a = document.createElement('a');
		a.href = source.url;
		a.download = `${source.name}.${source.type}`;
		a.click();
	}
}
