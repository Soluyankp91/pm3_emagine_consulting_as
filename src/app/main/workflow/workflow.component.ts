import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { WorkflowSalesClientDataForm } from './workflow.model';

@Component({
    selector: 'app-workflow',
    templateUrl: './workflow.component.html',
    styleUrls: ['./workflow.component.scss']
})
export class WorkflowComponent implements OnInit {
    selectedIndex = 0;
    firstForm = new FormGroup({
        test: new FormControl(null, Validators.required)
    });

    salesMainClientDataForm: WorkflowSalesClientDataForm;
    constructor(
        private _fb: FormBuilder
    ) {
        this.salesMainClientDataForm = new WorkflowSalesClientDataForm();
    }

    ngOnInit(): void {
        // init form to add signers array
        this.addSignerToForm();
    }


    addSignerToForm() {
        const form = this._fb.group({
            clientName: new FormControl(null),
            clientRole: new FormControl(null),
            clientSigvens: new FormControl(null)
        });
        this.salesMainClientDataForm.clientSigners.push(form);
    }

    get clientSigners(): FormArray {
        return this.salesMainClientDataForm.get('clientSigners') as FormArray;
    }

    removeSigner(index: number) {
        this.clientSigners.removeAt(index);
    }

    selectionChange(event: StepperSelectionEvent) {
        this.selectedIndex = event.selectedIndex;
    }

}
