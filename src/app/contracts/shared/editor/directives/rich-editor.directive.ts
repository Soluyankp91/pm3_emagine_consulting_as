import {
	AfterViewInit,
	Directive,
	ElementRef,
	EventEmitter,
	HostBinding,
	Inject,
	Input,
	OnChanges,
	OnDestroy,
	Output,
	Renderer2,
	SimpleChanges,
	SkipSelf,
} from '@angular/core';
import { EditorCoreService } from '../services';
import { create, Options, RichEdit } from 'devexpress-richedit';
import { RICH_EDITOR_OPTIONS } from '../providers';
import { fromEvent, Subscription, ReplaySubject } from 'rxjs';
import { ICustomCommand, IMergeField } from '../entities';

@Directive({
	standalone: true,
	selector: '[richEditor]',
})
export class RichEditorDirective implements AfterViewInit, OnDestroy {
	private _initialized = new ReplaySubject(1);
	private _commentModeEnabled = false;
	private _subscriptions: Array<Subscription> = [];
	editor: RichEdit = null;

	@Output() saved: EventEmitter<void> = new EventEmitter();

	@Output() documentReady: EventEmitter<void> = new EventEmitter();

	@Input() readonly = false;

	@Input() set template(template: File | Blob | ArrayBuffer | string | null) {
		this._registerTemplateChanges(template);
	}

	@Input() set mergeFields(fields: IMergeField) {
		this._registerMergeFields(fields);
	}

	@HostBinding('class.readonly') get readonlyClass() {
		return this.readonly;
	}

	constructor(
		private _renderer: Renderer2,
		private _elementRef: ElementRef<HTMLElement>,
		@SkipSelf() @Inject(RICH_EDITOR_OPTIONS) private editorOptions: Options,
		@SkipSelf() private editorService: EditorCoreService
	) {}

	ngAfterViewInit(): void {
		this.editor = create(this._elementRef.nativeElement, this.editorOptions);
		this.editorService.registerRichEditor(this.editor);
		this._initialized.next();

		if (!this.readonly) {
			this._handleRibbonListChange();
			this._registerTabChangeEvent();
		}
	}

	private _registerMergeFields(fields: IMergeField) {
		let subscription = this._initialized.subscribe(() => {
			this.editorService.applyMergeFields(fields);
		});
		this._subscriptions.push(subscription);
	}

	private _registerTemplateChanges(template: File | Blob | ArrayBuffer | string | null) {
		let subscription = this._initialized.subscribe(() => {
			this.editorService.initialize(this.readonly);
			if (template) {
				this.editorService.loadDocument(template);
			} else {
				this.editorService.newDocument();
			}
			this.documentReady.emit();
		});
		this._subscriptions.push(subscription);
	}

	private _handleRibbonListChange() {
		this.editor.events.customCommandExecuted.addHandler((s, e) => {
			if (this.readonly) return;

			switch (e.commandName) {
				case ICustomCommand.ToggleCommentMode: {
					this._updateCommentView(e.parameter);
					break;
				}
				case ICustomCommand.SelectionHighlight: {
					this._updateCommentView(true);
					break;
				}
				case ICustomCommand.RibbonListChange: {
					this._subscriptions.forEach((sub) => sub.unsubscribe());
					this._registerTabChangeEvent();
					break;
				}
				case ICustomCommand.DocumentSave: {
					this.saved.emit();
					break;
				}
			}
		});
	}

	private _registerTabChangeEvent() {
		let tabElems = this._elementRef.nativeElement.querySelectorAll('.dx-item.dx-tab');
		let sub = fromEvent(tabElems, 'click').subscribe((e) => {
			if (this.readonly) return;
			let target = e.target as HTMLElement;
			let parentElem = target.classList.contains('dx-item') ? target : target.parentElement;
			let ribbonName = parentElem.querySelector('.dx-tab-text')?.textContent;
			this.editor.events.customCommandExecuted._fireEvent(this.editor, {
				commandName: ICustomCommand.RibbonTabChange,
				parameter: ribbonName ? ribbonName.toLowerCase() : undefined,
			});
		});
		this._subscriptions.push(sub);
	}

	private _updateCommentView(commentEnabled: boolean) {
		if (this._commentModeEnabled !== commentEnabled) {
			this._commentModeEnabled = commentEnabled;
			let diffCount = 300;
			let rulerElem: HTMLElement = this._elementRef.nativeElement.querySelector('.dxreRuler');
			let pageElem: HTMLElement = this._elementRef.nativeElement.querySelector('.dxreView');
			let currentLeft = parseInt(rulerElem.style.left);

			let left = `${commentEnabled ? currentLeft - diffCount / 2 : currentLeft + diffCount / 2}px`;
			let maxWidth = `calc(100% - ${commentEnabled ? diffCount : 0}px)`;

			pageElem.style.maxWidth = maxWidth;
			rulerElem.style.left = left;
		}
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
