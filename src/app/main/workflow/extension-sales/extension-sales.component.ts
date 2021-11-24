import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl } from '@angular/forms';
import { WorkflowDataService } from '../workflow-data.service';
import { WorkflowExtensionForm, WorkflowSalesExtensionForm, WorkflowSteps } from '../workflow.model';

@Component({
    selector: 'app-extension-sales',
    templateUrl: './extension-sales.component.html',
    styleUrls: ['./extension-sales.component.scss']
})
export class ExtensionSalesComponent implements OnInit {
    @Input() selectedIndex: number;
    salesExtensionForm: WorkflowSalesExtensionForm;
    extensionForm: WorkflowExtensionForm;
    constructor(
        public _workflowDataService: WorkflowDataService,
        private _fb: FormBuilder
    ) {
        this.salesExtensionForm = new WorkflowSalesExtensionForm();
        this.extensionForm = new WorkflowExtensionForm();
    }

    ngOnInit(): void {
        // this.initSalesExtensionForm();
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

}
