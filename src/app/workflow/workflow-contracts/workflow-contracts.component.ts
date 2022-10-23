import { Overlay } from '@angular/cdk/overlay';
import {
    Component,
    Injector,
    Input,
    OnDestroy,
    OnInit,
    ViewChild,
} from '@angular/core';
import {
    AbstractControl,
    UntypedFormArray,
    UntypedFormBuilder,
    UntypedFormControl,
    Validators,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { InternalLookupService } from 'src/app/shared/common/internal-lookup.service';
import { AppComponentBase } from 'src/shared/app-component-base';
import {
    ClientPeriodContractsDataCommandDto,
    WorkflowProcessType,
    WorkflowServiceProxy,
    ClientPeriodServiceProxy,
    ConsultantContractsDataCommandDto,
    ContractsClientDataDto,
    ContractsMainDataDto,
    EnumEntityTypeDto,
    PeriodClientSpecialFeeDto,
    PeriodClientSpecialRateDto,
    PeriodConsultantSpecialFeeDto,
    PeriodConsultantSpecialRateDto,
    ProjectLineDto,
    ConsultantTerminationContractDataCommandDto,
    WorkflowTerminationContractDataCommandDto,
    ConsultantTerminationContractDataQueryDto,
    ClientContractsServiceProxy,
    ConsultantPeriodServiceProxy,
    ConsultantContractsServiceProxy,
    ConsultantPeriodContractsDataCommandDto,
    ClientsServiceProxy,
    ClientSpecialRateDto,
    ClientSpecialFeeDto,
    ConsultantResultDto,
    ContractSyncServiceProxy,
    StepType,
    ConsultantContractsDataQueryDto,
    ContractSyncResultDto,
} from 'src/shared/service-proxies/service-proxies';
import { WorkflowDataService } from '../workflow-data.service';
import { WorkflowProcessWithAnchorsDto } from '../workflow-period/workflow-period.model';
import { EmploymentTypes, ProjectLineDiallogMode } from '../workflow.model';
import { AddOrEditProjectLineDialogComponent } from './add-or-edit-project-line-dialog/add-or-edit-project-line-dialog.component';
import {
    LegalContractStatus,
    WorkflowConsultantsLegalContractForm,
    WorkflowContractsClientDataForm,
    WorkflowContractsConsultantsDataForm,
    WorkflowContractsMainForm,
    WorkflowContractsSyncForm,
    WorkflowContractsTerminationConsultantsDataForm,
} from './workflow-contracts.model';

@Component({
    selector: 'app-workflow-contracts',
    templateUrl: './workflow-contracts.component.html',
    styleUrls: ['./workflow-contracts.component.scss'],
})
export class WorkflowContractsComponent
    extends AppComponentBase
    implements OnInit, OnDestroy
{
    @Input() workflowId: string;
    @Input() periodId: string | undefined;
    @Input() consultant: ConsultantResultDto;
    @Input() activeSideSection: WorkflowProcessWithAnchorsDto;
    @Input() isCompleted: boolean;
    @Input() permissionsForCurrentUser: { [key: string]: boolean } | undefined;

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
    rateUnitTypes: EnumEntityTypeDto[] = [];
    legalContractStatuses: { [key: string]: string };
    consultantInsuranceOptions: { [key: string]: string };

    contractLinesDoneManuallyInOldPMControl = new UntypedFormControl();
    contractsTerminationConsultantForm: WorkflowContractsTerminationConsultantsDataForm;

    consultantRateToEdit: PeriodConsultantSpecialRateDto;
    isConsultantRateEditing = false;
    consultantFeeToEdit: PeriodConsultantSpecialFeeDto;
    isConsultantFeeEditing = false;
    clientSpecialRateList: ClientSpecialRateDto[];
    clientSpecialFeeList: ClientSpecialFeeDto[];
    filteredConsultantSpecialRates: ClientSpecialRateDto[];
    filteredConsultantSpecialFees: ClientSpecialFeeDto[];

    clientSpecialRateFilter = new UntypedFormControl('');
    clientRateToEdit: PeriodClientSpecialRateDto;
    isClientRateEditing = false;
    clientSpecialFeeFilter = new UntypedFormControl('');
    clientFeeToEdit: PeriodClientSpecialFeeDto;
    isClientFeeEditing = false;

    editEnabledForcefuly = false;
    syncNotPossible = false;
    statusAfterSync = false;
    syncMessage = '';
    legalContractModuleStatuses = LegalContractStatus;

    employmentTypesEnum = EmploymentTypes;

    private _unsubscribe = new Subject();

    constructor(
        injector: Injector,
        private _fb: UntypedFormBuilder,
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
        this.contractsConsultantsDataForm =
            new WorkflowContractsConsultantsDataForm();
        this.contractsSyncDataForm = new WorkflowContractsSyncForm();
        this.contractsTerminationConsultantForm =
            new WorkflowContractsTerminationConsultantsDataForm();
        this.consultantLegalContractsForm =
            new WorkflowConsultantsLegalContractForm();
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
        this.getUnitTypes();
        this.getLegalContractStatuses();
        this.getConsultantInsuranceOptions();

        this._workflowDataService.updateWorkflowProgressStatus({
            currentStepIsCompleted: this.isCompleted,
            currentStepIsForcefullyEditing: false,
        });
        if (this.permissionsForCurrentUser!['StartEdit']) {
            this.startEditContractStep();
        } else {
            this.getContractStepData();
        }

        // Client start, extend and change periods
        this._workflowDataService.startClientPeriodContractsSaved
            .pipe(takeUntil(this._unsubscribe))
            .subscribe((isDraft: boolean) => {
                if (isDraft) {
                    this.saveStartChangeOrExtendClientPeriodContracts(isDraft);
                } else {
                    if (this.validateSalesForm()) {
                        this.saveStartChangeOrExtendClientPeriodContracts(
                            isDraft
                        );
                    } else {
                        this.scrollToFirstError();
                    }
                }
            });

        // Consultant start, extend and change periods
        this._workflowDataService.consultantStartChangeOrExtendContractsSaved
            .pipe(takeUntil(this._unsubscribe))
            .subscribe((isDraft: boolean) => {
                if (isDraft) {
                    this.saveStartChangeOrExtendConsultantPeriodContracts(
                        isDraft
                    );
                } else {
                    if (this.validateSalesForm()) {
                        this.saveStartChangeOrExtendConsultantPeriodContracts(
                            isDraft
                        );
                    } else {
                        this.scrollToFirstError();
                    }
                }
            });

        // Terminations
        this._workflowDataService.workflowConsultantTerminationContractsSaved
            .pipe(takeUntil(this._unsubscribe))
            .subscribe((isDraft: boolean) => {
                if (isDraft) {
                    this.saveTerminationConsultantContractStep(isDraft);
                } else {
                    if (this.validateSalesForm()) {
                        this.saveTerminationConsultantContractStep(isDraft);
                    } else {
                        this.scrollToFirstError();
                    }
                }
            });

        this._workflowDataService.workflowTerminationContractsSaved
            .pipe(takeUntil(this._unsubscribe))
            .subscribe((isDraft: boolean) => {
                if (isDraft) {
                    this.saveWorkflowTerminationContractStep(isDraft);
                } else {
                    if (this.validateSalesForm()) {
                        this.saveWorkflowTerminationContractStep(isDraft);
                    } else {
                        this.scrollToFirstError();
                    }
                }
            });

        this._workflowDataService.cancelForceEdit
            .pipe(takeUntil(this._unsubscribe))
            .subscribe((value: boolean) => {
                this.isCompleted = true;
                this.editEnabledForcefuly = false;
                this._workflowDataService.updateWorkflowProgressStatus({
                    currentStepIsCompleted: this.isCompleted,
                    currentStepIsForcefullyEditing: this.editEnabledForcefuly,
                });
                this.getContractStepData();
            });
    }

    validateSalesForm() {
        this.contractsMainForm.markAllAsTouched();
        this.contractClientForm.markAllAsTouched();
        this.contractsSyncDataForm.markAllAsTouched();
        this.contractsConsultantsDataForm.markAllAsTouched();
        return true;
        // switch (this.activeSideSection.typeId) {
        //     case WorkflowProcessType.StartClientPeriod:
        //     case WorkflowProcessType.ChangeClientPeriod:
        //     case WorkflowProcessType.ExtendClientPeriod:
        //     case WorkflowProcessType.StartConsultantPeriod:
        //     case WorkflowProcessType.ChangeConsultantPeriod:
        //     case WorkflowProcessType.ExtendConsultantPeriod:
        //         return this.contractsMainForm.valid && this.contractClientForm.valid && this.contractsSyncDataForm.valid && this.contractsConsultantsDataForm.valid
        //     case WorkflowProcessType.TerminateWorkflow:
        //     case WorkflowProcessType.TerminateConsultant:
        //         return true;
        // }
    }

    scrollToFirstError() {
        setTimeout(() => {
            let firstError = document.getElementsByClassName(
                'mat-form-field-invalid'
            )[0] as HTMLElement;
            if (firstError) {
                firstError.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                    inline: 'nearest',
                });
            }
        }, 0);
    }

    getContractStepData(isFromSyncToLegacy?: boolean) {
        switch (this.activeSideSection.typeId) {
            case this.workflowSideSections.StartClientPeriod:
            case this.workflowSideSections.ChangeClientPeriod:
            case this.workflowSideSections.ExtendClientPeriod:
                this.getStartChangeOrExtendClientPeriodContracts(
                    isFromSyncToLegacy
                );
                break;
            case this.workflowSideSections.TerminateWorkflow:
                this.getWorkflowContractStepTermination(isFromSyncToLegacy);
                break;
            case this.workflowSideSections.StartConsultantPeriod:
            case this.workflowSideSections.ChangeConsultantPeriod:
            case this.workflowSideSections.ExtendConsultantPeriod:
                this.getStartChangeOrExtendConsultantPeriodContracts(
                    isFromSyncToLegacy
                );
                break;
            case this.workflowSideSections.TerminateConsultant:
                this.getWorkflowContractsStepConsultantTermination(
                    isFromSyncToLegacy
                );
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
                this.startEditConsultantPeriod();
                break;
            case this.workflowSideSections.TerminateConsultant:
                this.startEditTerminateConsultant();
                break;
        }
    }

    startEditClientPeriod() {
        this.showMainSpinner();
        this._clientContractsService
            .editStart(this.periodId!)
            .pipe(finalize(() => this.hideMainSpinner()))
            .subscribe((result) => {
                this._workflowDataService.workflowSideSectionUpdated.emit({
                    isStatusUpdate: true,
                });
                this.getContractStepData();
            });
    }

    startEditTerminateWorkflow() {
        this.showMainSpinner();
        this._workflowServiceProxy
            .terminationContractStartEdit(this.workflowId!)
            .pipe(finalize(() => this.hideMainSpinner()))
            .subscribe((result) => {
                this._workflowDataService.workflowSideSectionUpdated.emit({
                    isStatusUpdate: true,
                });
                this.getContractStepData();
            });
    }

    startEditConsultantPeriod() {
        this.showMainSpinner();
        this._consultantContractsService
            .editStart(this.activeSideSection.consultantPeriodId!)
            .pipe(finalize(() => this.hideMainSpinner()))
            .subscribe((result) => {
                this._workflowDataService.workflowSideSectionUpdated.emit({
                    isStatusUpdate: true,
                });
                this.getContractStepData();
            });
    }

    startEditTerminateConsultant() {
        this.showMainSpinner();
        this._workflowServiceProxy
            .terminationConsultantContractStartEdit(this.workflowId!)
            .pipe(finalize(() => this.hideMainSpinner()))
            .subscribe((result) => {
                this._workflowDataService.workflowSideSectionUpdated.emit({
                    isStatusUpdate: true,
                });
                this.getContractStepData();
            });
    }

    ngOnDestroy(): void {
        this._unsubscribe.next();
        this._unsubscribe.complete();
    }

    getCurrencies() {
        this._internalLookupService
            .getCurrencies()
            .subscribe((result) => (this.currencies = result));
    }

    getSpecialRateReportUnits() {
        this._internalLookupService
            .getSpecialRateReportUnits()
            .subscribe(
                (result) => (this.clientSpecialRateReportUnits = result)
            );
    }

    getSpecialFeeFrequencies() {
        this._internalLookupService
            .getSpecialFeeFrequencies()
            .subscribe((result) => (this.clientSpecialFeeFrequencies = result));
    }

    getDiscounts() {
        this._internalLookupService
            .getDiscounts()
            .subscribe((result) => (this.discounts = result));
    }

    getDeliveryTypes() {
        this._internalLookupService
            .getDeliveryTypes()
            .subscribe((result) => (this.deliveryTypes = result));
    }

    getSaleTypes() {
        this._internalLookupService
            .getSaleTypes()
            .subscribe((result) => (this.saleTypes = result));
    }

    getProjectTypes() {
        this._internalLookupService
            .getProjectTypes()
            .subscribe((result) => (this.projectTypes = result));
    }

    getMargins() {
        this._internalLookupService
            .getMargins()
            .subscribe((result) => (this.margins = result));
    }

    getClientTimeReportingCap() {
        this._internalLookupService
            .getClientTimeReportingCap()
            .subscribe((result) => (this.clientTimeReportingCap = result));
    }

    getEmploymentTypes() {
        this._internalLookupService
            .getEmploymentTypes()
            .subscribe((result) => (this.employmentTypes = result));
    }

    getConsultantTimeReportingCap() {
        this._internalLookupService
            .getConsultantTimeReportingCap()
            .subscribe(
                (result) => (this.consultantTimeReportingCapList = result)
            );
    }

    getUnitTypes() {
        this._internalLookupService
            .getUnitTypes()
            .subscribe((result) => (this.rateUnitTypes = result));
    }

    getLegalContractStatuses() {
        this._internalLookupService
            .getLegalContractStatuses()
            .subscribe((result) => (this.legalContractStatuses = result));
    }

    getConsultantInsuranceOptions() {
        this._internalLookupService
            .getConsultantInsuranceOptions()
            .subscribe((result) => (this.consultantInsuranceOptions = result));
    }

    toggleEditMode(isToggledFromUi?: boolean) {
        this.isCompleted = !this.isCompleted;
        this.editEnabledForcefuly = !this.editEnabledForcefuly;
        this._workflowDataService.updateWorkflowProgressStatus({
            currentStepIsCompleted: this.isCompleted,
            currentStepIsForcefullyEditing: this.editEnabledForcefuly,
        });
        if (isToggledFromUi) {
            this.getContractStepData();
        }
    }

    get canToggleEditMode() {
        return this.permissionsForCurrentUser!['Edit'] && this.isCompleted;
    }

    get readOnlyMode() {
        return this.isCompleted;
    }

    updateConsultantStepAnchors() {
        let consultantNames =
            this.contractsConsultantsDataForm.consultants.value.map(
                (item: any) => {
                    if (
                        item.consultantType?.id === 10 ||
                        item.consultantType?.id === 11
                    ) {
                        return item.nameOnly;
                    } else {
                        return item.consultant?.name;
                    }
                }
            );
        this._workflowDataService.consultantsAddedToStep.emit({
            stepType: StepType.Contract,
            processTypeId: this.activeSideSection.typeId!,
            consultantNames: consultantNames,
        });
    }

    selectClientRate(
        event: any,
        rate: ClientSpecialRateDto,
        clientRateMenuTrigger: MatMenuTrigger
    ) {
        const clientRate = new PeriodClientSpecialRateDto();
        clientRate.id = undefined;
        clientRate.clientSpecialRateId = rate.id;
        clientRate.rateName = rate.internalName;
        clientRate.reportingUnit = rate.specialRateReportingUnit;
        clientRate.rateSpecifiedAs = rate.specialRateSpecifiedAs;
        if (clientRate.rateSpecifiedAs?.id === 1) {
            clientRate.clientRate = +(
                (this.contractClientForm.clientRate?.value?.normalRate *
                    rate.clientRate!) /
                100
            ).toFixed(2);
            clientRate.clientRateCurrencyId =
                this.contractClientForm.currency?.value?.id;
        } else {
            clientRate.clientRate = rate.clientRate;
            clientRate.clientRateCurrencyId = rate.clientRateCurrency?.id;
        }
        clientRateMenuTrigger.closeMenu();
        this.addSpecialRate(clientRate);
    }

    addSpecialRate(clientRate?: PeriodClientSpecialRateDto) {
        const form = this._fb.group({
            id: new UntypedFormControl(clientRate?.id ?? null),
            clientSpecialRateId: new UntypedFormControl(
                clientRate?.clientSpecialRateId ?? null
            ),
            rateName: new UntypedFormControl(clientRate?.rateName ?? null),
            reportingUnit: new UntypedFormControl(
                clientRate?.reportingUnit ?? null
            ),
            clientRateValue: new UntypedFormControl(
                clientRate?.clientRate ?? null
            ),
            clientRateCurrency: new UntypedFormControl(
                this.findItemById(
                    this.currencies,
                    clientRate?.clientRateCurrencyId
                ) ?? null
            ),
            editable: new UntypedFormControl(clientRate ? false : true),
        });
        this.contractClientForm.clientRates.push(form);
    }

    get clientRates(): UntypedFormArray {
        return this.contractClientForm.get('clientRates') as UntypedFormArray;
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
                clientRateCurrencyId: clientFeeValue.clientRateCurrency?.id,
            });
            this.isClientRateEditing = true;
        }
        this.clientRates
            .at(index)
            .get('editable')
            ?.setValue(!isEditable, { emitEvent: false });
    }

    cancelEditClientRate(index: number) {
        const rateRow = this.clientFees.at(index);
        rateRow
            .get('clientRateValue')
            ?.setValue(this.clientRateToEdit.clientRate, { emitEvent: false });
        rateRow
            .get('clientRateCurrencyId')
            ?.setValue(
                this.findItemById(
                    this.currencies,
                    this.clientRateToEdit.clientRateCurrencyId
                ),
                { emitEvent: false }
            );
        this.clientRateToEdit = new PeriodConsultantSpecialRateDto();
        this.isClientRateEditing = false;
        this.clientRates
            .at(index)
            .get('editable')
            ?.setValue(false, { emitEvent: false });
    }

    selectClientFee(
        event: any,
        fee: ClientSpecialFeeDto,
        clientFeeMenuTrigger: MatMenuTrigger
    ) {
        const clientFee = new PeriodClientSpecialFeeDto();
        clientFee.id = undefined;
        clientFee.clientSpecialFeeId = fee.id;
        clientFee.feeName = fee.internalName;
        clientFee.frequency = fee.clientSpecialFeeFrequency;
        clientFee.clientRate = fee.clientRate;
        clientFee.clientRateCurrencyId = fee.clientRateCurrency?.id;
        clientFeeMenuTrigger.closeMenu();
        this.addClientFee(clientFee);
    }

    addClientFee(clientFee?: PeriodClientSpecialFeeDto) {
        const form = this._fb.group({
            id: new UntypedFormControl(clientFee?.id ?? null),
            clientSpecialFeeId: new UntypedFormControl(
                clientFee?.clientSpecialFeeId ?? null
            ),
            feeName: new UntypedFormControl(clientFee?.feeName ?? null),
            feeFrequency: new UntypedFormControl(clientFee?.frequency ?? null),
            clientRateValue: new UntypedFormControl(
                clientFee?.clientRate ?? null
            ),
            clientRateCurrency: new UntypedFormControl(
                this.findItemById(
                    this.currencies,
                    clientFee?.clientRateCurrencyId
                ) ?? null
            ),

            editable: new UntypedFormControl(clientFee ? false : true),
        });
        this.contractClientForm.clientFees.push(form);
    }

    get clientFees(): UntypedFormArray {
        return this.contractClientForm.get('clientFees') as UntypedFormArray;
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
                clientRateCurrencyId: clientFeeValue.clientRateCurrency?.id,
            });
            this.isClientFeeEditing = true;
        }
        this.clientFees
            .at(index)
            .get('editable')
            ?.setValue(!isEditable, { emitEvent: false });
    }

    cancelEditClientFee(index: number) {
        const feeRow = this.clientFees.at(index);
        feeRow
            .get('clientRateValue')
            ?.setValue(this.clientFeeToEdit.clientRate, { emitEvent: false });
        feeRow
            .get('clientRateCurrencyId')
            ?.setValue(
                this.findItemById(
                    this.currencies,
                    this.clientFeeToEdit.clientRateCurrencyId
                ),
                { emitEvent: false }
            );
        this.clientFeeToEdit = new PeriodConsultantSpecialFeeDto();
        this.isClientFeeEditing = false;
        this.clientFees
            .at(index)
            .get('editable')
            ?.setValue(false, { emitEvent: false });
    }

    addConsultantDataToForm(
        consultant: ConsultantContractsDataQueryDto,
        consultantIndex: number
    ) {
        const form = this._fb.group({
            consultantPeriodId: new UntypedFormControl(
                consultant?.consultantPeriodId
            ),
            consultantId: new UntypedFormControl(consultant?.consultantId),
            consultant: new UntypedFormControl(consultant?.consultant),
            nameOnly: new UntypedFormControl(consultant?.nameOnly),
            startDate: new UntypedFormControl(consultant?.startDate),
            endDate: new UntypedFormControl(consultant?.endDate),
            noEndDate: new UntypedFormControl(consultant?.noEndDate),
            consultantType: new UntypedFormControl(
                this.findItemById(
                    this.employmentTypes,
                    consultant?.employmentTypeId
                )
            ),
            consultantCapOnTimeReporting: new UntypedFormControl(
                this.findItemById(
                    this.consultantTimeReportingCapList,
                    consultant?.consultantTimeReportingCapId
                )
            ),
            consultantCapOnTimeReportingValue: new UntypedFormControl(
                consultant?.consultantTimeReportingCapMaxValue
            ),
            consultantCapOnTimeReportingCurrency: new UntypedFormControl(
                this.findItemById(
                    this.currencies,
                    consultant?.consultantTimeReportingCapCurrencyId
                )
            ),
            consultantRateUnitType: new UntypedFormControl(
                this.findItemById(
                    this.currencies,
                    consultant?.consultantRate?.rateUnitTypeId
                )
            ),
            consultantRateCurrency: new UntypedFormControl(
                this.findItemById(
                    this.currencies,
                    consultant?.consultantRate?.currencyId
                )
            ),
            consultantRate: new UntypedFormControl(consultant.consultantRate),
            noSpecialContractTerms: new UntypedFormControl(
                consultant?.noSpecialContractTerms
            ),
            specialContractTerms: new UntypedFormControl(
                {
                    value: consultant?.specialContractTerms,
                    disabled: consultant?.noSpecialContractTerms,
                },
                Validators.required
            ),
            pdcPaymentEntityId: new UntypedFormControl(
                consultant?.pdcPaymentEntityId
            ),
            specialRates: new UntypedFormArray([]),
            consultantSpecialRateFilter: new UntypedFormControl(''),
            clientFees: new UntypedFormArray([]),
            consultantSpecialFeeFilter: new UntypedFormControl(''),
            projectLines: new UntypedFormArray([]),
        });
        this.contractsConsultantsDataForm.consultants.push(form);
        consultant.projectLines?.forEach((project: any) => {
            this.addProjectLinesToConsultantData(consultantIndex, project);
        });
        consultant.periodConsultantSpecialFees?.forEach((fee: any) => {
            this.addClientFeesToConsultantData(consultantIndex, fee);
        });
        consultant.periodConsultantSpecialRates?.forEach((rate: any) => {
            this.addSpecialRateToConsultantData(consultantIndex, rate);
        });

        this.manageConsultantRateAutocomplete(consultantIndex);
        this.manageConsultantFeeAutocomplete(consultantIndex);
    }

    get consultants(): UntypedFormArray {
        return this.contractsConsultantsDataForm.get(
            'consultants'
        ) as UntypedFormArray;
    }

    addConsultantLegalContract(consultant: ConsultantContractsDataQueryDto) {
        const form = this._fb.group({
            consultantId: new UntypedFormControl(consultant.consultantId),
            consultantPeriodId: new UntypedFormControl(
                consultant?.consultantPeriodId
            ),
            consultant: new UntypedFormControl(consultant.consultant),
            consultantType: new UntypedFormControl(
                this.findItemById(
                    this.employmentTypes,
                    consultant?.employmentTypeId
                )
            ),
            nameOnly: new UntypedFormControl(consultant.nameOnly),
            internalLegalContractDoneStatusId: new UntypedFormControl(
                consultant.internalLegalContractDoneStatusId
            ),
            consultantLegalContractDoneStatusId: new UntypedFormControl(
                consultant.consultantLegalContractDoneStatusId
            ),
            pdcPaymentEntityId: new UntypedFormControl(
                consultant.pdcPaymentEntityId
            ),
        });
        this.contractsSyncDataForm.consultants.push(form);
    }

    displayConsultantEmploymentType(employmentTypeId: number) {
        return this.employmentTypes.find((x) => x.id === employmentTypeId)
            ?.name!;
    }

    getRatesAndFees(clientId: number) {
        this._clientService
            .specialRatesGet(clientId, true)
            .pipe(finalize(() => {}))
            .subscribe((result) => {
                this.clientSpecialRateList = result.filter((x) => !x.isHidden);
            });
        this._clientService
            .specialFeesGet(clientId, true)
            .pipe(finalize(() => {}))
            .subscribe((result) => {
                this.clientSpecialFeeList = result.filter((x) => !x.isHidden);
            });
    }

    selectConsultantSpecialRate(
        event: any,
        consultantIndex: number,
        rate: ClientSpecialRateDto,
        consultantRateMenuTrigger: MatMenuTrigger
    ) {
        const consultantRate = new PeriodConsultantSpecialRateDto();
        consultantRate.id = undefined;
        consultantRate.clientSpecialRateId = rate.id;
        consultantRate.rateName = rate.internalName;
        consultantRate.reportingUnit = rate.specialRateReportingUnit;
        consultantRate.prodataToProdataRate = rate.proDataToProDataRate;
        consultantRate.prodataToProdataRateCurrencyId =
            rate.proDataToProDataRateCurrency?.id;
        consultantRate.consultantRate = rate.consultantRate;
        consultantRate.consultantRateCurrencyId = rate.consultantCurrency?.id;
        consultantRate.rateSpecifiedAs = rate.specialRateSpecifiedAs;
        if (consultantRate.rateSpecifiedAs?.id === 1) {
            consultantRate.prodataToProdataRate = +(
                (this.contractsConsultantsDataForm.consultants
                    .at(consultantIndex)!
                    .get('consultantRate')!.value?.normalRate *
                    rate.proDataToProDataRate!) /
                100
            ).toFixed(2);
            consultantRate.prodataToProdataRateCurrencyId =
                this.contractsConsultantsDataForm.consultants
                    .at(consultantIndex)!
                    .get('consultantRateCurrency')!.value?.id;
            consultantRate.consultantRate = +(
                (this.contractsConsultantsDataForm.consultants
                    .at(consultantIndex)!
                    .get('consultantRate')!.value?.normalRate *
                    rate.consultantRate!) /
                100
            ).toFixed(2);
            consultantRate.consultantRateCurrencyId =
                this.contractsConsultantsDataForm.consultants
                    .at(consultantIndex)!
                    .get('consultantRateCurrency')!.value?.id;
        } else {
            consultantRate.prodataToProdataRate = rate.proDataToProDataRate;
            consultantRate.prodataToProdataRateCurrencyId =
                rate.proDataToProDataRateCurrency?.id;
            consultantRate.consultantRate = rate.consultantRate;
            consultantRate.consultantRateCurrencyId =
                rate.consultantCurrency?.id;
        }
        consultantRateMenuTrigger.closeMenu();
        this.addSpecialRateToConsultantData(consultantIndex, consultantRate);
    }

    addSpecialRateToConsultantData(
        index: number,
        clientRate?: PeriodConsultantSpecialRateDto
    ) {
        const form = this._fb.group({
            id: new UntypedFormControl(clientRate?.id ?? null),
            clientSpecialRateId: new UntypedFormControl(
                clientRate?.clientSpecialRateId ?? null
            ),
            rateName: new UntypedFormControl(clientRate?.rateName ?? null),
            reportingUnit: new UntypedFormControl(
                clientRate?.reportingUnit ?? null
            ),
            proDataRateValue: new UntypedFormControl(
                clientRate?.prodataToProdataRate ?? null
            ),
            proDataRateCurrency: new UntypedFormControl(
                this.findItemById(
                    this.currencies,
                    clientRate?.prodataToProdataRateCurrencyId
                ) ?? null
            ),
            consultantRateValue: new UntypedFormControl(
                clientRate?.consultantRate ?? null
            ),
            consultantRateCurrency: new UntypedFormControl(
                this.findItemById(
                    this.currencies,
                    clientRate?.consultantRateCurrencyId
                ) ?? null
            ),
            editable: new UntypedFormControl(clientRate ? false : true),
        });

        (
            this.contractsConsultantsDataForm.consultants
                .at(index)
                .get('specialRates') as UntypedFormArray
        ).push(form);
    }

    removeConsultantDataSpecialRate(
        consultantIndex: number,
        rateIndex: number
    ) {
        (
            this.contractsConsultantsDataForm.consultants
                .at(consultantIndex)
                .get('specialRates') as UntypedFormArray
        ).removeAt(rateIndex);
    }

    editOrSaveConsultantSpecialRate(
        isEditable: boolean,
        consultantIndex: number,
        rateIndex: number
    ) {
        if (isEditable) {
            this.consultantRateToEdit = new PeriodConsultantSpecialRateDto();
            this.isConsultantRateEditing = false;
        } else {
            const consultantRateValue = (
                this.consultants
                    .at(consultantIndex)
                    .get('specialRates') as UntypedFormArray
            ).at(rateIndex).value;
            this.consultantRateToEdit = new PeriodConsultantSpecialRateDto({
                id: consultantRateValue.id,
                clientSpecialRateId: consultantRateValue.clientSpecialRateId,
                rateName: consultantRateValue.rateName,
                reportingUnit: consultantRateValue.reportingUnit,
                prodataToProdataRate: consultantRateValue.proDataRateValue,
                prodataToProdataRateCurrencyId:
                    consultantRateValue.proDataRateCurrency?.id,
                consultantRate: consultantRateValue.consultantRateValue,
                consultantRateCurrencyId:
                    consultantRateValue.consultantRateCurrency?.id,
            });
            this.isConsultantRateEditing = true;
        }
        (
            this.consultants
                .at(consultantIndex)
                .get('specialRates') as UntypedFormArray
        )
            .at(rateIndex)
            .get('editable')
            ?.setValue(!isEditable, { emitEvent: false });
    }

    cancelEditConsultantRate(
        consultantIndex: number,
        specialRateIndex: number
    ) {
        const rateRow = (
            this.consultants
                .at(consultantIndex)
                .get('specialRates') as UntypedFormArray
        ).at(specialRateIndex);
        rateRow
            .get('proDataRateValue')
            ?.setValue(this.consultantRateToEdit.prodataToProdataRate, {
                emitEvent: false,
            });
        rateRow
            .get('proDataRateCurrency')
            ?.setValue(
                this.findItemById(
                    this.currencies,
                    this.consultantRateToEdit.prodataToProdataRateCurrencyId
                ),
                { emitEvent: false }
            );
        rateRow
            .get('consultantRateValue')
            ?.setValue(this.consultantRateToEdit.consultantRate, {
                emitEvent: false,
            });
        rateRow
            .get('consultantRateCurrency')
            ?.setValue(
                this.findItemById(
                    this.currencies,
                    this.consultantRateToEdit.consultantRateCurrencyId
                ),
                { emitEvent: false }
            );
        this.consultantRateToEdit = new PeriodConsultantSpecialRateDto();
        this.isConsultantRateEditing = false;
        (
            this.consultants
                .at(consultantIndex)
                .get('specialRates') as UntypedFormArray
        )
            .at(specialRateIndex)
            .get('editable')
            ?.setValue(false, { emitEvent: false });
    }

    getConsultantSpecialRateControls(index: number): AbstractControl[] | null {
        return (
            this.contractsConsultantsDataForm.consultants
                .at(index)
                .get('specialRates') as UntypedFormArray
        ).controls;
    }

    // #endregion Consultant data Special Rates

    // Consultant data Client fees START REGION

    selectConsultantSpecialFee(
        event: any,
        consultantIndex: number,
        fee: ClientSpecialFeeDto,
        consultantFeeMenuTrigger: MatMenuTrigger
    ) {
        const consultantFee = new PeriodConsultantSpecialFeeDto();
        consultantFee.id = undefined;
        consultantFee.clientSpecialFeeId = fee.id;
        consultantFee.feeName = fee.internalName;
        consultantFee.frequency = fee.clientSpecialFeeFrequency;
        consultantFee.prodataToProdataRate = fee.prodataToProdataRate;
        consultantFee.prodataToProdataRateCurrencyId =
            fee.prodataToProdataRateCurrency?.id;
        consultantFee.consultantRate = fee.consultantRate;
        consultantFee.consultantRateCurrencyId = fee.consultantCurrency?.id;
        consultantFeeMenuTrigger.closeMenu();
        this.addClientFeesToConsultantData(consultantIndex, consultantFee);
    }

    addClientFeesToConsultantData(
        index: number,
        clientFee?: PeriodConsultantSpecialFeeDto
    ) {
        const form = this._fb.group({
            id: new UntypedFormControl(clientFee?.id ?? null),
            clientSpecialFeeId: new UntypedFormControl(
                clientFee?.clientSpecialFeeId ?? null
            ),
            feeName: new UntypedFormControl(clientFee?.feeName ?? null),
            feeFrequency: new UntypedFormControl(clientFee?.frequency ?? null),
            proDataRateValue: new UntypedFormControl(
                clientFee?.prodataToProdataRate ?? null
            ),
            proDataRateCurrency: new UntypedFormControl(
                this.findItemById(
                    this.currencies,
                    clientFee?.prodataToProdataRateCurrencyId
                ) ?? null
            ),
            consultantRateValue: new UntypedFormControl(
                clientFee?.consultantRate ?? null
            ),
            consultantRateCurrency: new UntypedFormControl(
                this.findItemById(
                    this.currencies,
                    clientFee?.consultantRateCurrencyId
                ) ?? null
            ),
            editable: new UntypedFormControl(false),
        });
        (
            this.contractsConsultantsDataForm.consultants
                .at(index)
                .get('clientFees') as UntypedFormArray
        ).push(form);
    }

    removeConsultantDataClientFees(consultantIndex: number, feeIndex: number) {
        (
            this.contractsConsultantsDataForm.consultants
                .at(consultantIndex)
                .get('clientFees') as UntypedFormArray
        ).removeAt(feeIndex);
    }

    editOrSaveConsultantSpecialFee(
        isEditable: boolean,
        consultantIndex: number,
        feeIndex: number
    ) {
        if (isEditable) {
            this.consultantFeeToEdit = new PeriodConsultantSpecialFeeDto();
            this.isConsultantFeeEditing = false;
        } else {
            const consultantFeeValue = (
                this.consultants
                    .at(consultantIndex)
                    .get('clientFees') as UntypedFormArray
            ).at(feeIndex).value;
            this.consultantFeeToEdit = new PeriodConsultantSpecialFeeDto({
                id: consultantFeeValue.id,
                clientSpecialFeeId: consultantFeeValue.clientSpecialFeeId,
                feeName: consultantFeeValue.feeName,
                frequency: consultantFeeValue.feeFrequency,
                prodataToProdataRate: consultantFeeValue.proDataRateValue,
                prodataToProdataRateCurrencyId:
                    consultantFeeValue.proDataRateCurrency?.id,
                consultantRate: consultantFeeValue.consultantRateValue,
                consultantRateCurrencyId:
                    consultantFeeValue.consultantRateCurrency?.id,
            });
            this.isConsultantFeeEditing = true;
        }
        (
            this.consultants
                .at(consultantIndex)
                .get('clientFees') as UntypedFormArray
        )
            .at(feeIndex)
            .get('editable')
            ?.setValue(!isEditable, { emitEvent: false });
    }

    cancelEditConsultantFee(consultantIndex: number, specialFeeIndex: number) {
        const feeRow = (
            this.consultants
                .at(consultantIndex)
                .get('clientFees') as UntypedFormArray
        ).at(specialFeeIndex);
        feeRow
            .get('proDataRateValue')
            ?.setValue(this.consultantFeeToEdit?.prodataToProdataRate, {
                emitEvent: false,
            });
        feeRow
            .get('proDataRateCurrency')
            ?.setValue(
                this.findItemById(
                    this.currencies,
                    this.consultantFeeToEdit?.prodataToProdataRateCurrencyId
                ),
                { emitEvent: false }
            );
        feeRow
            .get('consultantRateValue')
            ?.setValue(this.consultantFeeToEdit?.consultantRate, {
                emitEvent: false,
            });
        feeRow
            .get('consultantRateCurrency')
            ?.setValue(
                this.findItemById(
                    this.currencies,
                    this.consultantFeeToEdit?.consultantRateCurrencyId
                ),
                { emitEvent: false }
            );
        this.consultantFeeToEdit = new PeriodConsultantSpecialFeeDto();
        this.isConsultantFeeEditing = false;
        (
            this.consultants
                .at(consultantIndex)
                .get('clientFees') as UntypedFormArray
        )
            .at(specialFeeIndex)
            .get('editable')
            ?.setValue(false, { emitEvent: false });
    }

    getConsultantClientFeesControls(index: number): AbstractControl[] | null {
        return (
            this.contractsConsultantsDataForm.consultants
                .at(index)
                .get('clientFees') as UntypedFormArray
        ).controls;
    }
    // Consultant data Client fees END REGION

    // Consultant data Project Lines START REGION

    createOrEditProjectLine(
        index: number,
        projectLinesMenuTrigger?: MatMenuTrigger,
        projectLinesIndex?: number
    ) {
        if (projectLinesMenuTrigger) {
            projectLinesMenuTrigger.closeMenu();
        }
        const scrollStrategy = this.overlay.scrollStrategies.reposition();
        let projectLine = {
            projectName: this.contractsMainForm.projectName!.value,
            startDate: this.contractsConsultantsDataForm.consultants
                .at(index)
                .get('startDate')?.value,
            endDate: this.contractsConsultantsDataForm.consultants
                .at(index)
                .get('endDate')?.value,
            noEndDate: this.contractsConsultantsDataForm.consultants
                .at(index)
                .get('noEndDate')?.value,
            debtorNumber: this.contractsMainForm!.customDebtorNumber?.value,
            invoicingReferenceNumber:
                this.contractClientForm.invoicingReferenceNumber?.value,
            invoiceRecipient:
                this.contractClientForm.clientInvoicingRecipient?.value,
            invoicingReferencePerson:
                this.contractClientForm.invoicingReferencePerson?.value,
        };
        if (projectLinesIndex !== null && projectLinesIndex !== undefined) {
            projectLine = (
                this.contractsConsultantsDataForm.consultants
                    .at(index)
                    .get('projectLines') as UntypedFormArray
            ).at(projectLinesIndex!).value;
        }
        const dialogRef = this.dialog.open(
            AddOrEditProjectLineDialogComponent,
            {
                width: '760px',
                minHeight: '180px',
                height: 'auto',
                scrollStrategy,
                backdropClass: 'backdrop-modal--wrapper',
                autoFocus: false,
                panelClass: 'confirmation-modal',
                data: {
                    dialogType:
                        projectLinesIndex !== null &&
                        projectLinesIndex !== undefined
                            ? ProjectLineDiallogMode.Edit
                            : ProjectLineDiallogMode.Create,
                    projectLineData: projectLine,
                    clientId: this.contractClientForm.directClientId?.value,
                },
            }
        );

        dialogRef.componentInstance.onConfirmed.subscribe((projectLine) => {
            if (projectLinesIndex !== null && projectLinesIndex !== undefined) {
                this.editProjectLineValue(
                    index,
                    projectLinesIndex,
                    projectLine
                );
            } else {
                this.addProjectLinesToConsultantData(index, projectLine);
            }
        });
    }

    addProjectLinesToConsultantData(
        index: number,
        projectLine?: ProjectLineDto
    ) {
        if (projectLine) {
            if (!projectLine?.differentDebtorNumber) {
                projectLine!.debtorNumber =
                    this.contractsMainForm!.customDebtorNumber?.value;
            }
            if (!projectLine?.differentInvoiceRecipient) {
                projectLine!.invoiceRecipient =
                    this.contractClientForm.clientInvoicingRecipient?.value;
            }
            if (!projectLine?.differentInvoicingReferenceNumber) {
                projectLine!.invoicingReferenceNumber =
                    this.contractClientForm.invoicingReferenceNumber?.value;
            }
            if (!projectLine?.differentInvoicingReferencePerson) {
                projectLine!.invoicingReferencePerson =
                    this.contractClientForm.invoicingReferencePerson?.value;
            }
        }
        const form = this._fb.group({
            id: new UntypedFormControl(projectLine?.id ?? null),
            projectName: new UntypedFormControl(
                projectLine?.projectName ?? null
            ),
            startDate: new UntypedFormControl(projectLine?.startDate ?? null),
            endDate: new UntypedFormControl(projectLine?.endDate ?? null),
            noEndDate: new UntypedFormControl(projectLine?.noEndDate ?? false),
            invoicingReferenceNumber: new UntypedFormControl(
                projectLine?.invoicingReferenceNumber ?? null
            ),
            differentInvoicingReferenceNumber: new UntypedFormControl(
                projectLine?.differentInvoicingReferenceNumber ?? null
            ),
            invoicingReferencePersonId: new UntypedFormControl(
                projectLine?.invoicingReferencePersonId ??
                    projectLine?.invoicingReferenceString
            ),
            invoicingReferencePerson: new UntypedFormControl(
                projectLine?.invoicingReferencePerson?.id
                    ? projectLine?.invoicingReferencePerson
                    : projectLine?.invoicingReferenceString
            ),
            differentInvoicingReferencePerson: new UntypedFormControl(
                projectLine?.differentInvoicingReferencePerson ?? false
            ),
            optionalInvoicingInfo: new UntypedFormControl(
                projectLine?.optionalInvoicingInfo ?? null
            ),
            differentDebtorNumber: new UntypedFormControl(
                projectLine?.differentDebtorNumber ?? false
            ),
            debtorNumber: new UntypedFormControl(
                projectLine?.debtorNumber ?? null
            ),
            differentInvoiceRecipient: new UntypedFormControl(
                projectLine?.differentInvoiceRecipient ?? false
            ),
            invoiceRecipientId: new UntypedFormControl(
                projectLine?.invoiceRecipientId ?? null
            ),
            invoiceRecipient: new UntypedFormControl(
                projectLine?.invoiceRecipient ?? null
            ),
            modifiedById: new UntypedFormControl(
                projectLine?.modifiedById ?? null
            ),
            modifiedBy: new UntypedFormControl(projectLine?.modifiedBy ?? null),
            modificationDate: new UntypedFormControl(
                projectLine?.modificationDate ?? null
            ),
            consultantInsuranceOptionId: new UntypedFormControl(
                projectLine?.consultantInsuranceOptionId
            ),
            markedForLegacyDeletion: new UntypedFormControl(
                projectLine?.markedForLegacyDeletion
            ),
            wasSynced: new UntypedFormControl(projectLine?.wasSynced),
            isLineForFees: new UntypedFormControl(projectLine?.isLineForFees),
        });
        (
            this.contractsConsultantsDataForm.consultants
                .at(index)
                .get('projectLines') as UntypedFormArray
        ).push(form);
    }

    editProjectLineValue(
        consultantIndex: number,
        projectLinesIndex: number,
        projectLineData: any
    ) {
        const projectLineRow = (
            this.contractsConsultantsDataForm.consultants
                .at(consultantIndex)
                .get('projectLines') as UntypedFormArray
        ).at(projectLinesIndex);
        projectLineRow
            .get('id')
            ?.setValue(projectLineData.id, { emitEvent: false });
        projectLineRow
            .get('projectName')
            ?.setValue(projectLineData.projectName, { emitEvent: false });
        projectLineRow
            .get('startDate')
            ?.setValue(projectLineData.startDate, { emitEvent: false });
        projectLineRow
            .get('endDate')
            ?.setValue(projectLineData.endDate, { emitEvent: false });
        projectLineRow
            .get('noEndDate')
            ?.setValue(projectLineData.noEndDate, { emitEvent: false });
        projectLineRow
            .get('invoicingReferenceNumber')
            ?.setValue(projectLineData.invoicingReferenceNumber, {
                emitEvent: false,
            });
        projectLineRow
            .get('differentInvoicingReferenceNumber')
            ?.setValue(projectLineData.differentInvoicingReferenceNumber, {
                emitEvent: false,
            });
        projectLineRow
            .get('invoicingReferencePersonId')
            ?.setValue(
                projectLineData.invoicingReferencePersonId ??
                    projectLineData.invoicingReferenceString,
                { emitEvent: false }
            );
        projectLineRow
            .get('invoicingReferencePerson')
            ?.setValue(
                projectLineData.invoicingReferencePerson?.id
                    ? projectLineData.invoicingReferencePerson
                    : projectLineData.invoicingReferenceString,
                { emitEvent: false }
            );
        projectLineRow
            .get('differentInvoicingReferencePerson')
            ?.setValue(projectLineData.differentInvoicingReferencePerson, {
                emitEvent: false,
            });
        projectLineRow
            .get('optionalInvoicingInfo')
            ?.setValue(projectLineData.optionalInvoicingInfo, {
                emitEvent: false,
            });
        projectLineRow
            .get('differentDebtorNumber')
            ?.setValue(projectLineData.differentDebtorNumber, {
                emitEvent: false,
            });
        projectLineRow
            .get('debtorNumber')
            ?.setValue(projectLineData.debtorNumber, { emitEvent: false });
        projectLineRow
            .get('differentInvoiceRecipient')
            ?.setValue(projectLineData.differentInvoiceRecipient, {
                emitEvent: false,
            });
        projectLineRow
            .get('invoiceRecipientId')
            ?.setValue(projectLineData.invoiceRecipientId, {
                emitEvent: false,
            });
        projectLineRow
            .get('invoiceRecipient')
            ?.setValue(projectLineData.invoiceRecipient, { emitEvent: false });
        projectLineRow
            .get('modifiedById')
            ?.setValue(projectLineData.modifiedById, { emitEvent: false });
        projectLineRow
            .get('modifiedBy')
            ?.setValue(projectLineData.modifiedBy, { emitEvent: false });
        projectLineRow
            .get('modificationDate')
            ?.setValue(projectLineData.modificationDate, { emitEvent: false });
        projectLineRow
            .get('consultantInsuranceOptionId')
            ?.setValue(projectLineData.consultantInsuranceOptionId, {
                emitEvent: false,
            });
        projectLineRow
            .get('markedForLegacyDeletion')
            ?.setValue(projectLineData.markedForLegacyDeletion, {
                emitEvent: false,
            });
        projectLineRow
            .get('wasSynced')
            ?.setValue(projectLineData.wasSynced, { emitEvent: false });
        projectLineRow
            .get('isLineForFees')
            ?.setValue(projectLineData.isLineForFees, { emitEvent: false });
    }

    duplicateProjectLine(consultantIndex: number, projectLinesIndex: number) {
        const projectLineRowValue: ProjectLineDto = new ProjectLineDto(
            (
                this.contractsConsultantsDataForm.consultants
                    .at(consultantIndex)
                    .get('projectLines') as UntypedFormArray
            ).at(projectLinesIndex).value
        );
        projectLineRowValue.id = undefined; // to create a new instance of project line
        projectLineRowValue.wasSynced = false;
        projectLineRowValue.isLineForFees = false;
        this.addProjectLinesToConsultantData(
            consultantIndex,
            projectLineRowValue
        );
    }

    removeConsultantDataProjectLines(
        consultantIndex: number,
        projectLineIndex: number
    ) {
        (
            this.contractsConsultantsDataForm.consultants
                .at(consultantIndex)
                .get('projectLines') as UntypedFormArray
        ).removeAt(projectLineIndex);
    }

    editOrSaveConsultantProjectLine(
        isEditMode: boolean,
        consultantIndex: number,
        projectLineIndex: number
    ) {
        (
            this.contractsConsultantsDataForm.consultants
                .at(consultantIndex)
                .get('projectLines') as UntypedFormArray
        )
            .at(projectLineIndex)
            .get('editable')
            ?.setValue(!isEditMode, { emitEvent: false });
    }

    getConsultantProjectLinesControls(index: number): AbstractControl[] | null {
        return (
            this.contractsConsultantsDataForm.consultants
                .at(index)
                .get('projectLines') as UntypedFormArray
        ).controls;
    }

    toggleMarkProjectLineForDeletion(
        previousValue: boolean,
        consultantIndex: number,
        projectLineIndex: number
    ) {
        (
            this.contractsConsultantsDataForm.consultants
                .at(consultantIndex)
                .get('projectLines') as UntypedFormArray
        )
            .at(projectLineIndex)
            .get('markedForLegacyDeletion')
            ?.setValue(!previousValue, { emitEvent: false });
    }
    // Consultant data Project Lines END REGION

    compareWithFn(listOfItems: any, selectedItem: any) {
        return (
            listOfItems && selectedItem && listOfItems.id === selectedItem.id
        );
    }

    displayNameFn(option: any) {
        return option?.name;
    }

    resetForms() {
        this.statusAfterSync = false;
        this.contractsMainForm.reset('', { emitEvent: false });
        this.contractClientForm.reset('', { emitEvent: false });
        this.contractClientForm.clientRates.controls = [];
        this.contractClientForm.clientFees.controls = [];
        this.contractsConsultantsDataForm.consultants.controls = [];
        this.contractsTerminationConsultantForm.consultantTerminationContractData.controls =
            [];
        this.contractsSyncDataForm.consultants.controls = [];
    }

    //#region Start client period
    getStartChangeOrExtendClientPeriodContracts(isFromSyncToLegacy?: boolean) {
        this.resetForms();
        this.showMainSpinner();
        this._clientPeriodService
            .clientContractsGet(this.periodId!)
            .pipe(
                finalize(() => {
                    if (!isFromSyncToLegacy) {
                        this.hideMainSpinner();
                    }
                })
            )
            .subscribe((result) => {
                // Main data
                this.contractsMainForm.salesType?.setValue(
                    this.findItemById(
                        this.saleTypes,
                        result.mainData?.salesTypeId
                    ),
                    { emitEvent: false }
                );
                this.contractsMainForm.deliveryType?.setValue(
                    this.findItemById(
                        this.deliveryTypes,
                        result.mainData?.deliveryTypeId
                    ),
                    { emitEvent: false }
                );
                this.contractsMainForm.discounts?.setValue(
                    this.findItemById(
                        this.discounts,
                        result.mainData?.discountId
                    ),
                    { emitEvent: false }
                );
                this.contractsMainForm.projectType?.setValue(
                    this.findItemById(
                        this.projectTypes,
                        result.mainData?.projectTypeId
                    ),
                    { emitEvent: false }
                );
                this.contractsMainForm.margin?.setValue(
                    this.findItemById(this.margins, result.mainData?.marginId),
                    { emitEvent: false }
                );
                this.contractsMainForm.projectDescription?.setValue(
                    result.mainData?.projectDescription,
                    { emitEvent: false }
                );
                this.contractsMainForm.projectName?.setValue(
                    result.mainData?.projectName,
                    { emitEvent: false }
                );
                this.contractsMainForm.noRemarks?.setValue(
                    result.mainData?.noRemarks,
                    { emitEvent: false }
                );
                this.contractsMainForm.remarks?.setValue(
                    result.mainData?.remarks,
                    { emitEvent: false }
                );
                if (result.mainData?.noRemarks) {
                    this.contractsMainForm.remarks?.disable();
                }
                // Client data
                this.contractClientForm.directClientId?.setValue(
                    result.clientData?.directClientId
                );
                if (result?.clientData?.directClientId) {
                    this.getRatesAndFees(result?.clientData?.directClientId);
                }
                this.contractClientForm.pdcInvoicingEntityId?.setValue(
                    result.clientData?.pdcInvoicingEntityId
                );
                this.contractClientForm.clientTimeReportingCapId?.setValue(
                    this.findItemById(
                        this.clientTimeReportingCap,
                        result.clientData?.clientTimeReportingCapId
                    ),
                    { emitEvent: false }
                );
                this.contractClientForm.rateUnitType?.setValue(
                    this.findItemById(
                        this.rateUnitTypes,
                        result.clientData?.clientRate?.rateUnitTypeId
                    ),
                    { emitEvent: false }
                );
                this.contractClientForm.currency?.setValue(
                    this.findItemById(
                        this.currencies,
                        result.clientData?.clientRate?.currencyId
                    ),
                    { emitEvent: false }
                );
                this.contractClientForm.clientRate?.setValue(
                    result.clientData?.clientRate
                ),
                    this.contractClientForm.clientTimeReportingCapMaxValue?.setValue(
                        result.clientData?.clientTimeReportingCapMaxValue,
                        { emitEvent: false }
                    );
                this.contractClientForm.clientTimeReportingCapCurrencyId?.setValue(
                    this.findItemById(
                        this.currencies,
                        result.clientData?.clientTimeReportingCapCurrencyId
                    ),
                    { emitEvent: false }
                );
                this.contractClientForm.specialContractTerms?.setValue(
                    result.clientData?.specialContractTerms,
                    { emitEvent: false }
                );
                this.contractClientForm.noSpecialContractTerms?.setValue(
                    result.clientData?.noSpecialContractTerms,
                    { emitEvent: false }
                );
                if (result.clientData?.noSpecialContractTerms) {
                    this.contractClientForm.specialContractTerms?.disable();
                }
                this.contractClientForm.invoicingReferenceNumber?.setValue(
                    result.clientData?.invoicingReferenceNumber,
                    { emitEvent: false }
                );
                this.contractClientForm.clientInvoicingRecipientIdValue?.setValue(
                    result.clientData?.clientInvoicingRecipientIdValue,
                    { emitEvent: false }
                );
                this.contractClientForm.clientInvoicingRecipient?.setValue(
                    result.clientData?.clientInvoicingRecipient,
                    { emitEvent: false }
                );
                this.contractClientForm.invoicingReferencePersonIdValue?.setValue(
                    result.clientData?.invoicingReferencePersonIdValue,
                    { emitEvent: false }
                );
                this.contractClientForm.invoicingReferencePerson?.setValue(
                    result.clientData?.invoicingReferencePerson,
                    { emitEvent: false }
                );

                this.contractsSyncDataForm.clientLegalContractDoneStatusId?.setValue(
                    result?.clientLegalContractDoneStatusId,
                    { emitEvent: false }
                );
                this.contractsSyncDataForm.enableLegalContractsButtons?.setValue(
                    result?.enableLegalContractsButtons,
                    { emitEvent: false }
                );
                this.contractsSyncDataForm.showManualOption?.setValue(
                    result?.showManualOption,
                    { emitEvent: false }
                );
                this.contractsSyncDataForm.manualCheckbox?.setValue(
                    result.contractLinesDoneManuallyInOldPm,
                    { emitEvent: false }
                );
                this.contractsSyncDataForm.isNewSyncNeeded?.setValue(
                    result?.isNewSyncNeeded,
                    { emitEvent: false }
                );
                this.contractsSyncDataForm.lastSyncedDate?.setValue(
                    result?.lastSyncedDate,
                    { emitEvent: false }
                );
                if (result.clientData?.periodClientSpecialRates?.length) {
                    result.clientData.periodClientSpecialRates.forEach(
                        (rate: PeriodClientSpecialRateDto) => {
                            this.addSpecialRate(rate);
                        }
                    );
                }

                if (result.clientData?.periodClientSpecialFees?.length) {
                    result.clientData.periodClientSpecialFees.forEach(
                        (fee: PeriodClientSpecialFeeDto) => {
                            this.addClientFee(fee);
                        }
                    );
                }

                if (result.consultantData?.length) {
                    result.consultantData.forEach(
                        (
                            consultant: ConsultantContractsDataQueryDto,
                            index
                        ) => {
                            this.addConsultantDataToForm(consultant, index);
                            this.addConsultantLegalContract(consultant);
                        }
                    );
                    this.updateConsultantStepAnchors();
                }
                if (isFromSyncToLegacy) {
                    this.processSyncToLegacySystem();
                }
            });
    }

    manageConsultantRateAutocomplete(consultantIndex: number) {
        let arrayControl = this.consultants.at(consultantIndex);
        arrayControl!
            .get('consultantSpecialRateFilter')!
            .valueChanges.pipe(takeUntil(this._unsubscribe))
            .subscribe((value) => {
                if (typeof value === 'string') {
                    this.filteredConsultantSpecialRates =
                        this._filterConsultantRates(value, consultantIndex);
                }
            });
    }

    private _filterConsultantRates(
        value: string,
        consultantIndex: number
    ): ClientSpecialFeeDto[] {
        const filterValue = value.toLowerCase();
        const result = this.clientSpecialRateList.filter((option) =>
            option.internalName!.toLowerCase().includes(filterValue)
        );
        return result;
    }

    manageConsultantFeeAutocomplete(consultantIndex: number) {
        let arrayControl = this.consultants.at(consultantIndex);
        arrayControl!
            .get('consultantSpecialFeeFilter')!
            .valueChanges.pipe(takeUntil(this._unsubscribe))
            .subscribe((value) => {
                if (typeof value === 'string') {
                    this.filteredConsultantSpecialFees =
                        this._filterConsultantFees(value, consultantIndex);
                }
            });
    }

    private _filterConsultantFees(
        value: string,
        consultantIndex: number
    ): ClientSpecialFeeDto[] {
        const filterValue = value.toLowerCase();
        const result = this.clientSpecialFeeList.filter((option) =>
            option.internalName!.toLowerCase().includes(filterValue)
        );
        return result;
    }

    saveStartChangeOrExtendClientPeriodContracts(
        isDraft: boolean,
        isSyncToLegacy?: boolean
    ) {
        let input = new ClientPeriodContractsDataCommandDto();
        input.clientData = new ContractsClientDataDto();
        input.clientData.specialContractTerms =
            this.contractClientForm.specialContractTerms?.value;
        input.clientData.noSpecialContractTerms =
            this.contractClientForm.noSpecialContractTerms?.value;
        input.clientData.clientTimeReportingCapId =
            this.contractClientForm.clientTimeReportingCapId?.value?.id;
        input.clientData.clientTimeReportingCapMaxValue =
            this.contractClientForm.clientTimeReportingCapMaxValue?.value;
        input.clientData.clientTimeReportingCapCurrencyId =
            this.contractClientForm.clientTimeReportingCapCurrencyId?.value?.id;
        input.clientData.clientRate = this.contractClientForm.clientRate?.value;
        input.clientData.pdcInvoicingEntityId =
            this.contractClientForm.pdcInvoicingEntityId?.value;
        input.clientData.periodClientSpecialRates =
            new Array<PeriodClientSpecialRateDto>();
        if (this.contractClientForm.clientRates.value?.length) {
            for (let specialRate of this.contractClientForm.clientRates.value) {
                const clientSpecialRate = new PeriodClientSpecialRateDto();
                clientSpecialRate.id = specialRate.id;
                clientSpecialRate.clientSpecialRateId =
                    specialRate.clientSpecialRateId;
                clientSpecialRate.rateName = specialRate.rateName;
                clientSpecialRate.reportingUnit = specialRate.reportingUnit;
                clientSpecialRate.clientRate = specialRate.clientRateValue;
                clientSpecialRate.clientRateCurrencyId =
                    specialRate.clientRateCurrency?.id;
                input.clientData.periodClientSpecialRates.push(
                    clientSpecialRate
                );
            }
        }
        input.clientData.noSpecialRate =
            this.contractClientForm.clientRates.value?.length === 0;
        input.clientData.periodClientSpecialFees =
            new Array<PeriodClientSpecialFeeDto>();
        if (this.contractClientForm.clientFees.value?.length) {
            for (let specialFee of this.contractClientForm.clientFees.value) {
                const clientSpecialFee = new PeriodClientSpecialFeeDto();
                clientSpecialFee.id = specialFee.id;
                clientSpecialFee.clientSpecialFeeId =
                    specialFee.clientSpecialFeeId;
                clientSpecialFee.feeName = specialFee.feeName;
                clientSpecialFee.frequency = specialFee.feeFrequency;
                clientSpecialFee.clientRate = specialFee.clientRateValue;
                clientSpecialFee.clientRateCurrencyId =
                    specialFee.clientRateCurrency?.id;
                input.clientData.periodClientSpecialFees.push(clientSpecialFee);
            }
        }
        input.clientData.noSpecialFee =
            this.contractClientForm.clientFees.value?.length === 0;
        input.contractLinesDoneManuallyInOldPm =
            this.contractsSyncDataForm.manualCheckbox?.value ?? false;

        input.mainData = new ContractsMainDataDto();
        input.mainData.projectDescription =
            this.contractsMainForm.projectDescription?.value;
        input.mainData.projectName = this.contractsMainForm.projectName?.value;
        input.mainData.projectTypeId =
            this.contractsMainForm.projectType?.value?.id;
        input.mainData.salesTypeId =
            this.contractsMainForm.salesType?.value?.id;
        input.mainData.deliveryTypeId =
            this.contractsMainForm.deliveryType?.value?.id;
        input.mainData.marginId = this.contractsMainForm.margin?.value?.id;
        input.mainData.discountId = this.contractsMainForm.discounts?.value?.id;
        input.mainData.remarks = this.contractsMainForm.remarks?.value;
        input.mainData.noRemarks = this.contractsMainForm.noRemarks?.value;

        input.consultantData = new Array<ConsultantContractsDataCommandDto>();
        if (this.contractsConsultantsDataForm?.consultants?.value?.length) {
            for (let consultant of this.contractsConsultantsDataForm.consultants
                .value) {
                let consultantData = new ConsultantContractsDataCommandDto();
                consultantData.consultantPeriodId =
                    consultant.consultantPeriodId;
                consultantData.employmentTypeId = consultant.consultantType?.id;
                consultantData.consultantId = consultant.consultantId;
                consultantData.nameOnly = consultant.nameOnly;
                consultantData.consultantTimeReportingCapId =
                    consultant.consultantCapOnTimeReporting?.id;
                consultantData.consultantTimeReportingCapMaxValue =
                    consultant.consultantCapOnTimeReportingValue;
                consultantData.consultantTimeReportingCapCurrencyId =
                    consultant.consultantCapOnTimeReportingCurrency?.id;
                consultantData.noSpecialContractTerms =
                    consultant.noSpecialContractTerms;
                consultantData.specialContractTerms =
                    consultant.specialContractTerms;
                consultantData.consultantRate = consultant.consultantRate;
                consultantData.pdcPaymentEntityId =
                    consultant.pdcPaymentEntityId;

                consultantData.periodConsultantSpecialFees =
                    new Array<PeriodConsultantSpecialFeeDto>();
                if (consultant.clientFees?.length) {
                    for (let specialFee of consultant.clientFees) {
                        let consultantFee = new PeriodConsultantSpecialFeeDto();
                        consultantFee.id = specialFee.id;
                        consultantFee.clientSpecialFeeId =
                            specialFee.clientSpecialFeeId;
                        consultantFee.feeName = specialFee.feeName;
                        consultantFee.frequency = specialFee.feeFrequency;
                        consultantFee.prodataToProdataRate =
                            specialFee.proDataRateValue;
                        consultantFee.prodataToProdataRateCurrencyId =
                            specialFee.proDataRateCurrency?.id;
                        consultantFee.consultantRate =
                            specialFee.consultantRateValue;
                        consultantFee.consultantRateCurrencyId =
                            specialFee.consultantRateCurrency?.id;
                        consultantData.periodConsultantSpecialFees.push(
                            consultantFee
                        );
                    }
                }
                consultantData.noSpecialFee =
                    consultant.clientFees?.length === 0;
                consultantData.periodConsultantSpecialRates =
                    new Array<PeriodConsultantSpecialRateDto>();
                if (consultant.specialRates?.length) {
                    for (let specialRate of consultant.specialRates) {
                        let consultantRate =
                            new PeriodConsultantSpecialRateDto();
                        consultantRate.id = specialRate.id;
                        consultantRate.clientSpecialRateId =
                            specialRate.clientSpecialRateId;
                        consultantRate.rateName = specialRate.rateName;
                        consultantRate.reportingUnit =
                            specialRate.reportingUnit;
                        consultantRate.prodataToProdataRate =
                            specialRate.proDataRateValue;
                        consultantRate.prodataToProdataRateCurrencyId =
                            specialRate.proDataRateCurrency?.id;
                        consultantRate.consultantRate =
                            specialRate.consultantRateValue;
                        consultantRate.consultantRateCurrencyId =
                            specialRate.consultantRateCurrency?.id;
                        consultantData.periodConsultantSpecialRates.push(
                            consultantRate
                        );
                    }
                }
                consultantData.noSpecialRate =
                    consultant.clientSpecialRates?.length === 0;
                consultantData.projectLines = new Array<ProjectLineDto>();
                if (consultant.projectLines?.length) {
                    for (let projectLine of consultant.projectLines) {
                        let projectLineInput = new ProjectLineDto();
                        projectLineInput.id = projectLine.id;
                        projectLineInput.projectName = projectLine.projectName;
                        projectLineInput.startDate = projectLine.startDate;
                        projectLineInput.endDate = projectLine.endDate;
                        projectLineInput.noEndDate = projectLine.noEndDate;
                        projectLineInput.differentInvoicingReferenceNumber =
                            projectLine.differentInvoicingReferenceNumber;
                        if (
                            projectLineInput.differentInvoicingReferenceNumber
                        ) {
                            projectLineInput.invoicingReferenceNumber =
                                projectLine.invoicingReferenceNumber;
                        }
                        projectLineInput.differentInvoicingReferencePerson =
                            projectLine.differentInvoicingReferencePerson;
                        if (
                            projectLineInput.differentInvoicingReferencePerson
                        ) {
                            if (projectLine.invoicingReferencePerson?.id) {
                                projectLineInput.invoicingReferencePersonId =
                                    projectLine.invoicingReferencePersonId;
                                projectLineInput.invoicingReferencePerson =
                                    projectLine.invoicingReferencePerson;
                            } else {
                                projectLineInput.invoicingReferenceString =
                                    projectLine.invoicingReferencePersonId;
                            }
                        }
                        projectLineInput.optionalInvoicingInfo =
                            projectLine.optionalInvoicingInfo;
                        projectLineInput.differentDebtorNumber =
                            projectLine.differentDebtorNumber;
                        if (projectLineInput.differentDebtorNumber) {
                            projectLineInput.debtorNumber =
                                projectLine.debtorNumber;
                        }
                        projectLineInput.differentInvoiceRecipient =
                            projectLine.differentInvoiceRecipient;
                        if (projectLineInput.differentInvoiceRecipient) {
                            projectLineInput.invoiceRecipientId =
                                projectLine.invoiceRecipientId;
                            projectLineInput.invoiceRecipient =
                                projectLine.invoiceRecipient;
                        }
                        projectLineInput.modifiedById =
                            projectLine.modifiedById;
                        projectLineInput.modifiedBy = projectLine.modifiedBy;
                        projectLineInput.modificationDate =
                            projectLine.modificationDate;
                        projectLineInput.consultantInsuranceOptionId =
                            projectLine.consultantInsuranceOptionId;
                        projectLineInput.markedForLegacyDeletion =
                            projectLine.markedForLegacyDeletion;
                        projectLineInput.wasSynced = projectLine.wasSynced;
                        projectLineInput.isLineForFees =
                            projectLine.isLineForFees;

                        consultantData.projectLines.push(projectLineInput);
                    }
                }
                input.consultantData.push(consultantData);
            }
        }
        this.showMainSpinner();
        if (isDraft) {
            this._clientPeriodService
                .clientContractsPut(this.periodId!, input)
                .pipe(
                    finalize(() => {
                        if (!isSyncToLegacy) {
                            this.hideMainSpinner();
                        }
                    })
                )
                .subscribe((result) => {
                    this._workflowDataService.workflowOverviewUpdated.emit(
                        true
                    );
                    if (this.editEnabledForcefuly && !isSyncToLegacy) {
                        this.toggleEditMode();
                    }
                    this.getContractStepData(isSyncToLegacy);
                });
        } else {
            this._clientContractsService
                .editFinish(this.periodId!, input)
                .pipe(
                    finalize(() => {
                        this.hideMainSpinner();
                    })
                )
                .subscribe((result) => {
                    this._workflowDataService.workflowSideSectionUpdated.emit({
                        isStatusUpdate: true,
                    });
                    this._workflowDataService.workflowOverviewUpdated.emit(
                        true
                    );
                    this.getContractStepData();
                });
        }
    }
    //#endregion Start client period

    //#region Start consultant period
    getStartChangeOrExtendConsultantPeriodContracts(
        isFromSyncToLegacy?: boolean
    ) {
        this.resetForms();
        this.showMainSpinner();
        this._consultantPeriodService
            .consultantContractsGet(this.activeSideSection.consultantPeriodId!)
            .pipe(
                finalize(() => {
                    if (!isFromSyncToLegacy) {
                        this.hideMainSpinner();
                    }
                })
            )
            .subscribe((result) => {
                this.contractsMainForm.remarks?.setValue(result?.remarks, {
                    emitEvent: false,
                });
                this.contractsMainForm.noRemarks?.setValue(result?.noRemarks, {
                    emitEvent: false,
                });
                if (result?.noRemarks) {
                    this.contractsMainForm.remarks?.disable();
                }
                this.contractsMainForm.projectDescription?.setValue(
                    result?.projectDescription,
                    { emitEvent: false }
                );
                this.contractsMainForm.projectName?.setValue(
                    result?.projectName,
                    { emitEvent: false }
                );
                this.contractsMainForm.salesType?.setValue(
                    this.findItemById(
                        this.saleTypes,
                        result?.mainData?.salesTypeId
                    ),
                    { emitEvent: false }
                );
                this.contractsMainForm.deliveryType?.setValue(
                    this.findItemById(
                        this.deliveryTypes,
                        result?.mainData?.deliveryTypeId
                    ),
                    { emitEvent: false }
                );
                this.contractsMainForm.projectType?.setValue(
                    this.findItemById(
                        this.projectTypes,
                        result?.mainData?.projectTypeId
                    ),
                    { emitEvent: false }
                );
                this.contractsMainForm.margin?.setValue(
                    this.findItemById(this.margins, result?.mainData?.marginId),
                    { emitEvent: false }
                );
                this.contractsMainForm.discounts?.setValue(
                    this.findItemById(
                        this.discounts,
                        result?.mainData?.discountId
                    ),
                    { emitEvent: false }
                );
                this.contractsMainForm.customDebtorNumber?.setValue(
                    result?.customDebtorNumber,
                    { emitEvent: false }
                );

                this.contractClientForm.invoicingReferenceNumber?.setValue(
                    result.clientData?.invoicingReferenceNumber,
                    { emitEvent: false }
                );
                this.contractClientForm.clientInvoicingRecipientIdValue?.setValue(
                    result.clientData?.clientInvoicingRecipientIdValue,
                    { emitEvent: false }
                );
                this.contractClientForm.clientInvoicingRecipient?.setValue(
                    result.clientData?.clientInvoicingRecipient,
                    { emitEvent: false }
                );
                this.contractClientForm.invoicingReferencePersonIdValue?.setValue(
                    result.clientData?.invoicingReferencePersonIdValue,
                    { emitEvent: false }
                );
                this.contractClientForm.invoicingReferencePerson?.setValue(
                    result.clientData?.invoicingReferencePerson,
                    { emitEvent: false }
                );

                this.contractsSyncDataForm.manualCheckbox?.setValue(
                    result?.contractLinesDoneManuallyInOldPm,
                    { emitEvent: false }
                );
                this.contractsSyncDataForm.newLegalContract?.setValue(
                    result?.newLegalContractRequired,
                    { emitEvent: false }
                );
                this.contractsSyncDataForm.isNewSyncNeeded?.setValue(
                    result?.isNewSyncNeeded,
                    { emitEvent: false }
                );
                this.contractsSyncDataForm.lastSyncedDate?.setValue(
                    result?.lastSyncedDate,
                    { emitEvent: false }
                );

                this.addConsultantDataToForm(result?.consultantData!, 0);
                this.addConsultantLegalContract(result.consultantData!);
                this.updateConsultantStepAnchors();
                if (isFromSyncToLegacy) {
                    this.processSyncToLegacySystem();
                }
            });
    }

    saveStartChangeOrExtendConsultantPeriodContracts(
        isDraft: boolean,
        isSyncToLegacy?: boolean
    ) {
        let input = new ConsultantPeriodContractsDataCommandDto();
        input.remarks = this.contractsMainForm.remarks?.value;
        input.noRemarks = this.contractsMainForm.noRemarks?.value;
        input.projectDescription =
            this.contractsMainForm.projectDescription?.value;
        input.projectName = this.contractsMainForm.projectName?.value;
        input.mainData = new ContractsMainDataDto();
        input.mainData.projectTypeId =
            this.contractsMainForm.projectType?.value?.id;
        input.mainData.salesTypeId =
            this.contractsMainForm.salesType?.value?.id;
        input.mainData.deliveryTypeId =
            this.contractsMainForm.deliveryType?.value?.id;
        input.mainData.marginId = this.contractsMainForm.margin?.value?.id;
        input.mainData.discountId = this.contractsMainForm.discounts?.value?.id;

        input.consultantData = new ConsultantContractsDataCommandDto();
        const consultantInput =
            this.contractsConsultantsDataForm.consultants.at(0).value;
        if (consultantInput) {
            let consultantData = new ConsultantContractsDataCommandDto();
            consultantData.consultantPeriodId =
                consultantInput.consultantPeriodId;
            consultantData.employmentTypeId =
                consultantInput.consultantType?.id;
            consultantData.consultantId = consultantInput.consultantId;
            consultantData.nameOnly = consultantInput.nameOnly;
            consultantData.consultantTimeReportingCapId =
                consultantInput.consultantCapOnTimeReporting?.id;
            consultantData.consultantTimeReportingCapMaxValue =
                consultantInput.consultantCapOnTimeReportingValue;
            consultantData.consultantTimeReportingCapCurrencyId =
                consultantInput.consultantCapOnTimeReportingCurrency?.id;
            consultantData.noSpecialContractTerms =
                consultantInput.noSpecialContractTerms;
            consultantData.specialContractTerms =
                consultantInput.specialContractTerms;

            consultantData.periodConsultantSpecialFees =
                new Array<PeriodConsultantSpecialFeeDto>();
            if (consultantInput.clientFees?.length) {
                for (let specialFee of consultantInput.clientFees) {
                    let consultantFee = new PeriodConsultantSpecialFeeDto();
                    consultantFee.id = specialFee.id;
                    consultantFee.clientSpecialFeeId =
                        specialFee.clientSpecialFeeId;
                    consultantFee.feeName = specialFee.feeName;
                    consultantFee.frequency = specialFee.feeFrequency;
                    consultantFee.prodataToProdataRate =
                        specialFee.proDataRateValue;
                    consultantFee.prodataToProdataRateCurrencyId =
                        specialFee.proDataRateCurrency?.id;
                    consultantFee.consultantRate =
                        specialFee.consultantRateValue;
                    consultantFee.consultantRateCurrencyId =
                        specialFee.consultantRateCurrency?.id;
                    consultantData.periodConsultantSpecialFees.push(
                        consultantFee
                    );
                }
            }
            consultantData.noSpecialFee =
                consultantInput.clientFees?.length === 0;
            consultantData.periodConsultantSpecialRates =
                new Array<PeriodConsultantSpecialRateDto>();
            if (consultantInput.clientSpecialRates?.length) {
                for (let specialRate of consultantInput.clientSpecialRates) {
                    let consultantRate = new PeriodConsultantSpecialRateDto();
                    consultantRate.id = specialRate.id;
                    consultantRate.clientSpecialRateId =
                        specialRate.clientSpecialRateId;
                    consultantRate.rateName = specialRate.rateName;
                    consultantRate.reportingUnit = specialRate.reportingUnit;
                    consultantRate.prodataToProdataRate =
                        specialRate.proDataRateValue;
                    consultantRate.prodataToProdataRateCurrencyId =
                        specialRate.proDataRateCurrency?.id;
                    consultantRate.consultantRate =
                        specialRate.consultantRateValue;
                    consultantRate.consultantRateCurrencyId =
                        specialRate.consultantRateCurrency?.id;
                    consultantData.periodConsultantSpecialRates.push(
                        consultantRate
                    );
                }
            }
            consultantData.noSpecialRate =
                consultantInput.clientSpecialRates?.length === 0;
            consultantData.projectLines = new Array<ProjectLineDto>();
            if (consultantInput.projectLines?.length) {
                for (let projectLine of consultantInput.projectLines) {
                    let projectLineInput = new ProjectLineDto();
                    projectLineInput.id = projectLine.id;
                    projectLineInput.projectName = projectLine.projectName;
                    projectLineInput.startDate = projectLine.startDate;
                    projectLineInput.endDate = projectLine.endDate;
                    projectLineInput.noEndDate = projectLine.noEndDate;
                    projectLineInput.differentInvoicingReferenceNumber =
                        projectLine.differentInvoicingReferenceNumber;
                    if (projectLineInput.differentInvoicingReferenceNumber) {
                        projectLineInput.invoicingReferenceNumber =
                            projectLine.invoicingReferenceNumber;
                    }
                    projectLineInput.differentInvoicingReferencePerson =
                        projectLine.differentInvoicingReferencePerson;
                    if (projectLineInput.differentInvoicingReferencePerson) {
                        if (projectLine.invoicingReferencePerson?.id) {
                            projectLineInput.invoicingReferencePersonId =
                                projectLine.invoicingReferencePersonId;
                            projectLineInput.invoicingReferencePerson =
                                projectLine.invoicingReferencePerson;
                        } else {
                            projectLineInput.invoicingReferenceString =
                                projectLine.invoicingReferencePersonId;
                        }
                    }
                    projectLineInput.optionalInvoicingInfo =
                        projectLine.optionalInvoicingInfo;
                    projectLineInput.differentDebtorNumber =
                        projectLine.differentDebtorNumber;
                    if (projectLineInput.differentDebtorNumber) {
                        projectLineInput.debtorNumber =
                            projectLine.debtorNumber;
                    }
                    projectLineInput.differentInvoiceRecipient =
                        projectLine.differentInvoiceRecipient;
                    if (projectLineInput.differentInvoiceRecipient) {
                        projectLineInput.invoiceRecipientId =
                            projectLine.invoiceRecipientId;
                        projectLineInput.invoiceRecipient =
                            projectLine.invoiceRecipient;
                    }
                    projectLineInput.modifiedById = projectLine.modifiedById;
                    projectLineInput.modifiedBy = projectLine.modifiedBy;
                    projectLineInput.modificationDate =
                        projectLine.modificationDate;
                    projectLineInput.consultantInsuranceOptionId =
                        projectLine.consultantInsuranceOptionId;
                    projectLineInput.markedForLegacyDeletion =
                        projectLine.markedForLegacyDeletion;
                    projectLineInput.wasSynced = projectLine.wasSynced;
                    projectLineInput.isLineForFees = projectLine.isLineForFees;

                    consultantData.projectLines.push(projectLineInput);
                }
            }
            input.consultantData = consultantData;
        }
        input.contractLinesDoneManuallyInOldPm =
            this.contractsSyncDataForm.manualCheckbox?.value;
        input.newLegalContractRequired =
            this.contractsSyncDataForm.newLegalContract?.value;
        this.showMainSpinner();
        if (isDraft) {
            this._consultantPeriodService
                .consultantContractsPut(
                    this.activeSideSection.consultantPeriodId!,
                    input
                )
                .pipe(
                    finalize(() => {
                        if (!isSyncToLegacy) {
                            this.hideMainSpinner();
                        }
                    })
                )
                .subscribe((result) => {
                    this._workflowDataService.workflowOverviewUpdated.emit(
                        true
                    );
                    if (this.editEnabledForcefuly && !isSyncToLegacy) {
                        this.toggleEditMode();
                    }
                    this.getContractStepData(isSyncToLegacy);
                });
        } else {
            this._consultantContractsService
                .editFinish(this.activeSideSection.consultantPeriodId!, input)
                .pipe(
                    finalize(() => {
                        this.hideMainSpinner();
                    })
                )
                .subscribe((result) => {
                    this._workflowDataService.workflowSideSectionUpdated.emit({
                        isStatusUpdate: true,
                    });
                    this._workflowDataService.workflowOverviewUpdated.emit(
                        true
                    );
                    this.getContractStepData();
                });
        }
    }
    //#endregion Start consultant period

    // Termination

    addConsultantDataToTerminationForm(
        consultant: ConsultantTerminationContractDataQueryDto
    ) {
        const form = this._fb.group({
            consultantId: new UntypedFormControl(consultant?.consultant?.id),
            consultantData: new UntypedFormControl(consultant?.consultant),
            removedConsultantFromAnyManualChecklists: new UntypedFormControl(
                consultant.removedConsultantFromAnyManualChecklists
            ),
            deletedAnySensitiveDocumentsForGDPR: new UntypedFormControl(
                consultant.deletedAnySensitiveDocumentsForGDPR
            ),
        });
        this.contractsTerminationConsultantForm.consultantTerminationContractData.push(
            form
        );
    }

    get consultantTerminationContractData(): UntypedFormArray {
        return this.contractsTerminationConsultantForm.get(
            'consultantTerminationContractData'
        ) as UntypedFormArray;
    }

    getWorkflowContractsStepConsultantTermination(
        isFromSyncToLegacy?: boolean
    ) {
        this.resetForms();
        this.showMainSpinner();
        this._workflowServiceProxy
            .terminationConsultantContractGet(
                this.workflowId!,
                this.consultant.id!
            )
            .pipe(
                finalize(() => {
                    if (!isFromSyncToLegacy) {
                        this.hideMainSpinner();
                    }
                })
            )
            .subscribe((result) => {
                // End of Consultant Contract
                this.contractLinesDoneManuallyInOldPMControl?.setValue(
                    result?.contractLinesDoneManuallyInOldPM,
                    { emitEvent: false }
                );
                this.addConsultantDataToTerminationForm(result);
                if (isFromSyncToLegacy) {
                    this.processSyncToLegacySystem();
                }
            });
    }

    saveTerminationConsultantContractStep(
        isDraft: boolean,
        isSyncToLegacy?: boolean
    ) {
        let input = new ConsultantTerminationContractDataCommandDto();
        input.consultantId =
            this.contractsTerminationConsultantForm.consultantTerminationContractData?.value.consultantId;
        input.contractLinesDoneManuallyInOldPM =
            this.contractLinesDoneManuallyInOldPMControl?.value;
        input.removedConsultantFromAnyManualChecklists =
            this.contractsTerminationConsultantForm.consultantTerminationContractData?.value.removedConsultantFromAnyManualChecklists;
        input.deletedAnySensitiveDocumentsForGDPR =
            this.contractsTerminationConsultantForm.consultantTerminationContractData?.value.deletedAnySensitiveDocumentsForGDPR;

        this.showMainSpinner();
        if (isDraft) {
            this._workflowServiceProxy
                .terminationConsultantContractPut(this.workflowId!, input)
                .pipe(
                    finalize(() => {
                        if (!isSyncToLegacy) {
                            this.hideMainSpinner();
                        }
                    })
                )
                .subscribe((result) => {
                    this._workflowDataService.workflowOverviewUpdated.emit(
                        true
                    );
                    if (this.editEnabledForcefuly && !isSyncToLegacy) {
                        this.toggleEditMode();
                    }
                    this.getContractStepData(isSyncToLegacy);
                });
        } else {
            this._workflowServiceProxy
                .terminationConsultantContractComplete(this.workflowId!, input)
                .pipe(
                    finalize(() => {
                        this.hideMainSpinner();
                    })
                )
                .subscribe((result) => {
                    this._workflowDataService.workflowSideSectionUpdated.emit({
                        isStatusUpdate: true,
                    });
                    this._workflowDataService.workflowOverviewUpdated.emit(
                        true
                    );
                    this.getContractStepData();
                });
        }
    }

    getWorkflowContractStepTermination(isFromSyncToLegacy?: boolean) {
        this.resetForms();
        this.showMainSpinner();
        this._workflowServiceProxy
            .terminationContractGet(this.workflowId!)
            .pipe(
                finalize(() => {
                    if (!isFromSyncToLegacy) {
                        this.hideMainSpinner();
                    }
                })
            )
            .subscribe((result) => {
                // End of Consultant Contract
                this.contractLinesDoneManuallyInOldPMControl?.setValue(
                    result?.contractLinesDoneManuallyInOldPM,
                    { emitEvent: false }
                );
                result.consultantTerminationContractData?.forEach((data) => {
                    this.addConsultantDataToTerminationForm(data);
                });
                if (isFromSyncToLegacy) {
                    this.processSyncToLegacySystem();
                }
            });
    }

    saveWorkflowTerminationContractStep(
        isDraft: boolean,
        isSyncToLegacy?: boolean
    ) {
        let input = new WorkflowTerminationContractDataCommandDto();
        input.contractLinesDoneManuallyInOldPM =
            this.contractLinesDoneManuallyInOldPMControl?.value;
        input.consultantTerminationContractData =
            this.contractsTerminationConsultantForm.consultantTerminationContractData?.value;

        input.consultantTerminationContractData =
            new Array<ConsultantTerminationContractDataCommandDto>();
        if (
            this.contractsTerminationConsultantForm
                .consultantTerminationContractData.value?.length
        ) {
            this.contractsTerminationConsultantForm.consultantTerminationContractData.value.forEach(
                (consultant: any) => {
                    let consultantInput =
                        new ConsultantTerminationContractDataCommandDto();
                    consultantInput.consultantId = consultant.consultantId;
                    consultantInput.contractLinesDoneManuallyInOldPM =
                        consultant.contractLinesDoneManuallyInOldPM;
                    consultantInput.removedConsultantFromAnyManualChecklists =
                        consultant.removedConsultantFromAnyManualChecklists;
                    consultantInput.deletedAnySensitiveDocumentsForGDPR =
                        consultant.deletedAnySensitiveDocumentsForGDPR;

                    input.consultantTerminationContractData!.push(
                        consultantInput
                    );
                }
            );
        }
        this.showMainSpinner();
        if (isDraft) {
            this._workflowServiceProxy
                .terminationContractPut(this.workflowId!, input)
                .pipe(
                    finalize(() => {
                        if (!isSyncToLegacy) {
                            this.hideMainSpinner();
                        }
                    })
                )
                .subscribe((result) => {
                    this._workflowDataService.workflowOverviewUpdated.emit(
                        true
                    );
                    if (this.editEnabledForcefuly && !isSyncToLegacy) {
                        this.toggleEditMode();
                    }
                    this.getContractStepData(isSyncToLegacy);
                });
        } else {
            this._workflowServiceProxy
                .terminationContractComplete(this.workflowId!, input)
                .pipe(
                    finalize(() => {
                        this.hideMainSpinner();
                    })
                )
                .subscribe((result) => {
                    this._workflowDataService.workflowSideSectionUpdated.emit({
                        isStatusUpdate: true,
                    });
                    this._workflowDataService.workflowOverviewUpdated.emit(
                        true
                    );
                    this.getContractStepData();
                });
        }
    }

    terminateConsultantStart(index: number) {
        this.showMainSpinner();
        this._workflowServiceProxy
            .terminationConsultantStart(this.workflowId!, index)
            .pipe(
                finalize(() => {
                    this.hideMainSpinner();
                })
            )
            .subscribe((result) => {
                this._workflowDataService.workflowSideSectionAdded.emit(true);
                this._workflowDataService.workflowOverviewUpdated.emit(true);
            });
    }

    processSaveBeforeSyncToLegacySystem() {
        let isDraft = true;
        let isSyncToLegacy = true;
        switch (
            this._workflowDataService.workflowProgress
                .currentlyActiveSideSection
        ) {
            case WorkflowProcessType.StartClientPeriod:
            case WorkflowProcessType.ChangeClientPeriod:
            case WorkflowProcessType.ExtendClientPeriod:
                this.saveStartChangeOrExtendClientPeriodContracts(
                    isDraft,
                    isSyncToLegacy
                );
                break;
            case WorkflowProcessType.TerminateWorkflow:
                this.saveWorkflowTerminationContractStep(
                    isDraft,
                    isSyncToLegacy
                );
                break;
            case WorkflowProcessType.TerminateConsultant:
                this.saveTerminationConsultantContractStep(
                    isDraft,
                    isSyncToLegacy
                );
                break;
            case WorkflowProcessType.StartConsultantPeriod:
            case WorkflowProcessType.ChangeConsultantPeriod:
            case WorkflowProcessType.ExtendConsultantPeriod:
                this.saveStartChangeOrExtendConsultantPeriodContracts(
                    isDraft,
                    isSyncToLegacy
                );
                break;
        }
    }

    processSyncToLegacySystem() {
        switch (
            this._workflowDataService.workflowProgress
                .currentlyActiveSideSection
        ) {
            case WorkflowProcessType.StartClientPeriod:
            case WorkflowProcessType.ChangeClientPeriod:
            case WorkflowProcessType.ExtendClientPeriod:
                this.syncClientPeriodToLegacySystem();
                break;
            case WorkflowProcessType.TerminateWorkflow:
                this.syncWorkflowTerminationToLegacySystem();
                break;
            case WorkflowProcessType.TerminateConsultant:
                this.syncConsultantTerminationToLegacySystem();
                break;
            case WorkflowProcessType.StartConsultantPeriod:
            case WorkflowProcessType.ChangeConsultantPeriod:
            case WorkflowProcessType.ExtendConsultantPeriod:
                this.syncConsultantPeriodToLegacySystem();
                break;
        }
    }

    syncClientPeriodToLegacySystem() {
        this.showMainSpinner();
        this._contractSyncService
            .clientPeriodSync(this.periodId!)
            .pipe(
                finalize(() => {
                    this.hideMainSpinner();
                })
            )
            .subscribe((result) => {
                this.processAfterSync(result);
            });
    }

    syncConsultantPeriodToLegacySystem() {
        this.showMainSpinner();
        this._contractSyncService
            .consultantPeriodSync(this.activeSideSection.consultantPeriodId!)
            .pipe(
                finalize(() => {
                    this.hideMainSpinner();
                })
            )
            .subscribe((result) => {
                this.processAfterSync(result);
            });
    }

    syncWorkflowTerminationToLegacySystem() {
        this.showMainSpinner();
        this._contractSyncService
            .workflowTerminationSync(this.workflowId!)
            .pipe(
                finalize(() => {
                    this.hideMainSpinner();
                })
            )
            .subscribe((result) => {
                this.processAfterSync(result);
            });
    }

    syncConsultantTerminationToLegacySystem() {
        this.showMainSpinner();
        this.activeSideSection.consultantPeriodId;
        this._contractSyncService
            .consultantTerminationSync(
                this.activeSideSection.consultantPeriodId!
            )
            .pipe(
                finalize(() => {
                    this.hideMainSpinner();
                })
            )
            .subscribe((result) => {
                this.processAfterSync(result);
            });
    }

    processAfterSync(result: ContractSyncResultDto) {
        this.statusAfterSync = true;
        this.syncNotPossible = !result.success!;
        this.contractsSyncDataForm.enableLegalContractsButtons?.setValue(
            result.enableLegalContractsButtons!
        );
        this.contractsSyncDataForm.showManualOption?.setValue(
            result?.showManualOption,
            { emitEvent: false }
        );
        this.syncMessage = result.success
            ? 'Sync successfull'
            : result.message!;
        if (result.success) {
            this.contractsConsultantsDataForm.consultants.controls.forEach(
                (consultant: any) => {
                    consultant.controls.projectLines.controls.forEach(
                        (x: any) => {
                            x.controls.wasSynced.setValue(true, {
                                emitEvent: false,
                            });
                        }
                    );
                }
            );
        }
    }

    openContractModule(
        periodId: string,
        legalContractStatus: number,
        isInternal: boolean,
        tenantId: number,
        consultant?: ConsultantResultDto
    ) {
        let isFrameworkAgreement = false;
        window.open(
            `pmpapercontractpm3:${periodId}/${isInternal ? 'True' : 'False'}/${
                legalContractStatus <= 1 ? 'True' : 'False'
            }/${isFrameworkAgreement ? 'True' : 'False'}/${tenantId}${
                consultant?.id ? '/' + consultant.id : ''
            }`
        );
    }

    detectContractModuleIcon(legalContractStatus: number | string): string {
        switch (legalContractStatus) {
            case LegalContractStatus.NotAcceessible:
                return 'cancel-fill';
            case LegalContractStatus.NotYetCreated:
                return 'in-progress-icon';
            case LegalContractStatus.SavedButNotGenerated:
                return 'completed-icon';
            case LegalContractStatus.Done:
                return 'completed-icon';
            default:
                return '';
        }
    }
}
