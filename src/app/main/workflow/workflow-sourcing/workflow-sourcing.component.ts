import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { WorkflowSourcingConsultantsForm } from './workflow-sourcing.model';

@Component({
    selector: 'app-workflow-sourcing',
    templateUrl: './workflow-sourcing.component.html',
    styleUrls: ['./workflow-sourcing.component.scss']
})
export class WorkflowSourcingComponent implements OnInit {
    @Input() activeSideSection: number;
    workflowSourcingConsultantsForm: WorkflowSourcingConsultantsForm;
    constructor(
        private _fb: FormBuilder
    ) {
        this.workflowSourcingConsultantsForm = new WorkflowSourcingConsultantsForm();
    }

    ngOnInit(): void {
        let consultants = [
            {
                pictureId: 'https://placekitten.com/50/50',
                name: 'Robert Oscar'
            },
            {
                pictureId: 'https://placekitten.com/50/50',
                name: 'Robert Oscar22'
            }
        ];
        consultants.forEach(consultant => {
            this.addConsultantToForm(consultant);
        });
    }

    addConsultantToForm(consultantData: any) {
        const form = this._fb.group({
            pictureId: new FormControl(consultantData.pictureId),
            name: new FormControl(consultantData.name),
            isCvUpdated: new FormControl(false),
        });
        this.workflowSourcingConsultantsForm.consultantData.push(form);
    }

}
