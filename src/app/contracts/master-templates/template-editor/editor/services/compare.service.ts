import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

import { DocumentFormatApi } from 'devexpress-richedit/lib/model-api/formats/enum';
import { FileTabCommandId } from 'devexpress-richedit/lib/client/public/commands/enum';
import { create, createOptions, Options, RibbonButtonItem, RibbonTab, RichEdit } from 'devexpress-richedit';

import { compareTexts, getDifferences } from '../helpers/compare';
import { CompareButtons, ICompareButton, ICompareTabOptions, ICustomCommand, COMPARE_TAB_CONTEXT_MENU_ITEM_IDS} from '../entities';

@Injectable()
export class CompareService {
	private _instance: RichEdit;
	public isCompareMode$: BehaviorSubject<boolean> = new BehaviorSubject(false);

	constructor(@Inject(DOCUMENT) private _document: Document) {}

	initialize(richInstance: RichEdit) {
		this._instance = richInstance;

		const buttons = this._initializeTabButtons();
		this._updateContextMenuItems(richInstance);
		this._registerListeners(richInstance);
		this._initializeTab(richInstance, {
			id: 'CompareTabID',
			title: 'Compare',
			buttons,
		});
	}

	applyCompareTemplate(blob: any) {
		let temp = this._createInstance();
		temp.openDocument(blob, 'temp_compare_document', DocumentFormatApi.OpenXml, () => {
			let diffArray = this._generateComparisonMap(this._instance, temp);
			this._applyDiffsToTemplate(this._instance, temp, diffArray);
			this._toggleCompareMode(true);
		});
	}

	private _toggleCompareMode(cond: boolean) {
		this.isCompareMode$.next(cond);
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
		const diff = compareTexts(doc2Lines.join('\n'), doc1Lines.join('\n'));
		const changes = getDifferences(diff);
		console.log(changes);
		return changes;
	}

	private _applyDiffsToTemplate(current: RichEdit, temp: RichEdit, changes: any[]) {
		for (let i = 0; i < changes.length; i++) {
			setTimeout(() => {
				if (changes[i].type === 'insert') {
					const p = current.document.paragraphs.getByIndex(changes[i].line - 1);
					current.document.setCharacterProperties(p.interval, {
						...p.properties,
						...{ backColor: '#fbf5d0' },
					});
				}

				if (changes[i].type === 'delete') {
					const p = current.document.paragraphs.getByIndex(changes[i].line - 1);
					const chProperties = temp.document.getCharacterProperties(p.interval);
					const pProperties = temp.document.getParagraphProperties(p.interval);

					current.document.insertText(p.interval.start, changes[i].text);

					const ap = current.document.paragraphs.getByIndex(changes[i].line - 1);
					current.document.setParagraphProperties(ap.interval, pProperties);
					current.document.setCharacterProperties(ap.interval, {
						...chProperties,
						...{ backColor: '#dff1ff' },
					});
				}
			}, i);
		}
	}

	private _registerListeners(instance: RichEdit) {
		instance.events.customCommandExecuted.addHandler((s, e) => {
			switch (e.commandName) {
				case ICustomCommand.UploadDocument: {
					instance.executeCommand(FileTabCommandId.OpenDocument);
					break;
				}
				case ICustomCommand.KeepBothVersions: {
					this._keepBoth(instance);
					break;
				}
				case ICustomCommand.KeepCurrentVersion: {
					this._keepCurrent(instance);
					break;
				}
				case ICustomCommand.KeepNewVersion: {
					this._keepNew(instance);
					break;
				}
			}
		});
	}

	private _initializeTab(richInstance: RichEdit, options: ICompareTabOptions) {
		const { id, title, buttons } = options;
		richInstance.updateRibbon((ribbon) => {
			ribbon.insertTab(new RibbonTab(title, id, buttons));
		});
	}

	private _initializeTabButtons() {
		return [
			this._createButton(CompareButtons.COMPARE_TAB_SELECT_DOCUMENT),
			this._createButton(CompareButtons.COMPARE_TAB_UPLOAD_DOCUMENT),
			this._createButton(CompareButtons.COMPARE_TAB_COMPARE_VERSION),
		];
	}

	private _createInstance() {
		const options: Options = createOptions();
		options.width = 'calc(100vw - 160px)';
		options.height = 'calc(100vh - 240px)';
		options.unit = 1;

		let elem = this._document.createElement('div');
		this._disappearElement(elem);
		this._document.body.appendChild(elem);
		return create(elem, options);
	}

	private _disappearElement(elem: HTMLElement) {
		elem.style.width = '0';
		elem.style.height = '0';
		elem.style.visibility = 'hidden';
		elem.style.opacity = '0';
	}

	private _createButton(button: ICompareButton) {
		return new RibbonButtonItem(button.type, button.title, {
			showText: true,
			beginGroup: true,
			icon: button.icon || null,
		});
	}

	private _updateContextMenuItems(editor: RichEdit) {
		const allowedItemIds = COMPARE_TAB_CONTEXT_MENU_ITEM_IDS;
		editor.events.contextMenuShowing.addHandler((s, e) => {
		   if (this.isCompareMode$.value) {
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

	private _keepCurrent(editor: RichEdit) {
		let characterProperties = editor.selection.activeSubDocument.getCharacterProperties(editor.selection.intervals[0])
		let p = editor.selection.activeSubDocument.paragraphs.find(editor.selection.intervals[0]);
		if (characterProperties.backColor === '#FBF5D0') {
			console.log(p[0].interval.start);
		} else {
			console.log('another');
		}
		
	}

	private _keepNew(editor: RichEdit) {
		let characterProperties = editor.selection.activeSubDocument.getCharacterProperties(editor.selection.intervals[0])
		let p = editor.selection.activeSubDocument.paragraphs.find(editor.selection.intervals[0]);
		if (characterProperties.backColor === '#FBF5D0') {
			editor.document.deleteText(p[0].interval);
		} else {
			console.log('another');
		}
	}

	private _keepBoth(editor: RichEdit) {

	}
}
