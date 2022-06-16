import { Overlay } from '@angular/cdk/overlay';
import { Component, Injector, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { InternalLookupService } from 'src/app/shared/common/internal-lookup.service';
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { AppComponentBase } from 'src/shared/app-component-base';
import { ClientPeriodContractsDataDto, WorkflowProcessType, WorkflowServiceProxy, ClientPeriodServiceProxy, ConsultantContractsDataDto, ConsultantSalesDataDto, ContractsClientDataDto, ContractsMainDataDto, EnumEntityTypeDto, PeriodClientSpecialFeeDto, PeriodClientSpecialRateDto, PeriodConsultantSpecialFeeDto, PeriodConsultantSpecialRateDto, ProjectLineDto, ConsultantTerminationContractDataCommandDto, WorkflowTerminationContractDataCommandDto, ConsultantTerminationContractDataQueryDto, ClientContractsServiceProxy, ConsultantPeriodServiceProxy, ConsultantContractsServiceProxy, ConsultantPeriodContractsDataDto, ClientsServiceProxy, ClientSpecialRateDto, ClientSpecialFeeDto, ConsultantResultDto, WorkflowProcessDto, ContractSyncServiceProxy } from 'src/shared/service-proxies/service-proxies';
import { WorkflowConsultantActionsDialogComponent } from '../workflow-consultant-actions-dialog/workflow-consultant-actions-dialog.component';
import { WorkflowDataService } from '../workflow-data.service';
import { ConsultantDiallogAction } from '../workflow-sales/workflow-sales.model';
import { ProjectLineDiallogMode } from '../workflow.model';
import { AddOrEditProjectLineDialogComponent } from './add-or-edit-project-line-dialog/add-or-edit-project-line-dialog.component';
import { WorkflowConsultantsLegalContractForm, WorkflowContractsClientDataForm, WorkflowContractsConsultantsDataForm, WorkflowContractsMainForm, WorkflowContractsSyncForm, WorkflowContractsTerminationConsultantsDataForm } from './workflow-contracts.model';

@Component({
    selector: 'app-workflow-contracts',
    templateUrl: './workflow-contracts.component.html',
    styleUrls: ['./workflow-contracts.component.scss']
})
export class WorkflowContractsComponent extends AppComponentBase implements OnInit, OnDestroy {
    @Input() workflowId: string;
    @Input() periodId: string | undefined;
    @Input() consultant: ConsultantResultDto;

    // Changed all above to enum
    @Input() activeSideSection: WorkflowProcessDto;
    @Input() isCompleted: boolean;
    @Input() permissionsForCurrentUser: { [key: string]: boolean; } | undefined;

    workflowSideSections = WorkflowProcessType;

    contractsMainForm: WorkflowContractsMainForm;
    contractClientForm: WorkflowContractsClientDataForm;
    contractsConsultantsDataForm: WorkflowContractsConsultantsDataForm;
    contractsSyncDataForm: WorkflowContractsSyncForm;
    consultantLegalContractsForm: WorkflowConsultantsLegalContractForm;

    currencies: EnumEntityTypeDto[] = [];
    discounts: EnumEntityTypeDto[] = [];
    deliveryTypes: EnumEntityTypeDto[] = [];
    saleTypes: EnumEntityTypeDto[] = [];
    projectTypes: EnumEntityTypeDto[] = [];
    margins: EnumEntityTypeDto[] = [];
    clientTimeReportingCap: EnumEntityTypeDto[] = [];
    clientSpecialRateReportUnits: EnumEntityTypeDto[] = [];
    clientSpecialFeeFrequencies: EnumEntityTypeDto[] = [];
    employmentTypes: EnumEntityTypeDto[] = [];
    consultantTimeReportingCapList: EnumEntityTypeDto[] = [];

    contractLinesDoneManuallyInOldPMControl = new FormControl();
    contractsTerminationConsultantForm: WorkflowContractsTerminationConsultantsDataForm;

    consultantRateToEdit: PeriodConsultantSpecialRateDto;
    isConsultantRateEditing = false;
    consultantFeeToEdit: PeriodConsultantSpecialFeeDto;
    isConsultantFeeEditing = false;
    clientSpecialRateList: ClientSpecialRateDto[];
    clientSpecialFeeList: ClientSpecialFeeDto[];
    filteredConsultantSpecialRates: ClientSpecialRateDto[];
    filteredConsultantSpecialFees: ClientSpecialFeeDto[];

    clientSpecialRateFilter = new FormControl('');
    clientRateToEdit: PeriodClientSpecialRateDto;
    isClientRateEditing = false;
    clientSpecialFeeFilter = new FormControl('');
    clientFeeToEdit: PeriodClientSpecialFeeDto;
    isClientFeeEditing = false;

    editEnabledForcefuly = false;
    syncNotPossible = false;
    enableLegalContractsButtons = false;
    showManualOption = false;
    syncMessage = '';
    private _unsubscribe = new Subject();

    constructor(
        injector: Injector,
        private _fb: FormBuilder,
        private overlay: Overlay,
        private dialog: MatDialog,
        private _clientPeriodService: ClientPeriodServiceProxy,
        private _workflowDataService: WorkflowDataService,
        private _internalLookupService: InternalLookupService,
        private _workflowServiceProxy: WorkflowServiceProxy,
        private _clientContractsService: ClientContractsServiceProxy,
        private _consultantPeriodService: ConsultantPeriodServiceProxy,
        private _consultantContractsService: ConsultantContractsServiceProxy,
        private _clientService: ClientsServiceProxy,
        private _contractSyncService: ContractSyncServiceProxy
    ) {
        super(injector);
        this.contractsMainForm = new WorkflowContractsMainForm();
        this.contractClientForm = new WorkflowContractsClientDataForm();
        this.contractsConsultantsDataForm = new WorkflowContractsConsultantsDataForm();
        this.contractsSyncDataForm = new WorkflowContractsSyncForm();
        this.contractsTerminationConsultantForm = new WorkflowContractsTerminationConsultantsDataForm();
        this.consultantLegalContractsForm = new WorkflowConsultantsLegalContractForm();
    }

    ngOnInit(): void {
        this.getCurrencies();
        this.getSpecialRateReportUnits();
        this.getSpecialFeeFrequencies();

        this.getDiscounts();
        this.getDeliveryTypes();
        this.getSaleTypes();
        this.getClientTimeReportingCap();
        this.getProjectTypes();
        this.getMargins();
        this.getEmploymentTypes();
        this.getConsultantTimeReportingCap();

        this._workflowDataService.updateWorkflowProgressStatus({currentStepIsCompleted: this.isCompleted, currentStepIsForcefullyEditing: false});
        if (this.permissionsForCurrentUser!["StartEdit"]) {
            this.startEditContractStep();
        } else {
            this.getContractStepData();
        }

        // Client start, extend and change periods
        this._workflowDataService.startClientPeriodContractsSaved
            .pipe(takeUntil(this._unsubscribe))
            .subscribe((value: boolean) => {
                this.saveStartChangeOrExtendClientPeriodContracts(value);
            });

        // Consultant start, extend and change periods
        this._workflowDataService.consultantStartChangeOrExtendContractsSaved
            .pipe(takeUntil(this._unsubscribe))
            .subscribe((value: boolean) => {
                this.saveStartChangeOrExtendConsultantPeriodContracts(value);
            });

        // Terminations
        this._workflowDataService.workflowConsultantTerminationContractsSaved
            .pipe(takeUntil(this._unsubscribe))
            .subscribe((value: boolean) => {
                this.saveTerminationConsultantContractStep(value);
            });

        this._workflowDataService.workflowTerminationContractsSaved
            .pipe(takeUntil(this._unsubscribe))
            .subscribe((value: boolean) => {
                this.saveWorkflowTerminationContractStep(value);
            });

        this._workflowDataService.cancelForceEdit
            .pipe(takeUntil(this._unsubscribe))
            .subscribe((value: boolean) => {
                this.isCompleted = true;
                this.editEnabledForcefuly = false;
                this._workflowDataService.updateWorkflowProgressStatus({currentStepIsCompleted: this.isCompleted, currentStepIsForcefullyEditing: this.editEnabledForcefuly});
                this.getContractStepData();
            });
    }

    getContractStepData() {
        switch (this.activeSideSection.typeId) {
            case this.workflowSideSections.StartClientPeriod:
            case this.workflowSideSections.ChangeClientPeriod:
            case this.workflowSideSections.ExtendClientPeriod:
                this.getStartChangeOrExtendClientPeriodContracts();
                break;
            case this.workflowSideSections.TerminateWorkflow:
                this.getWorkflowContractStepTermination();
                break;
            case this.workflowSideSections.StartConsultantPeriod:
            case this.workflowSideSections.ChangeConsultantPeriod:
            case this.workflowSideSections.ExtendConsultantPeriod:
                this.getStartChangeOrExtendConsultantPeriodContracts();
                break;
            case this.workflowSideSections.TerminateConsultant:
                this.getWorkflowContractsStepConsultantTermination();
                break;
        }
    }

    startEditContractStep() {
        switch (this.activeSideSection.typeId) {
            case this.workflowSideSections.StartClientPeriod:
            case this.workflowSideSections.ChangeClientPeriod:
            case this.workflowSideSections.ExtendClientPeriod:
                this.startEditClientPeriod();
                break;
            case this.workflowSideSections.TerminateWorkflow:
                this.startEditTerminateWorkflow();
                break;

            case this.workflowSideSections.StartConsultantPeriod:
            case this.workflowSideSections.ChangeConsultantPeriod:
            case this.workflowSideSections.ExtendConsultantPeriod:
                // if (!this.activeSideSection.consultantPeriodId) {
                //     let interval = setInterval(() => {
                //         if (this.activeSideSection.consultantPeriodId) {
                //             clearInterval(interval);
                            this.startEditConsultantPeriod();
                //         }
                //     }, 100);
                // } else {
                //     this.startEditConsultantPeriod();
                // }
                break;
            case this.workflowSideSections.TerminateConsultant:
                this.startEditTerminateConsultant();
                break;
        }
    }

    startEditClientPeriod() {
        this.showMainSpinner();
        this._clientContractsService.editStart(this.periodId!)
            .pipe(finalize(() => this.hideMainSpinner()))
            .subscribe(result => {
                this._workflowDataService.workflowSideSectionUpdated.emit({isStatusUpdate: true});
                this.getContractStepData();
            });
    }

    startEditTerminateWorkflow() {
        this.showMainSpinner();
        this._workflowServiceProxy.terminationContractStartEdit(this.periodId!)
            .pipe(finalize(() => this.hideMainSpinner()))
            .subscribe(result => {
                this._workflowDataService.workflowSideSectionUpdated.emit({isStatusUpdate: true});
                this.getContractStepData();
            });
    }

    startEditConsultantPeriod() {
        this.showMainSpinner();
        this._consultantContractsService.editStart(this.activeSideSection.consultantPeriodId!)
            .pipe(finalize(() => this.hideMainSpinner()))
            .subscribe(result => {
                this._workflowDataService.workflowSideSectionUpdated.emit({isStatusUpdate: true});
                this.getContractStepData();
            });
    }

    startEditTerminateConsultant() {
        this.showMainSpinner();
        this._workflowServiceProxy.terminationConsultantContractStartEdit(this.periodId!)
            .pipe(finalize(() => this.hideMainSpinner()))
            .subscribe(result => {
                this._workflowDataService.workflowSideSectionUpdated.emit({isStatusUpdate: true});
                this.getContractStepData();
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

    getEmploymentTypes() {
        this._internalLookupService.getEmploymentTypes()
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.employmentTypes = result;
            });
    }

    getConsultantTimeReportingCap() {
        this._internalLookupService.getConsultantTimeReportingCap()
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.consultantTimeReportingCapList = result;
            });
    }

    toggleEditMode() {
        this.isCompleted = !this.isCompleted;
        this.editEnabledForcefuly = !this.editEnabledForcefuly;
        this._workflowDataService.updateWorkflowProgressStatus({currentStepIsCompleted: this.isCompleted, currentStepIsForcefullyEditing: this.editEnabledForcefuly});
        this.getContractStepData();
    }

    get canToggleEditMode() {
        // return this.permissionsForCurrentUser!["Edit"] && (this.isCompleted || this.editEnabledForcefuly);
        return this.permissionsForCurrentUser!["Edit"] && this.isCompleted;
    }

    get readOnlyMode() {
        // return !this.permissionsForCurrentUser!["Edit"] && !this.permissionsForCurrentUser!["StartEdit"];
        return this.isCompleted;
    }

    // #region CHANGE NAMING
    selectClientRate(event: any, rate: ClientSpecialRateDto, clientRateMenuTrigger: MatMenuTrigger) {
        const clientRate = new PeriodClientSpecialRateDto();
        clientRate.id = undefined;
        clientRate.clientSpecialRateId = rate.id;
        clientRate.rateName = rate.publicName;
        clientRate.reportingUnit = rate.specialRateReportingUnit;
        clientRate.clientRate = rate.clientRate;
        clientRate.clientRateCurrencyId = rate.clientRateCurrency?.id;
        clientRateMenuTrigger.closeMenu();
        this.addSpecialRate(clientRate);
    }

    addSpecialRate(clientRate?: PeriodClientSpecialRateDto) {
        const form = this._fb.group({
            id: new FormControl(clientRate?.id ?? null),
            clientSpecialRateId: new FormControl(clientRate?.clientSpecialRateId ?? null),
            rateName: new FormControl(clientRate?.rateName ?? null),
            reportingUnit: new FormControl(clientRate?.reportingUnit ?? null),
            clientRateValue: new FormControl(clientRate?.clientRate ?? null),
            clientRateCurrency: new FormControl(this.findItemById(this.currencies, clientRate?.clientRateCurrencyId) ?? null),
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

    editOrSaveSpecialRate(isEditable: boolean, index: number) {
        if (isEditable) {
            // save
            this.clientRateToEdit = new PeriodClientSpecialRateDto();
            this.isClientRateEditing = false;
        } else {
            // make editable
            const clientFeeValue = this.clientRates.at(index).value;
            this.clientRateToEdit = new PeriodClientSpecialRateDto({
                id: clientFeeValue.id,
                clientSpecialRateId: clientFeeValue.clientSpecialRateId,
                rateName: clientFeeValue.rateName,
                reportingUnit: clientFeeValue.reportingUnit,
                clientRate: clientFeeValue.clientRateValue,
                clientRateCurrencyId: clientFeeValue.clientRateCurrency?.id
            });
            this.isClientRateEditing = true;
        }
        this.clientRates.at(index).get('editable')?.setValue(!isEditable, {emitEvent: false});
    }

    cancelEditClientRate(index: number) {
        const rateRow = this.clientFees.at(index);
        rateRow.get('clientRateValue')?.setValue(this.clientRateToEdit.clientRate, {emitEvent: false});
        rateRow.get('clientRateCurrencyId')?.setValue(this.findItemById(this.currencies, this.clientRateToEdit.clientRateCurrencyId), {emitEvent: false});
        this.clientRateToEdit = new PeriodConsultantSpecialRateDto();
        this.isClientRateEditing = false;
        this.clientRates.at(index).get('editable')?.setValue(false, {emitEvent: false});
    }

    selectClientFee(event: any, fee: ClientSpecialFeeDto, clientFeeMenuTrigger: MatMenuTrigger) {
        const clientFee = new PeriodClientSpecialFeeDto();
        clientFee.id = undefined;
        clientFee.clientSpecialFeeId = fee.id;
        clientFee.feeName = fee.publicName;
        clientFee.frequency = fee.clientSpecialFeeFrequency;
        clientFee.clientRate = fee.clientRate;
        clientFee.clientRateCurrencyId = fee.clientRateCurrency?.id;
        clientFeeMenuTrigger.closeMenu();
        this.addClientFee(clientFee);
    }

    addClientFee(clientFee?: PeriodClientSpecialFeeDto) {
        const form = this._fb.group({
            id: new FormControl(clientFee?.id ?? null),
            clientSpecialFeeId: new FormControl(clientFee?.clientSpecialFeeId ?? null),
            feeName: new FormControl(clientFee?.feeName ?? null),
            feeFrequency: new FormControl(clientFee?.frequency ?? null),
            clientRateValue: new FormControl(clientFee?.clientRate ?? null),
            clientRateCurrency: new FormControl(this.findItemById(this.currencies, clientFee?.clientRateCurrencyId) ?? null),

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

    editOrSaveClientFee(isEditable: boolean, index: number) {
        if (isEditable) {
            // save
            this.clientFeeToEdit = new PeriodClientSpecialFeeDto();
            this.isClientFeeEditing = false;
        } else {
            // make editable
            const clientFeeValue = this.clientFees.at(index).value;
            this.clientFeeToEdit = new PeriodClientSpecialFeeDto({
                id: clientFeeValue.id,
                clientSpecialFeeId: clientFeeValue.clientSpecialFeeId,
                feeName: clientFeeValue.feeName,
                frequency: clientFeeValue.feeFrequency,
                clientRate: clientFeeValue.clientRateValue,
                clientRateCurrencyId: clientFeeValue.clientRateCurrency?.id
            });
            this.isClientFeeEditing = true;
        }
        this.clientFees.at(index).get('editable')?.setValue(!isEditable, {emitEvent: false});
    }

    cancelEditClientFee(index: number) {
        const feeRow = this.clientFees.at(index);
        feeRow.get('clientRateValue')?.setValue(this.clientFeeToEdit.clientRate, {emitEvent: false});
        feeRow.get('clientRateCurrencyId')?.setValue(this.findItemById(this.currencies, this.clientFeeToEdit.clientRateCurrencyId), {emitEvent: false});
        this.clientFeeToEdit = new PeriodConsultantSpecialFeeDto();
        this.isClientFeeEditing = false;
        this.clientFees.at(index).get('editable')?.setValue(false, {emitEvent: false});
    }

    // #endregion CHANGE NAMING

    addConsultantDataToForm(consultant: ConsultantContractsDataDto, consultantIndex: number) {
        // TODO: add missing properties, id, employmentType, etc.
        const form = this._fb.group({
            consultantPeriodId: new FormControl(consultant?.consultantPeriodId),
            consultantId: new FormControl(consultant?.consultantId),
            consultant: new FormControl(consultant?.consultant),
            nameOnly: new FormControl(consultant?.nameOnly),
            startDate: new FormControl(consultant?.startDate),
            endDate: new FormControl(consultant?.endDate),
            noEndDate: new FormControl(consultant?.noEndDate),
            consultantType: new FormControl(this.findItemById(this.employmentTypes, consultant?.employmentTypeId)),
            consultantCapOnTimeReporting: new FormControl(this.findItemById(this.consultantTimeReportingCapList, consultant?.consultantTimeReportingCapId)),
            consultantCapOnTimeReportingValue: new FormControl(consultant?.consultantTimeReportingCapMaxValue),
            consultantCapOnTimeReportingCurrency: new FormControl(this.findItemById(this.currencies, consultant?.consultantTimeReportingCapCurrencyId)),
            noSpecialContractTerms: new FormControl(consultant?.noSpecialContractTerms),
            specialContractTerms: new FormControl({value: consultant?.specialContractTerms, disabled: consultant?.noSpecialContractTerms}),
            pdcPaymentEntityId: new FormControl(consultant?.pdcPaymentEntityId),
            specialRates: new FormArray([]),
            consultantSpecialRateFilter: new FormControl(''),
            clientFees: new FormArray([]),
            consultantSpecialFeeFilter: new FormControl(''),
            projectLines: new FormArray([])
        });
        this.contractsConsultantsDataForm.consultants.push(form);
        consultant.projectLines?.forEach(project => {
            this.addProjectLinesToConsultantData(consultantIndex, project);
        });
        consultant.periodConsultantSpecialFees?.forEach(fee => {
            this.addClientFeesToConsultantData(consultantIndex, fee);
        });
        consultant.periodConsultantSpecialRates?.forEach(rate => {
            this.addSpecialRateToConsultantData(consultantIndex, rate);
        });

        this.manageConsultantRateAutocomplete(consultantIndex);
        this.manageConsultantFeeAutocomplete(consultantIndex);
    }

    get consultants(): FormArray {
        return this.contractsConsultantsDataForm.get('consultants') as FormArray;
    }

    addConsultantLegalContract(consultant: ConsultantContractsDataDto) {
        const form = this._fb.group({
            consultantId: new FormControl(consultant.consultantId),
            consultant: new FormControl(consultant.consultant),
            internalLegalContractDoneStatusId: new FormControl(consultant.internalLegalContractDoneStatusId),
            consultantLegalContractDoneStatusId: new FormControl(consultant.consultantLegalContractDoneStatusId),
            pdcPaymentEntityId: new FormControl(consultant.pdcPaymentEntityId)
        });
        this.contractsSyncDataForm.consultants.push(form);
    }

    displayConsultantEmploymentType(employmentTypeId: number) {
        return this.employmentTypes.find(x => x.id === employmentTypeId)?.name!;
    }

    getRatesAndFees(clientId: number) {
        this._clientService.specialRatesGet(clientId, true)
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.clientSpecialRateList = result.filter(x => !x.isHidden);
            });
        this._clientService.specialFeesGet(clientId, true)
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.clientSpecialFeeList = result.filter(x => !x.isHidden);
            });
    }

    selectConsultantSpecialRate(event: any, consultantIndex: number, rate: ClientSpecialRateDto, consultantRateMenuTrigger: MatMenuTrigger) {
        const consultantRate = new PeriodConsultantSpecialRateDto();
        consultantRate.id = undefined;
        consultantRate.clientSpecialRateId = rate.id;
        consultantRate.rateName = rate.publicName;
        consultantRate.reportingUnit = rate.specialRateReportingUnit;
        consultantRate.prodataToProdataRate = rate.proDataToProDataRate;
        consultantRate.prodataToProdataRateCurrencyId = rate.proDataToProDataRateCurrency?.id;
        consultantRate.consultantRate = rate.consultantRate;
        consultantRate.consultantRateCurrencyId = rate.consultantCurrency?.id;
        // if (consultantRate.rateSpecifiedAs?.id === 1) {
        //     consultantRate.prodataToProdataRate = +(this.contractsConsultantsDataForm.consultants.at(consultantIndex)!.get('consultantRate')!.value * rate.proDataToProDataRate! / 100).toFixed(2);
        //     consultantRate.prodataToProdataRateCurrencyId = this.contractsConsultantsDataForm.consultants.at(consultantIndex)!.get('consultantRateCurrency')!.value?.id;
        //     consultantRate.consultantRate = +(this.contractsConsultantsDataForm.consultants.at(consultantIndex)!.get('consultantRate')!.value * rate.consultantRate! / 100).toFixed(2);
        //     consultantRate.consultantRateCurrencyId = this.contractsConsultantsDataForm.consultants.at(consultantIndex)!.get('consultantRateCurrency')!.value?.id;
        // } else {
        //     consultantRate.prodataToProdataRate = rate.proDataToProDataRate;
        //     consultantRate.prodataToProdataRateCurrencyId = rate.proDataToProDataRateCurrency?.id;
        //     consultantRate.consultantRate = rate.consultantRate;
        //     consultantRate.consultantRateCurrencyId = rate.consultantCurrency?.id;
        // }
        consultantRateMenuTrigger.closeMenu();
        this.addSpecialRateToConsultantData(consultantIndex, consultantRate);
    }

    addSpecialRateToConsultantData(index: number, clientRate?: PeriodConsultantSpecialRateDto) {
        const form = this._fb.group({
            id: new FormControl(clientRate?.id ?? null),
            clientSpecialRateId: new FormControl(clientRate?.clientSpecialRateId ?? null),
            rateName: new FormControl(clientRate?.rateName ?? null),
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

    editOrSaveConsultantSpecialRate(isEditable: boolean, consultantIndex: number, rateIndex: number) {
        if (isEditable) {
            // save
            this.consultantRateToEdit = new PeriodConsultantSpecialRateDto();
            this.isConsultantRateEditing = false;
        } else {
            // make editable
            const consultantRateValue = (this.consultants.at(consultantIndex).get('specialRates') as FormArray).at(rateIndex).value;
            this.consultantRateToEdit = new PeriodConsultantSpecialRateDto({
                id: consultantRateValue.id,
                clientSpecialRateId: consultantRateValue.clientSpecialRateId,
                rateName: consultantRateValue.rateName,
                reportingUnit: consultantRateValue.reportingUnit,
                prodataToProdataRate: consultantRateValue.proDataRateValue,
                prodataToProdataRateCurrencyId: consultantRateValue.proDataRateCurrency?.id,
                consultantRate: consultantRateValue.consultantRateValue,
                consultantRateCurrencyId: consultantRateValue.consultantRateCurrency?.id
            });
            this.isConsultantRateEditing = true;
        }
        (this.consultants.at(consultantIndex).get('specialRates') as FormArray).at(rateIndex).get('editable')?.setValue(!isEditable, {emitEvent: false});
    }

    cancelEditConsultantRate(consultantIndex: number, specialRateIndex: number) {
        const rateRow = (this.consultants.at(consultantIndex).get('specialRates') as FormArray).at(specialRateIndex);
        rateRow.get('proDataRateValue')?.setValue(this.consultantRateToEdit.prodataToProdataRate, {emitEvent: false});
        rateRow.get('proDataRateCurrency')?.setValue(this.findItemById(this.currencies, this.consultantRateToEdit.prodataToProdataRateCurrencyId), {emitEvent: false});
        rateRow.get('consultantRateValue')?.setValue(this.consultantRateToEdit.consultantRate, {emitEvent: false});
        rateRow.get('consultantRateCurrency')?.setValue(this.findItemById(this.currencies, this.consultantRateToEdit.consultantRateCurrencyId), {emitEvent: false});
        this.consultantRateToEdit = new PeriodConsultantSpecialRateDto();
        this.isConsultantRateEditing = false;
        (this.consultants.at(consultantIndex).get('specialRates') as FormArray).at(specialRateIndex).get('editable')?.setValue(false, {emitEvent: false});
    }

    getConsultantSpecialRateControls(index: number): AbstractControl[] | null {
        return (this.contractsConsultantsDataForm.consultants.at(index).get('specialRates') as FormArray).controls;
    }

    // #endregion Consultant data Special Rates

    // Consultant data Client fees START REGION

    selectConsultantSpecialFee(event: any, consultantIndex: number, fee: ClientSpecialFeeDto, consultantFeeMenuTrigger: MatMenuTrigger) {
        const consultantFee = new PeriodConsultantSpecialFeeDto();
        consultantFee.id = undefined;
        consultantFee.clientSpecialFeeId = fee.id;
        consultantFee.feeName = fee.publicName;
        consultantFee.frequency = fee.clientSpecialFeeFrequency;
        consultantFee.prodataToProdataRate = fee.prodataToProdataRate;
        consultantFee.prodataToProdataRateCurrencyId = fee.prodataToProdataRateCurrency?.id;
        consultantFee.consultantRate = fee.consultantRate;
        consultantFee.consultantRateCurrencyId = fee.consultantCurrency?.id;
        consultantFeeMenuTrigger.closeMenu();
        this.addClientFeesToConsultantData(consultantIndex, consultantFee);
    }

    addClientFeesToConsultantData(index: number, clientFee?: PeriodConsultantSpecialFeeDto) {
        const form = this._fb.group({
            id: new FormControl(clientFee?.id ?? null),
            clientSpecialFeeId: new FormControl(clientFee?.clientSpecialFeeId ?? null),
            feeName: new FormControl(clientFee?.feeName ?? null),
            feeFrequency: new FormControl(clientFee?.frequency ?? null),
            proDataRateValue: new FormControl(clientFee?.prodataToProdataRate ?? null),
            proDataRateCurrency: new FormControl(this.findItemById(this.currencies,clientFee?.prodataToProdataRateCurrencyId) ?? null),
            consultantRateValue: new FormControl(clientFee?.consultantRate ?? null),
            consultantRateCurrency: new FormControl(this.findItemById(this.currencies, clientFee?.consultantRateCurrencyId) ?? null),
            editable: new FormControl(false)
        });
        (this.contractsConsultantsDataForm.consultants.at(index).get('clientFees') as FormArray).push(form);
    }

    removeConsultantDataClientFees(consultantIndex: number, feeIndex: number) {
        (this.contractsConsultantsDataForm.consultants.at(consultantIndex).get('clientFees') as FormArray).removeAt(feeIndex);
    }

    editOrSaveConsultantSpecialFee(isEditable: boolean, consultantIndex: number, feeIndex: number) {
        if (isEditable) {
            // save
            this.consultantFeeToEdit = new PeriodConsultantSpecialFeeDto();
            this.isConsultantFeeEditing = false;
        } else {
            // make editable
            const consultantFeeValue = (this.consultants.at(consultantIndex).get('clientFees') as FormArray).at(feeIndex).value;
            this.consultantFeeToEdit = new PeriodConsultantSpecialFeeDto({
                id: consultantFeeValue.id,
                clientSpecialFeeId: consultantFeeValue.clientSpecialFeeId,
                feeName: consultantFeeValue.feeName,
                frequency: consultantFeeValue.feeFrequency,
                prodataToProdataRate: consultantFeeValue.proDataRateValue,
                prodataToProdataRateCurrencyId: consultantFeeValue.proDataRateCurrency?.id,
                consultantRate: consultantFeeValue.consultantRateValue,
                consultantRateCurrencyId: consultantFeeValue.consultantRateCurrency?.id
            });
            this.isConsultantFeeEditing = true;
        }
        (this.consultants.at(consultantIndex).get('clientFees') as FormArray).at(feeIndex).get('editable')?.setValue(!isEditable, {emitEvent: false});
    }

    cancelEditConsultantFee(consultantIndex: number, specialFeeIndex: number) {
        const feeRow = (this.consultants.at(consultantIndex).get('clientFees') as FormArray).at(specialFeeIndex);
        feeRow.get('proDataRateValue')?.setValue(this.consultantFeeToEdit?.prodataToProdataRate, {emitEvent: false});
        feeRow.get('proDataRateCurrency')?.setValue(this.findItemById(this.currencies, this.consultantFeeToEdit?.prodataToProdataRateCurrencyId), {emitEvent: false});
        feeRow.get('consultantRateValue')?.setValue(this.consultantFeeToEdit?.consultantRate, {emitEvent: false});
        feeRow.get('consultantRateCurrency')?.setValue(this.findItemById(this.currencies, this.consultantFeeToEdit?.consultantRateCurrencyId), {emitEvent: false});
        this.consultantFeeToEdit = new PeriodConsultantSpecialFeeDto();
        this.isConsultantFeeEditing = false;
        (this.consultants.at(consultantIndex).get('clientFees') as FormArray).at(specialFeeIndex).get('editable')?.setValue(false, {emitEvent: false});
    }

    getConsultantClientFeesControls(index: number): AbstractControl[] | null {
        return (this.contractsConsultantsDataForm.consultants.at(index).get('clientFees') as FormArray).controls;
    }
    // Consultant data Client fees END REGION

    // Consultant data Project Lines START REGION

    createOrEditProjectLine(index: number, projectLinesIndex?: number) {
        const scrollStrategy = this.overlay.scrollStrategies.reposition();
        let projectLine = {
            projectName: this.contractsMainForm.projectDescription!.value,
            startDate: this.contractsConsultantsDataForm.consultants.at(index).get('startDate')?.value,
            endDate: this.contractsConsultantsDataForm.consultants.at(index).get('endDate')?.value,
            noEndDate: this.contractsConsultantsDataForm.consultants.at(index).get('noEndDate')?.value,
        };
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
                dialogType: projectLinesIndex !== null && projectLinesIndex !== undefined ? ProjectLineDiallogMode.Edit : ProjectLineDiallogMode.Create,
                projectLineData: projectLine,
                clientId: this.contractClientForm.directClientId?.value
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
            noEndDate: new FormControl(projectLine?.noEndDate ?? false),
            invoicingReferenceNumber: new FormControl(projectLine?.invoicingReferenceNumber ?? null),
            invoicingReferencePersonId: new FormControl(projectLine?.invoicingReferencePersonId ?? null),
            optionalInvoicingInfo: new FormControl(projectLine?.optionalInvoicingInfo ?? null),
            differentDebtorNumber: new FormControl(projectLine?.differentDebtorNumber ?? false),
            debtorNumber: new FormControl(projectLine?.debtorNumber ?? null),
            differentInvoiceRecipient: new FormControl(projectLine?.differentInvoiceRecipient ?? false),
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
        projectLineRow.get('noEndDate')?.setValue(projectLineData.noEndDate, {emitEvent: false});
        projectLineRow.get('invoicingReferenceNumber')?.setValue(projectLineData.invoicingReferenceNumber, {emitEvent: false});
        projectLineRow.get('invoicingReferencePersonId')?.setValue(projectLineData.invoicingReferencePersonId, {emitEvent: false});
        projectLineRow.get('optionalInvoicingInfo')?.setValue(projectLineData.optionalInvoicingInfo, {emitEvent: false});
        projectLineRow.get('differentDebtorNumber')?.setValue(projectLineData.differentDebtorNumber, {emitEvent: false});
        projectLineRow.get('debtorNumber')?.setValue(projectLineData.debtorNumber, {emitEvent: false});
        projectLineRow.get('differentInvoiceRecipient')?.setValue(projectLineData.differentInvoiceRecipient, {emitEvent: false});
        projectLineRow.get('invoiceRecipientId')?.setValue(projectLineData.invoiceRecipientId, {emitEvent: false});
    }

    duplicateProjectLine(consultantIndex: number, projectLinesIndex: number) {
        const projectLineRowValue: ProjectLineDto = new ProjectLineDto((this.contractsConsultantsDataForm.consultants.at(consultantIndex).get('projectLines') as FormArray).at(projectLinesIndex).value);
        projectLineRowValue.id = undefined; // to create a new instance of project line
        console.log(projectLineRowValue);
        this.addProjectLinesToConsultantData(consultantIndex, projectLineRowValue);
        // (this.contractsConsultantsDataForm.consultants.at(consultantIndex).get('projectLines') as FormArray).push(projectLineRow);
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
        const scrollStrategy = this.overlay.scrollStrategies.reposition();
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            width: '450px',
            minHeight: '180px',
            height: 'auto',
            scrollStrategy,
            backdropClass: 'backdrop-modal--wrapper',
            autoFocus: false,
            panelClass: 'confirmation-modal',
            data: {
                confirmationMessageTitle: `Are you sure you want to terminate consultant ${consultantData.consultant?.name ?? ''}?`,
                // confirmationMessage: 'When you confirm the termination, all the info contained inside this block will disappear.',
                rejectButtonText: 'Cancel',
                confirmButtonText: 'Delete',
                isNegative: true
            }
        });

        dialogRef.componentInstance.onConfirmed.subscribe(() => {
            this.terminateConsultantStart(consultantData.consultant?.id);
        });

        dialogRef.componentInstance.onRejected.subscribe(() => {
            // nthng
        });
    }

    //#endregion Consultant menu actions

    compareWithFn(listOfItems: any, selectedItem: any) {
        return listOfItems && selectedItem && listOfItems.id === selectedItem.id;;
    }

    displayNameFn(option: any) {
        return option?.name;
    }

    resetForms() {
        this.contractsMainForm.reset('', {emitEvent: false});
        this.contractClientForm.reset('', {emitEvent: false});
        this.contractsConsultantsDataForm.consultants.controls = [];
        this.contractsSyncDataForm.consultants.controls = [];
    }

    //#region Start client period
    getStartChangeOrExtendClientPeriodContracts() {
        this.resetForms();
        this.showMainSpinner();
        this._clientPeriodService.clientContractsGet(this.periodId!)
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
                this.contractsMainForm.remarks?.setValue(result.mainData?.remarks, {emitEvent: false});
                this.contractsMainForm.noRemarks?.setValue(result.mainData?.noRemarks, {emitEvent: false});

                // Client data
                this.contractClientForm.directClientId?.setValue(result.clientData?.directClientId);
                if (result?.clientData?.directClientId) {
                    this.getRatesAndFees(result?.clientData?.directClientId);
                }
                this.contractClientForm.pdcInvoicingEntityId?.setValue(result.clientData?.pdcInvoicingEntityId);
                this.contractClientForm.clientTimeReportingCapId?.setValue(this.findItemById(this.clientTimeReportingCap, result.clientData?.clientTimeReportingCapId), {emitEvent: false});
                this.contractClientForm.clientTimeReportingCapMaxValue?.setValue(result.clientData?.clientTimeReportingCapMaxValue, {emitEvent: false});
                this.contractClientForm.clientTimeReportingCapCurrencyId?.setValue(this.findItemById(this.currencies, result.clientData?.clientTimeReportingCapCurrencyId), {emitEvent: false});
                this.contractClientForm.specialContractTerms?.setValue(result.clientData?.specialContractTerms, {emitEvent: false});
                this.contractClientForm.noSpecialContractTerms?.setValue(result.clientData?.noSpecialContractTerms, {emitEvent: false});

                this.contractsSyncDataForm.clientLegalContractDoneStatusId?.setValue(result?.clientLegalContractDoneStatusId, {emitEvent: false});
                this.contractsSyncDataForm.enableLegalContractsButtons?.setValue(result?.enableLegalContractsButtons, {emitEvent: false});
                this.contractsSyncDataForm.showManualOption?.setValue(result?.showManualOption, {emitEvent: false});

                if (result.clientData?.periodClientSpecialRates?.length) {
                    result.clientData.periodClientSpecialRates.forEach((rate: PeriodClientSpecialRateDto) => {
                        this.addSpecialRate(rate);
                    });
                }

                if (result.clientData?.periodClientSpecialFees?.length) {
                    result.clientData.periodClientSpecialFees.forEach((fee: PeriodClientSpecialFeeDto) => {
                        this.addClientFee(fee);
                    });
                }

                if (result.consultantData?.length) {
                    result.consultantData.forEach((consultant: ConsultantContractsDataDto, index) => {
                        this.addConsultantDataToForm(consultant, index);
                        this.addConsultantLegalContract(consultant);
                    })
                }
            });
    }

    manageConsultantRateAutocomplete(consultantIndex: number) {
        let arrayControl = this.consultants.at(consultantIndex);
        arrayControl!.get('consultantSpecialRateFilter')!.valueChanges
        .pipe(takeUntil(this._unsubscribe))
        .subscribe(value => {
            if (typeof value === 'string') {
                this.filteredConsultantSpecialRates =  this._filterConsultantRates(value, consultantIndex);
            }
        });
    }

    private _filterConsultantRates(value: string, consultantIndex: number): ClientSpecialFeeDto[] {
        const filterValue = value.toLowerCase();
        const result = this.clientSpecialRateList.filter(option => option.publicName!.toLowerCase().includes(filterValue));
        return result;
    }

    manageConsultantFeeAutocomplete(consultantIndex: number) {
        let arrayControl = this.consultants.at(consultantIndex);
        arrayControl!.get('consultantSpecialFeeFilter')!.valueChanges
        .pipe(takeUntil(this._unsubscribe))
        .subscribe(value => {
            if (typeof value === 'string') {
                this.filteredConsultantSpecialFees =  this._filterConsultantFees(value, consultantIndex);
            }
        });
    }

    private _filterConsultantFees(value: string, consultantIndex: number): ClientSpecialFeeDto[] {
        const filterValue = value.toLowerCase();
        const result = this.clientSpecialFeeList.filter(option => option.publicName!.toLowerCase().includes(filterValue));
        return result;
    }

    saveStartChangeOrExtendClientPeriodContracts(isDraft: boolean, isSyncToLegacy?: boolean) {
        let input = new ClientPeriodContractsDataDto();
        input.clientData = new ContractsClientDataDto();

        input.clientData.specialContractTerms = this.contractClientForm.specialContractTerms?.value;
        input.clientData.noSpecialContractTerms = this.contractClientForm.noSpecialContractTerms?.value;
        input.clientData.clientTimeReportingCapId = this.contractClientForm.clientTimeReportingCapId?.value?.id;
        input.clientData.clientTimeReportingCapMaxValue = this.contractClientForm.clientTimeReportingCapMaxValue?.value;
        input.clientData.clientTimeReportingCapCurrencyId = this.contractClientForm.clientTimeReportingCapCurrencyId?.value?.id;
        input.clientData.periodClientSpecialRates = new Array<PeriodClientSpecialRateDto>();
        if (this.contractClientForm.clientRates.value?.length) {
            for (let specialRate of this.contractClientForm.clientRates.value) {
                const clientSpecialRate = new PeriodClientSpecialRateDto();
                clientSpecialRate.id = specialRate.id;
                clientSpecialRate.clientSpecialRateId = specialRate.clientSpecialRateId;
                clientSpecialRate.rateName = specialRate.rateName;
                clientSpecialRate.reportingUnit = specialRate.reportingUnit;
                clientSpecialRate.clientRate = specialRate.clientRateValue;
                clientSpecialRate.clientRateCurrencyId = specialRate.clientRateCurrency?.id;
                input.clientData.periodClientSpecialRates.push(clientSpecialRate);
            }
        }
        input.clientData.noSpecialRate = this.contractClientForm.clientRates.value?.length === 0;
        input.clientData.periodClientSpecialFees = new Array<PeriodClientSpecialFeeDto>();
        if (this.contractClientForm.clientFees.value?.length) {
            for (let specialFee of this.contractClientForm.clientFees.value) {
                const clientSpecialFee = new PeriodClientSpecialFeeDto();
                clientSpecialFee.id = specialFee.id;
                clientSpecialFee.clientSpecialFeeId = specialFee.clientSpecialFeeId;
                clientSpecialFee.feeName = specialFee.feeName;
                clientSpecialFee.frequency = specialFee.feeFrequency;
                clientSpecialFee.clientRate = specialFee.clientRateValue;
                clientSpecialFee.clientRateCurrencyId = specialFee.clientRateCurrency?.id;
                input.clientData.periodClientSpecialFees.push(clientSpecialFee);
            }
        }
        input.clientData.noSpecialFee = this.contractClientForm.clientFees.value?.length === 0;
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
        if (this.consultants.value?.length) {
            for (let consultant of this.consultants.value) {
                let consultantData = new ConsultantContractsDataDto();
                consultantData.consultantPeriodId = consultant.consultantPeriodId;
                consultantData.employmentTypeId = consultant.consultantType?.id;
                consultantData.consultantId = consultant.consultantId;
                consultantData.nameOnly = consultant.nameOnly;
                consultantData.consultantTimeReportingCapId = consultant.consultantCapOnTimeReporting?.id;
                consultantData.consultantTimeReportingCapMaxValue = consultant.consultantCapOnTimeReportingValue;
                consultantData.consultantTimeReportingCapCurrencyId = consultant.consultantCapOnTimeReportingCurrency?.id;
                consultantData.noSpecialContractTerms = consultant.noSpecialContractTerms;
                consultantData.specialContractTerms = consultant.specialContractTerms;

                consultantData.periodConsultantSpecialFees = new Array<PeriodConsultantSpecialFeeDto>();
                if (consultant.clientFees?.length) {
                    for (let specialFee of consultant.clientFees) {
                        let consultantFee = new PeriodConsultantSpecialFeeDto();
                        consultantFee.id = specialFee.id;
                        consultantFee.clientSpecialFeeId = specialFee.clientSpecialFeeId;
                        consultantFee.feeName = specialFee.feeName;
                        consultantFee.frequency = specialFee.feeFrequency;
                        consultantFee.prodataToProdataRate = specialFee.proDataRateValue;
                        consultantFee.prodataToProdataRateCurrencyId = specialFee.proDataRateCurrency?.id;
                        consultantFee.consultantRate = specialFee.consultantRateValue;
                        consultantFee.consultantRateCurrencyId = specialFee.consultantRateCurrency?.id;
                        consultantData.periodConsultantSpecialFees.push(consultantFee);
                    }
                }
                consultantData.noSpecialFee = consultant.clientFees?.length === 0;
                consultantData.periodConsultantSpecialRates = new Array<PeriodConsultantSpecialRateDto>();
                if (consultant.clientSpecialRates?.length) {
                    for (let specialRate of consultant.clientSpecialRates) {
                        let consultantRate = new PeriodConsultantSpecialRateDto();
                        consultantRate.id = specialRate.id;
                        consultantRate.clientSpecialRateId = specialRate.clientSpecialRateId;
                        consultantRate.rateName = specialRate.rateName;
                        consultantRate.reportingUnit = specialRate.reportingUnit;
                        consultantRate.prodataToProdataRate = specialRate.proDataRateValue;
                        consultantRate.prodataToProdataRateCurrencyId = specialRate.proDataRateCurrency?.id;
                        consultantRate.consultantRate = specialRate.consultantRateValue;
                        consultantRate.consultantRateCurrencyId = specialRate.consultantRateCurrency?.id;
                        consultantData.periodConsultantSpecialRates.push(consultantRate);
                    }
                }
                consultantData.noSpecialRate = consultant.clientSpecialRates?.length === 0;
                consultantData.projectLines = new Array<ProjectLineDto>();
                if (consultant.projectLines?.length) {
                    for (let projectLine of consultant.projectLines) {
                        let projectLineInput = new ProjectLineDto();
                        projectLineInput.id = projectLine.id;
                        projectLineInput.projectName = projectLine.projectName;
                        projectLineInput.startDate = projectLine.startDate;
                        projectLineInput.endDate = projectLine.endDate;
                        projectLineInput.noEndDate = projectLine.noEndDate;
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
                input.consultantData.push(consultantData);

            }
        }
        this.showMainSpinner();
        if (isDraft) {
            this._clientPeriodService.clientContractsPut(this.periodId!, input)
                .pipe(finalize(() => {
                    this.hideMainSpinner();
                }))
                .subscribe(result => {
                    if (isSyncToLegacy) {
                        this.syncClientPeriodToLegacySystem();
                    } else if (this.editEnabledForcefuly) {
                        this.toggleEditMode();
                    }
                });
        } else {
            this._clientContractsService.editFinish(this.periodId!, input)
                .pipe(finalize(() => {
                    this.hideMainSpinner();
                }))
                .subscribe(result => {
                    this._workflowDataService.workflowSideSectionUpdated.emit({isStatusUpdate: true});
                });
        }
    }
    //#endregion Start client period

    //#region Start consultant period
    getStartChangeOrExtendConsultantPeriodContracts() {
        this.resetForms();
        this.showMainSpinner();
        this._consultantPeriodService.consultantContractsGet(this.activeSideSection.consultantPeriodId!)
            .pipe(finalize(() => this.hideMainSpinner()))
            .subscribe(result => {
                this.contractsMainForm.remarks?.setValue(result?.remarks, {emitEvent: false});
                this.contractsMainForm.noRemarks?.setValue(result?.noRemarks, {emitEvent: false});
                if (result?.noRemarks) {
                    this.contractsMainForm.remarks?.disable();
                }
                this.contractsMainForm.projectDescription?.setValue(result?.projectDescription, {emitEvent: false});
                this.contractsMainForm.salesType?.setValue(this.findItemById(this.saleTypes, result?.mainData?.salesTypeId), {emitEvent: false});
                this.contractsMainForm.deliveryType?.setValue(this.findItemById(this.deliveryTypes, result?.mainData?.deliveryTypeId), {emitEvent: false});
                this.contractsMainForm.projectType?.setValue(this.findItemById(this.projectTypes, result?.mainData?.projectTypeId), {emitEvent: false});
                this.contractsMainForm.margin?.setValue(this.findItemById(this.margins, result?.mainData?.marginId), {emitEvent: false});
                this.contractsMainForm.discounts?.setValue(this.findItemById(this.discounts, result?.mainData?.discountId), {emitEvent: false});
                this.addConsultantDataToForm(result?.consultantData!, 0);
                this.contractsSyncDataForm.manualCheckbox?.setValue(result?.contractLinesDoneManuallyInOldPm, {emitEvent: false})
                this.contractsSyncDataForm.newLegalContract?.setValue(result?.newLegalContractRequired, {emitEvent: false});
            });
    }

    saveStartChangeOrExtendConsultantPeriodContracts(isDraft: boolean, isSyncToLegacy?: boolean) {
        let input = new ConsultantPeriodContractsDataDto();
        input.remarks =  this.contractsMainForm.remarks?.value;
        input.noRemarks =  this.contractsMainForm.noRemarks?.value
        input.projectDescription =  this.contractsMainForm.projectDescription?.value;
        input.mainData!.projectTypeId = this.contractsMainForm.projectType?.value?.id;;
        input.mainData!.salesTypeId =  this.contractsMainForm.salesType?.value?.id;
        input.mainData!.deliveryTypeId =this.contractsMainForm.deliveryType?.value?.id;
        input.mainData!.marginId = this.contractsMainForm.margin?.value?.id;
        input.mainData!.discountId = this.contractsMainForm.discounts?.value?.id;

        input.consultantData = new ConsultantContractsDataDto();
        const consultantInput = this.contractsConsultantsDataForm.consultants.at(0).value;
        if (consultantInput) {
            let consultantData = new ConsultantContractsDataDto();
            consultantData.consultantPeriodId = consultantInput.consultantPeriodId;
            consultantData.employmentTypeId = consultantInput.consultantType?.id;
            consultantData.consultantId = consultantInput.consultantId;
            consultantData.nameOnly = consultantInput.nameOnly;
            consultantData.consultantTimeReportingCapId = consultantInput.consultantCapOnTimeReporting?.id;
            consultantData.consultantTimeReportingCapMaxValue = consultantInput.consultantCapOnTimeReportingValue;
            consultantData.consultantTimeReportingCapCurrencyId = consultantInput.consultantCapOnTimeReportingCurrency?.id;
            consultantData.noSpecialContractTerms = consultantInput.noSpecialContractTerms;
            consultantData.specialContractTerms = consultantInput.specialContractTerms;

            consultantData.periodConsultantSpecialFees = new Array<PeriodConsultantSpecialFeeDto>();
            if (consultantInput.clientFees?.length) {
                for (let specialFee of consultantInput.clientFees) {
                    let consultantFee = new PeriodConsultantSpecialFeeDto();
                    consultantFee.id = specialFee.id;
                    consultantFee.clientSpecialFeeId = specialFee.clientSpecialFeeId;
                    consultantFee.feeName = specialFee.feeName;
                    consultantFee.frequency = specialFee.feeFrequency;
                    consultantFee.prodataToProdataRate = specialFee.proDataRateValue;
                    consultantFee.prodataToProdataRateCurrencyId = specialFee.proDataRateCurrency?.id;
                    consultantFee.consultantRate = specialFee.consultantRateValue;
                    consultantFee.consultantRateCurrencyId = specialFee.consultantRateCurrency?.id;
                    consultantData.periodConsultantSpecialFees.push(consultantFee);
                }
            }
            consultantData.noSpecialFee = consultantInput.clientFees?.length === 0;
            consultantData.periodConsultantSpecialRates = new Array<PeriodConsultantSpecialRateDto>();
            if (consultantInput.clientSpecialRates?.length) {
                for (let specialRate of consultantInput.clientSpecialRates) {
                    let consultantRate = new PeriodConsultantSpecialRateDto();
                    consultantRate.id = specialRate.id;
                    consultantRate.clientSpecialRateId = specialRate.clientSpecialRateId;
                    consultantRate.rateName = specialRate.rateName;
                    consultantRate.reportingUnit = specialRate.reportingUnit;
                    consultantRate.prodataToProdataRate = specialRate.proDataRateValue;
                    consultantRate.prodataToProdataRateCurrencyId = specialRate.proDataRateCurrency?.id;
                    consultantRate.consultantRate = specialRate.consultantRateValue;
                    consultantRate.consultantRateCurrencyId = specialRate.consultantRateCurrency?.id;
                    consultantData.periodConsultantSpecialRates.push(consultantRate);
                }
            }
            consultantData.noSpecialRate = consultantInput.clientSpecialRates?.length === 0;
            consultantData.projectLines = new Array<ProjectLineDto>();
            if (consultantInput.projectLines?.length) {
                for (let projectLine of consultantInput.projectLines) {
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
            input.consultantData = consultantData;
        }
        input.contractLinesDoneManuallyInOldPm = this.contractsSyncDataForm.manualCheckbox?.value;
        input.newLegalContractRequired = this.contractsSyncDataForm.newLegalContract?.value;
        this.showMainSpinner();
        if (isDraft) {
            this._consultantPeriodService.consultantContractsPut(this.activeSideSection.consultantPeriodId!, input)
                .pipe(finalize(() => this.hideMainSpinner()))
                .subscribe(result => {
                    if (isSyncToLegacy) {
                        this.syncConsultantPeriodToLegacySystem();
                    } else if (this.editEnabledForcefuly) {
                        this.toggleEditMode();
                    }
                });
        } else {
            this._consultantContractsService.editFinish(this.activeSideSection.consultantPeriodId!, input)
                .pipe(finalize(() => this.hideMainSpinner()))
                .subscribe(result => {
                    this._workflowDataService.workflowSideSectionUpdated.emit({isStatusUpdate: true});
                });
        }
    }
    //#endregion Start consultant period

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
        this.resetForms();
        this._workflowServiceProxy.terminationConsultantContractGet(this.workflowId!, this.consultant.id!)
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                // End of Consultant Contract
                this.contractLinesDoneManuallyInOldPMControl?.setValue(result?.contractLinesDoneManuallyInOldPM, {emitEvent: false});
                this.addConsultantDataToTerminationForm(result);
            });
    }

    saveTerminationConsultantContractStep(isDraft: boolean, isSyncToLegacy?: boolean) {
        let input = new ConsultantTerminationContractDataCommandDto();
        input.consultantId = this.contractsTerminationConsultantForm.consultantTerminationContractData?.value.consultantId;
        input.contractLinesDoneManuallyInOldPM = this.contractLinesDoneManuallyInOldPMControl?.value;
        input.removedConsultantFromAnyManualChecklists = this.contractsTerminationConsultantForm.consultantTerminationContractData?.value.removedConsultantFromAnyManualChecklists;
        input.deletedAnySensitiveDocumentsForGDPR = this.contractsTerminationConsultantForm.consultantTerminationContractData?.value.deletedAnySensitiveDocumentsForGDPR;

        this.showMainSpinner();
        if (isDraft) {
            this._workflowServiceProxy.terminationConsultantContractPut(this.workflowId!, input)
                .pipe(finalize(() => this.hideMainSpinner()))
                .subscribe(result => {
                    if (isSyncToLegacy) {
                        this.syncConsultantTerminationToLegacySystem();
                    } else if (this.editEnabledForcefuly) {
                        this.toggleEditMode();
                    }
                })
        } else {
            this._workflowServiceProxy.terminationConsultantContractComplete(this.workflowId!, input)
            .pipe(finalize(() => this.hideMainSpinner()))
            .subscribe(result => {
                this._workflowDataService.workflowSideSectionUpdated.emit({isStatusUpdate: true});
            })
        }
    }

    getWorkflowContractStepTermination() {
        this.resetForms();
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

    saveWorkflowTerminationContractStep(isDraft: boolean, isSyncToLegacy?: boolean) {
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
        this.showMainSpinner();
        if (isDraft) {
            this._workflowServiceProxy.terminationContractPut(this.workflowId!, input)
                .pipe(finalize(() => this.hideMainSpinner()))
                .subscribe(result => {
                    if (isSyncToLegacy) {
                        this.syncWorkflowTerminationToLegacySystem();
                    }
                })
        } else {
            this._workflowServiceProxy.terminationContractComplete(this.workflowId!, input)
            .pipe(finalize(() => this.hideMainSpinner()))
            .subscribe(result => {
                this._workflowDataService.workflowSideSectionUpdated.emit({isStatusUpdate: true});
            })
        }
    }

    terminateConsultantStart(index: number) {
        // this.consultantInformation = this.consultantsForm.consultantData.at(index).value.consultantName;
        this._workflowServiceProxy.terminationConsultantStart(this.workflowId!, index)
        .pipe(finalize(() => {

        }))
        .subscribe(result => {
            this._workflowDataService.workflowSideSectionAdded.emit(true);
        });
    }

    processSyncToLegacySystem() {
        let isDraft = true;
        let isSyncToLegacy = true;
        switch (this._workflowDataService.workflowProgress.currentlyActiveSideSection) {
            case WorkflowProcessType.StartClientPeriod:
            case WorkflowProcessType.ChangeClientPeriod:
            case WorkflowProcessType.ExtendClientPeriod:
                this.saveStartChangeOrExtendClientPeriodContracts(isDraft, isSyncToLegacy);
                break;
            case WorkflowProcessType.TerminateWorkflow:
                this.saveWorkflowTerminationContractStep(isDraft, isSyncToLegacy);
                break;
            case WorkflowProcessType.TerminateConsultant:
                this.saveTerminationConsultantContractStep(isDraft, isSyncToLegacy);
                break;
            case WorkflowProcessType.StartConsultantPeriod:
            case WorkflowProcessType.ChangeConsultantPeriod:
            case WorkflowProcessType.ExtendConsultantPeriod:
                this.saveStartChangeOrExtendConsultantPeriodContracts(isDraft, isSyncToLegacy);
                break;
        }
    }

    syncClientPeriodToLegacySystem() {
        this.showMainSpinner();
        this._contractSyncService.clientPeriodSync(this.periodId!)
            .pipe(finalize(() => this.hideMainSpinner()))
            .subscribe(result => {
                this.syncNotPossible = !result.success!;
                this.enableLegalContractsButtons = result.enableLegalContractsButtons!;
                this.showManualOption = result.showManualOption!;
                this.syncMessage = result.message!;
            });
    }

    syncConsultantPeriodToLegacySystem() {
        this.showMainSpinner();
        this._contractSyncService.consultantPeriodSync(this.activeSideSection.consultantPeriodId!)
            .pipe(finalize(() => {}))
            .subscribe(result => {
                this.syncNotPossible = !result.success!;
                this.enableLegalContractsButtons = result.enableLegalContractsButtons!;
                this.showManualOption = result.showManualOption!;
                this.syncMessage = result.message!;
            });
    }

    syncWorkflowTerminationToLegacySystem() {
        this.showMainSpinner();
        this._contractSyncService.workflowTerminationSync(this.workflowId!)
            .pipe(finalize(() => {}))
            .subscribe(result => {
                this.syncNotPossible = !result.success!;
                this.enableLegalContractsButtons = result.enableLegalContractsButtons!;
                this.showManualOption = result.showManualOption!;
                this.syncMessage = result.message!;
            });
    }

    syncConsultantTerminationToLegacySystem() {
        this.showMainSpinner();
        this.activeSideSection.consultantPeriodId
        this._contractSyncService.consultantTerminationSync(this.activeSideSection.consultantPeriodId!)
            .pipe(finalize(() => {}))
            .subscribe(result => {
                this.syncNotPossible = !result.success!;
                this.enableLegalContractsButtons = result.enableLegalContractsButtons!;
                this.showManualOption = result.showManualOption!;
                this.syncMessage = result.message!;
            });
    }

    
    openContractModule(legalContractStatus: number, isInternal: boolean, tenantId: number, consultant?: ConsultantResultDto) {
        let isFrameworkAgreement = false;
        window.open(`pmpapercontractpm3:${this.periodId}/${isInternal ? 'True' : 'False'}/${legalContractStatus <= 1 ? 'True' : 'False'}/${isFrameworkAgreement ? 'True' : 'False'}/${tenantId}${consultant?.id ? '/' + consultant.id : ''}`);
    }
}
