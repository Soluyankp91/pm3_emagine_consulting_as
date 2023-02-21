import { Component, OnChanges, Input, Output, EventEmitter, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { PreviewService } from 'src/app/contracts/master-templates/listAndPreviews/services/preview.service';

@Component({
	selector: 'app-client-template-preview',
	templateUrl: './client-template-preview.component.html',
	styleUrls: ['./client-template-preview.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [PreviewService],
})
export class ClientTemplatePreviewComponent implements OnChanges {
	@Input() currentId: number | null;
	@Output() currentIdChange = new EventEmitter();
	constructor(private readonly _previewService: PreviewService) {}

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
