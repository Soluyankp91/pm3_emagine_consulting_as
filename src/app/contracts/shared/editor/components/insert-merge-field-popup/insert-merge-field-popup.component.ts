import { CommonModule, DOCUMENT } from '@angular/common';
import {
	AfterViewInit,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	EventEmitter,
	Inject,
	Input,
	OnInit,
	Output,
	ViewChild,
	ViewEncapsulation,
} from '@angular/core';
import {
	DxBulletModule,
	DxButtonModule,
	DxCheckBoxModule,
	DxPopupModule,
	DxTemplateModule,
	DxTreeListModule,
	DxTreeViewComponent,
	DxTreeViewModule,
} from 'devextreme-angular';
import { IMergeField } from '../../entities';
import { EditorCoreService } from '../../services';

interface IMergeFieldItem {
	id: string;
	parentID: string | null;
	displayName: string;
}

@Component({
	standalone: true,
	selector: 'app-insert-merge-field-popup',
	templateUrl: './insert-merge-field-popup.component.html',
	imports: [
		CommonModule,
		DxTemplateModule,
		DxButtonModule,
		DxPopupModule,
		DxTreeViewModule,
		DxCheckBoxModule,
		DxTreeListModule,
	],
	styleUrls: ['./insert-merge-field-popup.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None,
})
export class InsertMergeFieldPopupComponent implements OnInit {
	@ViewChild('treeView') private _treeView: DxTreeViewComponent;

	selected: string[] = [];
	dataSource: Array<IMergeFieldItem> = [];
	visibility: boolean = false;
	searchValue: string = '';

	@Input() set fields(fields: IMergeField) {
		this.dataSource = this._mapMergeField(fields);
	}

	@Output() mergeField: EventEmitter<string[]> = new EventEmitter();

	constructor(
		@Inject(DOCUMENT) private document: Document,
		private _cdr: ChangeDetectorRef,
		private _editorCoreService: EditorCoreService
	) {}

	ngOnInit(): void {
		this._editorCoreService.onSelectMergeField$.subscribe(() => {
			this.visibility = true;
			this._cdr.detectChanges();
		});
	}

	initialized() {
		this.focusSearchField();
	}

	selectItem(event: Record<'itemData', IMergeFieldItem>) {
		event.itemData.parentID && this.selected.push(event.itemData.id);
	}

	applySelected() {
		if (this.selected.length) {
			this.mergeField.emit(this.selected.reverse());
			this.close();
		}
	}

	treeViewItemClicked(event) {
		if (event.itemData.parentID) {
			if (event.itemData.selected) {
				event.component.unselectItem(event.itemData);
			} else {
				event.component.selectItem(event.itemData);
			}
		}
	}

	treeViewItemRendered(event) {
		if (!event.itemData.parentID) {
			let parentElem: HTMLElement = event.itemElement.parentNode;
			parentElem.classList.add('parent-node-item');
		}
	}

	treeViewSelectionChanged(e) {
		this.syncSelection(e.component);
	}

	treeViewContentReady(e) {
		this.syncSelection(e.component);
	}

	syncSelection(treeView) {
		const selectedItems: string[] = treeView
			.getSelectedNodes()
			.map((node) => node.itemData)
			.filter((item) => item.parentID)
			.map((item) => item.id);

		let current = this.selected.filter((i) => selectedItems.includes(i));

		selectedItems.forEach((item) => {
			if (!current.includes(item)) {
				current.push(item);
			}
		});
		this.selected = current;
	}

	focusSearchField() {
		let selector = '.dx-treeview-search .dx-texteditor-input';
		let searchInput: HTMLInputElement = this.document.querySelector(selector);
		if (searchInput) {
			searchInput.focus();
		}
	}

	close() {
		this.visibility = false;
		this.afterClosed();
	}

	afterClosed() {
		this.selected = [];
		this.searchValue = '';
		this._treeView.instance.unselectAll();
		this._treeView.instance.collapseAll();
	}

	private _mapMergeField(mergeFields: IMergeField) {
		return Object.keys(mergeFields).reduce((acc, item) => {
			let slices = item.split('.');
			if (!acc.length || acc[acc.length - 1].parentID !== slices[0]) {
				acc.push({
					id: slices[0],
					parentID: null,
					displayName: slices[0],
				});
			}
			acc.push({
				id: item,
				parentID: slices[0],
				// @ts-ignore
				displayName: slices.slice(1).join(' ').replaceAll('_', ' '),
			});
			return acc;
		}, [] as Array<IMergeFieldItem>);
	}
}
