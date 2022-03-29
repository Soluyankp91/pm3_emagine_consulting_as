import { Overlay } from '@angular/cdk/overlay';
import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { finalize } from 'rxjs/operators';
import { InternalLookupService } from 'src/app/shared/common/internal-lookup.service';
import { ClientPeriodContractsDataDto, ClientPeriodServiceProxy, ConsultantContractsDataDto, ConsultantTerminationContractDataDto, ContractsClientDataDto, ContractsMainDataDto, EnumEntityTypeDto, PeriodClientSpecialFeeDto, PeriodClientSpecialRateDto, PeriodConsultantSpecialFeeDto, PeriodConsultantSpecialRateDto, WorkflowProcessType, WorkflowServiceProxy, WorkflowTerminationContractDataDto, ProjectLineDto } from 'src/shared/service-proxies/service-proxies';
import { WorkflowConsultantActionsDialogComponent } from '../workflow-consultant-actions-dialog/workflow-consultant-actions-dialog.component';
import { WorkflowDataService } from '../workflow-data.service';
import { ConsultantDiallogAction } from '../workflow-sales/workflow-sales.model';
import { ConsultantTypes } from '../workflow.model';
import { WorkflowContractsClientDataForm, WorkflowContractsConsultantsDataForm, WorkflowContractsMainForm, WorkflowContractsSyncForm, WorkflowContractsTerminationConsultantsDataForm } from './workflow-contracts.model';

@Component({
    selector: 'app-workflow-contracts',
    templateUrl: './workflow-contracts.component.html',
    styleUrls: ['./workflow-contracts.component.scss']
})
export class WorkflowContractsComponent implements OnInit {
    @Input() workflowId: string;
    @Input() clientPeriodId: string | undefined;

    // Changed all above to enum
    @Input() activeSideSection: number;

    workflowSideSections = WorkflowProcessType;

    contractsMainDataForm: WorkflowContractsMainForm;
    contractsClientDataForm: WorkflowContractsClientDataForm;
    contractsConsultantsDataForm: WorkflowContractsConsultantsDataForm;
    contractsSyncDataForm: WorkflowContractsSyncForm;

    currencies: EnumEntityTypeDto[] = [];
    clientSpecialRateOrFeeDirections: EnumEntityTypeDto[] = [];
    clientSpecialRateReportUnits: EnumEntityTypeDto[] = [];
    clientSpecialFeeFrequencies: EnumEntityTypeDto[] = [];

    contractLinesDoneManuallyInOldPMControl = new FormControl();
    contractsTerminationConsultantForm: WorkflowContractsTerminationConsultantsDataForm;
    consultantId = 1;


    consultantList = [{
        id: 123,
        name: 'Robertsen Oscar',
        consultantProjectStartDate: new Date(2021, 4, 2),
        consultantProjectEndDate: new Date(2022, 4, 2),
        employmentTypeId: {id: 1, name: 'Employee'},
        consultantCapOnTimeReportingValue: null,
        consultantCapOnTimeReportingCurrency: null
    },
    {
        id: 1234,
        name: 'Van Trier Mia',
        consultantProjectStartDate: new Date(2021, 5, 3),
        consultantProjectEndDate: new Date(2022, 6, 3),
        employmentTypeId: {id: 2, name: 'Freelance'},
        consultantCapOnTimeReportingValue: null,
        consultantCapOnTimeReportingCurrency: null
    }];

    consultantTypes = ConsultantTypes;
    constructor(
        private _fb: FormBuilder,
        private overlay: Overlay,
        private dialog: MatDialog,
        private _clientPeriodService: ClientPeriodServiceProxy,
        private _workflowDataService: WorkflowDataService,
        private _internalLookupService: InternalLookupService,
        private _workflowServiceProxy: WorkflowServiceProxy
    ) {
        this.contractsMainDataForm = new WorkflowContractsMainForm();
        this.contractsClientDataForm = new WorkflowContractsClientDataForm();
        this.contractsConsultantsDataForm = new WorkflowContractsConsultantsDataForm();
        this.contractsSyncDataForm = new WorkflowContractsSyncForm();
        this.contractsTerminationConsultantForm = new WorkflowContractsTerminationConsultantsDataForm();
    }

    ngOnInit(): void {
        this.consultantList.forEach(item =>this.addConsultantDataToForm(item));
        this.getSalesInfo();
        this.getCurrencies();
        this.getSpecialRateOrFeeDirections();
        this.getSpecialRateReportUnits();
        this.getSpecialFeeFrequencies();

        // Termination
        this.getWorkflowContractsStepConsultantTermination();
        this.getWorkflowContractStepTermination();
    }

    getCurrencies() {
        this._internalLookupService.getCurrencies()
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.currencies = result;
            });
    }

    getSpecialRateOrFeeDirections() {
        this._internalLookupService.getSpecialRateOrFeeDirections()
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.clientSpecialRateOrFeeDirections = result;
            });
    }

    getSpecialRateReportUnits() {
        this._internalLookupService.getSpecialRateReportUnits()
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.clientSpecialRateReportUnits = result;
            });
    }

    getSpecialFeeFrequencies() {
        this._internalLookupService.getSpecialFeeFrequencies()
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.clientSpecialFeeFrequencies = result;
            });
    }

    getSalesInfo() {
        this._clientPeriodService.salesGet(this.clientPeriodId!)
            .pipe(finalize(() => {

            }))
            .subscribe(result => {

            });
    }

    saveContractsStep() {
        let input = new ClientPeriodContractsDataDto();
        input.clientData = new ContractsClientDataDto();

        input.clientData.specialContractTerms = undefined;
        input.clientData.noSpecialContractTerms = undefined;
        input.clientData.clientTimeReportingCapId = undefined;
        input.clientData.clientTimeReportingCapMaxValue = undefined;
        input.clientData.clientTimeReportingCapCurrencyId = undefined;
        input.clientData.noSpecialRate = undefined;
        input.clientData.noSpecialFee = undefined;
        input.clientData.periodClientSpecialRates = new Array<PeriodClientSpecialRateDto>();
        for (let specialRate of this.contractsClientDataForm.clientRates.value) {
            let clientSpecialRate = new PeriodClientSpecialRateDto();
            input.clientData.periodClientSpecialRates.push(clientSpecialRate);
        }
        input.clientData.periodClientSpecialFees = new Array<PeriodClientSpecialFeeDto>();
        for (let specialFee of this.contractsClientDataForm.clientFees.value) {
            let clientSpecialFee = new PeriodClientSpecialFeeDto();
            input.clientData.periodClientSpecialFees.push(clientSpecialFee);
        }
        input.contractLinesDoneManuallyInOldPm = this.contractsSyncDataForm.manualCheckbox?.value ?? false;

        input.mainData = new ContractsMainDataDto();
        input.mainData.projectDescription = this.contractsMainDataForm.projectDescription?.value;
        input.mainData.projectTypeId = this.contractsMainDataForm.projectType?.value?.id;
        input.mainData.salesTypeId = this.contractsMainDataForm.salesType?.value?.id;
        input.mainData.deliveryTypeId = this.contractsMainDataForm.deliveryType?.value?.id;
        input.mainData.marginId = this.contractsMainDataForm.margin?.value?.id;
        input.mainData.discountId = this.contractsMainDataForm.discounts?.value?.id;
        input.mainData.remarks = this.contractsMainDataForm.remarks?.value;
        input.mainData.noRemarks = this.contractsMainDataForm.noRemarks?.value;

        input.consultantData = new Array<ConsultantContractsDataDto>();
        for (let consultant of this.consultantData.value) {
            let consultantData = new ConsultantContractsDataDto();
            consultantData.consultantPeriodId = consultant.consultantPeriodId;
            consultantData.employmentTypeId = consultant.consultantPeriodId;
            consultantData.consultantId = consultant.consultantPeriodId;
            consultantData.nameOnly = consultant.consultantName;
            consultantData.consultantTimeReportingCapId = consultant.consultantPeriodId;
            consultantData.consultantTimeReportingCapMaxValue = consultant.consultantPeriodId;
            consultantData.consultantTimeReportingCapCurrencyId = consultant.consultantPeriodId;
            consultantData.noSpecialContractTerms = consultant.isSpecialContractTermsNone;
            consultantData.specialContractTerms = consultant.specialContractTerms;
            consultantData.noSpecialRate = consultant.consultantPeriodId;
            consultantData.noSpecialFee = consultant.consultantPeriodId;

            consultantData.periodConsultantSpecialFees = new Array<PeriodConsultantSpecialFeeDto>();
            for (let specialFee of consultant.clientFees) {
                let consultantFee = new PeriodConsultantSpecialFeeDto();
                consultantData.periodConsultantSpecialFees.push(consultantFee);
            }
            consultantData.periodConsultantSpecialRates = new Array<PeriodConsultantSpecialRateDto>();
            for (let specialFee of consultant.clientSpecialRates) {
                let consultantRate = new PeriodConsultantSpecialRateDto();
                consultantData.periodConsultantSpecialRates.push(consultantRate);
            }
            input.consultantData.push(consultantData);
        }

        this._clientPeriodService.contractsPut(this.clientPeriodId!, input)
            .pipe(finalize(() => {

            }))
            .subscribe(result => {

            });
    }

    getContractsStep() {

    }

    get readOnlyMode() {
        return this._workflowDataService.getWorkflowProgress.isWorkflowContractsSaved;
    }

    // #region CHANGE NAMING
    addSpecialRate(clientRate?: PeriodClientSpecialRateDto) {
        const form = this._fb.group({
            id: new FormControl(clientRate?.id ?? null),
            clientSpecialRateId: new FormControl(clientRate?.clientSpecialRateId ?? null),
            rateName: new FormControl(clientRate?.rateName ?? null),
            rateDirection: new FormControl(clientRate?.rateDirection?.id ?? null),
            reportingUnit: new FormControl(clientRate?.reportingUnit?.id ?? null),
            clientRateValue: new FormControl(clientRate?.clientRate ?? null),
            clientRateCurrency: new FormControl(clientRate?.clientRateCurrencyId ?? null),
            editable: new FormControl(clientRate ? false : true)
        });
        this.contractsClientDataForm.clientRates.push(form);
    }

    get clientRates(): FormArray {
        return this.contractsClientDataForm.get('clientRates') as FormArray;
    }

    removeClientRate(index: number) {
        this.clientRates.removeAt(index);
    }

    editOrSaveSpecialRate(isEditMode: boolean, index: number) {
        this.clientRates.at(index).get('editable')?.setValue(!isEditMode, {emitEvent: false});
    }

    addClientFee(clientFee?: PeriodClientSpecialFeeDto) {
        const form = this._fb.group({
            id: new FormControl(clientFee?.id ?? null),
            clientSpecialFeeId: new FormControl(clientFee?.clientSpecialFeeId ?? null),
            feeName: new FormControl(clientFee?.feeName ?? null),
            feeDirection: new FormControl(clientFee?.feeDirection ?? null),
            feeFrequency: new FormControl(clientFee?.frequency ?? null),
            clientRateValue: new FormControl(clientFee?.clientRate ?? null),
            clientRateCurrency: new FormControl(clientFee?.clientRateCurrencyId ?? null),

            editable: new FormControl(clientFee ? false : true)
        });
        this.contractsClientDataForm.clientFees.push(form);
    }

    get clientFees(): FormArray {
        return this.contractsClientDataForm.get('clientFees') as FormArray;
    }

    removeClientFee(index: number) {
        this.clientFees.removeAt(index);
    }

    editOrSaveClientFee(isEditMode: boolean, index: number) {
        this.clientFees.at(index).get('editable')?.setValue(!isEditMode, {emitEvent: false});
    }
    // #endregion CHANGE NAMING

    addConsultantDataToForm(consultant: any) {
        // TODO: add missing properties, id, employmentType, etc.
        const form = this._fb.group({
            consultantName: new FormControl(consultant.name),
            consultantProjectStartDate: new FormControl(consultant.consultantProjectStartDate),
            consultantProjectEndDate: new FormControl(consultant.consultantProjectEndDate),
            consultantType: new FormControl(this.displayConsultantEmploymentType(consultant.employmentTypeId)),
            consultantCapOnTimeReportingValue: new FormControl(consultant.consultantCapOnTimeReportingValue),
            consultantCapOnTimeReportingCurrency: new FormControl(consultant.consultantCapOnTimeReportingCurrency),
            specialContractTerms: new FormControl(null),
            isSpecialContractTermsNone: new FormControl(null),
            specialRates: new FormArray([]),
            clientFees: new FormArray([]),
            projectLines: new FormArray([])
        });
        this.contractsConsultantsDataForm.consultantData.push(form);
    }

    get consultantData(): FormArray {
        return this.contractsConsultantsDataForm.get('consultantData') as FormArray;
    }

    displayConsultantEmploymentType(employmentTypeId: number) {
        return this.consultantTypes.find(x => x.id === employmentTypeId)?.name!;
    }

    addSpecialRateToConsultantData(index: number, clientRate?: PeriodConsultantSpecialRateDto) {
        const form = this._fb.group({
            id: new FormControl(clientRate?.id ?? null),
            clientSpecialRateId: new FormControl(clientRate?.clientSpecialRateId ?? null),
            rateName: new FormControl(clientRate?.rateName ?? null),
            rateDirection: new FormControl(clientRate?.rateDirection?.id ?? null),
            reportingUnit: new FormControl(clientRate?.reportingUnit?.id ?? null),
            proDataRateValue: new FormControl(clientRate?.prodataToProdataRate ?? null),
            proDataRateCurrency: new FormControl(clientRate?.prodataToProdataRateCurrencyId ?? null),
            consultantRateValue: new FormControl(clientRate?.consultantRate ?? null),
            consultantRateCurrency: new FormControl(clientRate?.consultantRateCurrencyId ?? null),
            editable: new FormControl(clientRate ? false : true)
        });

        (this.contractsConsultantsDataForm.consultantData.at(index).get('specialRates') as FormArray).push(form);
    }

    removeConsultantDataSpecialRate(consultantIndex: number, rateIndex: number) {
        (this.contractsConsultantsDataForm.consultantData.at(consultantIndex).get('specialRates') as FormArray).removeAt(rateIndex);
    }

    editOrSaveConsultantSpecialRate(isEditMode: boolean, consultantIndex: number, rateIndex: number) {
        (this.consultantData.at(consultantIndex).get('specialRates') as FormArray).at(rateIndex).get('editable')?.setValue(!isEditMode, {emitEvent: false});
    }

    getConsultantSpecialRateControls(index: number): AbstractControl[] | null {
        return (this.contractsConsultantsDataForm.consultantData.at(index).get('specialRates') as FormArray).controls;

    }

    // #endregion Consultant data Special Rates

    // Consultant data Client fees START REGION

    addClientFeesToConsultantData(index: number, clientFee?: PeriodConsultantSpecialFeeDto) {
        const form = this._fb.group({
            id: new FormControl(clientFee?.id ?? null),
            clientSpecialFeeId: new FormControl(clientFee?.clientSpecialFeeId ?? null),
            feeName: new FormControl(clientFee?.feeName ?? null),
            feeDirection: new FormControl(clientFee?.feeDirection ?? null),
            frequency: new FormControl(clientFee?.frequency ?? null),
            proDataRateValue: new FormControl(clientFee?.prodataToProdataRate ?? null),
            proDataRateCurrency: new FormControl(clientFee?.prodataToProdataRateCurrencyId ?? null),
            consultantRateValue: new FormControl(clientFee?.consultantRate ?? null),
            consultantRateCurrency: new FormControl(clientFee?.consultantRateCurrencyId ?? null),
            editable: new FormControl(true)
        });
        (this.contractsConsultantsDataForm.consultantData.at(index).get('clientFees') as FormArray).push(form);
    }

    removeConsultantDataClientFees(consultantIndex: number, rateIndex: number) {
        (this.contractsConsultantsDataForm.consultantData.at(consultantIndex).get('clientFees') as FormArray).removeAt(rateIndex);
    }

    editOrSaveConsultantSpecialFee(isEditMode: boolean, consultantIndex: number, rateIndex: number) {
        (this.contractsConsultantsDataForm.consultantData.at(consultantIndex).get('clientFees') as FormArray).at(rateIndex).get('editable')?.setValue(!isEditMode, {emitEvent: false});
    }

    getConsultantClientFeesControls(index: number): AbstractControl[] | null {
        return (this.contractsConsultantsDataForm.consultantData.at(index).get('clientFees') as FormArray).controls
    }
    // Consultant data Client fees END REGION

    // Consultant data Project Lines START REGION
    addProjectLinesToConsultantData(index: number, projectLine?: ProjectLineDto) {
        const form = this._fb.group({
            id: new FormControl(projectLine?.id ?? null),
            projectName: new FormControl(projectLine?.projectName ?? null),
            startDate: new FormControl(projectLine?.startDate ?? null),
            endDate: new FormControl(projectLine?.endDate ?? null),
            invoicingReferenceNumber: new FormControl(projectLine?.invoicingReferenceNumber ?? null),
            invoicingReferencePersonId: new FormControl(projectLine?.invoicingReferencePersonId ?? null),
            optionalInvoicingInfo: new FormControl(projectLine?.optionalInvoicingInfo ?? null),
            differentDebtorNumber: new FormControl(projectLine?.differentDebtorNumber ?? null),
            debtorNumber: new FormControl(projectLine?.debtorNumber ?? null),
            differentInvoiceRecipient: new FormControl(projectLine?.differentInvoiceRecipient ?? null),
            invoiceRecipientId: new FormControl(projectLine?.invoiceRecipientId ?? null),
            modifiedById: new FormControl(projectLine?.modifiedById ?? null),
            modificationDate: new FormControl(projectLine?.modificationDate ?? null),
            editable: new FormControl(projectLine?.id ? false : true)
        });
        (this.contractsConsultantsDataForm.consultantData.at(index).get('projectLines') as FormArray).push(form);
    }

    removeConsultantDataProjectLines(consultantIndex: number, rateIndex: number) {
        (this.contractsConsultantsDataForm.consultantData.at(consultantIndex).get('projectLines') as FormArray).removeAt(rateIndex);
    }

    editOrSaveConsultantProjectLine(isEditMode: boolean, consultantIndex: number, rateIndex: number) {
        (this.contractsConsultantsDataForm.consultantData.at(consultantIndex).get('projectLines') as FormArray).at(rateIndex).get('editable')?.setValue(!isEditMode, {emitEvent: false});
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

    //#region Consultant menu actions
    changeConsultantData(index: number) {
        const consultantData = this.contractsConsultantsDataForm.consultantData.at(index).value;
        console.log('change consultant ', consultantData);
        const scrollStrategy = this.overlay.scrollStrategies.reposition();
        const dialogRef = this.dialog.open(WorkflowConsultantActionsDialogComponent, {
            minWidth: '450px',
            minHeight: '180px',
            height: 'auto',
            width: 'auto',
            scrollStrategy,
            backdropClass: 'backdrop-modal--wrapper',
            autoFocus: false,
            panelClass: 'confirmation-modal',
            data: {
                dialogType: ConsultantDiallogAction.Change,
                consultantData: consultantData,
                dialogTitle: `Change consultant`,
                rejectButtonText: 'Cancel',
                confirmButtonText: 'Create',
                isNegative: false
            }
        });

        dialogRef.componentInstance.onConfirmed.subscribe((result) => {
            console.log('new date ', result?.newCutoverDate, 'new contract required ', result?.newLegalContractRequired);
            // call API to change consultant
        });

        dialogRef.componentInstance.onRejected.subscribe(() => {
            // nthng
        });
    }

    extendConsultant(index: number) {
        const consultantData = this.contractsConsultantsDataForm.consultantData.at(index).value;
        console.log('extend consultant ', consultantData);
        const scrollStrategy = this.overlay.scrollStrategies.reposition();
        const dialogRef = this.dialog.open(WorkflowConsultantActionsDialogComponent, {
            minWidth: '450px',
            minHeight: '180px',
            height: 'auto',
            width: 'auto',
            scrollStrategy,
            backdropClass: 'backdrop-modal--wrapper',
            autoFocus: false,
            panelClass: 'confirmation-modal',
            data: {
                dialogType: ConsultantDiallogAction.Extend,
                consultantData: consultantData,
                dialogTitle: `Extend consultant`,
                rejectButtonText: 'Cancel',
                confirmButtonText: 'Create',
                isNegative: false
            }
        });

        dialogRef.componentInstance.onConfirmed.subscribe((result) => {
            console.log('start date ', result?.startDate, 'end date ', result?.endDate, 'no end date ', result?.noEndDate);
            // call API to change consultant
        });

        dialogRef.componentInstance.onRejected.subscribe(() => {
            // nthng
        });
    }

    terminateConsultant(index: number) {
        const consultantData = this.contractsConsultantsDataForm.consultantData.at(index).value;
        console.log('terminate consultant ', consultantData);
    }

    //#endregion Consultant menu actions

    compareWithFn(listOfItems: any, selectedItem: any) {
        return listOfItems && selectedItem && listOfItems.id === selectedItem.id;;
    }

    displayNameFn(option: any) {
        return option?.name;
    }

    // Termination

    addConsultantDataToTerminationForm(consultant: ConsultantTerminationContractDataDto) {
        const form = this._fb.group({
            consultantId: new FormControl(consultant.consultantId),
            // consultantName: new FormControl(consultant.name),
            removedConsultantFromAnyManualChecklists: new FormControl(consultant.removedConsultantFromAnyManualChecklists),
            deletedAnySensitiveDocumentsForGDPR: new FormControl(consultant.deletedAnySensitiveDocumentsForGDPR),

        });
        this.contractsTerminationConsultantForm.consultantTerminationContractData.push(form);
    }

    get consultantTerminationContractData(): FormArray {
        return this.contractsTerminationConsultantForm.get('consultantTerminationContractData') as FormArray;
    }

    getWorkflowContractsStepConsultantTermination() {
        this._workflowServiceProxy.terminationConsultantContractGet(this.workflowId!, this.consultantId!)
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                // End of Consultant Contract
                this.contractLinesDoneManuallyInOldPMControl?.setValue(result?.contractLinesDoneManuallyInOldPM, {emitEvent: false});
                this.addConsultantDataToTerminationForm(result);
            });
    }

    updateTerminationConsultantContractStep() {
        let input = new ConsultantTerminationContractDataDto();
        input.consultantId = this.contractsTerminationConsultantForm.consultantTerminationContractData?.value.consultantId;
        input.contractLinesDoneManuallyInOldPM = this.contractLinesDoneManuallyInOldPMControl?.value;
        input.removedConsultantFromAnyManualChecklists = this.contractsTerminationConsultantForm.consultantTerminationContractData?.value.removedConsultantFromAnyManualChecklists;
        input.deletedAnySensitiveDocumentsForGDPR = this.contractsTerminationConsultantForm.consultantTerminationContractData?.value.deletedAnySensitiveDocumentsForGDPR;

        this._workflowServiceProxy.terminationConsultantContractPut(this.workflowId!, input)
            .pipe(finalize(() => {

            }))
            .subscribe(result => {

            })
    }

    completeTerminationConsultantContractStep() {
        let input = new ConsultantTerminationContractDataDto();

        input.consultantId = this.contractsTerminationConsultantForm.consultantTerminationContractData?.value.consultantId;
        input.contractLinesDoneManuallyInOldPM = this.contractLinesDoneManuallyInOldPMControl?.value;
        input.removedConsultantFromAnyManualChecklists = this.contractsTerminationConsultantForm.consultantTerminationContractData?.value.removedConsultantFromAnyManualChecklists;
        input.deletedAnySensitiveDocumentsForGDPR = this.contractsTerminationConsultantForm.consultantTerminationContractData?.value.deletedAnySensitiveDocumentsForGDPR;

        this._workflowServiceProxy.terminationConsultantContractComplete(this.workflowId!, input)
            .pipe(finalize(() => {

            }))
            .subscribe(result => {

            })
    }

    getWorkflowContractStepTermination() {
        this._workflowServiceProxy.terminationContractGet(this.workflowId!)
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                // End of Consultant Contract
                this.contractLinesDoneManuallyInOldPMControl?.setValue(result?.contractLinesDoneManuallyInOldPM, {emitEvent: false});
                result.consultantTerminationContractData?.forEach(data => {
                    this.addConsultantDataToTerminationForm(data);
                })
            });
    }

    updateTerminationContractStep() {
        let input = new WorkflowTerminationContractDataDto();
        input.contractLinesDoneManuallyInOldPM = this.contractLinesDoneManuallyInOldPMControl?.value;
        input.consultantTerminationContractData = this.contractsTerminationConsultantForm.consultantTerminationContractData?.value

        input.consultantTerminationContractData = new Array<ConsultantTerminationContractDataDto>();
        if (this.contractsTerminationConsultantForm.consultantTerminationContractData.value?.length) {
            this.contractsTerminationConsultantForm.consultantTerminationContractData.value.forEach((consultant: any) => {
                let consultantInput = new ConsultantTerminationContractDataDto();
                consultantInput.consultantId = consultant.consultantId;
                consultantInput.contractLinesDoneManuallyInOldPM = consultant.contractLinesDoneManuallyInOldPM;
                consultantInput.removedConsultantFromAnyManualChecklists = consultant.removedConsultantFromAnyManualChecklists;
                consultantInput.deletedAnySensitiveDocumentsForGDPR = consultant.deletedAnySensitiveDocumentsForGDPR;

                input.consultantTerminationContractData!.push(consultantInput);
            });
        }

        this._workflowServiceProxy.terminationContractPut(this.workflowId!, input)
            .pipe(finalize(() => {

            }))
            .subscribe(result => {

            })
    }

    completeTerminationContractStep() {
        let input = new WorkflowTerminationContractDataDto();
        input.contractLinesDoneManuallyInOldPM = this.contractLinesDoneManuallyInOldPMControl?.value;
        input.consultantTerminationContractData = this.contractsTerminationConsultantForm.consultantTerminationContractData?.value

        input.consultantTerminationContractData = new Array<ConsultantTerminationContractDataDto>();
        if (this.contractsTerminationConsultantForm.consultantTerminationContractData.value?.length) {
            this.contractsTerminationConsultantForm.consultantTerminationContractData.value.forEach((consultant: any) => {
                let consultantInput = new ConsultantTerminationContractDataDto();
                consultantInput.consultantId = consultant.consultantId;
                consultantInput.contractLinesDoneManuallyInOldPM = consultant.contractLinesDoneManuallyInOldPM;
                consultantInput.removedConsultantFromAnyManualChecklists = consultant.removedConsultantFromAnyManualChecklists;
                consultantInput.deletedAnySensitiveDocumentsForGDPR = consultant.deletedAnySensitiveDocumentsForGDPR;

                input.consultantTerminationContractData!.push(consultantInput);
            });
        }

        this._workflowServiceProxy.terminationContractComplete(this.workflowId!, input)
            .pipe(finalize(() => {

            }))
            .subscribe(result => {

            })
    }
}
