import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl } from '@angular/forms';
import { WorkflowDataService } from '../workflow-data.service';
import { WorkflowSideSections } from '../workflow.model';
import { FinancesClientForm, FinancesConsultantsForm } from './workflow-finances.model';

@Component({
    selector: 'app-workflow-finances',
    templateUrl: './workflow-finances.component.html',
    styleUrls: ['./workflow-finances.component.scss']
})
export class WorkflowFinancesComponent implements OnInit {
    @Input() workflowId: string;

    @Input() primaryWorkflow: boolean;
    @Input() editWorfklow: boolean;
    @Input() addConsultant: boolean;

    // Changed all above to enum
    @Input() activeSideSection: number;
    workflowSideSections = WorkflowSideSections;

    financesClientForm: FinancesClientForm;
    financesConsultantsForm: FinancesConsultantsForm;

    consultantList = [
        {
            consultantName: 'Robertsen Oscar'
        },
        {
            consultantName: 'Van Trier Mia'
        }
    ]
    constructor(
        private _fb: FormBuilder,
        private _workflowDataService: WorkflowDataService
    ) {
        this.financesClientForm = new FinancesClientForm();
        this.financesConsultantsForm = new FinancesConsultantsForm();
    }

    ngOnInit(): void {
        console.log('init', this.editWorfklow);
        this.consultantList.forEach(consultant => {
            this.addConsultantToForm(consultant);
        });
    }

    get readOnlyMode() {
        return this._workflowDataService.getWorkflowProgress.isWorkflowAccountsSaved;
    }

    addConsultantToForm(consultant: any) {
        const form = this._fb.group({
            consultantName: new FormControl(consultant.consultantName),
            checkConsualtantInvoicingSettings: new FormControl(false),
            consultantCreatedInNavision: new FormControl(false)
        });
        this.financesConsultantsForm.consultants.push(form);
    }

    get consultants(): FormArray {
        return this.financesConsultantsForm.get('consultants') as FormArray;
    }

    removeConsultant(index: number) {
        this.consultants.removeAt(index);
    }

}
