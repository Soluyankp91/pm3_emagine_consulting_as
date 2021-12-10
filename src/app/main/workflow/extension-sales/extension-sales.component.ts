import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl } from '@angular/forms';
import { AddConsultantDto, WorkflowSideNavigation } from './extensions.model';
import { WorkflowDataService } from '../workflow-data.service';
import { WorkflowSalesComponent } from '../workflow-sales/workflow-sales.component';
import { WorkflowExtensionForm, WorkflowSalesExtensionForm, WorkflowStepList, WorkflowSteps } from '../workflow.model';

@Component({
    selector: 'app-extension-sales',
    templateUrl: './extension-sales.component.html',
    styleUrls: ['./extension-sales.component.scss']
})
export class ExtensionSalesComponent implements OnInit {
    @Input() selectedIndex: number;
    salesExtensionForm: WorkflowSalesExtensionForm;
    extensionForm: WorkflowExtensionForm;

    // Extension start
    @Input() workflowId: number;
    @ViewChild('workflowSales', {static: false}) workflowSales: WorkflowSalesComponent;
    selectedStep: string;
    workflowSteps = WorkflowStepList;
    workflowSideNavigation = WorkflowSideNavigation;
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
        this.selectedStep = 'Sales';
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
        this.workflowSideNavigation.push(AddConsultantDto);
    }
    // Extension end

}
