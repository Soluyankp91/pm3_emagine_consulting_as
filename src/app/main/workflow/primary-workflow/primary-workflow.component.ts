import { Overlay } from '@angular/cdk/overlay';
import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ScrollToConfigOptions, ScrollToService } from '@nicky-lenaers/ngx-scroll-to';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { ManagerStatus } from 'src/app/shared/components/manager-search/manager-search.model';
import { WorkflowProcessDto, WorkflowServiceProxy } from 'src/shared/service-proxies/service-proxies';
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

    sectionIndex: number;

    managerStatus = ManagerStatus;


    sideMenuItms: WorkflowProcessDto[] = [];
    // WAIT A SEC, MAMA ZAISHLA!!!

    private _unsubscribe = new Subject();
    constructor(
        public _workflowDataService: WorkflowDataService,
        private _workflowService: WorkflowServiceProxy,
        private overlay: Overlay,
        private dialog: MatDialog,
    ) { }

    ngOnInit(): void {
        this._workflowDataService.workflowSideSectionAdded
            .pipe(takeUntil(this._unsubscribe))
            .subscribe((value: boolean) => {
                // NB: SAVE DRAFT or COMPLETE
                this.makeFirstSectionActive();
            });
        // this.workflowSideNavigation = new Array<SideNavigationParentItemDto>(...this._workflowDataService.workflowSideNavigation);
        this.changeSideSection(this.sideNavigation[0] , 0);

        this.getSideMenu();
    }

    getSideMenu() {
        this._workflowService.clientPeriods(this.workflowId, this.clientPeriodId, true)
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.sideMenuItms = result?.clientPeriods![0].workflowProcesses!;
                console.log(result);
            });
    }

    ngAfterViewInit(): void {
        // this.workflowSideNavigation = new Array<SideNavigationParentItemDto>(...this._workflowDataService.workflowSideNavigation);
        this.changeSideSection(this.sideNavigation[0] , 0);
    }

    get sideNavigation() {
        return this.workflowSideNavigation = new Array<SideNavigationParentItemDto>(...this._workflowDataService.workflowSideNavigation);
    }

    makeFirstSectionActive() {
        this.changeSideSection(this.sideNavigation[0] , 0);
        // TODO: scroll to top on newly added section?
    }

    changeStepSelection(stepName: string, stepId: any, stepEnum: number) {
        this.selectedStep = stepName;
        this.selectedStepEnum = stepEnum;
        this._workflowDataService.workflowProgress.currentlyActiveStep = stepId * 1;
    }

    changeSideSection(item: SideNavigationParentItemDto, index: number) {
        this.sectionIndex = index;
        this.selectedSideSection = item.sectionEnumValue;
        this._workflowDataService.updateWorkflowProgressStatus({currentlyActiveSideSection: item.sectionEnumValue});
        const firstitemInSection = this.workflowSideNavigation.find(x => x.displayName === item.displayName)?.subItems[0];
        this.changeStepSelection(firstitemInSection!.name, firstitemInSection!.id, firstitemInSection!.enumStepValue);
    }

    deleteSideSection(item: SideNavigationParentItemDto) {
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
                confirmationMessageTitle: `Are you sure you want to delete ${item.displayName} ?`,
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
