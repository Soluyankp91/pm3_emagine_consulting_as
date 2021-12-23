import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { WorkflowDataService } from '../workflow-data.service';
import { SideNavigationParentItemDto } from '../workflow-extension/workflow-extension.model';
import { WorkflowSalesComponent } from '../workflow-sales/workflow-sales.component';
import { WorkflowStepList } from '../workflow.model';
import { AddConsultantDto, EditConsultantDto, EditWorkflowDto, ExtendConsultantDto, ExtendWorkflowDto, TerminateConsultantDto, TerminateWorkflowDto } from './primary-workflow.model';

@Component({
    selector: 'app-primary-workflow',
    templateUrl: './primary-workflow.component.html',
    styleUrls: ['./primary-workflow.component.scss']
})
export class PrimaryWorkflowComponent implements OnInit {
    @Input() workflowId: number;
    @ViewChild('workflowSales', {static: false}) workflowSales: WorkflowSalesComponent;
    selectedStep: string;

    workflowSteps = WorkflowStepList;


    workflowSideNavigation: SideNavigationParentItemDto[];

    sectionIndex: number;
    constructor(
        public _workflowDataService: WorkflowDataService
    ) { }

    ngOnInit(): void {
        this.workflowSideNavigation = new Array<SideNavigationParentItemDto>(...this._workflowDataService.workflowSideNavigation);
        this.changeSideSection(this.workflowSideNavigation[0] , 0);
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
        this.workflowSideNavigation.push(AddConsultantDto);
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
        this.workflowSideNavigation.push(EditWorkflowDto);
    }

    extendConsultant() {
        this.workflowSideNavigation.push(ExtendConsultantDto);
    }

    terminateConsultant() {
        this.workflowSideNavigation.push(TerminateConsultantDto);
    }

}
