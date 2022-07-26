import { Overlay } from '@angular/cdk/overlay';
import { Component, Injector, Input, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { GanttDate, GanttGroup, GanttItem, GanttViewOptions, GanttViewType, NgxGanttComponent } from '@worktile/gantt';
import { getUnixTime } from 'date-fns';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { AppComponentBase } from 'src/shared/app-component-base';
import { AppConsts } from 'src/shared/AppConsts';
import { ChangeConsultantPeriodDto, ConsultantGanttRow, ConsultantPeriodServiceProxy, ExtendConsultantPeriodDto, GanttRowItem, StepDto, WorkflowHistoryDto, WorkflowProcessDto, WorkflowProcessType, WorkflowServiceProxy, WorkflowStepStatus } from 'src/shared/service-proxies/service-proxies';
import { WorkflowConsultantActionsDialogComponent } from '../workflow-consultant-actions-dialog/workflow-consultant-actions-dialog.component';
import { WorkflowDataService } from '../workflow-data.service';
import { ConsultantDiallogAction } from '../workflow-sales/workflow-sales.model';
import { ExtendWorkflowProcessDto, OverviewData, ProcessParentItemDto, ProcessSubItemDto, StartWorkflowProcessDto } from './workflow-overview.model';

@Component({
    selector: 'app-workflow-overview',
    templateUrl: './workflow-overview.component.html',
    styleUrls: ['./workflow-overview.component.scss']
})
export class WorkflowOverviewComponent extends AppComponentBase implements OnInit {
    @ViewChild('gantt') ganttComponent: NgxGanttComponent;

    @Input() workflowId: string;

    componentInitalized = false;
    workflowStepStatus = WorkflowStepStatus;

    workflowProcesses: WorkflowProcessDto[];
    workflowProcessType = WorkflowProcessType;
    workflowHistory: WorkflowHistoryDto[];

    // gant

    overviewItems: GanttItem[] = [];
    overviewGroups: GanttGroup<any>[] = [];
    viewType = GanttViewType.month;

    viewOptions = {
        mergeIntervalDays: 0,
        dateFormat: {
            month: 'MM yyyy'
        },
        cellWidth: 115,
        start: new GanttDate(),
        end: new GanttDate(),
        min: new GanttDate(),
        max: new GanttDate()
    }
    historyTotalCount: number | undefined = 0;
    historyDeafultPageSize = AppConsts.grid.defaultPageSize;
    historyPageNumber = 1;
    pageSizeOptions = [5, 10, 20, 50, 100];

    private _unsubscribe = new Subject();
    constructor(
        injector: Injector,
        public _workflowDataService: WorkflowDataService,
        private _workflowService: WorkflowServiceProxy,
        private activatedRoute: ActivatedRoute,
        private overlay: Overlay,
        private dialog: MatDialog,
        private _consultantPeriodSerivce: ConsultantPeriodServiceProxy,

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
        this.getOverviewData();
        this.getWorkflowHistory();
    }

    ngOnDestroy(): void {
        this._unsubscribe.next();
        this._unsubscribe.complete();
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
    }

    getOverviewData() {
        this.overviewGroups = [];
        this.overviewItems = [];
        this._workflowService.overview(this.workflowId).subscribe(result => {
            this.workflowProcesses = result.incompleteWorkflowProcesses!;

            let groups: GanttGroup<any>[] = [];
            let items: GanttItem[] = [];

            // let oldestDateArray = result.clientGanntRows!.reduce((r, o) => o.lastClientPeriodEndDate! > r.lastClientPeriodEndDate! ? o : r);

            // let endDate = new Date();
            // if (oldestDateArray.lastClientPeriodEndDate === undefined || (oldestDateArray.lastClientPeriodEndDate.toDate().getTime() < this.formatDate(date).getTime())) {
            //     endDate = this.formatDate(date);
            // }
            let groupIndex = 0;
            result.clientGanntRows!.map((x, index) => {
                groups.push({
                    id: (++groupIndex).toString(),
                    title: x.name!
                })

                items = [...items, ...this.formatItems(x.ganttRowItems?.length!, x.ganttRowItems!, groups[index].id, true)];
            });

            result.consultantGanntRows!.map((x, index) => {
                index = groupIndex;
                groups.push({
                    id: (++groupIndex).toString(),
                    title: x.name!,
                    origin: x
                })

                items = [...items, ...this.formatItems(x.ganttRowItems?.length!, x.ganttRowItems!, groups[index].id, false)];
            });

            this.overviewGroups = groups;
            this.overviewItems = items;

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
        this._workflowService.history(this.workflowId, this.historyPageNumber, this.historyDeafultPageSize).subscribe(result => {
            if (result.items) {
                this.workflowHistory = result.items!;
                this.historyTotalCount = result.totalCount;
            }
        })
    }

    terminateConsultant(consultantInfo: ConsultantGanttRow) {
        const scrollStrategy = this.overlay.scrollStrategies.reposition();
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            width: '450px',
            minHeight: '180px',
            height: 'auto',
            scrollStrategy,
            backdropClass: 'backdrop-modal--wrapper',
            autoFocus: false,
            panelClass: 'confirmation-modal',
            data: {
                confirmationMessageTitle: `Are you sure you want to terminate consultant ${consultantInfo?.name}?`,
                rejectButtonText: 'Cancel',
                confirmButtonText: 'Terminate',
                isNegative: true
            }
        });

        dialogRef.componentInstance.onConfirmed.subscribe(() => {
            this.terminateConsultantStart(1); //FIXME: add real id when BE will be fixed
        });

        dialogRef.componentInstance.onRejected.subscribe(() => {
            // nthng
        });
    }

    terminateConsultantStart(index: number) {
        this._workflowService.terminationConsultantStart(this.workflowId!, index)
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this._workflowDataService.workflowSideSectionAdded.emit(true);
            });
    }

    changeConsultantData(consultantInfo: ConsultantGanttRow) {
        const scrollStrategy = this.overlay.scrollStrategies.reposition();
        const dialogRef = this.dialog.open(WorkflowConsultantActionsDialogComponent, {
            minWidth: '450px',
            minHeight: '180px',
            height: 'auto',
            width: 'auto',
            scrollStrategy,
            backdropClass: 'backdrop-modal--wrapper',
            autoFocus: false,
            panelClass: 'confirmation-modal',
            data: {
                dialogType: ConsultantDiallogAction.Change,
                consultantData: {externalId: consultantInfo.consultantExternalId, name: consultantInfo.name},
                dialogTitle: `Change consultant`,
                rejectButtonText: 'Cancel',
                confirmButtonText: 'Create',
                isNegative: false
            }
        });

        dialogRef.componentInstance.onConfirmed.subscribe((result) => {
            let input = new ChangeConsultantPeriodDto();
            input.cutoverDate = result.newCutoverDate;
            input.newLegalContractRequired = result.newLegalContractRequired;
            this._consultantPeriodSerivce.change(consultantInfo?.ganttRowItems![0].id!, input)
                .pipe(finalize(() => {}))
                .subscribe(result => {
                    this._workflowDataService.workflowSideSectionAdded.emit(true);
                });
        });

        dialogRef.componentInstance.onRejected.subscribe(() => {
            // nthng
        });
    }

    extendConsultant(consultantInfo: ConsultantGanttRow) {
        const scrollStrategy = this.overlay.scrollStrategies.reposition();
        const dialogRef = this.dialog.open(WorkflowConsultantActionsDialogComponent, {
            minWidth: '450px',
            minHeight: '180px',
            height: 'auto',
            width: 'auto',
            scrollStrategy,
            backdropClass: 'backdrop-modal--wrapper',
            autoFocus: false,
            panelClass: 'confirmation-modal',
            data: {
                dialogType: ConsultantDiallogAction.Extend,
                consultantData: {externalId: consultantInfo.consultantExternalId, name: consultantInfo.name},
                dialogTitle: `Extend consultant`,
                rejectButtonText: 'Cancel',
                confirmButtonText: 'Create',
                isNegative: false
            }
        });

        dialogRef.componentInstance.onConfirmed.subscribe((result) => {
            let input = new ExtendConsultantPeriodDto();
            input.startDate = result.startDate;
            input.endDate = result.endDate;
            input.noEndDate = result.noEndDate;
            this._consultantPeriodSerivce.extend(consultantInfo?.ganttRowItems![0].id!, input)
                .pipe(finalize(() => {}))
                .subscribe(result => {
                    this._workflowDataService.workflowSideSectionAdded.emit(true);
                });
            this._workflowDataService.workflowSideSectionAdded.emit(true);
        });

        dialogRef.componentInstance.onRejected.subscribe(() => {
            // nthng
        });
    }

    historyPageChanged(event?: any): void {
        this.historyPageNumber = event.pageIndex + 1;
        this.historyDeafultPageSize = event.pageSize;
        this.getWorkflowHistory();
    }

}
