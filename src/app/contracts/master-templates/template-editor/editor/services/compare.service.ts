import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';

import { DocumentFormatApi } from 'devexpress-richedit/lib/model-api/formats/enum';
import { FileTabCommandId } from 'devexpress-richedit/lib/client/public/commands/enum';
import { create, createOptions, Options, RibbonButtonItem, RibbonTab, RichEdit } from 'devexpress-richedit';

import { ICompareButtonType, ICustomEventType } from '../types';
import { compareTexts, highlightDifferences, highlightDifferencesConsole } from '../helpers/compare';

interface ICompareTabOptions {
	id: string;
	title: string;
	buttons: Array<RibbonButtonItem>;
}

interface ICompareButton {
	type: ICustomEventType;
	title: string;
	icon: string;
}

type ICompareButtons = Record<ICompareButtonType, ICompareButton>;

const CompareButtons: ICompareButtons = {
	[ICompareButtonType.Select]: {
		type: ICustomEventType.CompareTabSelect,
		title: 'Select document',
		icon: 'refresh',
	},
	[ICompareButtonType.Upload]: {
		type: ICustomEventType.CompareTabOpen,
		title: 'Upload document',
		icon: 'activefolder',
	},
	[ICompareButtonType.Compare]: {
		type: ICustomEventType.CompareTabCompareVersion,
		title: 'Compare to version',
		icon: 'unselectall',
	},
};

@Injectable()
export class CompareService {
	private _instance: RichEdit;
	constructor(@Inject(DOCUMENT) private document: Document) {}

	initialize(richInstance: RichEdit) {
		this._instance = richInstance;

		const buttons = this._initializeTabButtons();
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
			this._applyDiffsToTemplate(this._instance, diffArray);
		});
	}

	private _generateComparisonMap(current: RichEdit, processor: RichEdit) {
		let doc1 = current.document;
		let doc2 = processor.document;

		const arr1 = [];
		const arr2 = [];
		const paragraphsCount = Math.max(doc1.paragraphs.count, doc2.paragraphs.count);

		for (let i = 0; i < paragraphsCount; i++) {
			let pr1 = doc1.paragraphs.getByIndex(i);
			let pr2 = doc2.paragraphs.getByIndex(i);

			let txt1 = doc1.getText(pr1?.interval) || '';
			let txt2 = doc2.getText(pr2?.interval) || '';

			// if (txt1.replace(/(\r\n|\n|\r)/gm, '').length > 0) {
			if (pr1) {
				arr1.push(txt1);
			}
			// }

			if (pr2) {
				arr2.push(txt2);
			}
		}

		// COMPARE ALGORITHM
		const diff = compareTexts(arr2.join('\n'), arr1.join('\n'));
		const changes = highlightDifferences(diff);
		highlightDifferencesConsole(diff);

		for (let i = 0; i < changes.length; i++) {
			setTimeout(() => {
				if (changes[i].type === 'insert') {
					const p = current.document.paragraphs.getByIndex(changes[i].line - 1);
					current.document.setCharacterProperties(p.interval, {
						...p.properties,
						...{ backColor: '#F8EAA1' },
					});
				}

				if (changes[i].type === 'delete') {
					const p = current.document.paragraphs.getByIndex(changes[i].line - 1);
					const chProperties = current.document.getCharacterProperties(p.interval);
					const pProperties = current.document.getParagraphProperties(p.interval);

					current.document.insertText(p.interval.start, changes[i].text);

					const ap = current.document.paragraphs.getByIndex(changes[i].line - 1);
					current.document.setParagraphProperties(ap.interval, pProperties);
					current.document.setCharacterProperties(ap.interval, {
						...chProperties,
						...{ backColor: '#BDE3FF' },
					});
				}
			}, i * 800);
		}

		return [];
	}

	private _applyDiffsToTemplate(current: RichEdit, diff) {
		let pointer = 0;
	}

	private _registerListeners(instance: RichEdit) {
		instance.events.customCommandExecuted.addHandler((s, e) => {
			switch (e.commandName) {
				case ICompareButtonType.Upload: {
					instance.executeCommand(FileTabCommandId.OpenDocument);
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
			this._createButton(CompareButtons.COMPARE_TAB_SELECT_BTN),
			this._createButton(CompareButtons.COMPARE_TAB_UPLOAD_BTN),
			this._createButton(CompareButtons.COMPARE_TAB_COMPARE_BTN),
		];
	}

	private _createInstance() {
		const options: Options = createOptions();
		options.width = 'calc(100vw - 160px)';
		options.height = 'calc(100vh - 240px)';
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
		elem.style.opacity = '0';
	}

	private _createButton(button: ICompareButton) {
		return new RibbonButtonItem(button.type, button.title, {
			showText: true,
			beginGroup: true,
			icon: button.icon || null,
		});
	}
}
