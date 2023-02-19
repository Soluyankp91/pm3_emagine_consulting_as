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
import { IDocumentVersion } from '../../entities';
import { EditorCoreService } from '../../services';
import { AgreementTemplateDocumentFileVersionDto } from 'src/shared/service-proxies/service-proxies';

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

	@Input() dataSource: Array<AgreementTemplateDocumentFileVersionDto> = [];

	@Output() select: EventEmitter<number> = new EventEmitter();

	constructor(private _cdr: ChangeDetectorRef, private _editorCoreService: EditorCoreService) {}

	ngOnInit(): void {
		this._editorCoreService.onCompareVersion$.subscribe(() => {
			this.visibility = true;
			this._cdr.detectChanges();
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
