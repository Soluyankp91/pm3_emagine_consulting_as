import { Overlay } from '@angular/cdk/overlay';
import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { InternalLookupService } from 'src/app/shared/common/internal-lookup.service';
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { ManagerStatus } from 'src/app/shared/components/manager-search/manager-search.model';
import { EnumEntityTypeDto, StepDto, WorkflowProcessDto, WorkflowProcessType, WorkflowServiceProxy } from 'src/shared/service-proxies/service-proxies';
import { WorkflowDataService } from '../workflow-data.service';
import { SideNavigationParentItemDto } from '../workflow-extension/workflow-extension.model';
import { WorkflowSalesComponent } from '../workflow-sales/workflow-sales.component';
import { WorkflowSideSections, WorkflowSteps } from '../workflow.model';

@Component({
    selector: 'app-primary-workflow',
    templateUrl: './primary-workflow.component.html',
    styleUrls: ['./primary-workflow.component.scss']
})
export class PrimaryWorkflowComponent implements OnInit, AfterViewInit {
    @Input() workflowId: string;
    @Input() clientPeriodId: string | undefined;

    @Input() componentTypeId: number;

    @ViewChild('workflowSales', {static: false}) workflowSales: WorkflowSalesComponent;
    selectedStep: string;
    selectedAnchor: string;

    workflowSideSections = WorkflowSideSections;
    workflowSteps = WorkflowSteps;
    selectedStepEnum: number;
    selectedSideSection: number;

    workflowSideNavigation: SideNavigationParentItemDto[];

    sectionIndex = 0;

    managerStatus = ManagerStatus;


    sideMenuItems: WorkflowProcessDto[] = [];

    workflowProcessTypes = WorkflowProcessType;
    workflowPeriodStepTypes: EnumEntityTypeDto[] = [];
    private _unsubscribe = new Subject();
    constructor(
        public _workflowDataService: WorkflowDataService,
        private _workflowService: WorkflowServiceProxy,
        private overlay: Overlay,
        private dialog: MatDialog,
        private _lookupService: InternalLookupService
    ) { }

    ngOnInit(): void {
        // this._workflowDataService.workflowSideSectionAdded
        //     .pipe(takeUntil(this._unsubscribe))
        //     .subscribe((value: boolean) => {
        //         this.makeFirstSectionActive();
        //     });
        // this.workflowSideNavigation = new Array<SideNavigationParentItemDto>(...this._workflowDataService.workflowSideNavigation);
        // this.changeSideSection(this.sideMenuItems[0] , 0);

        this.getPeriodStepTypes();
        this.getSideMenu();
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
                // this.getPeriodStepTypes();
                // this.changeSideSection(this.sideMenuItems[0] , 0);
                console.log(result);
                console.log('side lvl ', this.sideMenuItems);
            });
    }

    mapIconFromMenuItem(typeId: number) {
        switch (typeId) {
            case WorkflowProcessType.StartClientPeriod:
                return 'workflowAdd'
            case WorkflowProcessType.ChangeClientPeriod:
                return 'workflowEdit'
            case WorkflowProcessType.ExtendClientPeriod:
                return 'workflowStartOrExtend'
            case WorkflowProcessType.StartConsultantPeriod:
                return 'workflowAdd'
            case WorkflowProcessType.ChangeConsultantPeriod:
                return 'workflowEdit'
            case WorkflowProcessType.ExtendConsultantPeriod:
                return 'workflowStartOrExtend'
        }
    }

    ngAfterViewInit(): void {
        // this.workflowSideNavigation = new Array<SideNavigationParentItemDto>(...this._workflowDataService.workflowSideNavigation);
        // this.changeSideSection(this.sideMenuItems[0] , 0);
    }

    get sideNavigation() {
        return this.workflowSideNavigation = new Array<SideNavigationParentItemDto>(...this._workflowDataService.workflowSideNavigation);
    }

    // makeFirstSectionActive() {
    //     this.changeSideSection(this.sideMenuItems[0] , 0);
    //     // TODO: scroll to top on newly added section?
    // }

    changeStepSelection(step: StepDto) {
        this.selectedStepEnum = this.mapStepType(this.workflowPeriodStepTypes?.find(x => x.id === step.typeId)!)!;
        this.selectedStep = step.name!;
        this._workflowDataService.workflowProgress.currentlyActiveStep = step.typeId! * 1;
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

    changeStepSelectionOld(stepName: string, stepEnum: number, stepId?: any,) {
        this.selectedStep = stepName;
        this.selectedStepEnum = stepEnum;

        // this._workflowDataService.workflowProgress.currentlyActiveStep = stepId * 1;
    }

    changeSideSection(item: WorkflowProcessDto, index: number) {
        this.sectionIndex = index;
        this.selectedSideSection = item.typeId!;
        this._workflowDataService.updateWorkflowProgressStatus({currentlyActiveSideSection: item.typeId!});
        const firstitemInSection = this.sideMenuItems.find(x => x.name === item.name)?.steps![0];
        this.changeStepSelection(firstitemInSection!);
    }

    // deleteSideSection(item: SideNavigationParentItemDto) {
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
            let sideNavToDelete = this._workflowDataService.workflowSideNavigation.findIndex(x => x.name === item.name);
            this._workflowDataService.workflowSideNavigation.splice(sideNavToDelete, 1)
        });

        dialogRef.componentInstance.onRejected.subscribe(() => {
            // nthng
        });
    }

    changeAnchorSelection(anchorName: string) {
        this.selectedAnchor = anchorName;
    }
}
