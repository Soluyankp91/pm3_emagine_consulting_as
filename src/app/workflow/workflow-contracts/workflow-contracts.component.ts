import { Overlay } from '@angular/cdk/overlay';
import { Component, Injector, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, UntypedFormArray, UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { ScrollToConfigOptions, ScrollToService } from '@nicky-lenaers/ngx-scroll-to';
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
	ConsultantPeriodServiceProxy,
	ConsultantPeriodContractsDataCommandDto,
	ClientsServiceProxy,
	ClientSpecialRateDto,
	ClientSpecialFeeDto,
	ConsultantResultDto,
	ContractSyncServiceProxy,
	StepType,
	ConsultantContractsDataQueryDto,
	ContractSyncResultDto,
	ClientPeriodContractsDataQueryDto,
	ConsultantPeriodContractsDataQueryDto,
	WorkflowTerminationContractDataQueryDto,
} from 'src/shared/service-proxies/service-proxies';
import {} from 'src/shared/service-proxies/service-proxies';
import { WorkflowDataService } from '../workflow-data.service';
import { WorkflowProcessWithAnchorsDto } from '../workflow-period/workflow-period.model';
import { EmploymentTypes, ProjectLineDiallogMode } from '../workflow.model';
import { AddOrEditProjectLineDialogComponent } from './add-or-edit-project-line-dialog/add-or-edit-project-line-dialog.component';
import { ContractsClientDataComponent } from './contracts-client-data/contracts-client-data.component';
import { ContractsConsultantDataComponent } from './contracts-consultant-data/contracts-consultant-data.component';
import { ContractsMainDataComponent } from './contracts-main-data/contracts-main-data.component';
import { ContractsSyncDataComponent } from './contracts-sync-data/contracts-sync-data.component';
import {
	ClientTimeReportingCaps,
	DeliveryTypes,
	LegalContractStatus,
	SalesTypes,
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
export class WorkflowContractsComponent extends AppComponentBase implements OnInit, OnDestroy {
	@Input() workflowId: string;
	@Input() periodId: string | undefined;
	@Input() consultant: ConsultantResultDto;
	@Input() activeSideSection: WorkflowProcessWithAnchorsDto;
	@Input() isCompleted: boolean;
	@Input() permissionsForCurrentUser: { [key: string]: boolean } | undefined;

    @ViewChild('mainDataComponent', { static: false }) mainDataComponent: ContractsMainDataComponent;
    @ViewChild('clientDataComponent', { static: false }) clientDataComponent: ContractsClientDataComponent;
    @ViewChild('consultantDataComponent', { static: false }) consultantDataComponent: ContractsConsultantDataComponent;
    @ViewChild('syncDataComponent', { static: false }) syncDataComponent: ContractsSyncDataComponent;

	workflowSideSections = WorkflowProcessType;

	// contractsMainForm: WorkflowContractsMainForm;
	// contractClientForm: WorkflowContractsClientDataForm;
	// contractsConsultantsDataForm: WorkflowContractsConsultantsDataForm;
	// contractsSyncDataForm: WorkflowContractsSyncForm;
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
	projectCategories: EnumEntityTypeDto[] = [];
	filteredConsultants: ConsultantResultDto[] = [];

	contractsTerminationConsultantForm: WorkflowContractsTerminationConsultantsDataForm;

	// consultantRateToEdit: PeriodConsultantSpecialRateDto;
	// isConsultantRateEditing = false;
	// consultantFeeToEdit: PeriodConsultantSpecialFeeDto;
	// isConsultantFeeEditing = false;
	clientSpecialRateList: ClientSpecialRateDto[];
	clientSpecialFeeList: ClientSpecialFeeDto[];
	// filteredConsultantSpecialRates: ClientSpecialRateDto[];
	// filteredConsultantSpecialFees: ClientSpecialFeeDto[];

	// clientSpecialRateFilter = new UntypedFormControl('');
	// clientRateToEdit: PeriodClientSpecialRateDto;
	// isClientRateEditing = false;
	// clientSpecialFeeFilter = new UntypedFormControl('');
	// clientFeeToEdit: PeriodClientSpecialFeeDto;
	// isClientFeeEditing = false;

	editEnabledForcefuly = false;
	// syncNotPossible = false;
	// statusAfterSync = false;
	// syncMessage = '';
	// legalContractModuleStatuses = LegalContractStatus;
	bypassLegalValidation = false;
	validationTriggered = false;

	employmentTypesEnum = EmploymentTypes;
	clientTimeReportingCaps = ClientTimeReportingCaps;
	deliveryTypesEnum = DeliveryTypes;
	salesTypesEnum = SalesTypes;

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
		private _consultantPeriodService: ConsultantPeriodServiceProxy,
		private _clientService: ClientsServiceProxy,
		private _contractSyncService: ContractSyncServiceProxy,
		private _scrollToService: ScrollToService
	) {
		super(injector);
		// this.contractsMainForm = new WorkflowContractsMainForm();
		// this.contractClientForm = new WorkflowContractsClientDataForm();
		// this.contractsConsultantsDataForm = new WorkflowContractsConsultantsDataForm();
		// this.contractsSyncDataForm = new WorkflowContractsSyncForm();
		this.contractsTerminationConsultantForm = new WorkflowContractsTerminationConsultantsDataForm();
		this.consultantLegalContractsForm = new WorkflowConsultantsLegalContractForm();
	}

	ngOnInit(): void {
		this._getCurrencies();
		this._getSpecialRateReportUnits();
		this._getSpecialFeeFrequencies();
		this._getDiscounts();
		this._getDeliveryTypes();
		this._getSaleTypes();
		this._getClientTimeReportingCap();
		this._getProjectTypes();
		this._getMargins();
		this._getEmploymentTypes();
		this._getConsultantTimeReportingCap();
		this._getUnitTypes();
		this._getLegalContractStatuses();
		this._getConsultantInsuranceOptions();
		this._getProjectCategory();

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
			.subscribe((value: { isDraft: boolean; bypassLegalValidation?: boolean | undefined }) => {
				this.bypassLegalValidation = value.bypassLegalValidation!;
				if (value.isDraft && !this.editEnabledForcefuly) {
					this.saveStartChangeOrExtendClientPeriodContracts(value.isDraft);
				} else {
					if (this.validateContractForm()) {
						this.saveStartChangeOrExtendClientPeriodContracts(value.isDraft);
					} else {
						this.scrollToFirstError(value.isDraft);
					}
				}
			});

		// Consultant start, extend and change periods
		this._workflowDataService.consultantStartChangeOrExtendContractsSaved
			.pipe(takeUntil(this._unsubscribe))
			.subscribe((value: { isDraft: boolean; bypassLegalValidation?: boolean | undefined }) => {
				this.bypassLegalValidation = value.bypassLegalValidation!;
				if (value.isDraft && !this.editEnabledForcefuly) {
					this.saveStartChangeOrExtendConsultantPeriodContracts(value.isDraft);
				} else {
					if (this.validateContractForm()) {
						this.saveStartChangeOrExtendConsultantPeriodContracts(value.isDraft);
					} else {
						this.scrollToFirstError(value.isDraft);
					}
				}
			});

		// Terminations
		this._workflowDataService.workflowConsultantTerminationContractsSaved
			.pipe(takeUntil(this._unsubscribe))
			.subscribe((isDraft: boolean) => {
				if (isDraft && !this.editEnabledForcefuly) {
					this.saveTerminationConsultantContractStep(isDraft);
				} else {
					if (this.validateContractForm()) {
						this.saveTerminationConsultantContractStep(isDraft);
					} else {
						this.scrollToFirstError(isDraft);
					}
				}
			});

		this._workflowDataService.workflowTerminationContractsSaved
			.pipe(takeUntil(this._unsubscribe))
			.subscribe((isDraft: boolean) => {
				if (isDraft && !this.editEnabledForcefuly) {
					this.saveWorkflowTerminationContractStep(isDraft);
				} else {
					if (this.validateContractForm()) {
						this.saveWorkflowTerminationContractStep(isDraft);
					} else {
						this.scrollToFirstError(isDraft);
					}
				}
			});

		this._workflowDataService.cancelForceEdit.pipe(takeUntil(this._unsubscribe)).subscribe(() => {
			this.isCompleted = true;
			this.editEnabledForcefuly = false;
			this._workflowDataService.updateWorkflowProgressStatus({
				currentStepIsCompleted: this.isCompleted,
				currentStepIsForcefullyEditing: this.editEnabledForcefuly,
			});
			this.getContractStepData();
		});
	}

	validateContractForm() {
		this.mainDataComponent?.contractsMainForm.markAllAsTouched();
		this.clientDataComponent?.contractClientForm.markAllAsTouched();
		this.syncDataComponent?.contractsSyncDataForm.markAllAsTouched();
		this.consultantDataComponent?.contractsConsultantsDataForm.markAllAsTouched();
		this.contractsTerminationConsultantForm.markAllAsTouched();
		this.validationTriggered = true;
		switch (this.activeSideSection.typeId) {
			case WorkflowProcessType.StartClientPeriod:
			case WorkflowProcessType.ChangeClientPeriod:
			case WorkflowProcessType.ExtendClientPeriod:
			case WorkflowProcessType.StartConsultantPeriod:
			case WorkflowProcessType.ChangeConsultantPeriod:
			case WorkflowProcessType.ExtendConsultantPeriod:
				return (
					this.mainDataComponent?.contractsMainForm.valid &&
					this.clientDataComponent?.contractClientForm.valid &&
					this.syncDataComponent?.contractsSyncDataForm.valid &&
					this.consultantDataComponent?.contractsConsultantsDataForm.valid &&
					(this.syncDataComponent?.statusAfterSync ||
						(this.syncDataComponent?.contractsSyncDataForm.showManualOption?.value &&
							this.syncDataComponent?.contractsSyncDataForm.contractLinesDoneManuallyInOldPm?.value) ||
						(!this.syncDataComponent?.contractsSyncDataForm.value.isNewSyncNeeded &&
							this.syncDataComponent?.contractsSyncDataForm.value.lastSyncedDate !== null &&
							this.syncDataComponent?.contractsSyncDataForm.value.lastSyncedDate !== undefined))
				);
			case WorkflowProcessType.TerminateWorkflow:
			case WorkflowProcessType.TerminateConsultant:
				return this.contractsTerminationConsultantForm.valid;
		}
	}

	scrollToFirstError(isDraft: boolean) {
		setTimeout(() => {
			let firstError = document.getElementsByClassName('mat-form-field-invalid')[0] as HTMLElement;
			if (firstError) {
				let config: ScrollToConfigOptions = {
					target: firstError,
					offset: -115,
				};
				this._scrollToService.scrollTo(config);
			} else {
				this.saveContractStepData(isDraft);
			}
		}, 0);
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

	saveContractStepData(isDraft: boolean) {
		switch (this.activeSideSection.typeId) {
			case this.workflowSideSections.StartClientPeriod:
			case this.workflowSideSections.ChangeClientPeriod:
			case this.workflowSideSections.ExtendClientPeriod:
				this.saveStartChangeOrExtendClientPeriodContracts(isDraft);
				break;
			case this.workflowSideSections.TerminateWorkflow:
				this.saveWorkflowTerminationContractStep(isDraft);
				break;
			case this.workflowSideSections.StartConsultantPeriod:
			case this.workflowSideSections.ChangeConsultantPeriod:
			case this.workflowSideSections.ExtendConsultantPeriod:
				this.saveStartChangeOrExtendConsultantPeriodContracts(isDraft);
				break;
			case this.workflowSideSections.TerminateConsultant:
				this.saveTerminationConsultantContractStep(isDraft);
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
		this._clientPeriodService
			.editStart(this.periodId!)
			.pipe(finalize(() => this.hideMainSpinner()))
			.subscribe(() => {
				this._workflowDataService.workflowSideSectionUpdated.emit({ isStatusUpdate: true });
				this.getContractStepData();
			});
	}

	startEditTerminateWorkflow() {
		this.showMainSpinner();
		this._workflowServiceProxy
			.terminationContractStartEdit(this.workflowId!)
			.pipe(finalize(() => this.hideMainSpinner()))
			.subscribe(() => {
				this._workflowDataService.workflowSideSectionUpdated.emit({ isStatusUpdate: true });
				this.getContractStepData();
			});
	}

	startEditConsultantPeriod() {
		this.showMainSpinner();
		this._consultantPeriodService
			.editStart3(this.activeSideSection.consultantPeriodId!)
			.pipe(finalize(() => this.hideMainSpinner()))
			.subscribe(() => {
				this._workflowDataService.workflowSideSectionUpdated.emit({ isStatusUpdate: true });
				this.getContractStepData();
			});
	}

	startEditTerminateConsultant() {
		this.showMainSpinner();
		this._workflowServiceProxy
			.terminationConsultantContractStartEdit(this.workflowId!)
			.pipe(finalize(() => this.hideMainSpinner()))
			.subscribe(() => {
				this._workflowDataService.workflowSideSectionUpdated.emit({ isStatusUpdate: true });
				this.getContractStepData();
			});
	}

	ngOnDestroy(): void {
		this._unsubscribe.next();
		this._unsubscribe.complete();
	}

	private _getCurrencies() {
		this._internalLookupService.getCurrencies().subscribe((result) => (this.currencies = result));
	}

	private _getSpecialRateReportUnits() {
		this._internalLookupService
			.getSpecialRateReportUnits()
			.subscribe((result) => (this.clientSpecialRateReportUnits = result));
	}

	private _getSpecialFeeFrequencies() {
		this._internalLookupService.getSpecialFeeFrequencies().subscribe((result) => (this.clientSpecialFeeFrequencies = result));
	}

	private _getDiscounts() {
		this._internalLookupService.getDiscounts().subscribe((result) => (this.discounts = result));
	}

	private _getDeliveryTypes() {
		this._internalLookupService.getDeliveryTypes().subscribe((result) => (this.deliveryTypes = result));
	}

	private _getSaleTypes() {
		this._internalLookupService.getSaleTypes().subscribe((result) => (this.saleTypes = result));
	}

	private _getProjectTypes() {
		this._internalLookupService.getProjectTypes().subscribe((result) => (this.projectTypes = result));
	}

	private _getMargins() {
		this._internalLookupService.getMargins().subscribe((result) => (this.margins = result));
	}

	private _getClientTimeReportingCap() {
		this._internalLookupService.getClientTimeReportingCap().subscribe((result) => (this.clientTimeReportingCap = result));
	}

	private _getEmploymentTypes() {
		this._internalLookupService.getEmploymentTypes().subscribe((result) => (this.employmentTypes = result));
	}

	private _getConsultantTimeReportingCap() {
		this._internalLookupService
			.getConsultantTimeReportingCap()
			.subscribe((result) => (this.consultantTimeReportingCapList = result));
	}

	private _getUnitTypes() {
		this._internalLookupService.getUnitTypes().subscribe((result) => (this.rateUnitTypes = result));
	}

	private _getLegalContractStatuses() {
		this._internalLookupService.getLegalContractStatuses().subscribe((result) => (this.legalContractStatuses = result));
	}

	private _getConsultantInsuranceOptions() {
		this._internalLookupService
			.getConsultantInsuranceOptions()
			.subscribe((result) => (this.consultantInsuranceOptions = result));
	}

	private _getProjectCategory() {
		this._internalLookupService.getProjectCategory().subscribe((result) => (this.projectCategories = result));
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
		let consultantNames = this.consultantDataComponent?.contractsConsultantsDataForm.consultants.value.map((item: any) => {
			if (item.consultantType?.id === 10 || item.consultantType?.id === 11) {
				return item.nameOnly;
			} else {
				return item.consultant?.name;
			}
		});
		this._workflowDataService.consultantsAddedToStep.emit({
			stepType: StepType.Contract,
			processTypeId: this.activeSideSection.typeId!,
			consultantNames: consultantNames,
		});
	}


	// addConsultantDataToForm(consultant: ConsultantContractsDataQueryDto, consultantIndex: number) {
	// 	const form = this._fb.group({
	// 		consultantPeriodId: new UntypedFormControl(consultant?.consultantPeriodId),
	// 		consultantId: new UntypedFormControl(consultant?.consultantId),
	// 		consultant: new UntypedFormControl(consultant?.consultant),
	// 		nameOnly: new UntypedFormControl(consultant?.nameOnly),
	// 		startDate: new UntypedFormControl(consultant?.startDate),
	// 		endDate: new UntypedFormControl(consultant?.endDate),
	// 		noEndDate: new UntypedFormControl(consultant?.noEndDate),
	// 		consultantType: new UntypedFormControl(this.findItemById(this.employmentTypes, consultant?.employmentTypeId)),
	// 		consultantCapOnTimeReporting: new UntypedFormControl(
	// 			this.findItemById(this.consultantTimeReportingCapList, consultant?.consultantTimeReportingCapId)
	// 		),
	// 		consultantCapOnTimeReportingValue: new UntypedFormControl(consultant?.consultantTimeReportingCapMaxValue),
	// 		consultantCapOnTimeReportingCurrency: new UntypedFormControl(
	// 			this.findItemById(this.currencies, consultant?.consultantTimeReportingCapCurrencyId)
	// 		),
	// 		consultantRateUnitType: new UntypedFormControl(
	// 			this.findItemById(this.currencies, consultant?.consultantRate?.rateUnitTypeId)
	// 		),
	// 		consultantRateCurrency: new UntypedFormControl(
	// 			this.findItemById(this.currencies, consultant?.consultantRate?.currencyId)
	// 		),
	// 		consultantRate: new UntypedFormControl(consultant.consultantRate),
	// 		noSpecialContractTerms: new UntypedFormControl(consultant?.noSpecialContractTerms),
	// 		specialContractTerms: new UntypedFormControl(
	// 			{
	// 				value: consultant?.specialContractTerms,
	// 				disabled: consultant?.noSpecialContractTerms,
	// 			},
	// 			Validators.required
	// 		),
	// 		pdcPaymentEntityId: new UntypedFormControl(consultant?.pdcPaymentEntityId),
	// 		specialRates: new UntypedFormArray([]),
	// 		consultantSpecialRateFilter: new UntypedFormControl(''),
	// 		clientFees: new UntypedFormArray([]),
	// 		consultantSpecialFeeFilter: new UntypedFormControl(''),
	// 		projectLines: new UntypedFormArray([], Validators.minLength(1)),
	// 	});
	// 	this.contractsConsultantsDataForm.consultants.push(form);
	// 	consultant.projectLines?.forEach((project: any) => {
	// 		this.addProjectLinesToConsultantData(consultantIndex, project);
	// 	});
	// 	consultant.periodConsultantSpecialFees?.forEach((fee: any) => {
	// 		this.addClientFeesToConsultantData(consultantIndex, fee);
	// 	});
	// 	consultant.periodConsultantSpecialRates?.forEach((rate: any) => {
	// 		this.addSpecialRateToConsultantData(consultantIndex, rate);
	// 	});
	// 	this.filteredConsultants.push(consultant.consultant!);
	// }

	// get consultants(): UntypedFormArray {
	// 	return this.contractsConsultantsDataForm.get('consultants') as UntypedFormArray;
	// }

	// addConsultantLegalContract(consultant: ConsultantContractsDataQueryDto) {
	// 	const form = this._fb.group({
	// 		consultantId: new UntypedFormControl(consultant.consultantId),
	// 		consultantPeriodId: new UntypedFormControl(consultant?.consultantPeriodId),
	// 		consultant: new UntypedFormControl(consultant.consultant),
	// 		consultantType: new UntypedFormControl(this.findItemById(this.employmentTypes, consultant?.employmentTypeId)),
	// 		nameOnly: new UntypedFormControl(consultant.nameOnly),
	// 		internalLegalContractDoneStatusId: new UntypedFormControl(consultant.internalLegalContractDoneStatusId),
	// 		consultantLegalContractDoneStatusId: new UntypedFormControl(consultant.consultantLegalContractDoneStatusId),
	// 		pdcPaymentEntityId: new UntypedFormControl(consultant.pdcPaymentEntityId),
	// 	});
	// 	this.contractsSyncDataForm.consultants.push(form);
	// }

	getRatesAndFees(clientId: number) {
		this._clientService
			.specialRatesAll(clientId, true)
			.pipe(finalize(() => {}))
			.subscribe((result) => {
				this.clientSpecialRateList = result.filter((x) => !x.isHidden);
			});
		this._clientService
			.specialFeesAll(clientId, true)
			.pipe(finalize(() => {}))
			.subscribe((result) => {
				this.clientSpecialFeeList = result.filter((x) => !x.isHidden);
			});
	}

	// selectConsultantSpecialRate(
	// 	event: any,
	// 	consultantIndex: number,
	// 	rate: ClientSpecialRateDto,
	// 	consultantRateMenuTrigger: MatMenuTrigger
	// ) {
	// 	const consultantRate = new PeriodConsultantSpecialRateDto();
	// 	consultantRate.id = undefined;
	// 	consultantRate.clientSpecialRateId = rate.id;
	// 	consultantRate.rateName = rate.internalName;
	// 	consultantRate.reportingUnit = rate.specialRateReportingUnit;
	// 	consultantRate.prodataToProdataRate = rate.proDataToProDataRate;
	// 	consultantRate.prodataToProdataRateCurrencyId = rate.proDataToProDataRateCurrency?.id;
	// 	consultantRate.consultantRate = rate.consultantRate;
	// 	consultantRate.consultantRateCurrencyId = rate.consultantCurrency?.id;
	// 	consultantRate.rateSpecifiedAs = rate.specialRateSpecifiedAs;
	// 	if (consultantRate.rateSpecifiedAs?.id === 1) {
	// 		consultantRate.prodataToProdataRate = +(
	// 			(this.contractsConsultantsDataForm.consultants.at(consultantIndex)!.get('consultantRate')!.value?.normalRate *
	// 				rate.proDataToProDataRate!) /
	// 			100
	// 		).toFixed(2);
	// 		consultantRate.prodataToProdataRateCurrencyId = this.contractsConsultantsDataForm.consultants
	// 			.at(consultantIndex)!
	// 			.get('consultantRateCurrency')!.value?.id;
	// 		consultantRate.consultantRate = +(
	// 			(this.contractsConsultantsDataForm.consultants.at(consultantIndex)!.get('consultantRate')!.value?.normalRate *
	// 				rate.consultantRate!) /
	// 			100
	// 		).toFixed(2);
	// 		consultantRate.consultantRateCurrencyId = this.contractsConsultantsDataForm.consultants
	// 			.at(consultantIndex)!
	// 			.get('consultantRateCurrency')!.value?.id;
	// 	} else {
	// 		consultantRate.prodataToProdataRate = rate.proDataToProDataRate;
	// 		consultantRate.prodataToProdataRateCurrencyId = rate.proDataToProDataRateCurrency?.id;
	// 		consultantRate.consultantRate = rate.consultantRate;
	// 		consultantRate.consultantRateCurrencyId = rate.consultantCurrency?.id;
	// 	}
	// 	consultantRateMenuTrigger.closeMenu();
	// 	this.addSpecialRateToConsultantData(consultantIndex, consultantRate);
	// }

	// addSpecialRateToConsultantData(index: number, clientRate?: PeriodConsultantSpecialRateDto) {
	// 	const form = this._fb.group({
	// 		id: new UntypedFormControl(clientRate?.id ?? null),
	// 		clientSpecialRateId: new UntypedFormControl(clientRate?.clientSpecialRateId ?? null),
	// 		rateName: new UntypedFormControl(clientRate?.rateName ?? null),
	// 		reportingUnit: new UntypedFormControl(clientRate?.reportingUnit ?? null),
	// 		proDataRateValue: new UntypedFormControl(clientRate?.prodataToProdataRate ?? null),
	// 		proDataRateCurrency: new UntypedFormControl(
	// 			this.findItemById(this.currencies, clientRate?.prodataToProdataRateCurrencyId) ?? null
	// 		),
	// 		consultantRateValue: new UntypedFormControl(clientRate?.consultantRate ?? null),
	// 		consultantRateCurrency: new UntypedFormControl(
	// 			this.findItemById(this.currencies, clientRate?.consultantRateCurrencyId) ?? null
	// 		),
	// 		editable: new UntypedFormControl(clientRate ? false : true),
	// 	});

	// 	(this.contractsConsultantsDataForm.consultants.at(index).get('specialRates') as UntypedFormArray).push(form);
	// }

	// removeConsultantDataSpecialRate(consultantIndex: number, rateIndex: number) {
	// 	(this.contractsConsultantsDataForm.consultants.at(consultantIndex).get('specialRates') as UntypedFormArray).removeAt(
	// 		rateIndex
	// 	);
	// }

	// editOrSaveConsultantSpecialRate(isEditable: boolean, consultantIndex: number, rateIndex: number) {
	// 	if (isEditable) {
	// 		this.consultantRateToEdit = new PeriodConsultantSpecialRateDto();
	// 		this.isConsultantRateEditing = false;
	// 	} else {
	// 		const consultantRateValue = (this.consultants.at(consultantIndex).get('specialRates') as UntypedFormArray).at(
	// 			rateIndex
	// 		).value;
	// 		this.consultantRateToEdit = new PeriodConsultantSpecialRateDto({
	// 			id: consultantRateValue.id,
	// 			clientSpecialRateId: consultantRateValue.clientSpecialRateId,
	// 			rateName: consultantRateValue.rateName,
	// 			reportingUnit: consultantRateValue.reportingUnit,
	// 			prodataToProdataRate: consultantRateValue.proDataRateValue,
	// 			prodataToProdataRateCurrencyId: consultantRateValue.proDataRateCurrency?.id,
	// 			consultantRate: consultantRateValue.consultantRateValue,
	// 			consultantRateCurrencyId: consultantRateValue.consultantRateCurrency?.id,
	// 		});
	// 		this.isConsultantRateEditing = true;
	// 	}
	// 	(this.consultants.at(consultantIndex).get('specialRates') as UntypedFormArray)
	// 		.at(rateIndex)
	// 		.get('editable')
	// 		?.setValue(!isEditable, { emitEvent: false });
	// }

	// cancelEditConsultantRate(consultantIndex: number, specialRateIndex: number) {
	// 	const rateRow = (this.consultants.at(consultantIndex).get('specialRates') as UntypedFormArray).at(specialRateIndex);
	// 	rateRow?.get('proDataRateValue')?.setValue(this.consultantRateToEdit.prodataToProdataRate, { emitEvent: false });
	// 	rateRow
	// 		?.get('proDataRateCurrency')
	// 		?.setValue(this.findItemById(this.currencies, this.consultantRateToEdit.prodataToProdataRateCurrencyId), {
	// 			emitEvent: false,
	// 		});
	// 	rateRow?.get('consultantRateValue')?.setValue(this.consultantRateToEdit.consultantRate, { emitEvent: false });
	// 	rateRow
	// 		?.get('consultantRateCurrency')
	// 		?.setValue(this.findItemById(this.currencies, this.consultantRateToEdit.consultantRateCurrencyId), {
	// 			emitEvent: false,
	// 		});
	// 	this.consultantRateToEdit = new PeriodConsultantSpecialRateDto();
	// 	this.isConsultantRateEditing = false;
	// 	(this.consultants.at(consultantIndex).get('specialRates') as UntypedFormArray)
	// 		.at(specialRateIndex)
	// 		.get('editable')
	// 		?.setValue(false, { emitEvent: false });
	// }

	// getConsultantSpecialRateControls(index: number): AbstractControl[] | null {
	// 	return (this.contractsConsultantsDataForm.consultants.at(index).get('specialRates') as UntypedFormArray).controls;
	// }

	// #endregion Consultant data Special Rates

	// Consultant data Client fees START REGION

	// selectConsultantSpecialFee(
	// 	event: any,
	// 	consultantIndex: number,
	// 	fee: ClientSpecialFeeDto,
	// 	consultantFeeMenuTrigger: MatMenuTrigger
	// ) {
	// 	const consultantFee = new PeriodConsultantSpecialFeeDto();
	// 	consultantFee.id = undefined;
	// 	consultantFee.clientSpecialFeeId = fee.id;
	// 	consultantFee.feeName = fee.internalName;
	// 	consultantFee.frequency = fee.clientSpecialFeeFrequency;
	// 	consultantFee.prodataToProdataRate = fee.prodataToProdataRate;
	// 	consultantFee.prodataToProdataRateCurrencyId = fee.prodataToProdataRateCurrency?.id;
	// 	consultantFee.consultantRate = fee.consultantRate;
	// 	consultantFee.consultantRateCurrencyId = fee.consultantCurrency?.id;
	// 	consultantFeeMenuTrigger.closeMenu();
	// 	this.addClientFeesToConsultantData(consultantIndex, consultantFee);
	// }

	// addClientFeesToConsultantData(index: number, clientFee?: PeriodConsultantSpecialFeeDto) {
	// 	const form = this._fb.group({
	// 		id: new UntypedFormControl(clientFee?.id ?? null),
	// 		clientSpecialFeeId: new UntypedFormControl(clientFee?.clientSpecialFeeId ?? null),
	// 		feeName: new UntypedFormControl(clientFee?.feeName ?? null),
	// 		feeFrequency: new UntypedFormControl(clientFee?.frequency ?? null),
	// 		proDataRateValue: new UntypedFormControl(clientFee?.prodataToProdataRate ?? null),
	// 		proDataRateCurrency: new UntypedFormControl(
	// 			this.findItemById(this.currencies, clientFee?.prodataToProdataRateCurrencyId) ?? null
	// 		),
	// 		consultantRateValue: new UntypedFormControl(clientFee?.consultantRate ?? null),
	// 		consultantRateCurrency: new UntypedFormControl(
	// 			this.findItemById(this.currencies, clientFee?.consultantRateCurrencyId) ?? null
	// 		),
	// 		editable: new UntypedFormControl(false),
	// 	});
	// 	(this.contractsConsultantsDataForm.consultants.at(index).get('clientFees') as UntypedFormArray).push(form);
	// }

	// removeConsultantDataClientFees(consultantIndex: number, feeIndex: number) {
	// 	(this.contractsConsultantsDataForm.consultants.at(consultantIndex).get('clientFees') as UntypedFormArray).removeAt(
	// 		feeIndex
	// 	);
	// }

	// editOrSaveConsultantSpecialFee(isEditable: boolean, consultantIndex: number, feeIndex: number) {
	// 	if (isEditable) {
	// 		this.consultantFeeToEdit = new PeriodConsultantSpecialFeeDto();
	// 		this.isConsultantFeeEditing = false;
	// 	} else {
	// 		const consultantFeeValue = (this.consultants.at(consultantIndex).get('clientFees') as UntypedFormArray).at(
	// 			feeIndex
	// 		).value;
	// 		this.consultantFeeToEdit = new PeriodConsultantSpecialFeeDto({
	// 			id: consultantFeeValue.id,
	// 			clientSpecialFeeId: consultantFeeValue.clientSpecialFeeId,
	// 			feeName: consultantFeeValue.feeName,
	// 			frequency: consultantFeeValue.feeFrequency,
	// 			prodataToProdataRate: consultantFeeValue.proDataRateValue,
	// 			prodataToProdataRateCurrencyId: consultantFeeValue.proDataRateCurrency?.id,
	// 			consultantRate: consultantFeeValue.consultantRateValue,
	// 			consultantRateCurrencyId: consultantFeeValue.consultantRateCurrency?.id,
	// 		});
	// 		this.isConsultantFeeEditing = true;
	// 	}
	// 	(this.consultants.at(consultantIndex).get('clientFees') as UntypedFormArray)
	// 		.at(feeIndex)
	// 		.get('editable')
	// 		?.setValue(!isEditable, { emitEvent: false });
	// }

	// cancelEditConsultantFee(consultantIndex: number, specialFeeIndex: number) {
	// 	const feeRow = (this.consultants.at(consultantIndex).get('clientFees') as UntypedFormArray).at(specialFeeIndex);
	// 	feeRow?.get('proDataRateValue')?.setValue(this.consultantFeeToEdit?.prodataToProdataRate, { emitEvent: false });
	// 	feeRow
	// 		?.get('proDataRateCurrency')
	// 		?.setValue(this.findItemById(this.currencies, this.consultantFeeToEdit?.prodataToProdataRateCurrencyId), {
	// 			emitEvent: false,
	// 		});
	// 	feeRow?.get('consultantRateValue')?.setValue(this.consultantFeeToEdit?.consultantRate, { emitEvent: false });
	// 	feeRow
	// 		?.get('consultantRateCurrency')
	// 		?.setValue(this.findItemById(this.currencies, this.consultantFeeToEdit?.consultantRateCurrencyId), {
	// 			emitEvent: false,
	// 		});
	// 	this.consultantFeeToEdit = new PeriodConsultantSpecialFeeDto();
	// 	this.isConsultantFeeEditing = false;
	// 	(this.consultants.at(consultantIndex).get('clientFees') as UntypedFormArray)
	// 		.at(specialFeeIndex)
	// 		.get('editable')
	// 		?.setValue(false, { emitEvent: false });
	// }

	// getConsultantClientFeesControls(index: number): AbstractControl[] | null {
	// 	return (this.contractsConsultantsDataForm.consultants.at(index).get('clientFees') as UntypedFormArray).controls;
	// }
	// Consultant data Client fees END REGION

	// Consultant data Project Lines START REGION

	// createOrEditProjectLine(index: number, projectLinesMenuTrigger?: MatMenuTrigger, projectLinesIndex?: number) {
	// 	if (projectLinesMenuTrigger) {
	// 		projectLinesMenuTrigger.closeMenu();
	// 	}
	// 	const scrollStrategy = this.overlay.scrollStrategies.reposition();
	// 	let projectLine = {
	// 		projectName: this.mainDataComponent?.contractsMainForm.projectName!.value,
	// 		startDate: this.contractsConsultantsDataForm.consultants.at(index).get('startDate')?.value,
	// 		endDate: this.contractsConsultantsDataForm.consultants.at(index).get('endDate')?.value,
	// 		noEndDate: this.contractsConsultantsDataForm.consultants.at(index).get('noEndDate')?.value,
	// 		debtorNumber: this.mainDataComponent?.contractsMainForm!.customDebtorNumber?.value,
	// 		invoicingReferenceNumber: this.clientDataComponent?.contractClientForm.invoicingReferenceNumber?.value,
	// 		invoiceRecipient: this.clientDataComponent?.contractClientForm.clientInvoicingRecipient?.value,
	// 		invoicingReferencePerson: this.clientDataComponent?.contractClientForm.invoicingReferencePerson?.value,
	// 	};
	// 	if (projectLinesIndex !== null && projectLinesIndex !== undefined) {
	// 		projectLine = (this.contractsConsultantsDataForm.consultants.at(index).get('projectLines') as UntypedFormArray).at(
	// 			projectLinesIndex!
	// 		).value;
	// 	}
	// 	const dialogRef = this.dialog.open(AddOrEditProjectLineDialogComponent, {
	// 		width: '760px',
	// 		minHeight: '180px',
	// 		height: 'auto',
	// 		scrollStrategy,
	// 		backdropClass: 'backdrop-modal--wrapper',
	// 		autoFocus: false,
	// 		panelClass: 'confirmation-modal',
	// 		data: {
	// 			dialogType:
	// 				projectLinesIndex !== null && projectLinesIndex !== undefined
	// 					? ProjectLineDiallogMode.Edit
	// 					: ProjectLineDiallogMode.Create,
	// 			projectLineData: projectLine,
	// 			clientId: this.clientDataComponent?.contractClientForm.directClientId?.value,
	// 		},
	// 	});

	// 	dialogRef.componentInstance.onConfirmed.subscribe((projectLine) => {
	// 		if (projectLinesIndex !== null && projectLinesIndex !== undefined) {
	// 			this.editProjectLineValue(index, projectLinesIndex, projectLine);
	// 		} else {
	// 			this.addProjectLinesToConsultantData(index, projectLine);
	// 		}
	// 	});
	// }

	// addProjectLinesToConsultantData(index: number, projectLine?: ProjectLineDto) {
	// 	if (projectLine) {
	// 		if (!projectLine?.differentDebtorNumber) {
	// 			projectLine!.debtorNumber = this.mainDataComponent?.contractsMainForm!.customDebtorNumber?.value;
	// 		}
	// 		if (!projectLine?.differentInvoiceRecipient) {
	// 			projectLine!.invoiceRecipient = this.clientDataComponent?.contractClientForm.clientInvoicingRecipient?.value;
	// 		}
	// 		if (!projectLine?.differentInvoicingReferenceNumber) {
	// 			projectLine!.invoicingReferenceNumber = this.clientDataComponent?.contractClientForm.invoicingReferenceNumber?.value;
	// 		}
	// 		if (!projectLine?.differentInvoicingReferencePerson) {
	// 			projectLine!.invoicingReferencePerson = this.clientDataComponent?.contractClientForm.invoicingReferencePerson?.value;
	// 		}
	// 	}
	// 	const form = this._fb.group({
	// 		id: new UntypedFormControl(projectLine?.id ?? null),
	// 		projectName: new UntypedFormControl(projectLine?.projectName ?? null),
	// 		startDate: new UntypedFormControl(projectLine?.startDate ?? null),
	// 		endDate: new UntypedFormControl(projectLine?.endDate ?? null),
	// 		noEndDate: new UntypedFormControl(projectLine?.noEndDate ?? false),
	// 		invoicingReferenceNumber: new UntypedFormControl(projectLine?.invoicingReferenceNumber ?? null),
	// 		differentInvoicingReferenceNumber: new UntypedFormControl(projectLine?.differentInvoicingReferenceNumber ?? null),
	// 		invoicingReferencePersonId: new UntypedFormControl(
	// 			projectLine?.invoicingReferencePersonId ?? projectLine?.invoicingReferenceString
	// 		),
	// 		invoicingReferencePerson: new UntypedFormControl(
	// 			projectLine?.invoicingReferencePerson?.id
	// 				? projectLine?.invoicingReferencePerson
	// 				: projectLine?.invoicingReferenceString
	// 		),
	// 		differentInvoicingReferencePerson: new UntypedFormControl(projectLine?.differentInvoicingReferencePerson ?? false),
	// 		optionalInvoicingInfo: new UntypedFormControl(projectLine?.optionalInvoicingInfo ?? null),
	// 		differentDebtorNumber: new UntypedFormControl(projectLine?.differentDebtorNumber ?? false),
	// 		debtorNumber: new UntypedFormControl(projectLine?.debtorNumber ?? null),
	// 		differentInvoiceRecipient: new UntypedFormControl(projectLine?.differentInvoiceRecipient ?? false),
	// 		invoiceRecipientId: new UntypedFormControl(projectLine?.invoiceRecipientId ?? null),
	// 		invoiceRecipient: new UntypedFormControl(projectLine?.invoiceRecipient ?? null),
	// 		modifiedById: new UntypedFormControl(projectLine?.modifiedById ?? null),
	// 		modifiedBy: new UntypedFormControl(projectLine?.modifiedBy ?? null),
	// 		modificationDate: new UntypedFormControl(projectLine?.modificationDate ?? null),
	// 		consultantInsuranceOptionId: new UntypedFormControl(projectLine?.consultantInsuranceOptionId),
	// 		markedForLegacyDeletion: new UntypedFormControl(projectLine?.markedForLegacyDeletion),
	// 		wasSynced: new UntypedFormControl(projectLine?.wasSynced),
	// 		isLineForFees: new UntypedFormControl(projectLine?.isLineForFees),
	// 	});
	// 	(this.contractsConsultantsDataForm.consultants.at(index).get('projectLines') as UntypedFormArray).push(form);
	// }

	// editProjectLineValue(consultantIndex: number, projectLinesIndex: number, projectLineData: any) {
	// 	const projectLineRow = (
	// 		this.contractsConsultantsDataForm.consultants.at(consultantIndex).get('projectLines') as UntypedFormArray
	// 	).at(projectLinesIndex);
	// 	projectLineRow.get('id')?.setValue(projectLineData.id, { emitEvent: false });
	// 	projectLineRow.get('projectName')?.setValue(projectLineData.projectName, { emitEvent: false });
	// 	projectLineRow.get('startDate')?.setValue(projectLineData.startDate, { emitEvent: false });
	// 	projectLineRow.get('endDate')?.setValue(projectLineData.endDate, { emitEvent: false });
	// 	projectLineRow.get('noEndDate')?.setValue(projectLineData.noEndDate, { emitEvent: false });
	// 	projectLineRow.get('invoicingReferenceNumber')?.setValue(projectLineData.invoicingReferenceNumber, {
	// 		emitEvent: false,
	// 	});
	// 	projectLineRow.get('differentInvoicingReferenceNumber')?.setValue(projectLineData.differentInvoicingReferenceNumber, {
	// 		emitEvent: false,
	// 	});
	// 	projectLineRow
	// 		.get('invoicingReferencePersonId')
	// 		?.setValue(projectLineData.invoicingReferencePersonId ?? projectLineData.invoicingReferenceString, {
	// 			emitEvent: false,
	// 		});
	// 	projectLineRow
	// 		.get('invoicingReferencePerson')
	// 		?.setValue(
	// 			projectLineData.invoicingReferencePerson?.id
	// 				? projectLineData.invoicingReferencePerson
	// 				: projectLineData.invoicingReferenceString,
	// 			{ emitEvent: false }
	// 		);
	// 	projectLineRow.get('differentInvoicingReferencePerson')?.setValue(projectLineData.differentInvoicingReferencePerson, {
	// 		emitEvent: false,
	// 	});
	// 	projectLineRow.get('optionalInvoicingInfo')?.setValue(projectLineData.optionalInvoicingInfo, {
	// 		emitEvent: false,
	// 	});
	// 	projectLineRow.get('differentDebtorNumber')?.setValue(projectLineData.differentDebtorNumber, {
	// 		emitEvent: false,
	// 	});
	// 	projectLineRow.get('debtorNumber')?.setValue(projectLineData.debtorNumber, { emitEvent: false });
	// 	projectLineRow.get('differentInvoiceRecipient')?.setValue(projectLineData.differentInvoiceRecipient, {
	// 		emitEvent: false,
	// 	});
	// 	projectLineRow.get('invoiceRecipientId')?.setValue(projectLineData.invoiceRecipientId, {
	// 		emitEvent: false,
	// 	});
	// 	projectLineRow.get('invoiceRecipient')?.setValue(projectLineData.invoiceRecipient, { emitEvent: false });
	// 	projectLineRow.get('modifiedById')?.setValue(projectLineData.modifiedById, { emitEvent: false });
	// 	projectLineRow.get('modifiedBy')?.setValue(projectLineData.modifiedBy, { emitEvent: false });
	// 	projectLineRow.get('modificationDate')?.setValue(projectLineData.modificationDate, { emitEvent: false });
	// 	projectLineRow.get('consultantInsuranceOptionId')?.setValue(projectLineData.consultantInsuranceOptionId, {
	// 		emitEvent: false,
	// 	});
	// 	projectLineRow.get('markedForLegacyDeletion')?.setValue(projectLineData.markedForLegacyDeletion, {
	// 		emitEvent: false,
	// 	});
	// 	projectLineRow.get('wasSynced')?.setValue(projectLineData.wasSynced, { emitEvent: false });
	// 	projectLineRow.get('isLineForFees')?.setValue(projectLineData.isLineForFees, { emitEvent: false });
	// }

	// duplicateProjectLine(consultantIndex: number, projectLinesIndex: number) {
	// 	const projectLineRowValue: ProjectLineDto = new ProjectLineDto(
	// 		(this.contractsConsultantsDataForm.consultants.at(consultantIndex).get('projectLines') as UntypedFormArray).at(
	// 			projectLinesIndex
	// 		).value
	// 	);
	// 	projectLineRowValue.id = undefined; // to create a new instance of project line
	// 	projectLineRowValue.wasSynced = false;
	// 	projectLineRowValue.isLineForFees = false;
	// 	this.addProjectLinesToConsultantData(consultantIndex, projectLineRowValue);
	// }

	// removeConsultantDataProjectLines(consultantIndex: number, projectLineIndex: number) {
	// 	(this.contractsConsultantsDataForm.consultants.at(consultantIndex).get('projectLines') as UntypedFormArray).removeAt(
	// 		projectLineIndex
	// 	);
	// }

	// editOrSaveConsultantProjectLine(isEditMode: boolean, consultantIndex: number, projectLineIndex: number) {
	// 	(this.contractsConsultantsDataForm.consultants.at(consultantIndex).get('projectLines') as UntypedFormArray)
	// 		.at(projectLineIndex)
	// 		.get('editable')
	// 		?.setValue(!isEditMode, { emitEvent: false });
	// }

	// getConsultantProjectLinesControls(index: number): AbstractControl[] | null {
	// 	return (this.contractsConsultantsDataForm.consultants.at(index).get('projectLines') as UntypedFormArray).controls;
	// }

	// toggleMarkProjectLineForDeletion(previousValue: boolean, consultantIndex: number, projectLineIndex: number) {
	// 	(this.contractsConsultantsDataForm.consultants.at(consultantIndex).get('projectLines') as UntypedFormArray)
	// 		.at(projectLineIndex)
	// 		.get('markedForLegacyDeletion')
	// 		?.setValue(!previousValue, { emitEvent: false });
	// }
	// Consultant data Project Lines END REGION

	compareWithFn(listOfItems: any, selectedItem: any) {
		return listOfItems && selectedItem && listOfItems.id === selectedItem.id;
	}

	displayNameFn(option: any) {
		return option?.name;
	}

	resetForms() {
		this.syncDataComponent.statusAfterSync = false;
		this.mainDataComponent?.contractsMainForm.reset('', { emitEvent: false });
		this.clientDataComponent?.contractClientForm.reset('', { emitEvent: false });
		this.clientDataComponent.contractClientForm.clientRates.controls = [];
		this.clientDataComponent.contractClientForm.clientFees.controls = [];
		this.consultantDataComponent.contractsConsultantsDataForm.consultants.controls = [];
		this.contractsTerminationConsultantForm.consultantTerminationContractData.controls = [];
		this.syncDataComponent.contractsSyncDataForm.consultants.controls = [];
		this.filteredConsultants = [];
	}

	//#region Start client period
	getStartChangeOrExtendClientPeriodContracts() {
		this.resetForms();
		this.showMainSpinner();
		this._clientPeriodService
			.clientContractsGET(this.periodId!)
			.pipe(
				finalize(() => {
					this.hideMainSpinner();
				})
			)
			.subscribe((result) => {
				this.fillClientPeriodForm(result);
			});
	}


	saveStartChangeOrExtendClientPeriodContracts(isDraft: boolean) {
		let input = this._packClientPeriodData();
		this.showMainSpinner();
		if (isDraft) {
			this._clientPeriodService
				.clientContractsPUT(this.periodId!, input)
				.pipe(
					finalize(() => {
						this.hideMainSpinner();
					})
				)
				.subscribe(() => {
					this.validationTriggered = false;
					this._workflowDataService.workflowOverviewUpdated.emit(true);
					if (this.editEnabledForcefuly) {
						this.toggleEditMode();
					}
					this.getContractStepData();
				});
		} else {
			this._clientPeriodService
				.editFinish2(this.periodId!, input)
				.pipe(
					finalize(() => {
						this.bypassLegalValidation = false;
						this.hideMainSpinner();
					})
				)
				.subscribe(() => {
					this.validationTriggered = false;
					this._workflowDataService.workflowSideSectionUpdated.emit({ isStatusUpdate: true });
					this._workflowDataService.workflowOverviewUpdated.emit(true);
					this.getContractStepData();
				});
		}
	}
	//#endregion Start client period

	//#region Start consultant period
	getStartChangeOrExtendConsultantPeriodContracts() {
		this.resetForms();
		this.showMainSpinner();
		this._consultantPeriodService
			.consultantContractsGET(this.activeSideSection.consultantPeriodId!)
			.pipe(
				finalize(() => {
					this.hideMainSpinner();
				})
			)
			.subscribe((result) => {
				this.fillConsultantPeriodForm(result);
			});
	}

	saveStartChangeOrExtendConsultantPeriodContracts(isDraft: boolean) {
		let input = this._packConsultantPeriodData();
		this.showMainSpinner();
		if (isDraft) {
			this._consultantPeriodService
				.consultantContractsPUT(this.activeSideSection.consultantPeriodId!, input)
				.pipe(
					finalize(() => {
						this.hideMainSpinner();
					})
				)
				.subscribe(() => {
					this.validationTriggered = false;
					this._workflowDataService.workflowOverviewUpdated.emit(true);
					if (this.editEnabledForcefuly) {
						this.toggleEditMode();
					}
					this.getContractStepData();
				});
		} else {
			this._consultantPeriodService
				.editFinish5(this.activeSideSection.consultantPeriodId!, input)
				.pipe(
					finalize(() => {
						this.bypassLegalValidation = false;
						this.hideMainSpinner();
					})
				)
				.subscribe(() => {
					this.validationTriggered = false;
					this._workflowDataService.workflowSideSectionUpdated.emit({ isStatusUpdate: true });
					this._workflowDataService.workflowOverviewUpdated.emit(true);
					this.getContractStepData();
				});
		}
	}
	//#endregion Start consultant period

	// Termination

	addConsultantDataToTerminationForm(consultant: ConsultantTerminationContractDataQueryDto) {
		const form = this._fb.group({
			consultantId: new UntypedFormControl(consultant?.consultant?.id),
			consultantData: new UntypedFormControl(consultant?.consultant),
			removedConsultantFromAnyManualChecklists: new UntypedFormControl(
				consultant.removedConsultantFromAnyManualChecklists,
				Validators.required
			),
			deletedAnySensitiveDocumentsForGDPR: new UntypedFormControl(
				consultant.deletedAnySensitiveDocumentsForGDPR,
				Validators.required
			),
		});
		this.contractsTerminationConsultantForm.consultantTerminationContractData.push(form);
	}

	get consultantTerminationContractData(): UntypedFormArray {
		return this.contractsTerminationConsultantForm.get('consultantTerminationContractData') as UntypedFormArray;
	}

	getWorkflowContractsStepConsultantTermination() {
		this.resetForms();
		this.showMainSpinner();
		this._workflowServiceProxy
			.terminationConsultantContractGET(this.workflowId!, this.consultant.id!)
			.pipe(
				finalize(() => {
					this.hideMainSpinner();
				})
			)
			.subscribe((result) => {
				this.fillConsultantTerminationForm(result);
			});
	}

	saveTerminationConsultantContractStep(isDraft: boolean) {
		let input = this._packConsultantTerminationData();
		this.showMainSpinner();
		if (isDraft) {
			this._workflowServiceProxy
				.terminationConsultantContractPUT(this.workflowId!, input)
				.pipe(
					finalize(() => {
						this.hideMainSpinner();
					})
				)
				.subscribe(() => {
					this.validationTriggered = false;
					this._workflowDataService.workflowOverviewUpdated.emit(true);
					if (this.editEnabledForcefuly) {
						this.toggleEditMode();
					}
					this.getContractStepData();
				});
		} else {
			this._workflowServiceProxy
				.terminationConsultantContractComplete(this.workflowId!, input)
				.pipe(
					finalize(() => {
						this.hideMainSpinner();
					})
				)
				.subscribe(() => {
					this.validationTriggered = false;
					this._workflowDataService.workflowSideSectionUpdated.emit({ isStatusUpdate: true });
					this._workflowDataService.workflowOverviewUpdated.emit(true);
					this.getContractStepData();
				});
		}
	}

	getWorkflowContractStepTermination() {
		this.resetForms();
		this.showMainSpinner();
		this._workflowServiceProxy
			.terminationContractGET(this.workflowId!)
			.pipe(
				finalize(() => {
					this.hideMainSpinner();
				})
			)
			.subscribe((result) => {
				this.fillWorkflowTerminationForm(result);
			});
	}

	saveWorkflowTerminationContractStep(isDraft: boolean) {
		let input = this._packWorkflowTerminationData();
		this.showMainSpinner();
		if (isDraft) {
			this._workflowServiceProxy
				.terminationContractPUT(this.workflowId!, input)
				.pipe(
					finalize(() => {
						this.hideMainSpinner();
					})
				)
				.subscribe(
					() => {
						this.validationTriggered = false;
						this._workflowDataService.workflowOverviewUpdated.emit(true);
						if (this.editEnabledForcefuly) {
							this.toggleEditMode();
						}
						this.getContractStepData();
					},
					() => this.hideMainSpinner()
				);
		} else {
			this._workflowServiceProxy
				.terminationContractComplete(this.workflowId!, input)
				.pipe(
					finalize(() => {
						this.hideMainSpinner();
					})
				)
				.subscribe(() => {
					this.validationTriggered = false;
					this._workflowDataService.workflowSideSectionUpdated.emit({ isStatusUpdate: true });
					this._workflowDataService.workflowOverviewUpdated.emit(true);
					this.getContractStepData();
				});
		}
	}

	processSyncToLegacySystem() {
		switch (this._workflowDataService.workflowProgress.currentlyActiveSideSection) {
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
		let input = this._packClientPeriodData();
		this._contractSyncService
			.clientPeriodSync(this.periodId!, input)
			.pipe(finalize(() => this.hideMainSpinner()))
			.subscribe(
				(result) => {
					this.fillClientPeriodForm(result?.clientPeriodContractsData!);
					this.processAfterSync(result.contractSyncResult);
				},
				() => {
					this.hideMainSpinner();
				}
			);
	}

	syncConsultantPeriodToLegacySystem() {
		this.showMainSpinner();
		let input = this._packConsultantPeriodData();
		this._contractSyncService
			.consultantPeriodSync(this.activeSideSection.consultantPeriodId!, input)
			.pipe(finalize(() => this.hideMainSpinner()))
			.subscribe(
				(result) => {
					this.fillConsultantPeriodForm(result?.consultantPeriodContractsData!);
					this.processAfterSync(result.contractSyncResult);
				},
				() => {
					this.hideMainSpinner();
				}
			);
	}

	syncWorkflowTerminationToLegacySystem() {
		this.showMainSpinner();
		let input = this._packWorkflowTerminationData();
		this._contractSyncService
			.workflowTerminationSync(this.workflowId!, input)
			.pipe(finalize(() => this.hideMainSpinner()))
			.subscribe(
				(result) => {
					this.fillWorkflowTerminationForm(result.workflowTerminationContractData!);
					this.processAfterSync(result.contractSyncResult);
				},
				() => {
					this.hideMainSpinner();
				}
			);
	}

	syncConsultantTerminationToLegacySystem() {
		this.showMainSpinner();
		let input = this._packConsultantTerminationData();
		this._contractSyncService
			.consultantTerminationSync(this.activeSideSection.consultantPeriodId!, input)
			.pipe(finalize(() => this.hideMainSpinner()))
			.subscribe(
				(result) => {
					this.fillConsultantTerminationForm(result.consultantTerminationContractData!);
					this.processAfterSync(result.contractSyncResult);
				},
				() => {
					this.hideMainSpinner();
				}
			);
	}

	processAfterSync(result: ContractSyncResultDto | undefined) {
		if (!result) {
			return;
		}
		this.showMainSpinner();
		this.syncDataComponent.statusAfterSync = true;
		this.syncDataComponent.syncNotPossible = !result.success!;
		this.syncDataComponent.contractsSyncDataForm.enableLegalContractsButtons?.setValue(result.enableLegalContractsButtons!);
		this.syncDataComponent.contractsSyncDataForm.showManualOption?.setValue(result?.showManualOption, { emitEvent: false });
		this.syncDataComponent.syncMessage = result.success ? 'Sync successfull' : result.message!;
		if (result.success) {
			this.consultantDataComponent?.contractsConsultantsDataForm.consultants.controls.forEach((consultant: any) => {
				consultant.controls.projectLines.controls.forEach((x: any) => {
					x.controls.wasSynced.setValue(true, { emitEvent: false });
				});
			});
		}
		this.hideMainSpinner();
	}

	// openContractModule(
	// 	periodId: string,
	// 	legalContractStatus: number,
	// 	isInternal: boolean,
	// 	tenantId: number,
	// 	consultant?: ConsultantResultDto
	// ) {
	// 	let isFrameworkAgreement = false;
	// 	window.open(
	// 		`pmpapercontractpm3:${periodId}/${isInternal ? 'True' : 'False'}/${legalContractStatus <= 1 ? 'True' : 'False'}/${
	// 			isFrameworkAgreement ? 'True' : 'False'
	// 		}/${tenantId}${consultant?.id ? '/' + consultant.id : ''}`
	// 	);
	// }

	// detectContractModuleIcon(legalContractStatus: number | string): string {
	// 	switch (legalContractStatus) {
	// 		case LegalContractStatus.NotAcceessible:
	// 			return 'cancel-fill';
	// 		case LegalContractStatus.NotYetCreated:
	// 			return 'in-progress-icon';
	// 		case LegalContractStatus.SavedButNotGenerated:
	// 			return 'completed-icon';
	// 		case LegalContractStatus.Done:
	// 			return 'completed-icon';
	// 		default:
	// 			return '';
	// 	}
	// }

	fillClientPeriodForm(data: ClientPeriodContractsDataQueryDto) {
		this.resetForms();
		if (data?.mainData !== undefined) {
			this.mainDataComponent?.contractsMainForm.patchValue(data?.mainData, { emitEvent: false });
			this.mainDataComponent?.contractsMainForm.salesType?.setValue(this.findItemById(this.saleTypes, data.mainData.salesTypeId), {
				emitEvent: false,
			});
			this.mainDataComponent?.contractsMainForm.deliveryType?.setValue(this.findItemById(this.deliveryTypes, data.mainData.deliveryTypeId), {
				emitEvent: false,
			});
			this.mainDataComponent?.contractsMainForm.discounts?.setValue(this.findItemById(this.discounts, data.mainData.discountId), {
				emitEvent: false,
			});
			this.mainDataComponent?.contractsMainForm.projectType?.setValue(this.findItemById(this.projectTypes, data.mainData.projectTypeId), {
				emitEvent: false,
			});
			this.mainDataComponent?.contractsMainForm.margin?.setValue(this.findItemById(this.margins, data.mainData.marginId), {
				emitEvent: false,
			});
			if (data.mainData.noRemarks) {
				this.mainDataComponent?.contractsMainForm.remarks?.disable();
			}
		}
		if (data?.clientData !== undefined) {
			this.clientDataComponent?.contractClientForm.patchValue(data.clientData, { emitEvent: false });
			this.clientDataComponent?.contractClientForm.clientTimeReportingCapId?.setValue(
				this.findItemById(this.clientTimeReportingCap, data.clientData.clientTimeReportingCapId),
				{ emitEvent: false }
			);
			this.clientDataComponent?.contractClientForm.rateUnitType?.setValue(
				this.findItemById(this.rateUnitTypes, data.clientData.clientRate?.rateUnitTypeId),
				{ emitEvent: false }
			);
			this.clientDataComponent?.contractClientForm.currency?.setValue(
				this.findItemById(this.currencies, data.clientData.clientRate?.currencyId),
				{ emitEvent: false }
			);
			this.clientDataComponent?.contractClientForm.clientTimeReportingCapCurrencyId?.setValue(
				this.findItemById(this.currencies, data.clientData.clientTimeReportingCapCurrencyId),
				{ emitEvent: false }
			);
			if (data.clientData.noSpecialContractTerms) {
				this.clientDataComponent?.contractClientForm.specialContractTerms?.disable();
			}
			if (data.clientData.directClientId) {
				this.getRatesAndFees(data.clientData.directClientId);
			}
		}
		this.syncDataComponent?.contractsSyncDataForm.patchValue(data, { emitEvent: false });
		if (data?.clientData?.periodClientSpecialRates?.length) {
			data.clientData.periodClientSpecialRates.forEach((rate: PeriodClientSpecialRateDto) => {
				this.clientDataComponent?.addSpecialRate(rate);
			});
		}
		if (data?.clientData?.periodClientSpecialFees?.length) {
			data.clientData.periodClientSpecialFees.forEach((fee: PeriodClientSpecialFeeDto) => {
				this.clientDataComponent?.addClientFee(fee);
			});
		}
		if (data?.consultantData?.length) {
			data.consultantData.forEach((consultant: ConsultantContractsDataQueryDto, index) => {
				this.consultantDataComponent?.addConsultantDataToForm(consultant, index);
				this.syncDataComponent?.addConsultantLegalContract(consultant);
			});
			this.updateConsultantStepAnchors();
		}
	}

	private _packClientPeriodData(): ClientPeriodContractsDataCommandDto {
		let input = new ClientPeriodContractsDataCommandDto();
		input.bypassLegalValidation = this.bypassLegalValidation;
		input.clientData = new ContractsClientDataDto();
		input.clientData.specialContractTerms = this.clientDataComponent?.contractClientForm.specialContractTerms?.value;
		input.clientData.noSpecialContractTerms = this.clientDataComponent?.contractClientForm.noSpecialContractTerms?.value;
		input.clientData.clientTimeReportingCapId = this.clientDataComponent?.contractClientForm.clientTimeReportingCapId?.value?.id;
		input.clientData.clientTimeReportingCapMaxValue = this.clientDataComponent?.contractClientForm.clientTimeReportingCapMaxValue?.value;
		input.clientData.clientTimeReportingCapCurrencyId = this.clientDataComponent?.contractClientForm.clientTimeReportingCapCurrencyId?.value?.id;
		input.clientData.clientRate = this.clientDataComponent?.contractClientForm.clientRate?.value;
		input.clientData.pdcInvoicingEntityId = this.clientDataComponent?.contractClientForm.pdcInvoicingEntityId?.value;
		input.clientData.periodClientSpecialRates = new Array<PeriodClientSpecialRateDto>();
		if (this.clientDataComponent?.contractClientForm.clientRates.value?.length) {
			for (let specialRate of this.clientDataComponent?.contractClientForm.clientRates.value) {
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
		input.clientData.noSpecialRate = this.clientDataComponent?.contractClientForm.clientRates.value?.length === 0;
		input.clientData.periodClientSpecialFees = new Array<PeriodClientSpecialFeeDto>();
		if (this.clientDataComponent?.contractClientForm.clientFees.value?.length) {
			for (let specialFee of this.clientDataComponent?.contractClientForm.clientFees.value) {
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
		input.clientData.noSpecialFee = this.clientDataComponent?.contractClientForm.clientFees.value?.length === 0;
		input.contractLinesDoneManuallyInOldPm = this.syncDataComponent?.contractsSyncDataForm.contractLinesDoneManuallyInOldPm?.value ?? false;

		input.mainData = new ContractsMainDataDto();
		input.mainData.projectDescription = this.mainDataComponent?.contractsMainForm.projectDescription?.value;
		input.mainData.projectName = this.mainDataComponent?.contractsMainForm.projectName?.value;
		input.mainData.projectTypeId = this.mainDataComponent?.contractsMainForm.projectType?.value?.id;
		input.mainData.salesTypeId = this.mainDataComponent?.contractsMainForm.salesType?.value?.id;
		input.mainData.deliveryTypeId = this.mainDataComponent?.contractsMainForm.deliveryType?.value?.id;
		input.mainData.marginId = this.mainDataComponent?.contractsMainForm.margin?.value?.id;
		input.mainData.discountId = this.mainDataComponent?.contractsMainForm.discounts?.value?.id;
		input.mainData.remarks = this.mainDataComponent?.contractsMainForm.remarks?.value;
		input.mainData.noRemarks = this.mainDataComponent?.contractsMainForm.noRemarks?.value;

		input.consultantData = new Array<ConsultantContractsDataCommandDto>();
		if (this.consultantDataComponent?.contractsConsultantsDataForm?.consultants?.value?.length) {
			for (let consultantInput of this.consultantDataComponent?.contractsConsultantsDataForm.consultants.value) {
				input.consultantData.push(this._packConsultantFormData(consultantInput));
			}
		}
		return input;
	}

	fillConsultantPeriodForm(data: ConsultantPeriodContractsDataQueryDto) {
		this.resetForms();
		if (data?.mainData !== undefined) {
			this.mainDataComponent?.contractsMainForm.patchValue(data, { emitEvent: false });
			this.mainDataComponent?.contractsMainForm.salesType?.setValue(this.findItemById(this.saleTypes, data?.mainData?.salesTypeId), {
				emitEvent: false,
			});
			this.mainDataComponent?.contractsMainForm.deliveryType?.setValue(this.findItemById(this.deliveryTypes, data?.mainData?.deliveryTypeId), {
				emitEvent: false,
			});
			this.mainDataComponent?.contractsMainForm.projectType?.setValue(this.findItemById(this.projectTypes, data?.mainData?.projectTypeId), {
				emitEvent: false,
			});
			this.mainDataComponent?.contractsMainForm.margin?.setValue(this.findItemById(this.margins, data?.mainData?.marginId), {
				emitEvent: false,
			});
			this.mainDataComponent?.contractsMainForm.discounts?.setValue(this.findItemById(this.discounts, data?.mainData?.discountId), {
				emitEvent: false,
			});
			if (data?.noRemarks) {
				this.mainDataComponent?.contractsMainForm.remarks?.disable();
			}
		}
		if (data?.clientData !== undefined) {
			this.clientDataComponent?.contractClientForm.patchValue(data.clientData, { emitEvent: false });
		}
		this.syncDataComponent?.contractsSyncDataForm.patchValue(data, { emitEvent: false });
		this.consultantDataComponent?.addConsultantDataToForm(data?.consultantData!, 0);
		this.syncDataComponent?.addConsultantLegalContract(data.consultantData!);
		this.updateConsultantStepAnchors();
	}

	private _packConsultantPeriodData(): ConsultantPeriodContractsDataCommandDto {
		let input = new ConsultantPeriodContractsDataCommandDto();
		input.bypassLegalValidation = this.bypassLegalValidation;
		input = this.mainDataComponent?.contractsMainForm.value;
		input.mainData = new ContractsMainDataDto();
		input.mainData.projectTypeId = this.mainDataComponent?.contractsMainForm.projectType?.value?.id;
		input.mainData.salesTypeId = this.mainDataComponent?.contractsMainForm.salesType?.value?.id;
		input.mainData.deliveryTypeId = this.mainDataComponent?.contractsMainForm.deliveryType?.value?.id;
		input.mainData.marginId = this.mainDataComponent?.contractsMainForm.margin?.value?.id;
		input.mainData.discountId = this.mainDataComponent?.contractsMainForm.discounts?.value?.id;

		input.consultantData = new ConsultantContractsDataCommandDto();
		const consultantInput = this.consultantDataComponent?.contractsConsultantsDataForm.consultants.at(0).value;
		if (consultantInput) {
			input.consultantData = this._packConsultantFormData(consultantInput);
		}
		input.contractLinesDoneManuallyInOldPm = this.syncDataComponent?.contractsSyncDataForm.contractLinesDoneManuallyInOldPm?.value;
		input.newLegalContractRequired = this.syncDataComponent?.contractsSyncDataForm.newLegalContract?.value;
		return input;
	}

	fillWorkflowTerminationForm(data: WorkflowTerminationContractDataQueryDto) {
		this.resetForms();
		this.syncDataComponent?.contractsSyncDataForm.patchValue(data, { emitEvent: false });
		data.consultantTerminationContractData?.forEach((consultant) => {
			this.addConsultantDataToTerminationForm(consultant);
		});
	}

	private _packWorkflowTerminationData(): WorkflowTerminationContractDataCommandDto {
		let input = new WorkflowTerminationContractDataCommandDto();
		input = this.syncDataComponent?.contractsSyncDataForm.value;
		input.consultantTerminationContractData = new Array<ConsultantTerminationContractDataCommandDto>();
		if (this.contractsTerminationConsultantForm.consultantTerminationContractData.value?.length) {
			this.contractsTerminationConsultantForm.consultantTerminationContractData.value.forEach((consultant: any) => {
				let consultantInput = new ConsultantTerminationContractDataCommandDto();
				consultantInput = consultant;
				input.consultantTerminationContractData!.push(consultantInput);
			});
		}
		return input;
	}

	fillConsultantTerminationForm(data: ConsultantTerminationContractDataQueryDto) {
		this.resetForms();
		this.syncDataComponent?.contractsSyncDataForm.contractLinesDoneManuallyInOldPm?.setValue(data?.contractLinesDoneManuallyInOldPM, {
			emitEvent: false,
		});
		this.addConsultantDataToTerminationForm(data);
	}

	private _packConsultantTerminationData(): ConsultantTerminationContractDataCommandDto {
		let input = new ConsultantTerminationContractDataCommandDto();
		input.consultantId = this.contractsTerminationConsultantForm.consultantTerminationContractData?.value.consultantId;
		input.contractLinesDoneManuallyInOldPM = this.syncDataComponent?.contractsSyncDataForm.contractLinesDoneManuallyInOldPm?.value;
		input.removedConsultantFromAnyManualChecklists =
			this.contractsTerminationConsultantForm.consultantTerminationContractData?.value.removedConsultantFromAnyManualChecklists;
		input.deletedAnySensitiveDocumentsForGDPR =
			this.contractsTerminationConsultantForm.consultantTerminationContractData?.value.deletedAnySensitiveDocumentsForGDPR;
		return input;
	}

	private _packConsultantFormData(consultantInput: any): ConsultantContractsDataCommandDto {
		let consultantData = new ConsultantContractsDataCommandDto();
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
				consultantFee.consultantRate = specialFee.consultantRateValue;
				consultantFee.prodataToProdataRateCurrencyId = specialFee.proDataRateCurrency?.id;
				consultantFee.consultantRateCurrencyId = specialFee.consultantRateCurrency?.id;
				consultantData.periodConsultantSpecialFees.push(consultantFee);
			}
		}
		consultantData.noSpecialFee = consultantInput.clientFees?.length === 0;
		consultantData.periodConsultantSpecialRates = new Array<PeriodConsultantSpecialRateDto>();
		if (consultantInput.specialRates?.length) {
			for (let specialRate of consultantInput.specialRates) {
				let consultantRate = new PeriodConsultantSpecialRateDto();
				consultantRate.id = specialRate.id;
				consultantRate.clientSpecialRateId = specialRate.clientSpecialRateId;
				consultantRate.rateName = specialRate.rateName;
				consultantRate.reportingUnit = specialRate.reportingUnit;
				consultantRate.prodataToProdataRate = specialRate.proDataRateValue;
				consultantRate.consultantRate = specialRate.consultantRateValue;
				consultantRate.prodataToProdataRateCurrencyId = specialRate.proDataRateCurrency?.id;
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
				projectLineInput.noEndDate = projectLine.noEndDate;
				projectLineInput.differentInvoicingReferenceNumber = projectLine.differentInvoicingReferenceNumber;
				if (projectLineInput.differentInvoicingReferenceNumber) {
					projectLineInput.invoicingReferenceNumber = projectLine.invoicingReferenceNumber;
				}
				projectLineInput.differentInvoicingReferencePerson = projectLine.differentInvoicingReferencePerson;
				if (projectLineInput.differentInvoicingReferencePerson) {
					if (projectLine.invoicingReferencePerson?.id) {
						projectLineInput.invoicingReferencePersonId = projectLine.invoicingReferencePersonId;
						projectLineInput.invoicingReferencePerson = projectLine.invoicingReferencePerson;
					} else {
						projectLineInput.invoicingReferenceString = projectLine.invoicingReferencePersonId;
					}
				}
				projectLineInput.optionalInvoicingInfo = projectLine.optionalInvoicingInfo;
				projectLineInput.differentDebtorNumber = projectLine.differentDebtorNumber;
				if (projectLineInput.differentDebtorNumber) {
					projectLineInput.debtorNumber = projectLine.debtorNumber;
				}
				projectLineInput.differentInvoiceRecipient = projectLine.differentInvoiceRecipient;
				if (projectLineInput.differentInvoiceRecipient) {
					projectLineInput.invoiceRecipientId = projectLine.invoiceRecipientId;
					projectLineInput.invoiceRecipient = projectLine.invoiceRecipient;
				}
				projectLineInput.modifiedById = projectLine.modifiedById;
				projectLineInput.modifiedBy = projectLine.modifiedBy;
				projectLineInput.modificationDate = projectLine.modificationDate;
				projectLineInput.consultantInsuranceOptionId = projectLine.consultantInsuranceOptionId;
				projectLineInput.markedForLegacyDeletion = projectLine.markedForLegacyDeletion;
				projectLineInput.wasSynced = projectLine.wasSynced;
				projectLineInput.isLineForFees = projectLine.isLineForFees;

				consultantData.projectLines.push(projectLineInput);
			}
		}
		return consultantData;
	}
}
