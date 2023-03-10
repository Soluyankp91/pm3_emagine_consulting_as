import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { RibbonItemType, RibbonTabType, RichEdit } from 'devexpress-richedit';
import { FieldApi } from 'devexpress-richedit/lib/model-api/field';
import { IntervalApi } from 'devexpress-richedit/lib/model-api/interval';

import { ICustomCommand, IHighlightState, InitialState, SidebarViewMode, TEXT_PRE_CONTENT, TEXT_SEPARATOR } from '../entities';
import { distinctUntilChanged, pluck, take } from 'rxjs/operators';
import { AgreementCommentDto } from 'src/shared/service-proxies/service-proxies';
@Injectable()
export class CommentService {
	private _editor: RichEdit;

	private _state$$: BehaviorSubject<IHighlightState> = new BehaviorSubject(InitialState);
	state$ = this._state$$.asObservable().pipe(distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)));
	selectEnabled$ = this.state$.pipe(pluck('enabled'));
	commentModeEnabled: boolean = false;

	constructor() {}

	initialize(instance: RichEdit) {
		this._editor = instance;
		this._registerEventListeners();
		this._editor.updateRibbon((ribbon) => {
			let tab = ribbon.getTab(RibbonTabType.File);
			tab.insertItem({
				icon: 'rename',
				text: 'Highlight',
				type: RibbonItemType.Button,
				toggleMode: true,
				selected: false,
				showText: true,
				beginGroup: false,
				id: ICustomCommand.ToggleCommentMode,
			});
		});

		this._updateContextMenuItems();
		this._editor.events.documentLoaded.addHandler(() => {
			this._setupDocumentHighlightState();
		});
	}

	toggleHighlightState(enabled: boolean) {
		this.commentModeEnabled = enabled;
		this.setState(() => ({ enabled, viewMode: SidebarViewMode.View }));
		this.forceUpdateHighlightVariables();
	}

	forceUpdateHighlightVariables() {
		this._editor.document.fields.updateAllFields();
	}

	toggleCreateMode() {
		const interval = this._editor.selection.intervals[0];
		this.setState(() => ({ enabled: true, viewMode: SidebarViewMode.Create, selected: [], interval }));
	}

	setViewMode(viewMode: SidebarViewMode) {
		this.setState(() => ({ viewMode }));
	}

	cleanUpDocument(comments: Array<AgreementCommentDto>): void {
		this.setState(() => ({ comments }));
		let actualCommentIds = comments.map((cm) => cm.id);
		let highlightFields = this._getDocumentHighlightFields();
		highlightFields.forEach((field) => {
			let metadata = this._getHighlightFieldMetadata(field);
			if (metadata.id && metadata.text) {
				if (!actualCommentIds.includes(metadata.id)) {
					this._deleteHighlightField(field, metadata.text);
					this.forceUpdateHighlightVariables();
				}
			}
		});
	}

	applyHighlight(interval: IntervalApi, commentID: number) {
		let editor = this._editor;
		this._runWithoutHistory(() => {
			const selectedText = editor.document.getText(interval);
			const fields = editor.selection.activeSubDocument.fields;
			const field = fields.create(
				editor.selection.end,
				`${TEXT_PRE_CONTENT}${TEXT_SEPARATOR}${selectedText}${TEXT_SEPARATOR}${commentID}`
			);
			editor.document.deleteText(interval);
			field.update();
		});

		this.forceUpdateHighlightVariables();
		this._toggleCommentSidebar(true);
		this.setState((state) => ({
			viewMode: SidebarViewMode.View,
			selected: [commentID],
			commentIDs: [...state.commentIDs, commentID],
		}));
	}

	deleteHighlight(entityID: number) {
		const highlightFields = this._getDocumentHighlightFields();
		highlightFields.forEach((field) => {
			let fieldMetadata = this._getHighlightFieldMetadata(field);
			if (fieldMetadata.id === entityID) {
				this._deleteHighlightField(field, fieldMetadata.text);
			}
		});
	}

	highlightSelected(entityID: number) {
		this.setState(() => ({
			viewMode: SidebarViewMode.View,
			selected: [entityID],
		}));
	}

	cancelCreatHighlight() {
		this.setState((state) => ({ viewMode: SidebarViewMode.View, selected: state.commentIDs }));
		this._editor.selection.setSelection(this._editor.selection.intervals[0].start);
		this._runWithoutHistory(() => {
			this.forceUpdateHighlightVariables();
		});
	}

	private _setupDocumentHighlightState() {
		this.forceUpdateHighlightVariables();
		this.setState(() => ({ commentIDs: this._accumulateCommentIdsFormTemplate() }));
	}

	private _getDocumentHighlightFields(): Array<FieldApi> {
		let fieldCollection = this._editor.selection.activeSubDocument.fields;
		let fields = fieldCollection.find({ start: 0, length: this._editor.document.length });
		return fields.filter((field) => this._isValidHighlightField(field));
	}

	private _deleteHighlightField(field: FieldApi, replaceText: string): void {
		this._runWithoutHistory(() => {
			let interval = field.interval;
			field.delete();
			this._editor.document.insertText(interval.start, replaceText);
			this.forceUpdateHighlightVariables();
		});
	}

	private _getMetadataFromSpecialString(textMetadata: string) {
		let [_, text, id] = textMetadata.split(TEXT_SEPARATOR);
		return { code: textMetadata, text, id: parseInt(id) };
	}

	private _isValidHighlightField(field: FieldApi): boolean {
		let textCode = this._editor.document.getText(field.codeInterval);
		return textCode.includes(TEXT_PRE_CONTENT);
	}

	private _getHighlightFieldMetadata(field: FieldApi): { code: string; text: string; id: number } | null {
		let textCode = this._editor.document.getText(field.codeInterval);
		let textMetadata = textCode.replace(TEXT_PRE_CONTENT, '');
		return this._getMetadataFromSpecialString(textMetadata);
	}

	private _registerEventListeners() {
		let editor = this._editor;

		// Fields update
		editor.events.calculateDocumentVariable.addHandler((s, e) => {
			this.state$.pipe(take(1)).subscribe((state) => {
				if (e.variableName === 'highlight') {
					this._runWithoutHistory(() => {
						let stringArg = e.args.join(' ');
						let metadata = this._getMetadataFromSpecialString(stringArg);
						e.value = metadata.text;
						if (state.enabled && state.viewMode === SidebarViewMode.View) {
							editor.document.setCharacterProperties(e.fieldInterval, {
								highlightColor: '#c0d2f9',
							});
						} else {
							editor.document.setCharacterProperties(e.fieldInterval, {
								highlightColor: 'Auto',
								backColor: 'Auto',
							});
						}
					});
				}
			});
		});

		// Selection events
		editor.events.selectionChanged.addHandler((s, e) => {
			this.state$.pipe(take(1)).subscribe(({ viewMode, enabled, commentIDs }) => {
				if (enabled && viewMode === SidebarViewMode.View) {
					const fields = this._findFieldBySelection();
					const metadata = fields.length ? this._getHighlightFieldMetadata(fields[0]) : null;
					let selected = metadata ? [metadata.id] : commentIDs;
					this.setState(() => ({ selected: [...selected] }));
				}

				if (enabled && viewMode === SidebarViewMode.Create) {
					this._toggleCommentSidebar(false);
					this.setState(() => ({ viewMode: SidebarViewMode.View }));
				}
			});
		});
	}

	private _findFieldBySelection() {
		let position = this._editor.selection.active;
		return this._editor.selection.activeSubDocument.fields.find(position);
	}

	private _updateContextMenuItems() {
		this._editor.events.contextMenuShowing.addHandler((s, e) => {
			if (this._editor.selection.intervals[0].length) {
				e.contextMenu.items.forEach((item) => {
					if (item.id === ICustomCommand.SelectionHighlight) {
						item.visible = true;
						item.disabled = false;
					}
				});
			}
		});
	}

	private _accumulateCommentIdsFormTemplate() {
		const highlightFields = this._getDocumentHighlightFields();
		return highlightFields.map((filed) => {
			const metadata = this._getHighlightFieldMetadata(filed);
			return metadata.id;
		});
	}

	private _toggleCommentSidebar(isOpened: boolean) {
		this._editor.events.customCommandExecuted._fireEvent(this._editor, {
			commandName: ICustomCommand.ToggleCommentMode,
			parameter: isOpened,
		});
	}

	private _runWithoutHistory(callback: () => any): void {
		this._editor.history.beginTransaction();
		callback();
		this._editor.history.endTransaction();
		this._editor.hasUnsavedChanges = false;
		this._editor.history.clear();
	}

	private setState(callback: (state: IHighlightState) => Partial<IHighlightState>): void {
		this._state$$.next({
			...this._state$$.value,
			...callback(this._state$$.value),
		});
	}
}
