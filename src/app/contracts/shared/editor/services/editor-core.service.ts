import { EventEmitter, Inject, Injectable, NgZone } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';

import { BehaviorSubject, ReplaySubject } from 'rxjs';
import {
	CommandId,
	ContextMenuCommandId,
	FileTabCommandId,
	FileTabItemId,
	HomeTabCommandId,
	HomeTabItemId,
	MailMergeTabCommandId,
	MailMergeTabItemId,
	Options,
	RibbonButtonItem,
	RibbonButtonItemOptions,
	RibbonSubMenuItem,
	RibbonTabType,
	RichEdit,
} from 'devexpress-richedit';
import { IntervalApi } from 'devexpress-richedit/lib/model-api/interval';
import { DocumentFormatApi } from 'devexpress-richedit/lib/model-api/formats/enum';
import { CharacterPropertiesApi } from 'devexpress-richedit/lib/model-api/character-properties';
import { ParagraphPropertiesApi } from 'devexpress-richedit/lib/model-api/paragraph';
import { ClientRichEdit } from 'devexpress-richedit/lib/client/client-rich-edit';

import { CompareService } from './compare.service';
import { CommentService } from './comment.service';
import { RICH_EDITOR_OPTIONS } from '../providers';
import { TransformMergeFiels } from '../helpers/transform-merge-fields.helper';
import { CUSTOM_CONTEXT_MENU_ITEMS, ICustomCommand, IMergeField } from '../entities';
import { AgreementCommentDto, AgreementTemplateCommentDto } from '../../../../../shared/service-proxies/service-proxies';
import { FieldApi } from 'devexpress-richedit/lib/model-api/field';
import { RibbonMenuItem } from 'devexpress-richedit/lib/client/public/ribbon/items/menu';

@Injectable()
export class EditorCoreService {
	private _initialised = false;
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
		private _zone: NgZone,
		private _compareService: CompareService,
		private _commentService: CommentService,
		private clipboard: Clipboard
	) {}

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

	registerRichEditor(editor: RichEdit) {
		this.editor = editor;
		this.editorNative = editor['_native'];
		this.options.ribbon.getTab(RibbonTabType.File).removeItem(FileTabItemId.ExportDocument);
	}

	initialize(readonly: boolean = false, exportWithMergedData: boolean = false) {
		this.editor.readOnly = readonly;

		if (exportWithMergedData) {
			this._customizeDownloadDocument();
		}

		if (!readonly) {
			if (this._initialised) return;
			this._customizeRibbonPanel();
			this._registerDocumentEvents();
			this._registerCustomEvents();
			this._initCompareTab();
			this._initComments();
			this._registerCustomContextMenuItems();
			this._registerCopyMergeFieldCommand();
			this._initialised = true;
		} else {
			this.editor.updateRibbon((ribbon) => {
				ribbon.activeTabIndex = 0;
			});
		}
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
		// this._commentService.closeCommentPanel();
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
		this.removeUnsavedChanges();
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
	}

	getSyncedCommentState() {
		return this._commentService.getSyncedCommentState();
	}

	toggleFields(showResult: boolean = true) {
		this.editor.executeCommand(MailMergeTabCommandId.UpdateAllFields);
		if (showResult) {
			this.editor.executeCommand(MailMergeTabCommandId.ShowAllFieldResults);
		} else {
			this.editor.executeCommand(MailMergeTabCommandId.ShowAllFieldCodes);
		}
	}

	toggleMergedData() {
		this.editor.executeCommand(MailMergeTabCommandId.ToggleViewMergedData);
	}

	toggleHighlightView(state: boolean) {
		this._triggerCustomCommand(ICustomCommand.ToggleCommentMode, state);
	}

	deleteComment(commentID: number) {
		this._commentService.deleteHighlight(commentID);
	}

	applyCommentChanges(commentID: number, text: string) {
		this._commentService.applyCommentChanges(commentID, text);
	}

	applyNewComment(comment: AgreementCommentDto | AgreementTemplateCommentDto) {
		this._commentService.applyNewComment(comment);
	}

	removeUnsavedChanges() {
		if (!this.editor) return;
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
		const showAllFieldResultsBtnOpts: RibbonButtonItemOptions = { icon: 'dxre-icon-ShowAllFieldResults', showText: true };
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
		mergeTab.removeItem(MailMergeTabItemId.ShowAllFieldResults);

		mergeTab.insertItem(
			new RibbonButtonItem(MailMergeTabItemId.UpdateAllFields, 'Show All Field Results', showAllFieldResultsBtnOpts),
			3
		);

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
			this.toggleHighlightView(!this.editor.readOnly);
			this.editor.events.contentInserted.addHandler((s, e) => {
				const regex = /{[^}]*}/g;
				const text = this.editor.document.getText(e.interval);
				if (text.length > 1 && regex.test(text)) {
					this._transformFieldsIntoMergeFields();
				}
			});
		});

		this.editor.events.documentChanged.addHandler(() => {
			if (!this._compareService.isCompareMode) {
				this._zone.run(() => {
					this.hasUnsavedChanges$.next(this.editor.hasUnsavedChanges);
				});
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
				case ICustomCommand.CopyMergeFields:
					this._copyMergeFields();
					break;
				case ICustomCommand.TransformToFreeText:
					this._transformMergeFieldToFreeText();
					break;
				case ICustomCommand.RibbonTabChange:
					this._onRibbonTabChange(e.parameter);
					break;
				case ICustomCommand.DownloadMDWordDoc:
					this._downloadWithMergedData(FileTabCommandId.DownloadDocx);
					break;
				case ICustomCommand.DownloadMDRichText:
					this._downloadWithMergedData(FileTabCommandId.DownloadRtf);
					break;
				case ICustomCommand.DownloadMDPlainText:
					this._downloadWithMergedData(FileTabCommandId.DownloadTxt);
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

	private _copyMergeFields() {
		this.editor.history.beginTransaction();
		let code = this.editor.document.getText(this.editor.selection.intervals[0]);
		let cleanedUpText = this._replaceMergeFieldWithRegex(code);
		this.clipboard.copy(cleanedUpText);
		this.editor.history.endTransaction();
	}

	private _transformMergeFieldToFreeText() {
		this.editor.history.beginTransaction();
		let selection = this.editor.selection.intervals[0];
		let fields = this.editor.document.fields.find(selection);
		fields.forEach((field) => this._removeMergeField(field));
		this.editor.history.endTransaction();
	}

	private _removeMergeField(field: FieldApi) {
		let fieldInterval = field.interval;
		let contentInterval = field.resultInterval;
		let content = this.editor.document.getText(contentInterval);
		let newInterval = new IntervalApi(fieldInterval.start, content.length);
		let highlightID = this._commentService.getMatchedHighlightIdByPosition(fieldInterval);
		field.delete();

		this.editor.document.insertText(fieldInterval.start, content);
		if (highlightID) {
			this._commentService.applyNewHighlight(newInterval, highlightID);
		}
		this.editor.selection.goToLineStart();
	}

	private _registerCopyMergeFieldCommand() {
		this.editor.events.contextMenuShowing.addHandler((s, e) => {
			let interval = this.editor.selection.intervals[0];
			if (interval.length) {
				let fieldsInPosition = this.editor.document.fields.find(interval);
				if (fieldsInPosition.length) {
					e.contextMenu.items.forEach((item) => {
						let allowedCommands = [ICustomCommand.CopyMergeFields, ICustomCommand.TransformToFreeText];
						let disallowedCommands = [
							ContextMenuCommandId.ShowBookmarkDialog,
							ContextMenuCommandId.ShowHyperlinkDialog,
						];
						if (allowedCommands.includes(item.id as ICustomCommand)) {
							item.visible = true;
							item.disabled = false;
						}

						if (disallowedCommands.includes(item.id as ContextMenuCommandId)) {
							item.visible = false;
							item.disabled = true;
						}
					});
				}
			}
		});
	}

	private _registerCustomContextMenuItems() {
		CUSTOM_CONTEXT_MENU_ITEMS.forEach((menuItem) => {
			if (Reflect.has(menuItem, 'insertAfter')) {
				this.editor.contextMenu.insertItemAfter(menuItem, menuItem.insertAfter);
			} else {
				this.editor.contextMenu.insertItem(menuItem);
			}
		});
	}

	private _replaceMergeFieldWithRegex(code: string) {
		const regex = new RegExp(/\}.*?\>/g);
		return code.replace(regex, '}').replace(/{MERGEFIELD /g, '{');
	}

	private _triggerCustomCommand(command: ICustomCommand, parameter?: any) {
		this.editor.events.customCommandExecuted._fireEvent(this.editor, { commandName: command, parameter });
	}

	private _onRibbonTabChange(param: string) {
		this._triggerCustomCommand(ICustomCommand.ToggleCommentMode, param !== 'compare');
	}

	private _customizeDownloadDocument() {
		const fileTab = this.options.ribbon.getTab(RibbonTabType.File);
		fileTab.removeItem(FileTabItemId.Download);

		fileTab.insertItem(
			new RibbonMenuItem(
				ICustomCommand.DownloadMD,
				'Download',
				[
					new RibbonSubMenuItem(ICustomCommand.DownloadMDWordDoc, 'Word Document (*.docx)'),
					new RibbonSubMenuItem(ICustomCommand.DownloadMDRichText, 'Rich Text Format (*.rtf)'),
					new RibbonSubMenuItem(ICustomCommand.DownloadMDPlainText, 'Plain Text (*.txt)'),
				],
				{ icon: 'dxre-icon-Download', showText: true }
			),
			2
		);
	}

	private _downloadWithMergedData(command: CommandId) {
		this.editor.executeCommand(MailMergeTabCommandId.ToggleViewMergedData);
		this.editor.executeCommand(command);
		this.editor.executeCommand(MailMergeTabCommandId.ToggleViewMergedData);
	}
}
