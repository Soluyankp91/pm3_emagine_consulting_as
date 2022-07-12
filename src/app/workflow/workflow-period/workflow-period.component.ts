import { Overlay } from '@angular/cdk/overlay';
import { Component, Injector, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { InternalLookupService } from 'src/app/shared/common/internal-lookup.service';
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { ManagerStatus } from 'src/app/shared/components/manager-search/manager-search.model';
import { AppComponentBase } from 'src/shared/app-component-base';
import { WorkflowProcessDto, WorkflowProcessType, WorkflowServiceProxy, StepDto, StepType, WorkflowStepStatus, ConsultantResultDto, ApiServiceProxy } from 'src/shared/service-proxies/service-proxies';
import { WorkflowDataService } from '../workflow-data.service';
import { StepAnchorDto, StepWithAnchorsDto, WorkflowProcessWithAnchorsDto } from './workflow-period.model';

@Component({
    selector: 'app-workflow-period',
    templateUrl: './workflow-period.component.html',
    styleUrls: ['./workflow-period.component.scss']
})
export class WorkflowPeriodComponent extends AppComponentBase implements OnInit {
    @Input() workflowId: string;
    @Input() periodId: string | undefined;

    sideMenuItems: WorkflowProcessDto[] = [];
    sideMenuItems2: WorkflowProcessWithAnchorsDto[] = [];
    workflowProcessTypes = WorkflowProcessType;
    workflowPeriodStepTypes: { [key: string]: string };
    // selectedStep: StepDto;
    selectedStep: StepWithAnchorsDto;
    selectedAnchor: string;

    workflowSteps = StepType;
    selectedStepEnum: StepType;
    // selectedSideSection: WorkflowProcessDto;
    selectedSideSection: WorkflowProcessWithAnchorsDto;
    sectionIndex = 0;
    consultant: ConsultantResultDto;

    // hardcoded status
    managerStatus = ManagerStatus;

    workflowStatuses = WorkflowStepStatus;

    isStatusUpdate = false;
    private _unsubscribe = new Subject();
    constructor(
        injector: Injector,
        public _workflowDataService: WorkflowDataService,
        private _workflowService: WorkflowServiceProxy,
        private overlay: Overlay,
        private dialog: MatDialog,
        private _internalLookupService: InternalLookupService,
        private _apiService: ApiServiceProxy
    ) {
        super(injector);
        this._workflowDataService.consultantsAddedToStep
            .pipe(takeUntil(this._unsubscribe))
            .subscribe((value: {stepType: number, consultantNames: string[]}) => {
                this.updateConsultantAnchorsInStep(value.stepType, value.consultantNames)
            });
    }

    ngOnInit(): void {
        this.getPeriodStepTypes();
        this.getSideMenu();
        this._workflowDataService.workflowSideSectionAdded
            .pipe(takeUntil(this._unsubscribe))
            .subscribe((value: boolean) => {
                this.getSideMenu(value);
            });
        this._workflowDataService.workflowSideSectionUpdated
            .pipe(takeUntil(this._unsubscribe))
                .subscribe((value: {isStatusUpdate: boolean}) => {
                    this.isStatusUpdate = value.isStatusUpdate;
                    this.getSideMenu();
                });
    }

    selectedManager(event: any) {
        console.log(event);
    }

    getPeriodStepTypes() {
        this._internalLookupService.getWorkflowPeriodStepTypes()
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.workflowPeriodStepTypes = result;
            });
    }

    getSideMenu(autoUpdate?: boolean) {
        this._workflowService.clientPeriods(this.workflowId, this.periodId, true)
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.sideMenuItems = result?.clientPeriods![0].workflowProcesses!;
                this.sideMenuItems2 = result?.clientPeriods![0].workflowProcesses!.map(side => {
                    return new WorkflowProcessWithAnchorsDto({
                        typeId: side.typeId!,
                        name: side.name!,
                        consultantPeriodId: side.consultantPeriodId!,
                        consultant: side.consultant!,
                        periodStartDate: side.periodStartDate!,
                        periodEndDate: side.periodEndDate!,
                        terminationEndDate: side.terminationEndDate!,
                        // steps: this.mapStepsIntoNewDto(side.steps!)
                        steps: side?.steps?.map(step => this.mapStepIntoNewDto(step))
                    });
                });

                console.log(this.sideMenuItems2);
                if (autoUpdate) {
                    let sideMenuItemsLength = this.sideMenuItems.length;
                    this.changeSideSection(this.sideMenuItems[sideMenuItemsLength - 1], sideMenuItemsLength - 1);
                }
            });
    }

    updateConsultantAnchorsInStep(stepType: number, consultantNames: string[]) {
        const stepIndex = this.sideMenuItems2[this.sectionIndex].steps?.findIndex(x => x.typeId === stepType)!;
        let stepToUpdate = this.sideMenuItems2[this.sectionIndex].steps![stepIndex];
        this.sideMenuItems2[this.sectionIndex].steps![stepIndex] = this.mapStepIntoNewDto(stepToUpdate, consultantNames);
        console.log(this.sideMenuItems2);
    }

    mapStepIntoNewDto(step: StepDto | StepWithAnchorsDto, consultantNames?: string[]) {
        // return steps.map(step => {
            return new StepWithAnchorsDto({
                typeId: step.typeId,
                name: step.name,
                status: step.status,
                responsiblePerson: step.responsiblePerson,
                actionsPermissionsForCurrentUser: step.actionsPermissionsForCurrentUser,
                menuAnchors: this.mapAnchorsForSteps(step!, consultantNames)
            });
        // });
    }

    mapAnchorsForSteps(step: StepDto | StepWithAnchorsDto, consultantNames?: string[]) {
        switch (step.typeId) {
            case StepType.Sales:
                let SalesAnchors: StepAnchorDto[] = [
                    {
                        name: 'Main Data',
                        anchor: 'mainDataAnchor'
                    },
                    {
                        name: 'Client Data',
                        anchor: 'clientDataAnchor'
                    }
                ];
                if (consultantNames?.length) {
                    consultantNames.forEach((name, index) => {
                        SalesAnchors.push({
                            name: 'Consultant Data',
                            anchor: `consultantDataAnchor${index}`,
                            consultantName: name
                        })
                    })
                }
                return new Array<StepAnchorDto>(...SalesAnchors);
            case StepType.Contract:
                let ContractAnchors = [
                    {
                        name: 'Main Data',
                        anchor: 'mainDataAnchor'
                    },
                    {
                        name: 'Client Data',
                        anchor: 'clientDataAnchor'
                    }
                ];
                return new Array<StepAnchorDto>(...ContractAnchors);
                // return ['Main Data', 'Client Data', 'Consultant Data'];
            case StepType.Finance:
                return [];
            case StepType.Sourcing:
                return [];
        }
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

    // changeStepSelection(step: StepDto) {
    changeStepSelection(step: StepWithAnchorsDto) {
        this.selectedStepEnum = step.typeId!;
        this.selectedStep = step;
        this._workflowDataService.updateWorkflowProgressStatus({currentlyActiveStep: step.typeId, stepSpecificPermissions: step.actionsPermissionsForCurrentUser, currentStepIsCompleted: step.status === WorkflowStepStatus.Completed});
    }

    changeSideSection(item: WorkflowProcessWithAnchorsDto, index: number) {
        this.sectionIndex = index;
        this.selectedSideSection = item;
        this.consultant = item.consultant!;
        this._workflowDataService.updateWorkflowProgressStatus({currentlyActiveSideSection: item.typeId!});
        if (!this.isStatusUpdate) {
            const firstitemInSection = this.sideMenuItems.find(x => x.name === item.name)?.steps![0];
            this.changeStepSelection(firstitemInSection!);
        } else {
            const stepToSelect = this.sideMenuItems.find(x => x.name === item.name)?.steps!.find(x => x.name === this.selectedStep.name);
            this.changeStepSelection(stepToSelect!);
        }
        this.isStatusUpdate = false;
        this._workflowDataService.workflowSideSectionChanged.emit({consultant: item.consultant, consultantPeriodId: item.consultantPeriodId});
    }

    // deleteSideSection(item: WorkflowProcessDto) {
    deleteSideSection(item: WorkflowProcessWithAnchorsDto) {
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
            switch (item.typeId) {
                case WorkflowProcessType.ChangeClientPeriod:
                case WorkflowProcessType.ExtendClientPeriod:
                    return this.deleteClientPeriod(this.periodId!);
                case WorkflowProcessType.StartConsultantPeriod:
                case WorkflowProcessType.ChangeConsultantPeriod:
                case WorkflowProcessType.ExtendConsultantPeriod:
                    return this.deleteConsultantPeriod(item.consultantPeriodId!);
                case WorkflowProcessType.TerminateConsultant:
                    return this.deleteConsultantTermination(item?.consultant?.id!);
                case WorkflowProcessType.TerminateWorkflow:
                    return this.deleteWorkflowTermination();
            }
        });

        dialogRef.componentInstance.onRejected.subscribe(() => {
            // nthng
        });
    }

    changeAnchorSelection(anchorName: string) {
        this.selectedAnchor = anchorName;
    }

    deleteWorkflowTermination() {
        this._workflowService.terminationDelete(this.workflowId).subscribe(result => {
            this._workflowDataService.workflowSideSectionUpdated.emit({isStatusUpdate: true});
        });
    }

    deleteConsultantTermination(consultantId: number) {
        this._workflowService.terminationConsultantDelete(this.workflowId, consultantId).subscribe(result => {
            this._workflowDataService.workflowSideSectionUpdated.emit({isStatusUpdate: true});
        })
    }

    deleteClientPeriod(clientPeriodId: string) {
        this.showMainSpinner();
        this._apiService.clientPeriod(clientPeriodId)
            .pipe(finalize(() => this.hideMainSpinner()))
            .subscribe(result => this._workflowDataService.workflowTopSectionUpdated.emit(true));
    }

    deleteConsultantPeriod(consultantPeriodId: string) {
        this.showMainSpinner();
        this._apiService.consultantPeriod(consultantPeriodId)
            .pipe(finalize(() => this.hideMainSpinner()))
            .subscribe(result => this._workflowDataService.workflowSideSectionUpdated.emit({isStatusUpdate: true}));
    }
}
