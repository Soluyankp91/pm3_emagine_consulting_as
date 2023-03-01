import { Component, Input, Output, EventEmitter, SimpleChanges, OnChanges, ViewEncapsulation } from '@angular/core';
import { AgreementPreviewService } from '../../services/agreemen-preview.service';

@Component({
	selector: 'app-agreement-preview',
	templateUrl: './agreement-preview.component.html',
	styleUrls: ['./agreement-preview.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [AgreementPreviewService],
})
export class AgreementPreviewComponent implements OnChanges {
	@Input() currentId: number | null;
	@Output() currentIdChange = new EventEmitter();
	constructor(private readonly _agreementPreviewService: AgreementPreviewService) {}

	ngOnChanges(changes: SimpleChanges): void {
		let currentIdChange = changes['currentId'];
		if (currentIdChange) {
			this._agreementPreviewService.updateCurrentRowId(currentIdChange.currentValue);
		}
	}

	closePanel() {
		this.currentIdChange.emit(null);
	}
}
