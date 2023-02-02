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
import { DxButtonModule, DxPopupModule, DxTemplateModule, DxTreeViewComponent, DxTreeViewModule } from 'devextreme-angular';
import { IMergeField } from '../../_api/merge-fields.service';
import { CommonModule } from '@angular/common';

interface IMergeFieldItem {
	id: string;
	parentID: string | null;
	displayName: string;
}

@Component({
	standalone: true,
	selector: 'app-insert-merge-field-popup',
	templateUrl: './insert-merge-field-popup.component.html',
	imports: [CommonModule, DxTemplateModule, DxButtonModule, DxPopupModule, DxTreeViewModule],
	styleUrls: ['./insert-merge-field-popup.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None,
})
export class InsertMergeFieldPopupComponent implements OnInit {
	@ViewChild('treeView') private treeView: DxTreeViewComponent;

	selected: string | null = null;
	dataSource: Array<IMergeFieldItem> = [];
	visibility: boolean = false;

	@Input() set fields(fields: IMergeField) {
		this.dataSource = this.mapMergeField(fields);
	}

	@Output() mergeField: EventEmitter<string> = new EventEmitter();

	constructor(private _chd: ChangeDetectorRef) {}

	ngOnInit(): void {}

	showPopup() {
		this.visibility = true;
		this._chd.detectChanges();
	}

	selectItem(event: Record<'itemData', IMergeFieldItem>) {
		this.selected = event.itemData.parentID ? event.itemData.id : null;
	}

	applySelected() {
		if (this.selected) {
			this.mergeField.emit(this.selected);
			this.close();
		}
	}

	close() {
		this.visibility = false;
		this.afterClosed();
	}

	afterClosed() {
		this.selected = null;
		this.treeView.instance.collapseAll();
	}

	private mapMergeField(mergeFields: IMergeField) {
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
