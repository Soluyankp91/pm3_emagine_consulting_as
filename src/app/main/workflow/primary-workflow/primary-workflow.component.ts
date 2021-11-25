import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { WorkflowDataService } from '../workflow-data.service';
import { WorkflowSalesComponent } from '../workflow-sales/workflow-sales.component';
import { WorkflowStepList, WorkflowSteps } from '../workflow.model';

@Component({
    selector: 'app-primary-workflow',
    templateUrl: './primary-workflow.component.html',
    styleUrls: ['./primary-workflow.component.scss']
})
export class PrimaryWorkflowComponent implements OnInit {
    @Input() workflowId: string;
    @ViewChild('workflowSales', {static: false}) workflowSales: WorkflowSalesComponent;
    selectedStep: string;

    // workflowSteps = [{id: 1, name: 'Sales'}, {id: 2, name: 'Contracts'}, {id: 3, name: 'Finance'}];
    workflowSteps = WorkflowStepList;
    constructor(
        public _workflowDataService: WorkflowDataService
    ) { }

    ngOnInit(): void {
        console.log('s');

        this.selectedStep = 'Sales';
    }

    changeStepSelection(stepName: string, stepId: any) {
        this.selectedStep = stepName;
        this._workflowDataService.workflowProgress.currentlyActiveStep = stepId * 1;
    }

    saveSalesStep(workflowId: string) {
        this.workflowSales.saveSalesStep(workflowId);
    }

}
