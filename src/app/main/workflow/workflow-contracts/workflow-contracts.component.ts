import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { WorkflowContractsSummaryForm } from '../workflow.model';
import { WorkflowContractsClientDataForm, WorkflowContractsConsultantsDataForm, WorkflowContractsMainForm, WorkflowContractsSyncForm } from './workflow-contracts.model';

@Component({
    selector: 'app-workflow-contracts',
    templateUrl: './workflow-contracts.component.html',
    styleUrls: ['./workflow-contracts.component.scss']
})
export class WorkflowContractsComponent implements OnInit {
    @Input() workflowId: number;
    @Input() editWorfklow: boolean;
    @Input() extendWorkflow: boolean;

    contactSummaryForm: WorkflowContractsSummaryForm;
    contractsMainDataForm: WorkflowContractsMainForm;
    contractsClientDataForm: WorkflowContractsClientDataForm;
    contractsConsultantsDataForm: WorkflowContractsConsultantsDataForm;
    contractsSyncDataForm: WorkflowContractsSyncForm;


    consultantList = [{
        name: 'Robertsen Oscar'
    },
    {
        name: 'Van Trier Mia'
    }];
    constructor(
        private _fb: FormBuilder
    ) {
        this.contactSummaryForm = new WorkflowContractsSummaryForm();
        this.contractsMainDataForm = new WorkflowContractsMainForm();
        this.contractsClientDataForm = new WorkflowContractsClientDataForm();
        this.contractsConsultantsDataForm = new WorkflowContractsConsultantsDataForm();
        this.contractsSyncDataForm = new WorkflowContractsSyncForm();
    }

    ngOnInit(): void {
        console.log('init', this.editWorfklow);
        this.addSpecialRateToForm();
        this.addClientFeeToForm();
        this.consultantList.forEach(item =>this.addConsultantDataToForm(item));
    }

    // #region CHANGE NAMING
    addSpecialRateToForm() {
        const form = this._fb.group({
            rateName: new FormControl(null),
            rateDirection: new FormControl(null),
            reportingUnit: new FormControl(null)

        });
        this.contractsClientDataForm.clientSpecialRates.push(form);
    }

    get clientSpecialRates(): FormArray {
        return this.contractsClientDataForm.get('clientSpecialRates') as FormArray;
    }

    removeSpecialRate(index: number) {
        this.clientSpecialRates.removeAt(index);
    }

    addClientFeeToForm() {
        const form = this._fb.group({
            feeName: new FormControl(null),
            feeDirection: new FormControl(null),
            frequency: new FormControl(null)
        });
        this.contractsClientDataForm.clientFees.push(form);
    }

    get clientFees(): FormArray {
        return this.contractsClientDataForm.get('clientFees') as FormArray;
    }

    removeFee(index: number) {
        this.clientFees.removeAt(index);
    }
    // #endregion CHANGE NAMING

    addConsultantDataToForm(consultant: any) {
        const form = this._fb.group({
            consultantName: new FormControl(consultant.name),
            specialContractTerms: new FormControl(null),
            isSpecialContractTermsNone: new FormControl(null),
            specialRates: new FormArray([this.initSpecialRateToConsultantData()]),
            clientFees: new FormArray([this.initClientFeesToConsultantData()]),
            projectLines: new FormArray([this.initProjectLinesToConsultantData()])
        });
        this.contractsConsultantsDataForm.consultantData.push(form);
    }

    get consultantData(): FormArray {
        return this.contractsConsultantsDataForm.get('consultantData') as FormArray;
    }

    // #region Consultant data Special Rates
    initSpecialRateToConsultantData() {
        const form = this._fb.group({
            rateName: new FormControl(null),
            rateDirection: new FormControl(null),
            reportingUnit: new FormControl(null)
        });
        return form;
    }

    addSpecialRateToConsultantData(index: number) {
        const form = this._fb.group({
            rateName: new FormControl(null),
            rateDirection: new FormControl(null),
            reportingUnit: new FormControl(null)
        });
        (this.contractsConsultantsDataForm.consultantData.at(index).get('specialRates') as FormArray).push(form);
    }

    removeConsultantDataSpecialRate(consultantIndex: number, rateIndex: number) {
        (this.contractsConsultantsDataForm.consultantData.at(consultantIndex).get('specialRates') as FormArray).removeAt(rateIndex);
    }

    getConsultantSpecialRateControls(index: number): AbstractControl[] | null {
        return (this.contractsConsultantsDataForm.consultantData.at(index).get('specialRates') as FormArray).controls;

    }
    // #endregion Consultant data Special Rates

    // Consultant data Client fees START REGION
    initClientFeesToConsultantData() {
        const form = this._fb.group({
            feeName: new FormControl(null),
            feeDirection: new FormControl(null),
            frequency: new FormControl(null)
        });
        return form;
    }

    addClientFeesToConsultantData(index: number) {
        const form = this._fb.group({
            feeName: new FormControl(null),
            feeDirection: new FormControl(null),
            frequency: new FormControl(null)
        });
        (this.contractsConsultantsDataForm.consultantData.at(index).get('clientFees') as FormArray).push(form);
    }

    removeConsultantDataClientFees(consultantIndex: number, rateIndex: number) {
        (this.contractsConsultantsDataForm.consultantData.at(consultantIndex).get('clientFees') as FormArray).removeAt(rateIndex);
    }

    getConsultantClientFeesControls(index: number): AbstractControl[] | null {
        return (this.contractsConsultantsDataForm.consultantData.at(index).get('clientFees') as FormArray).controls
    }
    // Consultant data Client fees END REGION

    // Consultant data Project Lines START REGION
    initProjectLinesToConsultantData() {
        const form = this._fb.group({
            feeName: new FormControl(null),
            feeDirection: new FormControl(null),
            frequency: new FormControl(null)
        });
        return form;
    }

    addProjectLinesToConsultantData(index: number) {
        const form = this._fb.group({
            feeName: new FormControl(null),
            feeDirection: new FormControl(null),
            frequency: new FormControl(null)
        });
        (this.contractsConsultantsDataForm.consultantData.at(index).get('projectLines') as FormArray).push(form);
    }

    removeConsultantDataProjectLines(consultantIndex: number, rateIndex: number) {
        (this.contractsConsultantsDataForm.consultantData.at(consultantIndex).get('projectLines') as FormArray).removeAt(rateIndex);
    }

    getConsultantProjectLinesControls(index: number): AbstractControl[] | null {
        return (this.contractsConsultantsDataForm.consultantData.at(index).get('projectLines') as FormArray).controls
    }
    // Consultant data Project Lines END REGION

    // form validations
    disableOrEnableInput(boolValue: boolean, control: AbstractControl | null | undefined) {
        if (boolValue) {
            // FIXME: do we need to clear input if it will be disabled ?
            control!.setValue(null, {emitEvent: false});
            control!.disable();
        } else {
            control!.enable();
        }
    }
}
