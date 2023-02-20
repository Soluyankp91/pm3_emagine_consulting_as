import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Subject } from 'rxjs';

import { DocumentFormatApi } from 'devexpress-richedit/lib/model-api/formats/enum';
import { create, createOptions, FileTabCommandId, Options, RibbonButtonItem, RibbonTab, RichEdit } from 'devexpress-richedit';
import { custom, alert } from 'devextreme/ui/dialog';

import {
	COMPARE_TAB_CONTEXT_MENU_ITEM_IDS,
	CompareButtons,
	ICompareButton,
	ICompareColors,
	ICompareTabOptions,
	ICustomCommand,
	ICompareChanges,
} from '../entities';

import { compareTexts, getDifferences } from '../helpers/compare-tab';
import { ConfirmDialogComponent } from '../../../../shared/components/popUps/confirm-dialog/confirm-dialog.component';

@Injectable()
export class CompareService {
	private tabID = 'CompareTabID';
	private _instance: RichEdit;
	private _tempInstance: RichEdit;
	private _changes: ICompareChanges[] = [];
	private _prevChangesState: Array<ICompareChanges[]> = [];

	private _ribbonSelectItems = this._getRibbonSelectionItems();
	private _ribbonApplyChangesItems = this._getRibbonApplyChangeItems();
	private _isCompareMode$: Subject<boolean> = new Subject();

	public isCompareMode: boolean = false;
	private _currentDocumentName: string = '';
	private _currentDocumentSnapshot: string = '';
	private _comparedDocumentSnapshot: string = '';

	constructor(@Inject(DOCUMENT) private document: Document) {}

	initialize(richInstance: RichEdit) {
		this._instance = richInstance;
		this._registerEventListeners();
		this._updateContextMenuItems(richInstance);
		this._initializeTab(richInstance, {
			id: this.tabID,
			title: 'Compare',
			buttons: this._ribbonSelectItems,
		});
	}

	applyCompareTemplate(blob: any, filename: string) {
		this._currentDocumentName = filename;
		this._setCompareMode(true);
		this._tempInstance = this._createInstance();
		this._instance.exportToBase64((base64String) => {
			this._currentDocumentSnapshot = base64String;
		});
		this._tempInstance.openDocument(blob, 'temp_compare_document', DocumentFormatApi.OpenXml, () => {
			let diffArray = this._generateComparisonMap(this._instance, this._tempInstance);
			this._applyDiffsToTemplate(this._instance, this._tempInstance, diffArray);
		});
	}

	cancelComparison() {
		this._instance.hasUnsavedChanges = false;
		this._instance.openDocument(this._currentDocumentSnapshot, 'emagine_doc', DocumentFormatApi.OpenXml);
		this._currentDocumentName = '';
		this._currentDocumentSnapshot = '';
		this._comparedDocumentSnapshot = '';
		if (this._tempInstance) {
			this._tempInstance.dispose();
			this._tempInstance = null;
		}
		this._setCompareMode(false);
	}

	openCompareTemplate() {
		this._currentDocumentName = 'New document';
		this._setCompareMode(true);
		this._tempInstance = this._createInstance();
		this._instance.exportToBase64((base64String) => {
			this._currentDocumentSnapshot = base64String;
		});
		this._tempInstance = this._createInstance();
		
		this._tempInstance.events.documentLoaded.addHandler(() => {
			let diffArray = this._generateComparisonMap(this._instance, this._tempInstance);
			this._applyDiffsToTemplate(this._instance, this._tempInstance, diffArray);
			this._clearHistory(this._instance);
		});

		this._tempInstance.executeCommand(FileTabCommandId.OpenDocument);
	}

	private _registerEventListeners() {
		this._isCompareMode$.subscribe((isCompareMode) => {
			this.isCompareMode = isCompareMode;
			this._activateRibbonItemsByMode(isCompareMode);
		});
		this._instance.events.customCommandExecuted.addHandler((s, e) => {
			switch (e.commandName) {
				case ICustomCommand.UploadDocument: {
					this.openCompareTemplate();
					break;
				}
				case ICustomCommand.CancelCompare: {
					this.cancelComparison();
					break;
				}
				case ICustomCommand.UndoEdits: {
					this._instance.history.undo();
					this._changes = this._prevChangesState.pop() || [];
					break;
				}
				case ICustomCommand.ConfirmEdits:
					this._confirmEdits();
					break;
				case ICustomCommand.KeepBothVersions: {
					this._keepBoth(this._instance);
					break;
				}
				case ICustomCommand.KeepCurrentVersion: {
					this._keepCurrent(this._instance);
					break;
				}
				case ICustomCommand.KeepNewVersion: {
					this._keepNew(this._instance);
					break;
				}
				case ICustomCommand.RibbonTabChange:
					this._handleTabChange();
					break;
			}
		});
	}

	private _activateRibbonItemsByMode(isCompareMode: boolean) {
		let ribbonItems = [...(isCompareMode ? this._ribbonApplyChangesItems : this._ribbonSelectItems)];
		if (isCompareMode && this._currentDocumentName) {
			ribbonItems.unshift(
				this._createButton({
					icon: 'refresh',
					title: this._currentDocumentName,
				})
			);
		}

		this._instance.updateRibbon((ribbon) => {
			let currentTab = ribbon.getTab(this.tabID);
			currentTab.items = ribbonItems;
		});
		this._emitRibbonChangeEvent();
	}

	private _setCompareMode(cond: boolean) {
		this._isCompareMode$.next(cond);
	}

	private _generateComparisonMap(current: RichEdit, processor: RichEdit) {
		let doc1 = current.document;
		let doc2 = processor.document;

		const doc1Lines = [];
		const doc2Lines = [];
		const paragraphsCount = Math.max(doc1.paragraphs.count, doc2.paragraphs.count);

		for (let i = 0; i < paragraphsCount; i++) {
			let pr1 = doc1.paragraphs.getByIndex(i);
			let pr2 = doc2.paragraphs.getByIndex(i);

			let txt1 = doc1.getText(pr1?.interval) || '';
			let txt2 = doc2.getText(pr2?.interval) || '';

			if (pr1) {
				doc1Lines.push(txt1);
			}

			if (pr2) {
				doc2Lines.push(txt2);
			}
		}

		// COMPARE ALGORITHM
		const diff = compareTexts(doc1Lines, doc2Lines);
		const changes = getDifferences(diff);

		this._changes = changes.map((item, index, arr) => {
			item.isDone = false;

			if (index === 0) {
				item.groupId = 'grp_' + index;
				return item;
			}

			if (item.line - 1 === arr[index - 1].line) {
				item.groupId = arr[index - 1].groupId;
				return item;
			} else {
				item.groupId = 'grp_' + index;
				return item;
			}
		});
		
		return changes;
	}

	private _applyDiffsToTemplate(current: RichEdit, temp: RichEdit, changes: any[]) {
		let insertCount = 0;

		current.loadingPanel.show();
		current.beginUpdate();

		for (let i = 0; i < changes.length; i++) {
			
			if (changes[i].type === 'insert') {
				const p = current.document.paragraphs.getByIndex(changes[i].line);
				current.document.setCharacterProperties(p.interval, {
					...p.properties,
					...{ backColor: ICompareColors.CURRENT },
				});

				insertCount++;
			}

			if (changes[i].type === 'delete') {
				const p = current.document.paragraphs.getByIndex(changes[i].line);
				const tempP = temp.document.paragraphs.getByIndex(changes[i].line - insertCount);

				const chProperties = temp.document.getCharacterProperties(tempP?.interval);
				const pProperties = temp.document.getParagraphProperties(tempP?.interval);

				const ap = current.document.insertText(p?.interval?.start || 0, changes[i].text);
				current.document.setParagraphProperties({
					start: ap.start,
					length: ap.length
				}, pProperties);
				current.document.setCharacterProperties({
					start: ap.start,
					length: ap.length
				}, {
					...chProperties,
					...{ backColor: ICompareColors.INCOMING },
				});
			}
		}

		current.endUpdate();
		current.loadingPanel.hide();
	}

	private _initializeTab(richInstance: RichEdit, options: ICompareTabOptions) {
		const { id, title, buttons } = options;
		richInstance.updateRibbon((ribbon) => {
			ribbon.insertTab(new RibbonTab(title, id, buttons));
		});
	}

	private _getRibbonSelectionItems() {
		return [
			this._createButton(CompareButtons.COMPARE_TAB_SELECT_DOCUMENT),
			this._createButton(CompareButtons.COMPARE_TAB_UPLOAD_DOCUMENT),
			this._createButton(CompareButtons.COMPARE_TAB_COMPARE_VERSION),
		];
	}

	private _getRibbonApplyChangeItems() {
		return [
			this._createButton(CompareButtons.COMPARE_TAB_CONFIRM_EDITS),
			this._createButton(CompareButtons.COMPARE_TAB_UNDO_EDITS),
			this._createButton(CompareButtons.COMPARE_TAB_CANCEL_EDITS),
		];
	}

	private _createInstance() {
		const options: Options = createOptions();
		options.width = 'calc(100vw - 160px)';
		options.height = '0px';
		options.unit = 1;

		let elem = this.document.createElement('div');
		this._disappearElement(elem);
		this.document.body.appendChild(elem);
		return create(elem, options);
	}

	private _disappearElement(elem: HTMLElement) {
		elem.style.width = '0';
		elem.style.height = '0';
		elem.style.visibility = 'hidden';
		elem.style.overflow = 'hidden';
		elem.style.opacity = '0';
	}

	private _createButton(button: ICompareButton) {
		return new RibbonButtonItem(button.type, button.title, {
			showText: true,
			icon: button.icon || null,
			beginGroup: !!button.beginGroup,
		});
	}

	private _clearHistory(editor: RichEdit) {
		editor.history.clear();
	}

	private _updateContextMenuItems(editor: RichEdit) {
		const allowedItemIds = COMPARE_TAB_CONTEXT_MENU_ITEM_IDS;
		editor.events.contextMenuShowing.addHandler((s, e) => {
			if (this.isCompareMode) {
				let characterProperties = s.selection.activeSubDocument.getCharacterProperties(s.selection.intervals[0]);
				if (characterProperties.backColor === '#FBF5D0' || characterProperties.backColor === '#DFF1FF') {
					e.contextMenu.items.forEach((item) => {
						const isCompatible = allowedItemIds.includes(item.id);
						item.visible = isCompatible;
						item.disabled = !isCompatible;
					});
				}
			}
		});
	}

	private _handleTabChange() {
		if (this._instance && this._tempInstance && this.isCompareMode) {
			setTimeout(() => {
				this.cancelComparison();
			});
		}
	}

	private _emitRibbonChangeEvent() {
		this._instance.events.customCommandExecuted._fireEvent(this._instance, {
			commandName: ICustomCommand.RibbonListChange,
			parameter: undefined,
		});
	}

	private _confirmEdits() {
		if (this._changes.find(item => !item.isDone)) {
			alert('You have unsaved changes, please complete changes or discard changes. ', 'Finish comparing');
			return;
		}

		this._showCompleteConfirmDialog((confirmed) => {
			if (confirmed) {
				this._instance.history.clear();
				this._setCompareMode(false);
				this._instance.events.customCommandExecuted._fireEvent(this._instance, {
					commandName: ICustomCommand.DocumentSave,
					parameter: undefined,
				});
			}
		});
	}

	private _showCompleteConfirmDialog(callback: (value: boolean) => void) {
		let dialog = custom({
			title: 'Finish comparing',
			buttons: [
				{ type: 'normal', text: 'Cancel', onClick: () => false },
				{ type: 'danger', text: 'Apply changes', onClick: () => true },
			],
			messageHtml: `
                <p>Applying changes will result in creating new version of the document.</p>
                <p>Are you sure you want to proceed?</p>`,
		});

		dialog.show().then((res) => {
			callback(res);
		});
	}

	private _keepCurrent(editor: RichEdit) {
		editor.history.beginTransaction();

		const selection = editor.selection.intervals[0];
		const p = editor.document.paragraphs.find(selection)[0];

		const groupId = this._changes.find((item) => item.line === p.index).groupId;
		const group = this._changes.filter((item) => item.groupId === groupId);

		let removedLastLine = 0;
		let removedCount = 0;

		group.forEach((item, index) => {
			editor.beginUpdate();
			let p = editor.document.paragraphs.getByIndex(item.line);
			editor.document.setCharacterProperties(p.interval, {
				...p.properties,
				...{ backColor: 'auto' },
			});
			editor.endUpdate();
		});

		group.forEach((item) => {
			if (item.type === 'delete') {
				let p = editor.document.paragraphs.getByIndex(item.line - removedCount);
				editor.document.deleteText(p.interval);
				removedCount++;
				removedLastLine = item.line;
			}
		});

		this._recalculateChanges(groupId, 'delete', removedLastLine, removedCount);
		editor.history.endTransaction();
	}

	private _keepNew(editor: RichEdit) {
		editor.history.beginTransaction();

		const selection = editor.selection.intervals[0];
		const p = editor.document.paragraphs.find(selection)[0];

		const groupId = this._changes.find((item) => item.line === p.index).groupId;
		const group = this._changes.filter((item) => item.groupId === groupId);

		let removedLastLine = 0;
		let removedCount = 0;

		group.forEach((item, index) => {
			let p = editor.document.paragraphs.getByIndex(item.line);
			editor.beginUpdate();
			editor.document.setCharacterProperties(p.interval, {
				...p.properties,
				...{ backColor: 'auto' },
			});
			editor.endUpdate();
		});

		group.forEach((item) => {
			if (item.type === 'insert') {
				let p = editor.document.paragraphs.getByIndex(item.line - removedCount);
				editor.document.deleteText(p.interval);
				removedCount++;
				removedLastLine = item.line;
			}
		});

		this._recalculateChanges(groupId, 'insert', removedLastLine, removedCount);
		editor.history.endTransaction();
	}

	private _keepBoth(editor: RichEdit) {
		editor.history.beginTransaction();

		const selection = editor.selection.intervals[0];
		const p = editor.document.paragraphs.find(selection)[0];

		const groupId = this._changes.find((item) => item.line === p.index).groupId;
		const group = this._changes.filter((item) => item.groupId === groupId);

		group.forEach((item) => {
			let p = editor.document.paragraphs.getByIndex(item.line);
			editor.beginUpdate();
			editor.document.setCharacterProperties(p.interval, {
				...p.properties,
				...{ backColor: 'auto' },
			});
			editor.endUpdate();
		});
		
		this._recalculateChanges(groupId, 'both');
		editor.history.endTransaction();
	}

	private _recalculateChanges(groupId: string, type: string, removedLastLine?: number, removedCount?: number) {
		this._prevChangesState.push(this._changes.map(item => {
			if (item.groupId === groupId) {
				return {
					...item,
					isDone: false
				}
			}

			return item;
		})); 

		if (type === 'both') {
			this._changes = this._changes.map(item => {
				if (item.groupId === groupId) {
					item.isDone = true
				}
	
				return item;
			});
		} else {
			this._changes = this._changes
			.map((item) => {
				if (item.groupId === groupId) {
					item.isDone = true
				}

				if (item.line > removedLastLine) {
					return {
						...item,
						line: item.line - removedCount,
					};
				}

				return item;
			});
		}
	}
}
