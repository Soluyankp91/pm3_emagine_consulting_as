import { AfterViewInit, ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { WorkflowDataService } from '../workflow-data.service';
import { WorkflowSalesComponent } from '../workflow-sales/workflow-sales.component';
import { WorkflowStepList, WorkflowSteps } from '../workflow.model';

@Component({
    selector: 'app-primary-workflow',
    templateUrl: './primary-workflow.component.html',
    styleUrls: ['./primary-workflow.component.scss']
})
export class PrimaryWorkflowComponent implements OnInit {
    @Input() workflowId: number;
    @ViewChild('workflowSales', {static: false}) workflowSales: WorkflowSalesComponent;
    selectedStep: string;

    // workflowSteps = [{id: 1, name: 'Sales'}, {id: 2, name: 'Contracts'}, {id: 3, name: 'Finance'}];
    workflowSteps = WorkflowStepList;
    constructor(
        public _workflowDataService: WorkflowDataService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        console.log('init PW');
        this.selectedStep = 'Sales';
        // this.selectedStep = 'Sales';
    }

    changeStepSelection(stepName: string, stepId: any) {
        this.selectedStep = stepName;
        this._workflowDataService.workflowProgress.currentlyActiveStep = stepId * 1;
    }

    saveSalesStep() {
        this.workflowSales.saveSalesStep();
    }

}
