import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl } from '@angular/forms';
import { WorkflowSourcingConsultantsDataForm } from './workflow-sourcing.model';

@Component({
    selector: 'app-workflow-sourcing',
    templateUrl: './workflow-sourcing.component.html',
    styleUrls: ['./workflow-sourcing.component.scss']
})
export class WorkflowSourcingComponent implements OnInit {
    @Input() activeSideSection: number;
    @Input() workflowId: string;

    sourcingConsultantsDataForm: WorkflowSourcingConsultantsDataForm;
    consultantList = [
        {
            name: 'Robertsen Oscar'
        },
        {
            name: 'Van Trier Mia'
        }];

    constructor(
        private _fb: FormBuilder,

    ) {
        this.sourcingConsultantsDataForm = new WorkflowSourcingConsultantsDataForm();

    }

    ngOnInit(): void {
        this.consultantList.forEach(item => this.addConsultantDataToForm(item));
    }

    addConsultantDataToForm(consultant: any) {
        const form = this._fb.group({
            consultantName: new FormControl(consultant.name)
        });
        this.sourcingConsultantsDataForm.consultantData.push(form);
    }

    get consultantData(): FormArray {
        return this.sourcingConsultantsDataForm.get('consultantData') as FormArray;
    }

}
