import { Inject, Injectable } from '@angular/core';
import { create, createOptions, Options, RibbonButtonItem, RibbonTab, RichEdit } from 'devexpress-richedit';
import { DOCUMENT } from '@angular/common';
import { FileTabCommandId } from 'devexpress-richedit/lib/client/public/commands/enum';
import { ICompareButtonType } from '../types';
import { DocumentFormatApi } from 'devexpress-richedit/lib/model-api/formats/enum';
import { ParagraphApi } from 'devexpress-richedit/lib/model-api/paragraph';

interface ICompareTabOptions {
	id: string;
	title: string;
	buttons: Array<RibbonButtonItem>;
}

interface ICompareButton {
	type: ICompareButtonType;
	title: string;
	icon: string;
}

type ICompareButtons = Record<ICompareButtonType, ICompareButton>;

const CompareButtons: ICompareButtons = {
	[ICompareButtonType.Select]: {
		type: ICompareButtonType.Select,
		title: 'Select document',
		icon: 'refresh',
	},
	[ICompareButtonType.Upload]: {
		type: ICompareButtonType.Upload,
		title: 'Upload document',
		icon: 'activefolder',
	},
	[ICompareButtonType.Compare]: {
		type: ICompareButtonType.Compare,
		title: 'Compare to version',
		icon: 'unselectall',
	},
};

@Injectable({
	providedIn: 'root',
})
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
			// let instance = this.createInstance();

			let diffArray = this._generateComparisonMap(this._instance, temp);

			this._applyDiffsToTemplate(this._instance, diffArray);
		});
	}

	private _generateComparisonMap(current: RichEdit, processor: RichEdit) {
		const diffMap = {
			list1: [],
			list2: [],
		};

		let doc1 = current.document;
		let doc2 = processor.document;

		const paragraphsCount = Math.max(doc1.paragraphs.count, doc2.paragraphs.count);

		for (let i = 0; i < paragraphsCount; i++) {
			let pr1 = doc1.paragraphs.getByIndex(i);
			let pr2 = doc2.paragraphs.getByIndex(i);

			let txt1 = doc1.getText(pr1?.interval);
			let txt2 = doc2.getText(pr2?.interval);

			if (txt1.replace(/(\r\n|\n|\r)/gm, '').length > 0) {
				diffMap.list1.push({
					paragraph: pr1,
					text: txt1,
				});
			}

			if (txt2.replace(/(\r\n|\n|\r)/gm, '').length > 0) {
				diffMap.list2.push({
					paragraph: pr2,
					text: txt2,
				});
			}
		}

		return diffMap;
	}

	private _applyDiffsToTemplate(current: RichEdit, diffMap) {
		let { list1, list2 } = diffMap;
		let maxPCount = Math.max(list1.length, list2.length);
		let isSame = true;
		const changes = [];

		for (let i = 0; i < maxPCount; i++) {
			if (list1[i] && list2[i]) {
				if (list1[i].text !== list2[i].text) {
					isSame = false;

					let currentP: ParagraphApi = list1[i].paragraph;
					current.document.setCharacterProperties(currentP.interval, {
						...currentP.properties,
						...{ backColor: '#F8EAA1' },
					});
					changes.push({
						pr: list1[i].paragraph,
						text: list2[i].text,
						length: list2[i].paragraph?.interval?.length || 0
					});
				}
			}
		}

		changes.forEach(change => {
			current.beginUpdate();

			current.document.insertText(change.pr.interval.end, change.text);

			current.document.setCharacterProperties({
				start: change.pr.interval.end,
				length: change.length
			}, {
				...change.pr.properties,
				...{ backColor: '#BDE3FF' },
			})

			current.endUpdate();
		})

		if (isSame) {
			alert('No Changes!');
		}
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
