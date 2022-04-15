import { Overlay } from '@angular/cdk/overlay';
import { Component, Injector, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { InternalLookupService } from 'src/app/shared/common/internal-lookup.service';
import { AppComopnentBase } from 'src/shared/app-component-base';
import { ClientPeriodContractsDataDto, WorkflowProcessType, WorkflowServiceProxy, ClientPeriodServiceProxy, ConsultantContractsDataDto, ConsultantSalesDataDto, ContractsClientDataDto, ContractsMainDataDto, EnumEntityTypeDto, PeriodClientSpecialFeeDto, PeriodClientSpecialRateDto, PeriodConsultantSpecialFeeDto, PeriodConsultantSpecialRateDto, ProjectLineDto, ConsultantTerminationContractDataCommandDto, WorkflowTerminationContractDataCommandDto, ConsultantTerminationContractDataQueryDto } from 'src/shared/service-proxies/service-proxies';
import { WorkflowConsultantActionsDialogComponent } from '../workflow-consultant-actions-dialog/workflow-consultant-actions-dialog.component';
import { WorkflowDataService } from '../workflow-data.service';
import { ConsultantDiallogAction } from '../workflow-sales/workflow-sales.model';
import { ConsultantTypes, ProjectLineDiallogMode } from '../workflow.model';
import { AddOrEditProjectLineDialogComponent } from './add-or-edit-project-line-dialog/add-or-edit-project-line-dialog.component';
import { WorkflowContractsClientDataForm, WorkflowContractsConsultantsDataForm, WorkflowContractsMainForm, WorkflowContractsSyncForm, WorkflowContractsTerminationConsultantsDataForm } from './workflow-contracts.model';

@Component({
    selector: 'app-workflow-contracts',
    templateUrl: './workflow-contracts.component.html',
    styleUrls: ['./workflow-contracts.component.scss']
})
export class WorkflowContractsComponent extends AppComopnentBase implements OnInit, OnDestroy {
    @Input() workflowId: string;
    @Input() clientPeriodId: string | undefined;

    // Changed all above to enum
    @Input() activeSideSection: number;
    @Input() isCompleted: boolean;

    workflowSideSections = WorkflowProcessType;

    contractsMainForm: WorkflowContractsMainForm;
    contractClientForm: WorkflowContractsClientDataForm;
    contractsConsultantsDataForm: WorkflowContractsConsultantsDataForm;
    contractsSyncDataForm: WorkflowContractsSyncForm;

    currencies: EnumEntityTypeDto[] = [];
    discounts: EnumEntityTypeDto[] = [];
    deliveryTypes: EnumEntityTypeDto[] = [];
    saleTypes: EnumEntityTypeDto[] = [];
    projectTypes: EnumEntityTypeDto[] = [];
    margins: EnumEntityTypeDto[] = [];
    clientTimeReportingCap: EnumEntityTypeDto[] = [];
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
    private _unsubscribe = new Subject();

    constructor(
        injector: Injector,
        private _fb: FormBuilder,
        private overlay: Overlay,
        private dialog: MatDialog,
        private _clientPeriodService: ClientPeriodServiceProxy,
        private _workflowDataService: WorkflowDataService,
        private _internalLookupService: InternalLookupService,
        private _workflowServiceProxy: WorkflowServiceProxy
    ) {
        super(injector);
        this.contractsMainForm = new WorkflowContractsMainForm();
        this.contractClientForm = new WorkflowContractsClientDataForm();
        this.contractsConsultantsDataForm = new WorkflowContractsConsultantsDataForm();
        this.contractsSyncDataForm = new WorkflowContractsSyncForm();
        this.contractsTerminationConsultantForm = new WorkflowContractsTerminationConsultantsDataForm();
        this._workflowDataService.workflowContractsSaved
            .pipe(takeUntil(this._unsubscribe))
            .subscribe((value: boolean) => {
                // NB: boolean SAVE DRAFT or COMPLETE in future
                this.saveContractsStep();
            });
    }

    ngOnInit(): void {
        this.getCurrencies();
        this.getSpecialRateOrFeeDirections();
        this.getSpecialRateReportUnits();
        this.getSpecialFeeFrequencies();

        this.getDiscounts();
        this.getDeliveryTypes();
        this.getSaleTypes();
        this.getClientTimeReportingCap();
        this.getProjectTypes();
        this.getMargins();

        this.getContractsStep();

        // Termination

        switch (this.activeSideSection) {
            case this.workflowSideSections.TerminateWorkflow:
                this.getWorkflowContractStepTermination();
                break;
            case this.workflowSideSections.TerminateConsultant:
                this.getWorkflowContractsStepConsultantTermination();
                break;
        }

        this._workflowDataService.workflowConsultantTerminationContractsSaved
            .pipe(takeUntil(this._unsubscribe))
            .subscribe((value: boolean) => {
                this.updateTerminationConsultantContractStep();
            });

        this._workflowDataService.workflowConsultantTerminationContractsCompleted
            .pipe(takeUntil(this._unsubscribe))
            .subscribe((value: boolean) => {
                this.completeTerminationConsultantContractStep();
            });

        this._workflowDataService.workflowTerminationContractsSaved
            .pipe(takeUntil(this._unsubscribe))
            .subscribe((value: boolean) => {
                this.updateTerminationContractStep();
            });

        this._workflowDataService.workflowTerminationContractsCompleted
            .pipe(takeUntil(this._unsubscribe))
            .subscribe((value: boolean) => {
                this.completeTerminationContractStep();
            });
    }

    ngOnDestroy(): void {
        this._unsubscribe.next();
        this._unsubscribe.complete();
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

    getDiscounts() {
        this._internalLookupService.getDiscounts()
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.discounts = result;
            });
    }

    getDeliveryTypes() {
        this._internalLookupService.getDeliveryTypes()
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.deliveryTypes = result;
            });
    }

    getSaleTypes() {
        this._internalLookupService.getSaleTypes()
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.saleTypes = result;
            });
    }

    getProjectTypes() {
        this._internalLookupService.getProjectTypes()
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.projectTypes = result;
            });
    }

    getMargins() {
        this._internalLookupService.getMargins()
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.margins = result;
            });
    }

    getClientTimeReportingCap() {
        this._internalLookupService.getClientTimeReportingCap()
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.clientTimeReportingCap = result;
            });
    }

    getContractsStep() {
        this.showMainSpinner();
        this._clientPeriodService.contractsGet(this.clientPeriodId!)
            .pipe(finalize(() => {
                this.hideMainSpinner();
            }))
            .subscribe(result => {
                // Main data
                this.contractsMainForm.salesType?.setValue(this.findItemById(this.saleTypes, result.mainData?.salesTypeId), {emitEvent: false});
                this.contractsMainForm.deliveryType?.setValue(this.findItemById(this.deliveryTypes, result.mainData?.deliveryTypeId), {emitEvent: false});
                this.contractsMainForm.discounts?.setValue(this.findItemById(this.discounts, result.mainData?.discountId), {emitEvent: false});
                this.contractsMainForm.projectType?.setValue(this.findItemById(this.projectTypes, result.mainData?.projectTypeId), {emitEvent: false});
                this.contractsMainForm.margin?.setValue(this.findItemById(this.margins, result.mainData?.marginId), {emitEvent: false});
                this.contractsMainForm.projectDescription?.setValue(result.mainData?.projectDescription, {emitEvent: false});
                this.contractsMainForm.remarks?.setValue(result.mainData?.projectTypeId, {emitEvent: false});
                this.contractsMainForm.noRemarks?.setValue(result.mainData?.noRemarks, {emitEvent: false});

                // Client data
                this.contractClientForm.capOnTimeReporting?.setValue(this.findItemById(this.clientTimeReportingCap, result.clientData?.clientTimeReportingCapId), {emitEvent: false});
                this.contractClientForm.specialContractTerms?.setValue(result.clientData?.specialContractTerms, {emitEvent: false});
                this.contractClientForm.noSpecialContractTerms?.setValue(result.clientData?.noSpecialContractTerms, {emitEvent: false})

                // add rates
                // add fees

                if (result.consultantData?.length) {
                    result.consultantData.forEach((consultant: ConsultantContractsDataDto, index) => {
                        this.addConsultantDataToForm(consultant, index);
                    })
                }
            });
    }

    saveContractsStep() {
        let input = new ClientPeriodContractsDataDto();
        input.clientData = new ContractsClientDataDto();

        input.clientData.specialContractTerms = this.contractClientForm.specialContractTerms?.value;;
        input.clientData.noSpecialContractTerms = this.contractClientForm.noSpecialContractTerms?.value;;
        input.clientData.clientTimeReportingCapId = this.contractClientForm.specialContractTerms?.value;;
        input.clientData.clientTimeReportingCapMaxValue = this.contractClientForm.specialContractTerms?.value;;
        input.clientData.clientTimeReportingCapCurrencyId = this.contractClientForm.specialContractTerms?.value;;
        input.clientData.noSpecialRate = this.contractClientForm.specialContractTerms?.value;;
        input.clientData.noSpecialFee = this.contractClientForm.specialContractTerms?.value;;
        input.clientData.periodClientSpecialRates = new Array<PeriodClientSpecialRateDto>();
        for (let specialRate of this.contractClientForm.clientRates.value) {
            let clientSpecialRate = new PeriodClientSpecialRateDto();
            input.clientData.periodClientSpecialRates.push(clientSpecialRate);
        }
        input.clientData.periodClientSpecialFees = new Array<PeriodClientSpecialFeeDto>();
        for (let specialFee of this.contractClientForm.clientFees.value) {
            let clientSpecialFee = new PeriodClientSpecialFeeDto();
            input.clientData.periodClientSpecialFees.push(clientSpecialFee);
        }
        input.contractLinesDoneManuallyInOldPm = this.contractsSyncDataForm.manualCheckbox?.value ?? false;

        input.mainData = new ContractsMainDataDto();
        input.mainData.projectDescription = this.contractsMainForm.projectDescription?.value;
        input.mainData.projectTypeId = this.contractsMainForm.projectType?.value?.id;
        input.mainData.salesTypeId = this.contractsMainForm.salesType?.value?.id;
        input.mainData.deliveryTypeId = this.contractsMainForm.deliveryType?.value?.id;
        input.mainData.marginId = this.contractsMainForm.margin?.value?.id;
        input.mainData.discountId = this.contractsMainForm.discounts?.value?.id;
        input.mainData.remarks = this.contractsMainForm.remarks?.value;
        input.mainData.noRemarks = this.contractsMainForm.noRemarks?.value;

        input.consultantData = new Array<ConsultantContractsDataDto>();
        for (let consultant of this.consultants.value) {
            let consultantData = new ConsultantContractsDataDto();
            consultantData.consultantPeriodId = consultant.consultantPeriodId;
            consultantData.employmentTypeId = consultant.consultantType?.id;
            consultantData.consultantId = consultant.consultnatId;
            consultantData.nameOnly = consultant.nameOnly;
            consultantData.consultantTimeReportingCapId = consultant.consultantCapOnTimeReportingValue;
            consultantData.consultantTimeReportingCapMaxValue = consultant.consultantCapOnTimeReportingValue;
            consultantData.consultantTimeReportingCapCurrencyId = consultant.consultantCapOnTimeReportingCurrency?.id;
            consultantData.noSpecialContractTerms = consultant.noSpecialContractTerms;
            consultantData.specialContractTerms = consultant.specialContractTerms;
            consultantData.noSpecialRate = consultant.consultantPeriodId;
            consultantData.noSpecialFee = consultant.consultantPeriodId;

            consultantData.periodConsultantSpecialFees = new Array<PeriodConsultantSpecialFeeDto>();
            for (let specialFee of consultant.clientFees) {
                let consultantFee = new PeriodConsultantSpecialFeeDto();
                consultantFee.id = specialFee.id;
                consultantFee.clientSpecialFeeId = specialFee.clientSpecialFeeId;
                consultantFee.feeName = specialFee.feeName;
                consultantFee.feeDirection = specialFee.feeDirection;
                consultantFee.frequency = specialFee.frequency;
                consultantFee.prodataToProdataRate = specialFee.proDataRateValue;
                consultantFee.prodataToProdataRateCurrencyId = specialFee.proDataRateCurrency?.id;
                consultantFee.consultantRate = specialFee.consultantRateValue;
                consultantFee.consultantRateCurrencyId = specialFee.consultantRateCurrency?.id;
                consultantData.periodConsultantSpecialFees.push(consultantFee);
            }
            consultantData.periodConsultantSpecialRates = new Array<PeriodConsultantSpecialRateDto>();
            for (let specialRate of consultant.clientSpecialRates) {
                let consultantRate = new PeriodConsultantSpecialRateDto();
                consultantRate.id = specialRate.id;
                consultantRate.clientSpecialRateId = specialRate.clientSpecialRateId;
                consultantRate.rateName = specialRate.rateName;
                consultantRate.rateDirection = specialRate.rateDirection;
                consultantRate.reportingUnit = specialRate.reportingUnit;
                consultantRate.prodataToProdataRate = specialRate.proDataRateValue;
                consultantRate.prodataToProdataRateCurrencyId = specialRate.proDataRateCurrency?.id;
                consultantRate.consultantRate = specialRate.consultantRateValue;
                consultantRate.consultantRateCurrencyId = specialRate.consultantRateCurrency?.id;
                consultantData.periodConsultantSpecialRates.push(consultantRate);
            }
            input.consultantData.push(consultantData);
            consultantData.projectLines = new Array<ProjectLineDto>();
            for (let projectLine of consultant.projectLines) {
                let projectLineInput = new ProjectLineDto();
                projectLineInput.id = projectLine.id;
                projectLineInput.projectName = projectLine.projectName;
                projectLineInput.startDate = projectLine.startDate;
                projectLineInput.endDate = projectLine.endDate;
                projectLineInput.invoicingReferenceNumber = projectLine.invoicingReferenceNumber;
                projectLineInput.invoicingReferencePersonId = projectLine.invoicingReferencePersonId;
                projectLineInput.optionalInvoicingInfo = projectLine.optionalInvoicingInfo;
                projectLineInput.differentDebtorNumber = projectLine.differentDebtorNumber;
                projectLineInput.debtorNumber = projectLine.debtorNumber;
                projectLineInput.differentInvoiceRecipient = projectLine.differentInvoiceRecipient;
                projectLineInput.invoiceRecipientId = projectLine.invoiceRecipientId;
                projectLineInput.modifiedById = projectLine.modifiedById;
                projectLineInput.modificationDate = projectLine.modificationDate;

                consultantData.projectLines.push(projectLineInput);
            }

        }

        this._clientPeriodService.contractsPut(this.clientPeriodId!, input)
            .pipe(finalize(() => {

            }))
            .subscribe(result => {

            });
    }

    get readOnlyMode() {
        return this.isCompleted;
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
        this.contractClientForm.clientRates.push(form);
    }

    get clientRates(): FormArray {
        return this.contractClientForm.get('clientRates') as FormArray;
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
        this.contractClientForm.clientFees.push(form);
    }

    get clientFees(): FormArray {
        return this.contractClientForm.get('clientFees') as FormArray;
    }

    removeClientFee(index: number) {
        this.clientFees.removeAt(index);
    }

    editOrSaveClientFee(isEditMode: boolean, index: number) {
        this.clientFees.at(index).get('editable')?.setValue(!isEditMode, {emitEvent: false});
    }
    // #endregion CHANGE NAMING

    addConsultantDataToForm(consultant: ConsultantContractsDataDto, index: number) {
        // TODO: add missing properties, id, employmentType, etc.
        const form = this._fb.group({
            consultnatId: new FormControl(consultant.consultantId),
            nameOnly: new FormControl(consultant.nameOnly),
            consultantType: new FormControl(this.findItemById(this.consultantTypes, consultant.employmentTypeId)),
            consultantCapOnTimeReportingValue: new FormControl(consultant.consultantTimeReportingCapMaxValue),
            consultantCapOnTimeReportingCurrency: new FormControl(this.findItemById(this.currencies, consultant.consultantTimeReportingCapCurrencyId)),
            noSpecialContractTerms: new FormControl(consultant.noSpecialContractTerms),
            specialContractTerms: new FormControl({value: consultant.specialContractTerms, disabled: consultant.noSpecialContractTerms}),
            specialRates: new FormArray([]),
            clientFees: new FormArray([]),
            projectLines: new FormArray([])
        });
        this.contractsConsultantsDataForm.consultants.push(form);
        consultant.projectLines?.forEach(project => {
            this.addProjectLinesToConsultantData(index, project);
        });
        consultant.periodConsultantSpecialFees?.forEach(fee => {
            this.addClientFeesToConsultantData(index, fee);
        });
        consultant.periodConsultantSpecialRates?.forEach(rate => {
            this.addSpecialRateToConsultantData(index, rate);
        })
    }

    get consultants(): FormArray {
        return this.contractsConsultantsDataForm.get('consultants') as FormArray;
    }

    displayConsultantEmploymentType(employmentTypeId: number) {
        return this.consultantTypes.find(x => x.id === employmentTypeId)?.name!;
    }

    addSpecialRateToConsultantData(index: number, clientRate?: PeriodConsultantSpecialRateDto) {
        const form = this._fb.group({
            id: new FormControl(clientRate?.id ?? null),
            clientSpecialRateId: new FormControl(clientRate?.clientSpecialRateId ?? null),
            rateName: new FormControl(clientRate?.rateName ?? null),
            rateDirection: new FormControl(clientRate?.rateDirection ?? null),
            reportingUnit: new FormControl(clientRate?.reportingUnit ?? null),
            proDataRateValue: new FormControl(clientRate?.prodataToProdataRate ?? null),
            proDataRateCurrency: new FormControl(this.findItemById(this.currencies, clientRate?.prodataToProdataRateCurrencyId) ?? null),
            consultantRateValue: new FormControl(clientRate?.consultantRate ?? null),
            consultantRateCurrency: new FormControl(this.findItemById(this.currencies, clientRate?.consultantRateCurrencyId) ?? null),
            editable: new FormControl(clientRate ? false : true)
        });

        (this.contractsConsultantsDataForm.consultants.at(index).get('specialRates') as FormArray).push(form);
    }

    removeConsultantDataSpecialRate(consultantIndex: number, rateIndex: number) {
        (this.contractsConsultantsDataForm.consultants.at(consultantIndex).get('specialRates') as FormArray).removeAt(rateIndex);
    }

    editOrSaveConsultantSpecialRate(isEditMode: boolean, consultantIndex: number, rateIndex: number) {
        (this.consultants.at(consultantIndex).get('specialRates') as FormArray).at(rateIndex).get('editable')?.setValue(!isEditMode, {emitEvent: false});
    }

    getConsultantSpecialRateControls(index: number): AbstractControl[] | null {
        return (this.contractsConsultantsDataForm.consultants.at(index).get('specialRates') as FormArray).controls;

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
            proDataRateCurrency: new FormControl(this.findItemById(this.currencies,clientFee?.prodataToProdataRateCurrencyId) ?? null),
            consultantRateValue: new FormControl(clientFee?.consultantRate ?? null),
            consultantRateCurrency: new FormControl(this.findItemById(this.currencies, clientFee?.consultantRateCurrencyId) ?? null),
            editable: new FormControl(true)
        });
        (this.contractsConsultantsDataForm.consultants.at(index).get('clientFees') as FormArray).push(form);
    }

    removeConsultantDataClientFees(consultantIndex: number, rateIndex: number) {
        (this.contractsConsultantsDataForm.consultants.at(consultantIndex).get('clientFees') as FormArray).removeAt(rateIndex);
    }

    editOrSaveConsultantSpecialFee(isEditMode: boolean, consultantIndex: number, rateIndex: number) {
        (this.contractsConsultantsDataForm.consultants.at(consultantIndex).get('clientFees') as FormArray).at(rateIndex).get('editable')?.setValue(!isEditMode, {emitEvent: false});
    }

    getConsultantClientFeesControls(index: number): AbstractControl[] | null {
        return (this.contractsConsultantsDataForm.consultants.at(index).get('clientFees') as FormArray).controls
    }
    // Consultant data Client fees END REGION

    // Consultant data Project Lines START REGION

    createOrEditProjectLine(index: number, projectLinesIndex?: number) {
        const scrollStrategy = this.overlay.scrollStrategies.reposition();
        let projectLine = null;
        if (projectLinesIndex !== null && projectLinesIndex !== undefined) {
            projectLine = (this.contractsConsultantsDataForm.consultants.at(index).get('projectLines') as FormArray).at(projectLinesIndex!).value;
        }
        const dialogRef = this.dialog.open(AddOrEditProjectLineDialogComponent, {
            width: '450px',
            minHeight: '180px',
            height: 'auto',
            scrollStrategy,
            backdropClass: 'backdrop-modal--wrapper',
            autoFocus: false,
            panelClass: 'confirmation-modal',
            data: {
                // NB: index for testing - in real world if id !== null ? ProjectLineDiallogMode.Create : ProjectLineDiallogMode.Edit
                dialogType: projectLinesIndex !== null && projectLinesIndex !== undefined ? ProjectLineDiallogMode.Edit : ProjectLineDiallogMode.Create,
                projectLineData: projectLine
            }
        });

        dialogRef.componentInstance.onConfirmed.subscribe((projectLine) => {
            // NB: index for testing - in real world if id !== null ? ProjectLineDiallogMode.Create : ProjectLineDiallogMode.Edit
            if (projectLinesIndex !== null && projectLinesIndex !== undefined) {
                // Edit
                this.editProjectLineValue(index, projectLinesIndex, projectLine);
            } else {
                this.addProjectLinesToConsultantData(index, projectLine);
                // Create
            }
            // confirmed
        });

        dialogRef.componentInstance.onRejected.subscribe(() => {
            // rejected
        });

    }

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
            modificationDate: new FormControl(projectLine?.modificationDate ?? null)
        });
        (this.contractsConsultantsDataForm.consultants.at(index).get('projectLines') as FormArray).push(form);
    }

    editProjectLineValue(consultantIndex: number, projectLinesIndex: number, projectLineData: any) {
        const projectLineRow = (this.contractsConsultantsDataForm.consultants.at(consultantIndex).get('projectLines') as FormArray).at(projectLinesIndex);
        projectLineRow.get('id')?.setValue(projectLineData.id, {emitEvent: false});
        projectLineRow.get('projectName')?.setValue(projectLineData.projectName, {emitEvent: false});
        projectLineRow.get('startDate')?.setValue(projectLineData.startDate, {emitEvent: false});
        projectLineRow.get('endDate')?.setValue(projectLineData.endDate, {emitEvent: false});
        projectLineRow.get('invoicingReferenceNumber')?.setValue(projectLineData.invoicingReferenceNumber, {emitEvent: false});
        projectLineRow.get('invoicingReferencePersonId')?.setValue(projectLineData.invoicingReferencePersonId, {emitEvent: false});
        projectLineRow.get('optionalInvoicingInfo')?.setValue(projectLineData.optionalInvoicingInfo, {emitEvent: false});
        projectLineRow.get('differentDebtorNumber')?.setValue(projectLineData.differentDebtorNumber, {emitEvent: false});
        projectLineRow.get('debtorNumber')?.setValue(projectLineData.debtorNumber, {emitEvent: false});
        projectLineRow.get('differentInvoiceRecipient')?.setValue(projectLineData.differentInvoiceRecipient, {emitEvent: false});
        projectLineRow.get('invoiceRecipientId')?.setValue(projectLineData.invoiceRecipientId, {emitEvent: false});
    }

    duplicateProjectLine(consultantIndex: number, projectLinesIndex: number) {
        const projectLineRow = (this.contractsConsultantsDataForm.consultants.at(consultantIndex).get('projectLines') as FormArray).at(projectLinesIndex) as FormGroup;
        (this.contractsConsultantsDataForm.consultants.at(consultantIndex).get('projectLines') as FormArray).push(projectLineRow);
    }

    removeConsultantDataProjectLines(consultantIndex: number, projectLineIndex: number) {
        (this.contractsConsultantsDataForm.consultants.at(consultantIndex).get('projectLines') as FormArray).removeAt(projectLineIndex);
    }

    editOrSaveConsultantProjectLine(isEditMode: boolean, consultantIndex: number, projectLineIndex: number) {
        (this.contractsConsultantsDataForm.consultants.at(consultantIndex).get('projectLines') as FormArray).at(projectLineIndex).get('editable')?.setValue(!isEditMode, {emitEvent: false});
    }

    getConsultantProjectLinesControls(index: number): AbstractControl[] | null {
        return (this.contractsConsultantsDataForm.consultants.at(index).get('projectLines') as FormArray).controls
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
        const consultantData = this.contractsConsultantsDataForm.consultants.at(index).value;
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
        const consultantData = this.contractsConsultantsDataForm.consultants.at(index).value;
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
        const consultantData = this.contractsConsultantsDataForm.consultants.at(index).value;
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

    addConsultantDataToTerminationForm(consultant: ConsultantTerminationContractDataQueryDto) {
        const form = this._fb.group({
            consultantId: new FormControl(consultant?.consultant?.id),
            consultantData: new FormControl(consultant?.consultant),
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
        let input = new ConsultantTerminationContractDataCommandDto();
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
        let input = new ConsultantTerminationContractDataCommandDto();

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
        let input = new WorkflowTerminationContractDataCommandDto();
        input.contractLinesDoneManuallyInOldPM = this.contractLinesDoneManuallyInOldPMControl?.value;
        input.consultantTerminationContractData = this.contractsTerminationConsultantForm.consultantTerminationContractData?.value

        input.consultantTerminationContractData = new Array<ConsultantTerminationContractDataCommandDto>();
        if (this.contractsTerminationConsultantForm.consultantTerminationContractData.value?.length) {
            this.contractsTerminationConsultantForm.consultantTerminationContractData.value.forEach((consultant: any) => {
                let consultantInput = new ConsultantTerminationContractDataCommandDto();
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
        let input = new WorkflowTerminationContractDataCommandDto();
        input.contractLinesDoneManuallyInOldPM = this.contractLinesDoneManuallyInOldPMControl?.value;
        input.consultantTerminationContractData = this.contractsTerminationConsultantForm.consultantTerminationContractData?.value

        input.consultantTerminationContractData = new Array<ConsultantTerminationContractDataCommandDto>();
        if (this.contractsTerminationConsultantForm.consultantTerminationContractData.value?.length) {
            this.contractsTerminationConsultantForm.consultantTerminationContractData.value.forEach((consultant: any) => {
                let consultantInput = new ConsultantTerminationContractDataCommandDto();
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
