import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { ManagerStatus } from 'src/app/shared/components/manager-search/manager-search.model';
import { WorkflowDataService } from '../workflow-data.service';
import { SideNavigationParentItemDto } from '../workflow-extension/workflow-extension.model';
import { WorkflowSalesComponent } from '../workflow-sales/workflow-sales.component';
import { WorkflowStepList } from '../workflow.model';
import { AddConsultantDto, EditConsultantDto, ChangeWorkflowDto, ExtendConsultantDto, ExtendWorkflowDto, TerminateConsultantDto, TerminateWorkflowDto } from './primary-workflow.model';

@Component({
    selector: 'app-primary-workflow',
    templateUrl: './primary-workflow.component.html',
    styleUrls: ['./primary-workflow.component.scss']
})
export class PrimaryWorkflowComponent implements OnInit, AfterViewInit {
    @Input() workflowId: string;
    @ViewChild('workflowSales', {static: false}) workflowSales: WorkflowSalesComponent;
    selectedStep: string;

    workflowSteps = WorkflowStepList;


    workflowSideNavigation: SideNavigationParentItemDto[];

    sectionIndex: number;

    managerStatus = ManagerStatus;
    constructor(
        public _workflowDataService: WorkflowDataService
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

    editConsultant() {
        this.workflowSideNavigation.push(EditConsultantDto);
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

    deleteChange(item: SideNavigationParentItemDto) {
        let sideNavToDelete = this._workflowDataService.workflowSideNavigation.findIndex(x => x.name === item.name);
        this._workflowDataService.workflowSideNavigation.splice(sideNavToDelete, 1)
    }
}
