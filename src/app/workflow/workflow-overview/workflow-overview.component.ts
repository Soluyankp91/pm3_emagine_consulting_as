import { Component, Injector, Input, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GanttDate, GanttGroup, GanttItem, GanttViewOptions, GanttViewType, NgxGanttComponent } from '@worktile/gantt';
import { getUnixTime } from 'date-fns';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppComponentBase } from 'src/shared/app-component-base';
import { GanttRowItem, StepDto, WorkflowHistoryDto, WorkflowProcessDto, WorkflowProcessType, WorkflowServiceProxy, WorkflowStepStatus } from 'src/shared/service-proxies/service-proxies';
import { WorkflowDataService } from '../workflow-data.service';
import { ExtendWorkflowProcessDto, OverviewData, ProcessParentItemDto, ProcessSubItemDto, StartWorkflowProcessDto } from './workflow-overview.model';

@Component({
    selector: 'app-workflow-overview',
    templateUrl: './workflow-overview.component.html',
    styleUrls: ['./workflow-overview.component.scss']
})
export class WorkflowOverviewComponent extends AppComponentBase implements OnInit {
    @ViewChild('gantt') ganttComponent: NgxGanttComponent;

    @Input() workflowId: string;
    // finished = true;
    // inPorgress = true;
    // notStarted = true;
    componentInitalized = false;
    workflowStepStatus = WorkflowStepStatus;

    // workflowProcesses: ProcessParentItemDto[] = [];
    workflowProcesses: WorkflowProcessDto[];
    workflowProcessType = WorkflowProcessType;

    workflowHistory: WorkflowHistoryDto[];

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

    overviewItems: GanttItem[] = [];
    overviewGroups: GanttGroup<any>[] = [];
    viewType = GanttViewType.month;

    startDate = new Date();
    startDateOfChart: number;

    viewOptions = {
        mergeIntervalDays: 0,
        dateFormat: {
            month: 'MM yyyy'
        },
        cellWidth: 115,
        start: new GanttDate(getUnixTime(new Date(this.startDate.setDate(this.startDate.getDate() - 7)))),
        end: new GanttDate(),
        min: new GanttDate(),
        max: new GanttDate()
    }
    private _unsubscribe = new Subject();
    constructor(
        injector: Injector,
        public _workflowDataService: WorkflowDataService,
        private _workflowService: WorkflowServiceProxy,
        private activatedRoute: ActivatedRoute
    ) {
        super(injector);
     }

    ngOnInit(): void {
        this.activatedRoute.paramMap.pipe(
            takeUntil(this._unsubscribe)
        ).subscribe(params => {
            this.workflowId = params.get('id')!;
        });
        this.componentInitalized = true;
        // this.initializeProcesses();
        this.getOverviewData();
        this.getWorkflowHistory();
    }

    ngOnDestroy(): void {
        this._unsubscribe.next();
        this._unsubscribe.complete();
    }

    initializeProcesses() {
        // this.workflowProcesses.unshift(StartWorkflowProcessDto);
        // this.workflowProcesses.unshift(ExtendWorkflowProcessDto);
    }

    displayStepAction(process: StepDto) {
        if (process?.status === WorkflowStepStatus.Completed) {
            return 'Step complete';
        } else if (process?.status === WorkflowStepStatus.Pending) {
            return 'Continue setup';
        } else if (process?.status === WorkflowStepStatus.Upcoming) {
            return 'Start setup';
        } else {
            return 'Step incomplete'
        }
    }

    displayStepActionTooltip(process: StepDto) {
        switch (process?.status) {
            case WorkflowStepStatus.Completed:
                return 'Finished';
            case WorkflowStepStatus.Pending:
                return 'In progress';
            case WorkflowStepStatus.Upcoming:
                return 'Not yet started';
            default:
                return 'Not yet started';
        }
        // if (process.status) {
        //     return 'Finished';
        // } else if (process.isInProgress) {
        //     return 'In progress';
        // } else if (process.canStartSetup) {
        //     return 'Not yet started';
        // } else {
        //     return 'Not yet started'
        // }
    }

    getOverviewData() {
        this.overviewGroups = [];
        this.overviewItems = [];
        this._workflowService.overview(this.workflowId).subscribe(result => {
            this.workflowProcesses = result.incompleteWorkflowProcesses!;
            console.log(this.workflowProcesses);

            let groups: GanttGroup<any>[] = [];
            let items: GanttItem[] = [];

            // let oldestDateArray = result.clientGanntRows!.reduce((r, o) => o.lastClientPeriodEndDate! > r.lastClientPeriodEndDate! ? o : r);

            // let endDate = new Date();
            // if (oldestDateArray.lastClientPeriodEndDate === undefined || (oldestDateArray.lastClientPeriodEndDate.toDate().getTime() < this.formatDate(date).getTime())) {
            //     endDate = this.formatDate(date);
            // }
            let groupIndex = 0;
            // if (result.clientGanntRows)
            result.clientGanntRows!.map((x, index) => {
                groups.push({
                    id: (++groupIndex).toString(),
                    title: x.name!
                })

                items = [...items, ...this.formatItems(x.ganttRowItems?.length!, x.ganttRowItems!, groups[index].id, true)];
                console.log('clientGanntRows', items)
            });

            result.consultantGanntRows!.map((x, index) => {
                index = groupIndex;
                groups.push({
                    id: (++groupIndex).toString(),
                    title: x.name!,
                    origin: x.consultantExternalId
                })

                items = [...items, ...this.formatItems(x.ganttRowItems?.length!, x.ganttRowItems!, groups[index].id, false)];
                console.log('consultantGanntRows', items)

            });

            this.overviewGroups = groups;
            this.overviewItems = items;
            console.log('overviewItems', this.overviewItems)

        })
    }

    formatItems(length: number, parent: GanttRowItem[], group: string, isClient: boolean) {
        const items = [];
        for (let i = 0; i < length; i++) {
            items.push({
                id: `${parent![i]?.id || group}`,
                title: `${WorkflowProcessType[parent![i]?.processTypeId!]}`,
                start: getUnixTime(parent![i]?.startDate?.toDate()!),
                end: parent![i]?.endDate !== undefined ? getUnixTime(parent![i]?.endDate!.toDate()!) : getUnixTime(this.viewOptions.end!.value),
                group_id: group,
                color: isClient ? 'rgba(23, 162, 151, 1)' : 'rgba(106, 71, 184, 1)'
            });
        }
        return items;
    }

    getWorkflowHistory() {
        this._workflowService.history(this.workflowId).subscribe(result => {
            if (result.items) {
                this.workflowHistory = result.items!;
            }
        })
    }
}
