import { EventEmitter, Inject, Injectable } from '@angular/core';
import { BehaviorSubject, ReplaySubject } from 'rxjs';
import {
	FileTabItemId,
	HomeTabCommandId,
	HomeTabItemId,
	MailMergeTabCommandId,
	MailMergeTabItemId,
	Options,
	RibbonButtonItem,
	RibbonButtonItemOptions,
	RibbonTabType,
	RichEdit,
} from 'devexpress-richedit';
import { DocumentFormatApi } from 'devexpress-richedit/lib/model-api/formats/enum';
import { CharacterPropertiesApi } from 'devexpress-richedit/lib/model-api/character-properties';
import { ParagraphPropertiesApi } from 'devexpress-richedit/lib/model-api/paragraph';
import { ClientRichEdit } from 'devexpress-richedit/lib/client/client-rich-edit';

import { CompareService } from './compare.service';
import { CommentService } from './comment.service';
import { RICH_EDITOR_OPTIONS } from '../providers';
import { TransformMergeFiels } from '../helpers/transform-merge-fields.helper';
import { CUSTOM_CONTEXT_MENU_ITEMS, ICustomCommand, IMergeField } from '../entities';
import { IntervalApi } from 'devexpress-richedit/lib/model-api/interval';
import { AgreementCommentDto } from '../../../../../shared/service-proxies/service-proxies';

@Injectable()
export class EditorCoreService {
	afterViewInit$: ReplaySubject<void> = new ReplaySubject();
	templateAsBase64$ = new BehaviorSubject<string>('');
	hasUnsavedChanges$: BehaviorSubject<boolean> = new BehaviorSubject(false);
	commentSidebarEnabled$ = this._commentService.selectEnabled$;

	public editor: RichEdit = null;
	public editorNative: ClientRichEdit = null;
	public onCompareTemplate$: EventEmitter<void> = new EventEmitter();
	public onCompareVersion$: EventEmitter<void> = new EventEmitter();
	public onSelectMergeField$: EventEmitter<void> = new EventEmitter();

	constructor(
		@Inject(RICH_EDITOR_OPTIONS) private options: Options,
		private _compareService: CompareService,
		private _commentService: CommentService
	) {}

	set mergeFields(fields: IMergeField) {
		this.options.mailMerge.dataSource = [fields];
	}

	get mergeFields() {
		return this.options.mailMerge.dataSource[0];
	}

	set loading(state: boolean) {
		if (this.editor) {
			if (state) {
				this.editor.loadingPanel.show();
			} else {
				this.editor.loadingPanel.hide();
			}
		}
	}

	get loading() {
		return this.editor ? this.editor.loadingPanel.enabled : false;
	}

	initialize(reference: RichEdit) {
		this.editor = reference;
		this.editorNative = reference['_native'];
		this._customizeRibbonPanel();
		this._registerDocumentEvents();
		this._registerCustomEvents();
		this._initCompareTab();
		this._initComments();
		this._registerCustomContextMenuItems();
	}

	loadDocument(template: File | Blob | ArrayBuffer | string, doc_name?: string) {
		if (!this.editor) throw ReferenceError('Editor not initialized yet!, please call initialize().');
		this.editor.openDocument(template, doc_name ?? 'emagine_doc', DocumentFormatApi.OpenXml);
	}

	newDocument() {
		if (!this.editor) throw ReferenceError('Editor not initialized yet!, please call initialize().');
		this.editor.newDocument();
	}

	compareTemplate(document: Blob, filename: string) {
		if (document && filename) {
			this._compareService.applyCompareTemplate(document, filename);
		}
	}

	setTemplateAsBase64(callback: (base64: string) => void | unknown) {
        this._commentService.closeCommentPanel();
		this.editor.exportToBase64((base64) => {
			this.templateAsBase64$.next(base64);
			callback(base64);
		});
	}

	applyMergeFields(fields: IMergeField) {
		this.editor.mailMergeOptions.setDataSource([fields]);
	}

	insertComments(comments: Array<AgreementCommentDto>) {
        this._commentService.applyComments(comments as any);
	}

	insertMergeField(field: string, insertBreak: boolean = false) {
		const position = this.editor.selection.active;
		if (insertBreak) {
			this.editor.document.insertText(position, ' ');
		}
		const _field = this.editor.selection.activeSubDocument.fields.createMergeField(position, field);

		const text = this.editor.document.getText(_field.codeInterval);

		const replaced = text.replace(/["]+/g, '');
		this.editor.document.deleteText(_field.codeInterval);
		this.editor.document.insertText(_field.codeInterval.start, replaced);
		this.toggleFields();
	}

    getSyncedCommentState() {
        return this._commentService.getSyncedCommentState();
    }

	toggleFields() {
		this.editor.executeCommand(MailMergeTabCommandId.ToggleViewMergedData);
		this.editor.executeCommand(MailMergeTabCommandId.ToggleViewMergedData);
		this.editor.executeCommand(MailMergeTabCommandId.ShowAllFieldResults);
	}

	deleteComment(commentID: number) {
		this._commentService.deleteHighlight(commentID);
	}

    applyCommentChanges(commentID: number, text: string) {
        this._commentService.applyCommentChanges(commentID, text);
    }

	removeUnsavedChanges() {
		this.editor.hasUnsavedChanges = false;
		this.hasUnsavedChanges$.next(false);
	}

	getUnsavedChanges() {
		return this.editor.hasUnsavedChanges;
	}

	destroy() {
		this.editor = null;
	}

	private _customizeRibbonPanel() {
		const fileTab = this.options.ribbon.getTab(RibbonTabType.File);
		const mergeTab = this.options.ribbon.getTab(RibbonTabType.MailMerge);
		const homeTab = this.options.ribbon.getTab(RibbonTabType.Home);

		const insertFieldBtnOpts: RibbonButtonItemOptions = { icon: 'dxre-icon-InsertDataField', showText: true };
		const painterFormatBtnOpts: RibbonButtonItemOptions = { icon: 'palette', showText: false };

		fileTab.insertItem(new RibbonButtonItem(ICustomCommand.UpdateStyle, 'Update Styles'), 5);
		mergeTab.insertItem(
			new RibbonButtonItem(ICustomCommand.ShowMergeFieldPopup, 'Insert Merge Field', insertFieldBtnOpts),
			2
		);
		homeTab.insertItem(new RibbonButtonItem(ICustomCommand.FormatPainter, 'Format Painter', painterFormatBtnOpts), 3);

		mergeTab.removeItem(MailMergeTabItemId.ShowInsertMergeFieldDialog);
		mergeTab.removeItem(MailMergeTabItemId.ToggleViewMergedData);
		mergeTab.removeItem(MailMergeTabItemId.ShowMailMergeDialog);
		mergeTab.removeItem(MailMergeTabItemId.GoToFirstDataRecord);
		mergeTab.removeItem(MailMergeTabItemId.GoToLastDataRecord);
		mergeTab.removeItem(MailMergeTabItemId.GoToNextDataRecord);
		mergeTab.removeItem(MailMergeTabItemId.GoToPreviousDataRecord);
		mergeTab.removeItem(MailMergeTabItemId.UpdateAllFields);

		fileTab.removeItem(FileTabItemId.ExportDocument);
		homeTab.removeItem(HomeTabItemId.Paste);

		this.editor.updateRibbon((ribbon) => {
			const merge = ribbon.getTab(RibbonTabType.MailMerge);
			merge.title = 'Merge Fields';

			ribbon.removeTab(RibbonTabType.MailMerge);
			ribbon.insertTab(merge, 6);
		});
	}

	private _registerDocumentEvents() {
		this.editor.events.documentLoaded.addHandler(() => {
			this.afterViewInit$.next();
			this.afterViewInit$.complete();
			this.toggleFields();
			this.removeUnsavedChanges();
		});

		this.editor.events.documentChanged.addHandler(() => {
			if (!this._compareService.isCompareMode) {
				this.hasUnsavedChanges$.next(this.editor.hasUnsavedChanges);
			}
		});

		this.editor.setCommandEnabled(ICustomCommand.FormatPainter, false);
		this.editor.events.selectionChanged.addHandler((a, b) => {
			if (a.selection.intervals[0].length) {
				a.setCommandEnabled(ICustomCommand.FormatPainter, true);
			} else {
				a.setCommandEnabled(ICustomCommand.FormatPainter, false);
			}
		});
	}

	private _initCompareTab() {
		this._compareService.initialize(this.editor);
	}

	private _initComments() {
		this._commentService.initialize(this.editor);
	}

	private _registerCustomEvents() {
		this.editor.events.customCommandExecuted.addHandler((s, e) => {
			switch (e.commandName as ICustomCommand) {
				case ICustomCommand.SelectDocument:
					this.onCompareTemplate$.emit();
					break;
				case ICustomCommand.CompareVersion:
					this.onCompareVersion$.emit();
					break;
				case ICustomCommand.UpdateStyle:
					this._updateFontsToDefault();
					this._transformFieldsIntoMergeFields();
					break;
				case ICustomCommand.ShowMergeFieldPopup:
					this.onSelectMergeField$.emit();
					break;
				case ICustomCommand.FormatPainter:
					this._formatPainter();
					break;
				case ICustomCommand.SelectionHighlight: {
					this._commentService.toggleCreateMode();
					break;
				}
				case ICustomCommand.ToggleCommentMode:
					this._commentService.toggleHighlightState(e.parameter);
					break;
			}
		});
	}

	private _transformFieldsIntoMergeFields() {
		TransformMergeFiels.updateMergeFields(this.editor);
	}

	private _updateFontsToDefault() {
		this.editor.beginUpdate();
		this.editor.selection.selectAll();
		this.editor.executeCommand(HomeTabCommandId.ChangeFontName, 'Arial');
		this.editor.endUpdate();
	}

	private _formatPainter() {
		this.editorNative.element.classList.add('painter-format');
		this.editor.setCommandEnabled(ICustomCommand.FormatPainter, false);

		let charProperties: CharacterPropertiesApi;
		let prgphProperties: ParagraphPropertiesApi;

		const handler = (rich: RichEdit, e) => {
			let interval = this.editor.selection.intervals[0];
			rich.beginUpdate();
			
			if (charProperties && prgphProperties) {
				rich.document.setCharacterProperties(interval, charProperties);
				rich.document.setParagraphProperties(interval, prgphProperties);
			}
			
			this.editor.setCommandEnabled(ICustomCommand.FormatPainter, true);
			rich.endUpdate();

			this.editor.events.pointerUp.removeHandler(handler);
			this.editor.events.selectionChanged.removeHandler(sHandler);
			this.editorNative.element.classList.remove('painter-format');
		};

		const interval = this.editor.selection.intervals[0];

		const sHandler = (rich: RichEdit, e) => {
			charProperties = rich.document.getCharacterProperties(interval);
			prgphProperties = rich.document.getParagraphProperties(interval);
		};

		if (!interval.length) {
			this.editor.events.pointerUp.removeHandler(handler);
			this.editor.events.selectionChanged.removeHandler(sHandler);
			return;
		}

		this.editor.events.selectionChanged.addHandler(sHandler);
		this.editor.events.pointerUp.addHandler(handler);
	}

	private _registerCustomContextMenuItems() {
		CUSTOM_CONTEXT_MENU_ITEMS.forEach((menuItem) => {
			this.editor.contextMenu.insertItem(menuItem);
		});
	}
}
