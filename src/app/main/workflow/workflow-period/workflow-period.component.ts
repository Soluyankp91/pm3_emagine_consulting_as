import { Overlay } from '@angular/cdk/overlay';
import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { InternalLookupService } from 'src/app/shared/common/internal-lookup.service';
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { ManagerStatus } from 'src/app/shared/components/manager-search/manager-search.model';
import { WorkflowProcessDto, WorkflowProcessType, EnumEntityTypeDto, WorkflowServiceProxy, StepDto, EmployeeDto } from 'src/shared/service-proxies/service-proxies';
import { WorkflowDataService } from '../workflow-data.service';
import { WorkflowSteps } from '../workflow.model';

@Component({
    selector: 'app-workflow-period',
    templateUrl: './workflow-period.component.html',
    styleUrls: ['./workflow-period.component.scss']
})
export class WorkflowPeriodComponent implements OnInit {
    @Input() workflowId: string;
    @Input() clientPeriodId: string | undefined;

    sideMenuItems: WorkflowProcessDto[] = [];
    workflowProcessTypes = WorkflowProcessType;
    workflowPeriodStepTypes: EnumEntityTypeDto[] = [];
    selectedStep: StepDto;
    selectedAnchor: string;

    workflowSteps = WorkflowSteps;
    selectedStepEnum: number;
    selectedSideSection: number;
    sectionIndex = 0;

    // hardcoded status
    managerStatus = ManagerStatus;
    private _unsubscribe = new Subject();
    constructor(
        public _workflowDataService: WorkflowDataService,
        private _workflowService: WorkflowServiceProxy,
        private overlay: Overlay,
        private dialog: MatDialog,
        private _lookupService: InternalLookupService
    ) { }

    ngOnInit(): void {
        this.getPeriodStepTypes();
        this.getSideMenu();
        this._workflowDataService.workflowSideSectionAdded
            .pipe(takeUntil(this._unsubscribe))
            .subscribe((value: boolean) => {
                this.getSideMenu();
            });
    }

    selectedManager(event: any) {
        console.log(event);
    }

    getPeriodStepTypes() {
        this._lookupService.getWorkflowPeriodStepTypes()
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.workflowPeriodStepTypes = result;
                // this.changeSideSection(this.sideMenuItems[0] , 0);
            });
    }

    getSideMenu() {
        this._workflowService.clientPeriods(this.workflowId, this.clientPeriodId, true)
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.sideMenuItems = result?.clientPeriods![0].workflowProcesses!;
                console.log('PERIOD SIDE');
            });
    }

    mapIconFromMenuItem(typeId: number) {
        switch (typeId) {
            case WorkflowProcessType.StartClientPeriod:
            case WorkflowProcessType.StartConsultantPeriod:
                return 'workflowAdd'
            case WorkflowProcessType.ChangeClientPeriod:
            case WorkflowProcessType.ChangeConsultantPeriod:
                return 'workflowEdit'
            case WorkflowProcessType.ExtendClientPeriod:
                case WorkflowProcessType.ExtendConsultantPeriod:
                return 'workflowStartOrExtend'
            case WorkflowProcessType.TerminateConsultant:
            case WorkflowProcessType.TerminateWorkflow:
                return 'workflowTerminate'
        }
    }

    mapStepType(stepType: EnumEntityTypeDto) {
        switch (stepType.name) {
            case 'Sales':
                return WorkflowSteps.Sales;
            case 'Contract':
                return WorkflowSteps.Contracts;
            case 'Finance':
                return WorkflowSteps.Finance;
            case 'Sourcing':
                return WorkflowSteps.Sourcing;
        }
    }

    changeStepSelection(step: StepDto) {
        this.selectedStepEnum = this.mapStepType(this.workflowPeriodStepTypes?.find(x => x.id === step.typeId)!)!;
        this.selectedStep = step;
        this._workflowDataService.workflowProgress.currentlyActiveStep = step.typeId! * 1;
    }

    changeSideSection(item: WorkflowProcessDto, index: number) {
        this.sectionIndex = index;
        this.selectedSideSection = item.typeId!;
        this._workflowDataService.updateWorkflowProgressStatus({currentlyActiveSideSection: item.typeId!});
        const firstitemInSection = this.sideMenuItems.find(x => x.name === item.name)?.steps![0];
        this.changeStepSelection(firstitemInSection!);
        this._workflowDataService.workflowSideSectionChanged.emit(true);
    }

    deleteSideSection(item: WorkflowProcessDto) {
        const scrollStrategy = this.overlay.scrollStrategies.reposition();
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            minWidth: '450px',
            minHeight: '180px',
            height: 'auto',
            width: 'auto',
            scrollStrategy,
            backdropClass: 'backdrop-modal--wrapper',
            autoFocus: false,
            panelClass: 'confirmation-modal',
            data: {
                confirmationMessageTitle: `Are you sure you want to delete ${item.name} ?`,
                confirmationMessage: 'The data, which has been filled until now - will be removed.',
                rejectButtonText: 'Cancel',
                confirmButtonText: 'Yes',
                isNegative: false
            }
        });

        dialogRef.componentInstance.onConfirmed.subscribe((result) => {

        });

        dialogRef.componentInstance.onRejected.subscribe(() => {
            // nthng
        });
    }

    changeAnchorSelection(anchorName: string) {
        this.selectedAnchor = anchorName;
    }


}
