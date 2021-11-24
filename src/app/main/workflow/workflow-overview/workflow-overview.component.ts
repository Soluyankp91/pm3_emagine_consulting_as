import { Component, Input, OnInit } from '@angular/core';
import { WorkflowDataService } from '../workflow-data.service';
import { WorkflowSteps } from '../workflow.model';

@Component({
    selector: 'app-workflow-overview',
    templateUrl: './workflow-overview.component.html',
    styleUrls: ['./workflow-overview.component.scss']
})
export class WorkflowOverviewComponent implements OnInit {
    @Input() workflowId: string;
    finished = true;
    inPorgress = true;
    notStarted = true;
    constructor(
        public _workflowDataService: WorkflowDataService
    ) { }

    ngOnInit(): void {
    }

}
