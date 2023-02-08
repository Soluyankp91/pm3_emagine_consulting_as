import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DxButtonModule, DxPopupModule, DxTemplateModule } from 'devextreme-angular';

@Component({
	standalone: true,
	selector: 'app-compare-select-document-popup',
	templateUrl: './compare-select-document-popup.component.html',
	styleUrls: ['./compare-select-document-popup.component.scss'],
	imports: [CommonModule, DxTemplateModule, DxButtonModule, DxPopupModule],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompareSelectDocumentPopupComponent implements OnInit {
	visibility: boolean = false;
	selected: string | null = null;
	dataSource: Array<any> = [];

	constructor(private _chd: ChangeDetectorRef) {}

	ngOnInit(): void {}

	show() {
		this.visibility = true;
		this._chd.detectChanges();
	}

	close() {
		this.visibility = false;
		this.afterClosed();
	}

	afterClosed() {}

	selectItem(event: Record<'itemData', any>) {
		this.selected = event.itemData.parentID ? event.itemData.id : null;
	}

	applySelected() {
		if (this.selected) {
			// this.mergeField.emit(this.selected);
			this.close();
		}
	}
}
