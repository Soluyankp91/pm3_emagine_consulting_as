import {
	Component,
	Input,
	Output,
	EventEmitter,
	ChangeDetectionStrategy,
	OnChanges,
	SimpleChanges,
} from '@angular/core';
import { AgreementTemplateService } from 'src/app/contracts/shared/editor/data-access';
import { AgreementAbstractService } from 'src/app/contracts/shared/editor/data-access/agreement-abstract.service';
import { PreviewService } from '../../services/preview.service';

@Component({
	selector: 'app-preview-tabs',
	templateUrl: './preview.component.html',
	styleUrls: ['./preview.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [PreviewService, {
		provide: AgreementAbstractService,
		useClass: AgreementTemplateService
	}],
})
export class PreviewTabsComponent implements OnChanges {
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
