import { Inject, Injectable } from '@angular/core';
import { create, createOptions, Options, RibbonButtonItem, RibbonTab, RichEdit } from 'devexpress-richedit';
import { DOCUMENT } from '@angular/common';
import { FileTabCommandId } from 'devexpress-richedit/lib/client/public/commands/enum';
import { ICompareButtonType } from '../types';

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
	constructor(@Inject(DOCUMENT) private document: Document) {}

	initialize(richInstance: RichEdit) {
		const buttons = this.initializeTabButtons();
		this.registerListeners(richInstance);
		this.initializeTab(richInstance, {
			id: 'CompareTabID',
			title: 'Compare',
			buttons,
		});

		// const instance = this.createCompareDocument();
	}

	private registerListeners(instance: RichEdit) {
		instance.events.customCommandExecuted.addHandler((s, e) => {
			switch (e.commandName) {
				case ICompareButtonType.Upload: {
					instance.executeCommand(FileTabCommandId.OpenDocument);
					break;
				}
			}
		});
	}

	private initializeTab(richInstance: RichEdit, options: ICompareTabOptions) {
		const { id, title, buttons } = options;
		richInstance.updateRibbon((ribbon) => {
			ribbon.insertTab(new RibbonTab(title, id, buttons));
		});
	}

	private initializeTabButtons() {
		return [
			this.createButton(CompareButtons.COMPARE_TAB_SELECT_BTN),
			this.createButton(CompareButtons.COMPARE_TAB_UPLOAD_BTN),
			this.createButton(CompareButtons.COMPARE_TAB_COMPARE_BTN),
		];
	}

	private createCompareDocument() {
		const instance = this.createInstance();
		instance.openDocument();
		instance.document.insertText(0, 'dsfdsfds dsf sdfds fds sdf dsdfdfds lkjlkj');
		return instance;
	}

	private createInstance() {
		const options: Options = createOptions();
		options.width = 'calc(100vw - 160px)';
		options.height = 'calc(100vh - 240px)';
		options.unit = 1;

		let elem = this.document.createElement('div');
		this.disappearElement(elem);
		this.document.body.appendChild(elem);
		return create(elem, options);
	}

	private disappearElement(elem: HTMLElement) {
		elem.style.width = '0';
		elem.style.height = '0';
		elem.style.visibility = 'hidden';
		elem.style.opacity = '0';
	}

	private createButton(button: ICompareButton) {
		return new RibbonButtonItem(button.type, button.title, {
			showText: true,
			beginGroup: true,
			icon: button.icon || null,
		});
	}
}
