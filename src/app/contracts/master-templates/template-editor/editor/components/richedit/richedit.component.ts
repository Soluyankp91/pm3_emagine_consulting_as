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
	MailMergeTabItemId,
	Options,
	RibbonButtonItem,
	RibbonTab,
	RibbonTabType,
	RichEdit,
} from 'devexpress-richedit';
import { RibbonButtonItemOptions } from 'devexpress-richedit/lib/client/public/ribbon/items/button';

import { IMergeField } from '../../_api/merge-fields.service';
import { RicheditService } from '../../services/richedit.service';
import { TransformMergeFiels } from '../../helpers/transform-merge-fields.helper';
import { InsertMergeFieldPopupComponent } from '../insert-merge-field-popup/insert-merge-field-popup.component';


@Component({
	standalone: true,
	selector: 'app-richedit',
	template: `
		<div class="editor"></div>
		<app-insert-merge-field-popup #mergePopup [fields]="mergeFields" (mergeField)="mergeSelectedField($event)">
		</app-insert-merge-field-popup>`,
	styleUrls: ['./richedit.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [CommonModule, InsertMergeFieldPopupComponent],
})
export class RicheditComponent implements AfterViewInit, OnDestroy {
	@Input() template: File | Blob | ArrayBuffer | string = '';
	@Input() mergeFields: IMergeField;

	@ViewChild('mergePopup') private mergeFieldPopup: InsertMergeFieldPopupComponent;

	templateAsBase64$: BehaviorSubject<string> = this._richeditService.templateAsBase64$;
	hasUnsavedChanges$: BehaviorSubject<boolean> = this._richeditService.hasUnsavedChanges$;

	private _rich: RichEdit;

	constructor(private _element: ElementRef, @SkipSelf() private _richeditService: RicheditService) {}

	ngAfterViewInit(): void {
		const options: Options = createOptions();

		this.setDimensions(options);
		this.ribbonCustomization(options);
		this.createDocument(this._element.nativeElement.firstElementChild, options);
		this.registerCustomEvents();
	}

	setDimensions(options: Options) {
		options.width = 'calc(100vw - 160px)';
		options.height = 'calc(100vh - 240px)';
	}

	createDocument(element: HTMLDivElement, options: Options) {
		this._rich = create(element, options);
		this._rich.openDocument(this.template, 'emagine_doc', 4);

		this._rich.events.documentChanged.addHandler(() => {
			this.hasUnsavedChanges$.next(this._rich.hasUnsavedChanges);
		});
	}

	ribbonCustomization(options: Options) {
		const fileTab = options.ribbon.getTab(RibbonTabType.File);
		const mergeTab = options.ribbon.getTab(RibbonTabType.MailMerge);
		const insertFieldBtnOpts: RibbonButtonItemOptions = { icon: 'dxre-icon-InsertDataField', showText: true };

		fileTab.insertItem(new RibbonButtonItem('updateStyles', 'Update Styles'), 5);
		mergeTab.insertItem(new RibbonButtonItem('mergeField', 'Insert Merge Field', insertFieldBtnOpts), 2);

		mergeTab.removeItem(MailMergeTabItemId.ShowInsertMergeFieldDialog);
		fileTab.removeItem(FileTabItemId.ExportDocument);

		this.insertCompareTab(options);

		// merge fields
		options.mailMerge.dataSource = [this.mergeFields];
	}

	insertCompareTab(options: Options) {
		const selectBtnId = 'selectBtn';
		const selectBtn = new RibbonButtonItem(selectBtnId, 'Select Document', {
			showText: true,
			beginGroup: true,
			icon: 'home',
		});

		const compareTabId = 'CompareTabID';
		options.ribbon.insertTab(new RibbonTab('Compare', compareTabId, [selectBtn]));
	}

	registerCustomEvents() {
		this._rich.events.customCommandExecuted.addHandler((s, e) => {
			switch (e.commandName) {
				case 'updateStyles':
					this.updateFontsToDefault();
					this.transformFiledsIntoMergeFields();
					break;
				case 'mergeField':
					this._showMergeFieldModal();
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
}
