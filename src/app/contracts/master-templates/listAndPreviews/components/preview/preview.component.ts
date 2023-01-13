import { Component, OnInit, ViewEncapsulation, Input, Output, OnChanges, SimpleChanges, EventEmitter } from '@angular/core';
import { PreviewService } from '../../services/preview.service';

@Component({
	selector: 'app-preview-tabs',
	templateUrl: './preview.component.html',
	styleUrls: ['./preview.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [PreviewService],
})
export class PreviewTabsComponent implements OnInit, OnChanges {
	@Input() currentId: number | null;
	@Output() currentIdChange = new EventEmitter();
	constructor(private readonly _previewService: PreviewService) {}

	ngOnInit(): void {}

	ngOnChanges(changes: SimpleChanges): void {
		let currentIdChange = changes['currentId'];
		if (currentIdChange) {
			this._previewService.updateCurrentRowId(currentIdChange.currentValue);
		}
	}

	closePanel() {
		this.currentIdChange.emit(null);
	}
}
