import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl } from '@angular/forms';
import { WorkflowSalesExtensionForm } from '../workflow.model';

@Component({
    selector: 'app-extension-sales',
    templateUrl: './extension-sales.component.html',
    styleUrls: ['./extension-sales.component.scss']
})
export class ExtensionSalesComponent implements OnInit {
    @Input() selectedIndex: number;
    salesExtensionForm: WorkflowSalesExtensionForm;
    constructor(
        private _fb: FormBuilder
    ) {
        this.salesExtensionForm = new WorkflowSalesExtensionForm();
    }

    ngOnInit(): void {
    }

    initSalesExtensionForm() {
        const form = this._fb.group({
            extensionEndDate: new FormControl(null),
            noExtensionEndDate: new FormControl(false),
            workflowInformation: new FormControl(null)
        });
        this.salesExtensionForm.salesExtension.push(form);
    }

    get salesExtension() {
        return this.salesExtensionForm.get('salesExtension') as FormArray;
    }

}
