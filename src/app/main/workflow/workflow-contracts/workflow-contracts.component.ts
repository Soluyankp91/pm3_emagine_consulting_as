import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl } from '@angular/forms';
import { WorkflowContractsSummaryForm } from '../workflow.model';

@Component({
    selector: 'app-workflow-contracts',
    templateUrl: './workflow-contracts.component.html',
    styleUrls: ['./workflow-contracts.component.scss']
})
export class WorkflowContractsComponent implements OnInit {
    contactSummaryForm: WorkflowContractsSummaryForm;
    constructor(
        private _fb: FormBuilder
    ) {
        this.contactSummaryForm = new WorkflowContractsSummaryForm();
    }

    ngOnInit(): void {
        this.addContractSigner();
    }

    addContractSigner() {
        const form = this._fb.group({
            name: new FormControl(null),
            role: new FormControl(null)
        });
        this.contactSummaryForm.contractData.push(form);
    }

    get contractData(): FormArray {
        return this.contactSummaryForm.get('contractData') as FormArray;
    }

    removeContractSigner(index: number) {
        this.contractData.removeAt(index);
    }
}
