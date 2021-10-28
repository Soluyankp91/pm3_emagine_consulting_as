import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { pipe } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { ApiServiceProxy, ContractSignerDto, SalesClientDataUpdateRequestDto, SalesMainDataUpdateRequestDto, SalesServiceProxy, SignerRole, WorkflowsServiceProxy } from 'src/shared/service-proxies/service-proxies';
import { DeliveryTypes, IWorkflowNavigationStep, SaleTypes, WorkflowContractsSummaryForm, WorkflowNavigation, WorkflowSalesAdditionalDataForm, WorkflowSalesClientDataForm, WorkflowSalesConsultantsForm, WorkflowSalesExtensionForm, WorkflowSalesMainForm, WorkflowTerminationSalesForm } from './workflow.model';

@Component({
    selector: 'app-workflow',
    templateUrl: './workflow.component.html',
    styleUrls: ['./workflow.component.scss']
})
export class WorkflowComponent implements OnInit {
    workflowId: string;
    selectedIndex = 0;
    selectedStep = 'Sales';

    workflowNavigation = WorkflowNavigation;

    // SalesStep
    intracompanyActive = false;
    salesMainClientDataForm: WorkflowSalesClientDataForm;
    salesMainDataForm: WorkflowSalesMainForm;
    saleTypes = SaleTypes;
    deliveryTypes = DeliveryTypes;


    consultantsForm: WorkflowSalesConsultantsForm;
    additionalDataForm: WorkflowSalesAdditionalDataForm;
    contactSummaryForm: WorkflowContractsSummaryForm;
    salesExtensionForm: WorkflowSalesExtensionForm;
    terminationSalesForm: WorkflowTerminationSalesForm;
    constructor(
        private _fb: FormBuilder,
        private _workflowService: WorkflowsServiceProxy,
        private _workflowSalesService: SalesServiceProxy
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

    starWorkflow() {
        this._workflowService.start()
            .subscribe(result => {
                this.workflowId = result.workflowId!;
            });
    }

    saveSalesMainData() {
        let input: SalesMainDataUpdateRequestDto = new SalesMainDataUpdateRequestDto();
        input.salesTypeId = this.salesMainDataForm.salesType?.value;
        input.isNearshore = this.salesMainDataForm.nearshoreOffshore?.value === 'Nearshore';
        input.isOffshore = this.salesMainDataForm.nearshoreOffshore?.value  === 'Offshore';
        input.isNormal = false; // ISNORMAL ??
        input.isIntracompanySale = this.intracompanyActive;
        input.intracompanyAccountManagerId = this.salesMainDataForm.intracompanyAccountManager?.value;
        input.intracompanyTenantId = this.salesMainDataForm.intracompanyAccountManager?.value; // tenant?
        input.salesAccountManagerId = this.salesMainDataForm.salesAccountManager?.value;
        input.commissionAccountManagerId = this.salesMainDataForm.commissionAccountManager?.value;
        this._workflowSalesService.mainData(this.workflowId, input)
            .pipe(finalize(() => {

            }))
            .subscribe(result => {

            });
    }

    saveSalesClientData() {
        let input: SalesClientDataUpdateRequestDto = new SalesClientDataUpdateRequestDto();
        input.directClientId = this.salesMainClientDataForm.directClient?.value;
        input.clientInvoicingRecipientSameAsDirectClient = this.salesMainClientDataForm.isClientInvoicingNone?.value;
        input.clientInvoicingRecipientId = this.salesMainClientDataForm.clientInvoicingRecipient?.value;
        input.invoicingReferencePersonId = this.salesMainClientDataForm.clientInvoicingPeriod?.value;
        input.evaluationsDisabled = this.salesMainClientDataForm.disableEvaluations?.value;
        input.evaluationsDisabledReason = this.salesMainClientDataForm.disableEvaluations?.value;
        input.evaluationsReferencePersonId = this.salesMainClientDataForm.evaluationReferencePerson?.value;
        input.clientSpecialContractTerms = this.salesMainClientDataForm.specialContractTerms?.value;
        input.invoicingReferenceNumber = this.salesMainClientDataForm.invoicingReferenceNumber?.value;

        input.contractSigners = [];
        for (let i = 0; i < this.salesMainClientDataForm.clientSigners.value.length; i++) {
            let signer = this.salesMainClientDataForm.clientSigners.value[i];
            let contractSigner = new ContractSignerDto();
            contractSigner.order = i + 1;
            contractSigner.contractSignerId = signer.clientSigvens;
            contractSigner.signerRole = new SignerRole();
            contractSigner.signerRole.roleName = signer.clientRole;
            input.contractSigners.push(contractSigner);
        }
        this._workflowSalesService.clientData(this.workflowId, input)
            .pipe(finalize(() => {

            }))
            .subscribe(result => {

            });
    }


    addNewExtension() {

    }

    addNewTermination() {

    }


    setActiveStep(step: IWorkflowNavigationStep) {
        this.selectedStep = step.name;
    }

}
