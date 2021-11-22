import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-workflow-overview',
    templateUrl: './workflow-overview.component.html',
    styleUrls: ['./workflow-overview.component.scss']
})
export class WorkflowOverviewComponent implements OnInit {

    finished = true;
    inPorgress = true;
    notStarted = true;
    constructor() { }

    ngOnInit(): void {
    }

}
