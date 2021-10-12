import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { WorkflowContractsSummaryForm, WorkflowSalesAdditionalDataForm, WorkflowSalesClientDataForm, WorkflowSalesConsultantsForm, WorkflowSalesExtensionForm, WorkflowSalesMainForm, WorkflowTerminationSalesForm } from './workflow.model';

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
    salesMainDataForm: WorkflowSalesMainForm;
    consultantsForm: WorkflowSalesConsultantsForm;
    additionalDataForm: WorkflowSalesAdditionalDataForm;
    contactSummaryForm: WorkflowContractsSummaryForm;
    salesExtensionForm: WorkflowSalesExtensionForm;
    terminationSalesForm: WorkflowTerminationSalesForm;
    constructor(
        private _fb: FormBuilder
    ) {
        this.salesMainClientDataForm = new WorkflowSalesClientDataForm();
        this.salesMainDataForm = new WorkflowSalesMainForm();
        this.consultantsForm = new WorkflowSalesConsultantsForm();
        this.additionalDataForm = new WorkflowSalesAdditionalDataForm();
        this.contactSummaryForm = new WorkflowContractsSummaryForm();
        this.salesExtensionForm = new WorkflowSalesExtensionForm();
        this.terminationSalesForm = new WorkflowTerminationSalesForm();
    }

    ngOnInit(): void {
        // init form to add signers array
        this.addSignerToForm();
        this.addConsultantForm();
        this.addContractSigner();
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

    addConsultantForm() {
        const form = this._fb.group({
            consultantType: new FormControl(null),
            consultantEvaluationsProData: new FormControl(null),
            disableEvaluations: new FormControl(false),
            consultantContractSigners: new FormArray([this.addConsultantSignerToForm()]),
            consultantSpecialContractTerms: new FormControl(null),
            consultantRate: new FormControl(null),
            consultantProjectStartDate: new FormControl(null),
            consultantProjectEndDate: new FormControl(null),
            consultantProjectNoEndDate: new FormControl(false),
            consultantProjectSameAsClientDuration: new FormControl(false)
        });
        this.consultantsForm.consultantData.push(form);
    }

    addConsultantSignerToForm() {
        const form = this._fb.group({
            clientName: new FormControl(null),
            clientRole: new FormControl(null),
            clientSigvens: new FormControl(null)
        });
        return form;
    }

    removeConsultant(index: number) {
        this.consultantsForm.consultantData.removeAt(index);
    }

    removeConsultantSigner(consultantIndex: number, signerIndex: number) {
        (this.consultantsForm.consultantData.at(consultantIndex).get('consultantContractSigners') as FormArray).removeAt(signerIndex);
    }

    addConsultantSigner(consultantIndex: number) {
        const form = this._fb.group({
            clientName: new FormControl(null),
            clientRole: new FormControl(null),
            clientSigvens: new FormControl(null)
        });
        (this.consultantsForm.consultantData.at(consultantIndex).get('consultantContractSigners') as FormArray).push(form);
    }

    removeConsulant(index: number) {
        this.consultantsForm.consultantData.removeAt(index);
    }

    getConsultantContractSignersControls(index: number) {
        return (this.consultantsForm.consultantData.at(index).get('consultantContractSigners') as FormArray).controls;
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

    selectionChange(event: StepperSelectionEvent) {
        this.selectedIndex = event.selectedIndex;
    }

}
