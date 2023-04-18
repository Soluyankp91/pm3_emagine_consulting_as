import { Component, Input, ChangeDetectionStrategy, Injector } from '@angular/core';
import { WorkflowSummary, WorkflowLabelMap } from 'src/app/contracts/agreements/template-editor/settings/settings.interfaces';
import { AppComponentBase } from 'src/shared/app-component-base';

@Component({
	selector: 'app-workflow-info-display-panel',
	templateUrl: './workflow-info-display-panel.component.html',
	styleUrls: ['./workflow-info-display-panel.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkflowInfoDisplayPanelComponent extends AppComponentBase {
	@Input() workflowSummary: WorkflowSummary;

	labelMap = WorkflowLabelMap;

	constructor(private readonly _injector: Injector) {
		super(_injector);
	}
}
