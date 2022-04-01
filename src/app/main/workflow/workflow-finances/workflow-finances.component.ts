import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl } from '@angular/forms';
import { WorkflowProcessType } from 'src/shared/service-proxies/service-proxies';
import { WorkflowDataService } from '../workflow-data.service';
import { FinancesClientForm, FinancesConsultantsForm } from './workflow-finances.model';

@Component({
    selector: 'app-workflow-finances',
    templateUrl: './workflow-finances.component.html',
    styleUrls: ['./workflow-finances.component.scss']
})
export class WorkflowFinancesComponent implements OnInit {
    @Input() workflowId: string;

    // Changed all above to enum
    @Input() activeSideSection: number;
    @Input() isCompleted: boolean;

    workflowSideSections = WorkflowProcessType;

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
        this.consultantList.forEach(consultant => {
            this.addConsultantToForm(consultant);
        });
    }

    get readOnlyMode() {
        return this.isCompleted;
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
