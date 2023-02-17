import { AfterViewInit, Directive, ElementRef, Inject, OnDestroy, Renderer2, SkipSelf } from '@angular/core';
import { EditorCoreService } from '../services/editor-core.service';
import { create, Options, RichEdit } from 'devexpress-richedit';

import { RICH_EDITOR_OPTIONS } from '../providers';

@Directive({
	standalone: true,
	selector: '[richEditor]',
})
export class RichEditorDirective implements AfterViewInit, OnDestroy {
	editor: RichEdit = null;

	constructor(
		private _renderer: Renderer2,
		private _elementRef: ElementRef,
		@SkipSelf() @Inject(RICH_EDITOR_OPTIONS) private _editorOptions: Options,
		@SkipSelf() private _editorService: EditorCoreService
	) {}

	ngAfterViewInit(): void {
		setTimeout(() => {
			this.editor = create(this._elementRef.nativeElement, this._editorOptions);
			this._editorService.initialize(this.editor);
		});
	}

	ngOnDestroy(): void {
		if (this.editor) {
			this.editor.dispose();
			this.editor = null;
			this._editorService.destroy();
		}
	}
}
