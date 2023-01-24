import { Overlay } from '@angular/cdk/overlay';
import { Component, Injector, Input, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { GanttDate, GanttGroup, GanttItem, GanttViewType, NgxGanttComponent } from '@worktile/gantt';
import { getUnixTime } from 'date-fns';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { environment } from 'src/environments/environment';
import { AppComponentBase, NotifySeverity } from 'src/shared/app-component-base';
import { AppConsts } from 'src/shared/AppConsts';
import { MediumDialogConfig } from 'src/shared/dialog.configs';
import { AvailableConsultantDto, ChangeConsultantPeriodDto, ClientPeriodDto, ClientPeriodServiceProxy, ConsultantGanttRow, ConsultantPeriodServiceProxy, ExtendClientPeriodDto, ExtendConsultantPeriodDto, GanttRowItem, StepDto, WorkflowDocumentQueryDto, WorkflowDocumentServiceProxy, WorkflowHistoryDto, WorkflowProcessDto, WorkflowProcessType, WorkflowServiceProxy, WorkflowStepStatus } from 'src/shared/service-proxies/service-proxies';
import { WorkflowActionsDialogComponent } from '../workflow-actions-dialog/workflow-actions-dialog.component';
import { WorkflowConsultantActionsDialogComponent } from '../workflow-consultant-actions-dialog/workflow-consultant-actions-dialog.component';
import { WorkflowDataService } from '../workflow-data.service';
import { ConsultantDiallogAction } from '../workflow-sales/workflow-sales.model';
import { WorkflowDiallogAction, WorkflowProgressStatus } from '../workflow.model';

@Component({
    selector: 'app-workflow-overview',
    templateUrl: './workflow-overview.component.html',
    styleUrls: ['./workflow-overview.component.scss']
})
export class WorkflowOverviewComponent extends AppComponentBase implements OnInit, OnDestroy {
    @ViewChild('gantt') ganttComponent: NgxGanttComponent;

    @Input() workflowId: string;
    @Input() periodId: string | undefined;
    @Input() clientPeriods: ClientPeriodDto[] | undefined;

    documentsPeriod = new UntypedFormControl(null);

    componentInitalized = false;
    workflowStepStatus = WorkflowStepStatus;

    workflowProcesses: WorkflowProcessDto[] = [];
    workflowProcessType = WorkflowProcessType;
    workflowHistory: WorkflowHistoryDto[] = [];

    overviewDocuments: WorkflowDocumentQueryDto[] = [];

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
    individualConsultantActionsAvailable: boolean;
    private _unsubscribe = new Subject();
    constructor(
        injector: Injector,
        public _workflowDataService: WorkflowDataService,
        private _workflowService: WorkflowServiceProxy,
        private activatedRoute: ActivatedRoute,
        private overlay: Overlay,
        private dialog: MatDialog,
        private _consultantPeriodSerivce: ConsultantPeriodServiceProxy,
        private _clientPeriodService: ClientPeriodServiceProxy,
        private _workflowDocumentsService: WorkflowDocumentServiceProxy
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
        this.individualConsultantActionsAvailable = environment.dev;
        this.getOverviewData();
        this.getWorkflowHistory();
        this._getDocuments();

        this._workflowDataService.workflowOverviewUpdated
            .pipe(takeUntil(this._unsubscribe))
            .subscribe((value: boolean) => {
                this.getOverviewData();
            });
    }

    ngOnDestroy(): void {
        this._unsubscribe.next();
        this._unsubscribe.complete();
    }

    private _getDocuments() {
        this._workflowDocumentsService.overviewAll(this.workflowId, this.documentsPeriod.value)
            .subscribe(result => {
                this.overviewDocuments = result;
            });
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

            let oldestDateClientArray = result.clientGanttRows?.map(x => {
                if (x.ganttRowItems?.length) {
                    if (x.ganttRowItems?.length > 1) {
                        return x.ganttRowItems?.reduce((r, o) => o.endDate! > r.endDate! ? o : r);
                    } else {
                        return x.ganttRowItems[0];
                    }
                }
            });

            let startOfClientArray = result.clientGanttRows?.map(x => {
                if (x.ganttRowItems?.length) {
                    if (x.ganttRowItems?.length > 1) {
                        return x.ganttRowItems?.reduce((r, o) => o.startDate! < r.startDate! ? o! : r!);
                    } else {
                        return x.ganttRowItems[0];
                    }
                }
            });

            let endDate = new Date();
            if (oldestDateClientArray![0]!.endDate === undefined || oldestDateClientArray![0]!.endDate.toDate().getTime() < this.formatDate(startOfClientArray![0]?.startDate!.toDate()!).getTime()) {
                endDate = this.formatDate(startOfClientArray![0]?.startDate!.toDate()!);
            }

            this.viewOptions.start = new GanttDate(getUnixTime(new Date(startOfClientArray![0]?.startDate!.toDate()!)));
            this.viewOptions.min = new GanttDate(getUnixTime(new Date(startOfClientArray![0]?.startDate!.toDate()!)));
            this.viewOptions.end = endDate.getTime() !== new Date().getTime() ? new GanttDate(getUnixTime(endDate)) : new GanttDate(getUnixTime(new Date(oldestDateClientArray![0]?.endDate?.toDate()!)));
            this.viewOptions.max = endDate.getTime() !== new Date().getTime() ? new GanttDate(getUnixTime(endDate)) : new GanttDate(getUnixTime(new Date(oldestDateClientArray![0]?.endDate?.toDate()!)));

            let groupIndex = 0;
            result.clientGanttRows!.map((x, index) => {
                groups.push({
                    id: (++groupIndex).toString(),
                    title: x.name!
                })

                items = [...items, ...this.formatItems(x.ganttRowItems?.length!, x.ganttRowItems!, groups[index].id)];
            });

            result.consultantGanttRows!.map((x, index) => {
                index = groupIndex;
                groups.push({
                    id: (++groupIndex).toString(),
                    title: x.name!,
                    origin: x
                })

                items = [...items, ...this.formatItems(x.ganttRowItems?.length!, x.ganttRowItems!, groups[index].id)];
            });

            this.overviewGroups = groups;
            this.overviewItems = items;

        })
    }

    formatDate(date: any) {
        var d = new Date(date),
            month = (d.getMonth() + 3),
            day = d.getDate() - d.getDate(),
            year = d.getFullYear();

        return new Date(year, month, day);
    }

    formatItems(length: number, parent: GanttRowItem[], group: string) {
        const items = [];
        for (let i = 0; i < length; i++) {
            items.push({
                id: `${parent![i]?.id || group}`,
                title: `${WorkflowProcessType[parent![i]?.processTypeId!]}`,
                start: getUnixTime(parent![i]?.startDate?.toDate()!),
                end: (parent![i]?.endDate !== undefined && parent![i]?.endDate !== null) ? getUnixTime(parent![i]?.endDate!.toDate()!) : getUnixTime(this.viewOptions.end!.value),
                group_id: group,
                color: this.getColorForConsultantsOverview(parent[i].processTypeId),
                origin: parent[i]
            });
        }
        return items;
    }

    getColorForConsultantsOverview(item: WorkflowProcessType | undefined) {
        switch (item) {
            case WorkflowProcessType.StartClientPeriod:
            case WorkflowProcessType.ChangeClientPeriod:
            case WorkflowProcessType.ExtendClientPeriod:
                return 'rgba(23, 162, 151, 1)';
            case WorkflowProcessType.StartConsultantPeriod:
            case WorkflowProcessType.ChangeConsultantPeriod:
            case WorkflowProcessType.ExtendConsultantPeriod:
                return 'rgba(106, 71, 184, 1)';
            case WorkflowProcessType.TerminateConsultant:
            case WorkflowProcessType.TerminateWorkflow:
                return 'rgba(255, 122, 120, 1)';
            default:
                break;
        }
    }
    getWorkflowHistory() {
        this._workflowService.history(this.workflowId, this.historyPageNumber, this.historyDeafultPageSize).subscribe(result => {
            if (result.items) {
                this.workflowHistory = result.items;
                this.historyTotalCount = result.totalCount;
            }
        })
    }

    terminateConsultant(consultantInfo: ConsultantGanttRow) {
        const scrollStrategy = this.overlay.scrollStrategies.reposition();
        MediumDialogConfig.scrollStrategy = scrollStrategy;
        MediumDialogConfig.data = {
            confirmationMessageTitle: `Terminate consultant`,
            confirmationMessage: `Are you sure you want to terminate consultant ${consultantInfo?.name}?`,
            rejectButtonText: 'Cancel',
            confirmButtonText: 'Terminate',
            isNegative: true
        }
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, MediumDialogConfig);
        dialogRef.componentInstance.onConfirmed.subscribe(() => {
            this.terminateConsultantStart(1); //FIXME: add real id when BE will be fixed
        });
    }

    terminateConsultantStart(index: number) {
        this._workflowService.terminationConsultantStart(this.workflowId!, index)
            .subscribe(() => {
                this._workflowDataService.workflowSideSectionAdded.emit(true);
            });
    }

    changeConsultantData(consultantInfo: ConsultantGanttRow) {
        const scrollStrategy = this.overlay.scrollStrategies.reposition();
        MediumDialogConfig.scrollStrategy = scrollStrategy;
        MediumDialogConfig.data = {
            dialogType: ConsultantDiallogAction.Change,
            consultantData: {externalId: consultantInfo.consultantExternalId, name: consultantInfo.name},
            dialogTitle: `Change consultant`,
            rejectButtonText: 'Cancel',
            confirmButtonText: 'Create',
            isNegative: false
        }
        const dialogRef = this.dialog.open(WorkflowConsultantActionsDialogComponent, MediumDialogConfig);
        dialogRef.componentInstance.onConfirmed.subscribe((result) => {
            let input = new ChangeConsultantPeriodDto();
            input.cutoverDate = result.newCutoverDate;
            input.newLegalContractRequired = result.newLegalContractRequired;
            this._consultantPeriodSerivce.change(consultantInfo?.ganttRowItems![0].id!, input)
                .subscribe(() => {
                    this._workflowDataService.workflowSideSectionAdded.emit(true);
                });
        });
    }

    extendConsultant(consultantInfo: ConsultantGanttRow) {
        const scrollStrategy = this.overlay.scrollStrategies.reposition();
        MediumDialogConfig.scrollStrategy = scrollStrategy;
        MediumDialogConfig.data = {
            dialogType: ConsultantDiallogAction.Extend,
            consultantData: {externalId: consultantInfo.consultantExternalId, name: consultantInfo.name},
            dialogTitle: `Extend consultant`,
            rejectButtonText: 'Cancel',
            confirmButtonText: 'Create',
            isNegative: false
        }
        const dialogRef = this.dialog.open(WorkflowConsultantActionsDialogComponent, MediumDialogConfig);
        dialogRef.componentInstance.onConfirmed.subscribe((result) => {
            let input = new ExtendConsultantPeriodDto();
            input.startDate = result.startDate;
            input.endDate = result.endDate;
            input.noEndDate = result.noEndDate;
            this._consultantPeriodSerivce.extend(consultantInfo?.ganttRowItems![0].id!, input)
                .subscribe(() => {
                    this._workflowDataService.workflowSideSectionAdded.emit(true);
                });
        });
    }

    historyPageChanged(event?: any): void {
        this.historyPageNumber = event.pageIndex + 1;
        this.historyDeafultPageSize = event.pageSize;
        this.getWorkflowHistory();
    }

    getAvailableConsultantForChangeOrExtend() {
        if (!this._workflowDataService.getWorkflowProgress.currentlyActivePeriodId) {
            let newStatus = new WorkflowProgressStatus();
            newStatus.currentlyActivePeriodId = this.periodId;
            this._workflowDataService.updateWorkflowProgressStatus(newStatus);
        }

        this.showMainSpinner();
        this._clientPeriodService.availableConsultants(this._workflowDataService.getWorkflowProgress.currentlyActivePeriodId!)
            .pipe(finalize(() => this.hideMainSpinner()))
            .subscribe(result => {
                if (result.length) {
                    this.addExtension(result);
                } else {
                    this.showNotify(NotifySeverity.Error, 'There are no available consultants for this action', 'Ok');
                }
            });
    }

    addExtension(availableConsultants: AvailableConsultantDto[]) {
        const scrollStrategy = this.overlay.scrollStrategies.reposition();
        MediumDialogConfig.scrollStrategy = scrollStrategy;
        MediumDialogConfig.data = {
            dialogType: WorkflowDiallogAction.Extend,
            dialogTitle: 'Extend Workflow',
            rejectButtonText: 'Cancel',
            confirmButtonText: 'Create',
            isNegative: false,
            consultantData: availableConsultants
        }
        const dialogRef = this.dialog.open(WorkflowActionsDialogComponent, MediumDialogConfig);
        dialogRef.componentInstance.onConfirmed.subscribe((result: ExtendClientPeriodDto) => {
            if (result) {
                this.showMainSpinner();
                this._clientPeriodService.clientExtend(this._workflowDataService.getWorkflowProgress.currentlyActivePeriodId!, result)
                    .pipe(finalize(() => this.hideMainSpinner()))
                    .subscribe(() => {
                        this._workflowDataService.workflowTopSectionUpdated.emit(true);
                    });
            }
        });
    }

    stepsTrackBy(index: number, step: StepDto) {
        return step;
    }
}
