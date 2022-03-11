import { Overlay } from '@angular/cdk/overlay';
import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { finalize } from 'rxjs/operators';
import { ClientPeriodContractsDataDto, ClientPeriodServiceProxy, ConsultantContractsDataDto, ContractsClientDataDto, ContractsMainDataDto, PeriodClientSpecialFeeDto, PeriodClientSpecialRateDto, PeriodConsultantSpecialFeeDto, PeriodConsultantSpecialRateDto } from 'src/shared/service-proxies/service-proxies';
import { WorkflowConsultantActionsDialogComponent } from '../workflow-consultant-actions-dialog/workflow-consultant-actions-dialog.component';
import { ConsultantDiallogAction } from '../workflow-sales/workflow-sales.model';
import { WorkflowSideSections } from '../workflow.model';
import { WorkflowContractsClientDataForm, WorkflowContractsConsultantsDataForm, WorkflowContractsMainForm, WorkflowContractsSyncForm } from './workflow-contracts.model';

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

    workflowSideSections = WorkflowSideSections;

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
        private _fb: FormBuilder,
        private overlay: Overlay,
        private dialog: MatDialog,
        private _clientPeriodService: ClientPeriodServiceProxy
    ) {
        this.contractsMainDataForm = new WorkflowContractsMainForm();
        this.contractsClientDataForm = new WorkflowContractsClientDataForm();
        this.contractsConsultantsDataForm = new WorkflowContractsConsultantsDataForm();
        this.contractsSyncDataForm = new WorkflowContractsSyncForm();
    }

    ngOnInit(): void {
        this.addSpecialRateToForm();
        this.addClientFeeToForm();
        this.consultantList.forEach(item =>this.addConsultantDataToForm(item));
        this.getSalesInfo();
    }

    getSalesInfo() {
        this._clientPeriodService.salesGet(this.clientPeriodId!)
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                console.log('s ', result);
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
        for (let specialRate of this.contractsClientDataForm.clientSpecialRates.value) {
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

    // #region CHANGE NAMING
    addSpecialRateToForm() {
        // TODO: add missing properties like on rate&fees
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
            // TODO: add missing properties like on rate&fees
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
        // TODO: add missing properties, id, employmentType, etc.
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
}
