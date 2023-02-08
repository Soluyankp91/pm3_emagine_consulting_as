import {
	AfterViewInit,
	ChangeDetectionStrategy,
	Component,
	ElementRef,
	Input,
	OnDestroy,
	SkipSelf,
	ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

import {
	create,
	createOptions,
	FileTabItemId,
	HomeTabCommandId,
	HomeTabItemId,
	MailMergeTabItemId,
	Options,
	RibbonButtonItem,
	RibbonTabType,
	RichEdit,
} from 'devexpress-richedit';
import { CharacterPropertiesApi } from 'devexpress-richedit/lib/model-api/character-properties';
import { ParagraphPropertiesApi } from 'devexpress-richedit/lib/model-api/paragraph';
import { RibbonButtonItemOptions } from 'devexpress-richedit/lib/client/public/ribbon/items/button';

import { IMergeField } from '../../_api/merge-fields.service';
import { RicheditService } from '../../services/richedit.service';
import { TransformMergeFiels } from '../../helpers/transform-merge-fields.helper';
import { InsertMergeFieldPopupComponent } from '../insert-merge-field-popup';
import { CompareSelectDocumentPopupComponent } from '../compare-select-document-popup';
import { CompareSelectVersionPopupComponent } from '../compare-select-version-popup';
import { CompareService } from '../../services/compare.service';
import { ICompareButtonType, IDocumentVersion } from '../../types';

@Component({
	standalone: true,
	selector: 'app-richedit',
	templateUrl: './richedit.component.html',
	styleUrls: ['./richedit.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [
		CommonModule,
		InsertMergeFieldPopupComponent,
		CompareSelectVersionPopupComponent,
		CompareSelectDocumentPopupComponent,
	],
})
export class RicheditComponent implements AfterViewInit, OnDestroy {
	@Input() template: File | Blob | ArrayBuffer | string = '';
	@Input() templateVersions: Array<IDocumentVersion> | null;
	@Input() mergeFields: IMergeField;

	@ViewChild('editor') editor: ElementRef;
	@ViewChild('mergePopup') private mergeFieldPopup: InsertMergeFieldPopupComponent;
	@ViewChild('compareVersionPopup') private compareVersionPopup: CompareSelectVersionPopupComponent;
	@ViewChild('compareDocumentPopup') private compareDocumentPopup: CompareSelectDocumentPopupComponent;

	templateAsBase64$: BehaviorSubject<string> = this._richeditService.templateAsBase64$;
	hasUnsavedChanges$: BehaviorSubject<boolean> = this._richeditService.hasUnsavedChanges$;

	private _rich: RichEdit;

	constructor(
		private _element: ElementRef,
		private _compareService: CompareService,
		@SkipSelf() private _richeditService: RicheditService
	) {}

	ngAfterViewInit(): void {
		const options: Options = createOptions();

		this.setDimensions(options);
		this.setUnit(options);
		this.ribbonCustomization(options);
		this.createDocument(this._element.nativeElement.firstElementChild, options);
		this.registerDocumentEvents();
		this.registerCustomEvents(options);

		this._compareService.initialize(this._rich);
	}

	setDimensions(options: Options) {
		options.width = 'calc(100vw - 160px)';
		options.height = 'calc(100vh - 240px)';
	}

	setUnit(options: Options) {
		options.unit = 1;
	}

	createDocument(element: HTMLDivElement, options: Options) {
		this._rich = create(element, options);
		this._rich.openDocument(this.template, 'emagine_doc', 4);
	}

	registerDocumentEvents() {
		this._rich.events.documentChanged.addHandler(() => {
			this.hasUnsavedChanges$.next(this._rich.hasUnsavedChanges);
		});

		this._rich.setCommandEnabled('formatPainter', false);
		this._rich.events.selectionChanged.addHandler((a, b) => {
			if (a.selection.intervals[0].length) {
				a.setCommandEnabled('formatPainter', true);
			} else {
				a.setCommandEnabled('formatPainter', false);
			}
		});
	}

	ribbonCustomization(options: Options) {
		const fileTab = options.ribbon.getTab(RibbonTabType.File);
		const mergeTab = options.ribbon.getTab(RibbonTabType.MailMerge);
		const homeTab = options.ribbon.getTab(RibbonTabType.Home);

		const insertFieldBtnOpts: RibbonButtonItemOptions = { icon: 'dxre-icon-InsertDataField', showText: true };
		const painterFormatBtnOpts: RibbonButtonItemOptions = { icon: 'palette', showText: false };

		fileTab.insertItem(new RibbonButtonItem('updateStyles', 'Update Styles'), 5);
		mergeTab.insertItem(new RibbonButtonItem('mergeField', 'Insert Merge Field', insertFieldBtnOpts), 2);
		homeTab.insertItem(new RibbonButtonItem('formatPainter', 'Format Painter', painterFormatBtnOpts), 3);

		mergeTab.removeItem(MailMergeTabItemId.ShowInsertMergeFieldDialog);
		fileTab.removeItem(FileTabItemId.ExportDocument);
		homeTab.removeItem(HomeTabItemId.Paste);

		// merge fields
		options.mailMerge.dataSource = [this.mergeFields];
	}

	registerCustomEvents(options: Options) {
		this._rich.events.customCommandExecuted.addHandler((s, e) => {
			switch (e.commandName) {
				case ICompareButtonType.Select:
					this.compareDocumentPopup.show();
					break;
				case ICompareButtonType.Compare:
					this.compareVersionPopup.show();
					break;
				case 'updateStyles':
					this.updateFontsToDefault();
					this.transformFiledsIntoMergeFields();
					break;
				case 'mergeField':
					this._showMergeFieldModal();
					break;
				case 'formatPainter':
					this.formatPainter();
					break;
			}
		});
	}

	transformFiledsIntoMergeFields() {
		TransformMergeFiels.updateMergeFields(this._rich);
	}

	updateFontsToDefault() {
		this._rich.beginUpdate();
		this._rich.selection.selectAll();
		this._rich.executeCommand(HomeTabCommandId.ChangeFontName, 'Arial');
		this._rich.endUpdate();
	}

	formatPainter() {
		this.editor.nativeElement.classList.add('painter-format');
		this._rich.setCommandEnabled('formatPainter', false);

		let charProperties: CharacterPropertiesApi;
		let prgphProperties: ParagraphPropertiesApi;

		const handler = (rich: RichEdit, e) => {
			let interval = this._rich.selection.intervals[0];

			rich.beginUpdate();
			rich.document.setCharacterProperties(interval, charProperties);
			rich.document.setParagraphProperties(interval, prgphProperties);
			this._rich.setCommandEnabled('formatPainter', true);
			rich.endUpdate();

			this._rich.events.pointerUp.removeHandler(handler);
			this._rich.events.selectionChanged.removeHandler(sHandler);
			this.editor.nativeElement.classList.remove('painter-format');
		};

		const interval = this._rich.selection.intervals[0];
		const sHandler = (rich: RichEdit, e) => {
			charProperties = rich.document.getCharacterProperties(interval);
			prgphProperties = rich.document.getParagraphProperties(interval);
		};

		if (!interval.length) {
			this._rich.events.pointerUp.removeHandler(handler);
			this._rich.events.selectionChanged.removeHandler(sHandler);
			return;
		}

		this._rich.events.selectionChanged.addHandler(sHandler);
		this._rich.events.pointerUp.addHandler(handler);
	}

	private _showMergeFieldModal() {
		this.mergeFieldPopup.showPopup();
	}

	mergeSelectedField(field: string) {
		const position = this._rich.selection.active;
		this._rich.selection.activeSubDocument.fields.createMergeField(position, field);
	}

	ngOnDestroy() {
		if (this._rich) {
			this._rich.dispose();
			this._rich = null;
		}
	}

	public setTemplateAsBase64() {
		this._rich.exportToBase64((s) => {
			this.templateAsBase64$.next(s);
		});
	}

	public setAsSaved() {
		console.log(11)
		this._rich.hasUnsavedChanges = false;
	}
}
