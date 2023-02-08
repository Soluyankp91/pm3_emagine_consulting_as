import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	EventEmitter,
	Input,
	OnInit,
	Output,
	ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DxButtonModule, DxListComponent, DxListModule, DxPopupModule, DxTemplateModule } from 'devextreme-angular';
import { IDocumentVersion } from '../../types';

@Component({
	standalone: true,
	selector: 'app-compare-select-version-popup',
	templateUrl: './compare-select-version-popup.component.html',
	styleUrls: ['./compare-select-version-popup.component.scss'],
	imports: [CommonModule, DxTemplateModule, DxButtonModule, DxPopupModule, DxListModule],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompareSelectVersionPopupComponent implements OnInit {
	visibility: boolean = false;
	selected: number | null = null;

	@ViewChild('listView') private _listView: DxListComponent;

	@Input() dataSource: Array<IDocumentVersion> = [];

	@Output() select: EventEmitter<number> = new EventEmitter();

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

	afterClosed() {
		this.selected = null;
		this._listView.instance.unselectAll();
	}

	selectItem(event: Record<'itemData', IDocumentVersion>) {
		this.selected = event.itemData.version || null;
	}

	applySelected() {
		if (this.selected) {
			this.select.emit(this.selected);
			this.close();
		}
	}
}
