import {
	AfterViewInit,
	Directive,
	ElementRef,
	EventEmitter,
	Inject,
	OnDestroy,
	Output,
	Renderer2,
	SkipSelf,
} from '@angular/core';
import { EditorCoreService } from '../services';
import { create, Options, RichEdit } from 'devexpress-richedit';
import { RICH_EDITOR_OPTIONS } from '../providers';
import { fromEvent, Subscription } from 'rxjs';
import { ICustomCommand } from '../entities';

@Directive({
	standalone: true,
	selector: '[richEditor]',
})
export class RichEditorDirective implements AfterViewInit, OnDestroy {
	private _subscriptions: Array<Subscription> = [];
	editor: RichEdit = null;

	@Output() saved: EventEmitter<void> = new EventEmitter();

	constructor(
		private _renderer: Renderer2,
		private _elementRef: ElementRef<HTMLElement>,
		@SkipSelf() @Inject(RICH_EDITOR_OPTIONS) private editorOptions: Options,
		@SkipSelf() private editorService: EditorCoreService
	) {}

	ngAfterViewInit(): void {
		setTimeout(() => {
			this.editor = create(this._elementRef.nativeElement, this.editorOptions);
			this.editorService.initialize(this.editor);
			this._handleRibbonListChange();
			this._registerTabChangeEvent();
		});
	}

	private _handleRibbonListChange() {
		this.editor.events.customCommandExecuted.addHandler((s, e) => {
			if (e.commandName === ICustomCommand.RibbonListChange) {
				this._subscriptions.forEach((sub) => sub.unsubscribe());
				this._registerTabChangeEvent();
			}

			if (e.commandName === ICustomCommand.DocumentSave) {
				this.saved.emit();
			}
		});
	}

	private _registerTabChangeEvent() {
		let tabElems = this._elementRef.nativeElement.querySelectorAll('.dx-item.dx-tab');
		let sub = fromEvent(tabElems, 'click').subscribe((e) => {
			this.editor.events.customCommandExecuted._fireEvent(this.editor, {
				commandName: ICustomCommand.RibbonTabChange,
				parameter: undefined,
			});
		});
		this._subscriptions.push(sub);
	}

	ngOnDestroy(): void {
		if (this.editor) {
			this.editor.dispose();
			this.editor = null;
			this.editorService.destroy();
			this._subscriptions.forEach((sub) => sub.unsubscribe());
		}
	}
}
