import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { WorkflowDataService } from './workflow/workflow-data.service';

@Component({
    selector: 'app-main',
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

    constructor(
        public _workflowDataService: WorkflowDataService
    ) { }

    ngOnInit(): void {
    }

    openSourcingApp() {
        window.open(environment.sourcingUrl, '_blank');
    }

}
