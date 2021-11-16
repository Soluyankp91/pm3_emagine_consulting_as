import { Component, Injector, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { AppComopnentBase } from 'src/shared/app-component-base';
import { ClientRateDto, ContractSignerDto, EnumEntityTypeDto, EnumServiceProxy, SignerRole, WorkflowConsultantDto, WorkflowSalesDataDto, WorkflowsServiceProxy } from 'src/shared/service-proxies/service-proxies';
import { WorkflowDataService } from '../workflow-data.service';
import { WorkflowSalesAdditionalDataForm, WorkflowSalesClientDataForm, WorkflowSalesConsultantsForm, WorkflowSalesMainForm } from './workflow-sales.model';
@Component({
    selector: 'app-workflow-sales',
    templateUrl: './workflow-sales.component.html',
    styleUrls: ['./workflow-sales.component.scss']
})
export class WorkflowSalesComponent extends AppComopnentBase implements OnInit {
    @Input() workflowId: string;
    // SalesStep
    intracompanyActive = false;
    salesMainClientDataForm: WorkflowSalesClientDataForm;
    salesMainDataForm: WorkflowSalesMainForm;
    consultantsForm: WorkflowSalesConsultantsForm;
    additionalDataForm: WorkflowSalesAdditionalDataForm;

    clientSpecialRateActive = false;
    clientSpecialFeesActive = false;

    deliveryTypes: EnumEntityTypeDto[] = [];
    currencies: EnumEntityTypeDto[] = [];
    saleTypes: EnumEntityTypeDto[] = [];
    invoicingTimes: EnumEntityTypeDto[] = [];
    constructor(
        injector: Injector,
        private _fb: FormBuilder,
        private _enumService: EnumServiceProxy,
        private _workflowService: WorkflowsServiceProxy,
        private _workflodDataService: WorkflowDataService
    ) {
        super(injector);
        this.salesMainClientDataForm = new WorkflowSalesClientDataForm();
        this.salesMainDataForm = new WorkflowSalesMainForm();
        this.consultantsForm = new WorkflowSalesConsultantsForm();
        this.additionalDataForm = new WorkflowSalesAdditionalDataForm();
    }

    ngOnInit(): void {
        // get enums
        this.getCurrencies();
        this.getDeliveryTypes();
        this.getSaleTypes();
        this.getInvoicingTimes();
        // init form to add signers array
        this.addSignerToForm();
        this.addConsultantForm();

        this.getWorkflowSalesStep();
    }

    getCurrencies() {
        this._workflodDataService.getCurrencies()
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.currencies = result;
            });
    }

    getDeliveryTypes() {
        this._workflodDataService.getDeliveryTypes()
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.deliveryTypes = result;
            });
    }

    getSaleTypes() {
        this._workflodDataService.getSaleTypes()
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.saleTypes = result;
            });
    }

    getInvoicingTimes() {
        this._workflodDataService.getInvoicingTimes()
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.invoicingTimes = result;
            });
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
            consultantName: new FormControl(null),
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
        this._workflodDataService.addOrUpdateConsultantTab(this.consultantsForm.consultantData.length - 1, form.get('consultantName')?.value);
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
        this._workflodDataService.removeConsultantTab(index);
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

    saveSalesStep(workflowId: string) {
        let input = new WorkflowSalesDataDto();
        input.salesTypeId = this.salesMainDataForm.salesType?.value;
        input.deliveryTypeId = this.salesMainDataForm.nearshoreOffshore?.value;
        input.salesAccountManagerIdValue = this.salesMainDataForm.salesAccountManager?.value;
        input.commissionAccountManagerIdValue = this.salesMainDataForm.commissionAccountManager?.value;
        input.directClientIdValue = this.salesMainClientDataForm.directClient?.value;
        input.endClientIdValue = this.salesMainClientDataForm.invoicingProDataEntity?.value;
        input.pdcInvoicingEntityId = this.salesMainClientDataForm.clientInvoicingReferencePerson?.value;
        input.clientInvoicingRecipientSameAsDirectClient = this.salesMainClientDataForm.sameAsDirectClient?.value;
        // FIXME: fix after design changes
        input.clientInvoicingRecipientIdValue = this.salesMainClientDataForm.invoicingProDataEntity?.value;
        // FIXME: fix after design changes
        input.noInvoicingReferencePerson = this.salesMainClientDataForm.isClientInvoicingNone?.value ? this.salesMainClientDataForm.isClientInvoicingNone?.value : false;
        // FIXME: fix after design changes
        input.invoicingReferencePersonIdValue = this.salesMainClientDataForm.clientInvoicingReferencePerson?.value;
        // FIXME: fix after design changes
        input.evaluationsReferencePersonIdValue = this.salesMainClientDataForm.evaluationReferencePerson?.value;
        input.evaluationsDisabled = this.salesMainClientDataForm.disableEvaluations?.value ? this.salesMainClientDataForm.disableEvaluations?.value : false;
        input.evaluationsDisabledReason = this.salesMainClientDataForm.disableEvaluationsReason?.value;
        input.contractSigners = [];
        for (let i = 0; i < this.salesMainClientDataForm.clientSigners.value.length; i++) {
            let signer = this.salesMainClientDataForm.clientSigners.value[i];
            let contractSigner = new ContractSignerDto();
            contractSigner.signOrder = i + 1;
            contractSigner.contactId = signer.clientSigvens;
            contractSigner.signerRole = new SignerRole();
            input.contractSigners.push(contractSigner);
        }
        input.noSpecialContractTerms = this.salesMainClientDataForm.isSpecialContractTermsNone?.value ? this.salesMainClientDataForm.isSpecialContractTermsNone?.value : false;
        input.specialContractTerms = this.salesMainClientDataForm.specialContractTerms?.value;
        // FIXME: fix after design changes
        input.noInvoicingReferenceNumber = false;
        input.invoicingReferenceNumber = this.salesMainClientDataForm.invoicingReferenceNumber?.value;
        input.clientRate = new ClientRateDto();
        // input.clientRate.isTimeBasedRate = this.salesMainClientDataForm.isTimeBasedRate.value;
        // input.clientRate.isFixedRate = this.salesMainClientDataForm.isFixedRate.value;
        input.clientRate.currencyId = this.salesMainClientDataForm.clientCurrency?.value;
        input.clientRate.invoiceCurrencyId = this.salesMainClientDataForm.clientInvoiceCurrency?.value;
        // input.clientRate.normalRate = this.salesMainClientDataForm.normalRate.value;
        // input.clientRate.rateUnitTypeId = this.salesMainClientDataForm.rateUnitTypeId.value;
        // input.clientRate.customInvoiceFrequency = this.salesMainClientDataForm.customInvoiceFrequency.value;
        // input.clientRate.price = this.salesMainClientDataForm.price.value;
        // input.clientRate.invoicingTimeId = this.salesMainClientDataForm.invoicingTimeId.value;

        // FIXME: fix after design changes
        // input.noClientSpecialRate = this.salesMainClientDataForm.clientRateAndInvoicing?.value;
        // input.clientSpecialRates = this.salesMainClientDataForm.clientSpecialRates.value; // number[]

        input.noClientSpecialFee = !this.clientSpecialFeesActive;
        // FIXME: fix after design changes
        // "clientSpecialFees": [
        //     0
        // ],
        input.contractStartDate = this.salesMainClientDataForm.clientContractStartDate?.value;
        input.contractEndDate = this.salesMainClientDataForm.clientContractEndDate?.value;
        input.noContractEndDate = this.salesMainClientDataForm.clientContractNoEndDate?.value ? this.salesMainClientDataForm.clientContractNoEndDate?.value : false;

        input.noClientExtensionOption = this.salesMainClientDataForm.clientExtensionNoEndDate?.value ? this.salesMainClientDataForm.clientExtensionNoEndDate?.value : false;
        input.clientExtensionDurationId = this.salesMainClientDataForm.clientExtensionStartDate?.value;
        // input.clientExtensionDeadlineId = this.salesMainClientDataForm.clientExtensionNoEndDate?.value;
        // "clientExtensionDeadlineId": 0,

        // "workflowConsultants": [
        //     {
        //     "idValue": 0,
        //     "employmentTypeId": 0,
        //     "nameOnly": "string",
        //     "pdcPaymentEntityId": 0,
        //     "specialContractTerms": "string",
        //     "contractStartDate": "2021-11-03T10:24:48.207Z",
        //     "isNoContractEndDate": true,
        //     "contractEndDate": "2021-11-03T10:24:48.207Z",
        //     "isOnsiteWorkplace": true,
        //     "isRemoteWorkplace": true,
        //     "isMixedWorkplace": true,
        //     "mainOnsiteClientId": 0,
        //     "mainRemoteAddressCountryId": 0,
        //     "noExpectedWorkload": true,
        //     "expectedWorkloadHours": 0,
        //     "expectedWorkloadUnitId": 0,
        //     "noCap": true,
        //     "sharedCap": true,
        //     "capOnMaxNumberOfUnits": 0,
        //     "capOnMaxTotalValue": 0,
        //     "deliveryManagerSameAsAccountManager": true,
        //     "deliveryAccountManagerIdValue": 0
        //     }
        // ],
        input.workflowConsultants = new Array<WorkflowConsultantDto>();
        for (let i = 0; i < this.consultantsForm.consultantData.value.length; i++) {
            let consultant = this.consultantsForm.consultantData.value[i];
            let workflowConsultant = new WorkflowConsultantDto();
            workflowConsultant.idValue = consultant.idValue;
            workflowConsultant.employmentTypeId = consultant.employmentTypeId;
            workflowConsultant.nameOnly = consultant.nameOnly;
            workflowConsultant.pdcPaymentEntityId = consultant.pdcPaymentEntityId;
            workflowConsultant.specialContractTerms = consultant.specialContractTerms;
            workflowConsultant.contractStartDate = consultant.contractStartDate;
            workflowConsultant.isNoContractEndDate = consultant.isNoContractEndDate;
            workflowConsultant.contractEndDate = consultant.contractEndDate;
            workflowConsultant.isOnsiteWorkplace = consultant.isOnsiteWorkplace;
            workflowConsultant.isRemoteWorkplace = consultant.isRemoteWorkplace;
            workflowConsultant.isMixedWorkplace = consultant.isMixedWorkplace;
            workflowConsultant.mainOnsiteClientId = consultant.mainOnsiteClientId;
            workflowConsultant.mainRemoteAddressCountryId = consultant.mainRemoteAddressCountryId;
            workflowConsultant.noExpectedWorkload = consultant.noExpectedWorkload;
            workflowConsultant.expectedWorkloadHours = consultant.expectedWorkloadHours;
            workflowConsultant.expectedWorkloadUnitId = consultant.expectedWorkloadUnitId;
            workflowConsultant.noCap = consultant.noCap;
            workflowConsultant.sharedCap = consultant.sharedCap;
            workflowConsultant.capOnMaxNumberOfUnits = consultant.capOnMaxNumberOfUnits;
            workflowConsultant.capOnMaxTotalValue = consultant.capOnMaxTotalValue;
            workflowConsultant.deliveryManagerSameAsAccountManager = consultant.deliveryManagerSameAsAccountManager;
            workflowConsultant.deliveryAccountManagerIdValue = consultant.deliveryAccountManagerIdValue;
            input.workflowConsultants.push(consultant);
        }
        input.projectDescription = this.additionalDataForm.projectDescription?.value;
        input.marginId = this.additionalDataForm.highLowMargin?.value;
        input.remarks = this.additionalDataForm.remarks?.value;

        this._workflowService.salesPut(this.workflowId, input)
            .pipe(finalize(() => {
                this.updateConsultantTabs();
            }))
            .subscribe(result => {

            });
    }

    updateConsultantTabs() {
        for (let i = 0; i < this.consultantsForm.consultantData.value.length; i++) {
            let consultant = this.consultantsForm.consultantData.value[i];
            this._workflodDataService.addOrUpdateConsultantTab(this.consultantsForm.consultantData.length - 1, consultant.consultantName);
        }
    }

    getWorkflowSalesStep() {
        this._workflowService.salesGet(this.workflowId)
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.salesMainDataForm.salesType?.setValue(result.salesTypeId, {emitEvent: false});
                this.salesMainDataForm.nearshoreOffshore?.setValue(result.deliveryTypeId, {emitEvent: false});
                this.salesMainDataForm.salesAccountManager?.setValue(result.salesAccountManagerIdValue, {emitEvent: false});
                this.salesMainDataForm.commissionAccountManager?.setValue(result.commissionAccountManagerIdValue, {emitEvent: false});
                this.salesMainClientDataForm.directClient?.setValue(result.directClientIdValue, {emitEvent: false});
                this.salesMainClientDataForm.invoicingProDataEntity?.setValue(result.endClientIdValue, {emitEvent: false});
                this.salesMainClientDataForm.clientInvoicingReferencePerson?.setValue(result.pdcInvoicingEntityId, {emitEvent: false});
                this.salesMainClientDataForm.sameAsDirectClient?.setValue(result.clientInvoicingRecipientSameAsDirectClient, {emitEvent: false});
            });
    }

    toggleClientFees() {
        this.salesMainClientDataForm.clientFees?.setValue(null, {emitEvent: false})
        this.salesMainClientDataForm.clientFeesCurrency?.setValue(null, {emitEvent: false});
        this.clientSpecialFeesActive = !this.clientSpecialFeesActive;
    }

    toggleSpecialClientRates() {
        this.salesMainClientDataForm.clientSpecialRatePrice?.setValue(null, {emitEvent: false})
        this.salesMainClientDataForm.clientSpecialRateCurrency?.setValue(null, {emitEvent: false});
        this.clientSpecialRateActive = !this.clientSpecialRateActive;
    }

}
