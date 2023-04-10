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
import { DxButtonModule, DxListComponent, DxPopupModule, DxTemplateModule, DxListModule } from 'devextreme-angular';
import { IDocumentItem } from '../../entities';
import { EditorCoreService } from '../../services';

@Component({
	standalone: true,
	selector: 'app-compare-select-document-popup',
	templateUrl: './compare-select-document-popup.component.html',
	styleUrls: ['./compare-select-document-popup.component.scss'],
	imports: [CommonModule, DxTemplateModule, DxButtonModule, DxPopupModule, DxListModule],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompareSelectDocumentPopupComponent implements OnInit {
	visibility: boolean = false;
	selected: number | null = null;

	@ViewChild('listView') private _listView: DxListComponent;

	@Input() dataSource: Array<IDocumentItem> = [];

	@Output() select: EventEmitter<number> = new EventEmitter();

	constructor(private _chd: ChangeDetectorRef, private _editorCoreService: EditorCoreService) {}

	ngOnInit(): void {
		this._editorCoreService.onCompareTemplate$.subscribe(() => {
			this.visibility = true;
			this._chd.detectChanges();
		});
	}

	close() {
		this.visibility = false;
		this.afterClosed();
	}

	afterClosed() {
		this.selected = null;
		this._listView.instance.unselectAll();
	}

	selectItem(event: Record<'itemData', IDocumentItem>) {
		this.selected = event.itemData.agreementTemplateId || null;
	}

	applySelected() {
		if (this.selected) {
			this.select.emit(this.selected);
			this.close();
		}
	}
}
