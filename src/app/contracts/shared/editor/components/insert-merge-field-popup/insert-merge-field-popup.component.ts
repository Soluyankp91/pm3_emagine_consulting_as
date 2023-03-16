import { CommonModule } from '@angular/common';
import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	EventEmitter,
	Input,
	OnInit,
	Output,
	ViewChild,
	ViewEncapsulation,
} from '@angular/core';
import { DxButtonModule, DxCheckBoxModule, DxPopupModule, DxTemplateModule, DxTreeViewComponent, DxTreeViewModule } from 'devextreme-angular';
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
	imports: [CommonModule, DxTemplateModule, DxButtonModule, DxPopupModule, DxTreeViewModule, DxCheckBoxModule],
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

	constructor(private _cdr: ChangeDetectorRef, private _editorCoreService: EditorCoreService) {}

	ngOnInit(): void {
		this._editorCoreService.onSelectMergeField$.subscribe(() => {
			this.visibility = true;
			this._cdr.detectChanges();
		});
	}

	selectItem(event: Record<'itemData', IMergeFieldItem>) {
		 event.itemData.parentID && this.selected.push(event.itemData.id);
	}

	applySelected() {
		if (this.selected.length) {
			this.mergeField.emit(this.selected);
			this.close();
		}
	}

	treeViewSelectionChanged(e) {
		this.syncSelection(e.component);
	}
	
	treeViewContentReady(e) {
		this.syncSelection(e.component);
	}

	syncSelection(treeView) {
		const selectedItems = treeView.getSelectedNodes()
			.map((node) => node.itemData).filter(item => item.parentID)
			.map(item => item.id);

		this.selected = selectedItems;
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
				displayName: slices.slice(1).join(' '),
			});
			return acc;
		}, [] as Array<IMergeFieldItem>);
	}
}
