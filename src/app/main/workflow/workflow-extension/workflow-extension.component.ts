import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl } from '@angular/forms';
import { AddConsultantDto, ExtensionSideNavigation, SideNavigationDto, SideNavigationParentItemDto } from './workflow-extension.model';
import { WorkflowDataService } from '../workflow-data.service';
import { WorkflowSalesComponent } from '../workflow-sales/workflow-sales.component';
import { WorkflowExtensionForm, WorkflowSalesExtensionForm, WorkflowStepList, WorkflowSteps } from '../workflow.model';

@Component({
    selector: 'app-workflow-extension',
    templateUrl: './workflow-extension.component.html',
    styleUrls: ['./workflow-extension.component.scss']
})
export class WorkflowExtensionComponent implements OnInit, AfterViewInit {
    @Input() selectedIndex: number;
    salesExtensionForm: WorkflowSalesExtensionForm;
    extensionForm: WorkflowExtensionForm;

    // Extension start
    @Input() workflowId: string;
    @ViewChild('workflowSales', {static: false}) workflowSales: WorkflowSalesComponent;
    selectedStep: string;
    workflowSteps = WorkflowStepList;
    sideNav: SideNavigationParentItemDto[];
    // Extension end

    constructor(
        public _workflowDataService: WorkflowDataService,
        private _fb: FormBuilder
    ) {
        this.salesExtensionForm = new WorkflowSalesExtensionForm();
        this.extensionForm = new WorkflowExtensionForm();
    }

    ngOnInit(): void {
        // this.initSalesExtensionForm();
        this.selectedStep = 'ExtendSales';
        const sideNavForSpecificExtension: SideNavigationDto = this._workflowDataService.extensionSideNavigation.find(x => x.index === this._workflowDataService.getWorkflowProgress.currentlyActiveExtensionIndex)!;
        this.sideNav = new Array<SideNavigationParentItemDto>(...sideNavForSpecificExtension.sideNav);
    }

    ngAfterViewInit(): void {
    }

    initPage() {
        this._workflowDataService.workflowProgress.currentlyActiveStep = WorkflowSteps.Sales;
        console.log('extInit');
    }

    initSalesExtensionForm() {
        const form = this._fb.group({
            extensionEndDate: new FormControl(null),
            noExtensionEndDate: new FormControl(false),
            workflowInformation: new FormControl(null)
        });
        this.salesExtensionForm.salesExtension.push(form);
        console.log('ss');
    }

    get salesExtension() {
        return this.salesExtensionForm.get('salesExtension') as FormArray;
    }

    // Extension start
    changeStepSelection(stepName: string, stepId: any) {
        this.selectedStep = stepName;
        this._workflowDataService.workflowProgress.currentlyActiveStep = stepId * 1;
    }

    addConsultantToPrimaryWorkflow() {
        // this.sideNav.push(AddConsultantDto);
    }
    // Extension end

}
