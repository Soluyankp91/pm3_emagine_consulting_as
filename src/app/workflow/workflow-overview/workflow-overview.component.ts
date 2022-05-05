import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { GanttDate, GanttGroup, GanttItem, GanttItemType, GanttViewOptions, GanttViewType, NgxGanttComponent } from '@worktile/gantt';
import { getUnixTime } from 'date-fns';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { WorkflowDataService } from '../workflow-data.service';
import { WorkflowSteps } from '../workflow.model';
import { ExtendWorkflowProcessDto, OverviewData, ProcessParentItemDto, ProcessSubItemDto, StartWorkflowProcessDto } from './workflow-overview.model';

@Component({
    selector: 'app-workflow-overview',
    templateUrl: './workflow-overview.component.html',
    styleUrls: ['./workflow-overview.component.scss']
})
export class WorkflowOverviewComponent implements OnInit {
    @ViewChild('gantt') ganttComponent: NgxGanttComponent;

    @Input() workflowId: string;
    finished = true;
    inPorgress = true;
    notStarted = true;
    componentInitalized = false;

    workflowProcesses: ProcessParentItemDto[] = [];

    // gant

    items: GanttItem<OverviewData>[] = [
        {
            id: '000000',
            title: 'Nordea Bank Danmark A/S',
            start: getUnixTime(new Date(2022, 1, 1)),
            end: getUnixTime(new Date(2022, 11, 31)),
            color: 'rgb(23, 162, 151)',
            expandable: true,
            expanded: true,
            children:[
                {
                    id: '000006',
                    title: '',
                    start: getUnixTime(new Date(2022, 1, 3)),
                    end: getUnixTime(new Date(2022, 5, 29)),
                    color: 'rgb(106, 71, 184)',
                    origin: {
                        firstName: 'Robertsen',
                        lastName: 'Oscar'
                    },
                },
                {
                    id: '000007',
                    title: '',
                    start: getUnixTime(new Date(2022, 2, 3)),
                    end: getUnixTime(new Date(2022, 4, 29)),
                    color: 'rgb(106, 71, 184)',
                    origin: {
                        firstName: 'Frederick',
                        lastName: 'Rikke'
                    },
                }
            ]
        },
        {
            id: '000001',
            title: 'Leadership support',
            color: 'rgb(23, 162, 151)',
            origin: {
                firstName: 'Frederick',
                lastName: 'Rikke'
            },
            start: getUnixTime(new Date(2022, 1, 2)),
            end: getUnixTime(new Date(2022, 2, 2))},
    ];

    viewType = GanttViewType.month;

    viewOptions: GanttViewOptions = {
        min: new GanttDate(new Date(2022, 1, 1)),
        max: new GanttDate(new Date(2022, 3, 10)),
        dateFormat: {
            month: 'MM yyyy'
        },
        cellWidth: 115
    }

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
