import { Component, Input, OnInit } from '@angular/core';
import { WorkflowDataService } from '../workflow-data.service';
import { WorkflowStepList, WorkflowSteps } from '../workflow.model';

@Component({
    selector: 'app-primary-workflow',
    templateUrl: './primary-workflow.component.html',
    styleUrls: ['./primary-workflow.component.scss']
})
export class PrimaryWorkflowComponent implements OnInit {
    @Input() workflowId: string;
    selectedStep: string;

    // workflowSteps = [{id: 1, name: 'Sales'}, {id: 2, name: 'Contracts'}, {id: 3, name: 'Accounts'}];
    workflowSteps = WorkflowStepList;
    constructor(
        public _workflowDatService: WorkflowDataService
    ) { }

    ngOnInit(): void {
        console.log('s');

        this.selectedStep = 'Sales';
    }

    changeStepSelection(stepName: string, stepId: any) {
        this.selectedStep = stepName;
        this._workflowDatService.workflowProgress.currentlyActiveStep = stepId * 1;
    }

}
