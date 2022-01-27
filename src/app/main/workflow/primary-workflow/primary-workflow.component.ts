import { Overlay } from '@angular/cdk/overlay';
import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { ManagerStatus } from 'src/app/shared/components/manager-search/manager-search.model';
import { WorkflowDataService } from '../workflow-data.service';
import { SideNavigationParentItemDto } from '../workflow-extension/workflow-extension.model';
import { WorkflowSalesComponent } from '../workflow-sales/workflow-sales.component';
import { AddConsultantDto, ChangeWorkflowDto, ExtendConsultantDto, ExtendWorkflowDto, TerminateConsultantDto, TerminateWorkflowDto, WorkflowSideSections } from '../workflow.model';

@Component({
    selector: 'app-primary-workflow',
    templateUrl: './primary-workflow.component.html',
    styleUrls: ['./primary-workflow.component.scss']
})
export class PrimaryWorkflowComponent implements OnInit, AfterViewInit {
    @Input() workflowId: string;
    @ViewChild('workflowSales', {static: false}) workflowSales: WorkflowSalesComponent;
    selectedStep: string;
    selectedAnchor: string;

    workflowSideSections = WorkflowSideSections;

    workflowSideNavigation: SideNavigationParentItemDto[];

    sectionIndex: number;

    managerStatus = ManagerStatus;
    constructor(
        public _workflowDataService: WorkflowDataService,
        private overlay: Overlay,
        private dialog: MatDialog
    ) { }

    ngOnInit(): void {
        // this.workflowSideNavigation = new Array<SideNavigationParentItemDto>(...this._workflowDataService.workflowSideNavigation);
        this.changeSideSection(this.sideNavigation[0] , 0);
    }

    ngAfterViewInit(): void {
        // this.workflowSideNavigation = new Array<SideNavigationParentItemDto>(...this._workflowDataService.workflowSideNavigation);
        this.changeSideSection(this.sideNavigation[0] , 0);
    }

    get sideNavigation() {
        return this.workflowSideNavigation = new Array<SideNavigationParentItemDto>(...this._workflowDataService.workflowSideNavigation);
    }

    changeStepSelection(stepName: string, stepId: any) {
        this.selectedStep = stepName;
        this._workflowDataService.workflowProgress.currentlyActiveStep = stepId * 1;
    }

    changeSideSection(item: SideNavigationParentItemDto, index: number) {
        this.sectionIndex = index;
        this._workflowDataService.updateWorkflowProgressStatus({currentlyActiveSideSection: item.sectionEnumValue});
        const firstitemInSection = this.workflowSideNavigation.find(x => x.displayName === item.displayName)?.subItems[0];
        this.changeStepSelection(firstitemInSection!.name, firstitemInSection!.id);
    }

    addConsultantToPrimaryWorkflow() {
        // this.workflowSideNavigation.push(AddConsultantDto);
        this._workflowDataService.workflowSideNavigation.push(AddConsultantDto);
    }

    extendWorkflow() {
        this.workflowSideNavigation.push(ExtendWorkflowDto);
    }

    terminateWorkflow() {
        this.workflowSideNavigation.push(TerminateWorkflowDto);
    }

    editWorkflow() {
        this.workflowSideNavigation.push(ChangeWorkflowDto);
    }

    extendConsultant() {
        this.workflowSideNavigation.push(ExtendConsultantDto);
    }

    terminateConsultant() {
        this.workflowSideNavigation.push(TerminateConsultantDto);
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
