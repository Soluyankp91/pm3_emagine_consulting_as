import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { WorkflowDataService } from '../workflow-data.service';
import { WorkflowSteps } from '../workflow.model';
import { ExtendWorkflowProcessDto, ProcessParentItemDto, ProcessSubItemDto, StartWorkflowProcessDto } from './workflow-overview.model';

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
    componentInitalized = false;

    workflowProcesses: ProcessParentItemDto[] = [];

    private _unsubscribe = new Subject();
    constructor(
        public _workflowDataService: WorkflowDataService,
        private activatedRoute: ActivatedRoute
    ) { }

    ngOnInit(): void {
        this.activatedRoute.paramMap.pipe(
            takeUntil(this._unsubscribe)
        ).subscribe(params => {
            this.workflowId = params.get('id')!;
        });
        this.componentInitalized = true;
        this.initializeProcesses();
    }

    ngOnDestroy(): void {
        this._unsubscribe.next();
        this._unsubscribe.complete();
    }

    initializeProcesses() {
        this.workflowProcesses.unshift(StartWorkflowProcessDto);
        this.workflowProcesses.unshift(ExtendWorkflowProcessDto);
    }

    displayStepAction(process: ProcessSubItemDto) {
        if (process.isCompleted) {
            return 'Step complete';
        } else if (process.isInProgress) {
            return 'Continue setup';
        } else if (process.canStartSetup) {
            return 'Start setup';
        } else {
            return 'Step incomplete'
        }
    }

    displayStepActionTooltip(process: ProcessSubItemDto) {
        if (process.isCompleted) {
            return 'Finished';
        } else if (process.isInProgress) {
            return 'In progress';
        } else if (process.canStartSetup) {
            return 'Not yet started';
        } else {
            return 'Not yet started'
        }
    }
}
