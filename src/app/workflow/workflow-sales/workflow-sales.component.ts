import { Overlay } from '@angular/cdk/overlay';
import { NumberSymbol } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, Injector, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, UntypedFormArray, UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatSelectChange } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationResult } from '@azure/msal-browser';
import { ScrollToConfigOptions, ScrollToService } from '@nicky-lenaers/ngx-scroll-to';
import { forkJoin, merge, of, Subject } from 'rxjs';
import { debounceTime, finalize, switchMap, takeUntil } from 'rxjs/operators';
import { InternalLookupService } from 'src/app/shared/common/internal-lookup.service';
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { environment } from 'src/environments/environment';
import { AppComponentBase, NotifySeverity } from 'src/shared/app-component-base';
import { MediumDialogConfig } from 'src/shared/dialog.configs';
import { LocalHttpService } from 'src/shared/service-proxies/local-http.service';
import {
	ClientPeriodSalesDataDto,
	ClientPeriodServiceProxy,
	ClientRateDto,
	CommissionDto,
	ConsultantRateDto,
	ConsultantSalesDataDto,
	ContractSignerDto,
	EmployeeDto,
	EnumEntityTypeDto,
	LookupServiceProxy,
	PeriodClientSpecialFeeDto,
	PeriodClientSpecialRateDto,
	SalesClientDataDto,
	SalesMainDataDto,
	WorkflowProcessType,
	WorkflowServiceProxy,
	ConsultantResultDto,
	ClientResultDto,
	ContactResultDto,
	ConsultantTerminationSalesDataCommandDto,
	WorkflowTerminationSalesDataCommandDto,
	PeriodConsultantSpecialFeeDto,
	PeriodConsultantSpecialRateDto,
	ClientSpecialRateDto,
	ClientsServiceProxy,
	ClientSpecialFeeDto,
	ConsultantPeriodServiceProxy,
	ConsultantPeriodSalesDataDto,
	ExtendConsultantPeriodDto,
	ChangeConsultantPeriodDto,
	ConsultantWithSourcingRequestResultDto,
	CountryDto,
	StepType,
	LegalEntityDto,
} from 'src/shared/service-proxies/service-proxies';
import { CustomValidators } from 'src/shared/utils/custom-validators';
import { WorkflowConsultantActionsDialogComponent } from '../workflow-consultant-actions-dialog/workflow-consultant-actions-dialog.component';
import { WorkflowDataService } from '../workflow-data.service';
import { WorkflowProcessWithAnchorsDto } from '../workflow-period/workflow-period.model';
import { EmploymentTypes } from '../workflow.model';
import { MainDataComponent } from './main-data/main-data.component';
import {
	ConsultantDiallogAction,
	SalesTerminateConsultantForm,
	WorkflowSalesClientDataForm,
	WorkflowSalesConsultantsForm,
	WorkflowSalesMainForm,
} from './workflow-sales.model';

@Component({
	selector: 'app-workflow-sales',
	templateUrl: './workflow-sales.component.html',
	styleUrls: ['./workflow-sales.component.scss'],
})
export class WorkflowSalesComponent extends AppComponentBase implements OnInit, OnDestroy {
    @ViewChild('mainDataComponent', {static: false}) mainDataComponent: MainDataComponent

	@Input() workflowId: string;
	@Input() periodId: string | undefined;
	@Input() consultant: ConsultantResultDto;
	@Input() activeSideSection: WorkflowProcessWithAnchorsDto;
	@Input() isCompleted: boolean;
	@Input() permissionsForCurrentUser: { [key: string]: boolean } | undefined;

	editEnabledForcefuly = false;
	workflowSideSections = WorkflowProcessType;
	// SalesStep
	salesClientDataForm: WorkflowSalesClientDataForm;
	// salesMainDataForm: WorkflowSalesMainForm;
	consultantsForm: WorkflowSalesConsultantsForm;
	salesTerminateConsultantForm: SalesTerminateConsultantForm;

	deliveryTypes: EnumEntityTypeDto[] = [];
	currencies: EnumEntityTypeDto[] = [];
	saleTypes: EnumEntityTypeDto[] = [];
	projectTypes: EnumEntityTypeDto[] = [];
	invoicingTimes: EnumEntityTypeDto[] = [];
	rateUnitTypes: EnumEntityTypeDto[] = [];
	invoiceFrequencies: EnumEntityTypeDto[] = [];
	signerRoles: EnumEntityTypeDto[] = [];
	margins: EnumEntityTypeDto[] = [];
	emagineOffices: EnumEntityTypeDto[] = [];
	clientExtensionDeadlines: EnumEntityTypeDto[] = [];
	clientExtensionDurations: EnumEntityTypeDto[] = [];
	clientSpecialFeeFrequencies: EnumEntityTypeDto[] = [];
	clientSpecialFeeSpecifications: EnumEntityTypeDto[] = [];
	clientSpecialRateReportUnits: EnumEntityTypeDto[] = [];
	clientSpecialRateSpecifications: EnumEntityTypeDto[] = [];
	contractExpirationNotificationDuration: { [key: string]: string };
	clientTimeReportingCap: EnumEntityTypeDto[] = [];
	commissionFrequencies: EnumEntityTypeDto[] = [];
	commissionTypes: EnumEntityTypeDto[] = [];
	commissionRecipientTypeList: EnumEntityTypeDto[] = [];
	legalEntities: LegalEntityDto[] = [];
	projectCategories: EnumEntityTypeDto[] = [];
	discounts: EnumEntityTypeDto[] = [];
	expectedWorkloadUnits: EnumEntityTypeDto[] = [];
	nonStandartTerminationTimes: { [key: string]: string };
	terminationReasons: { [key: string]: string };
	employmentTypes: EnumEntityTypeDto[] = [];
	countries: CountryDto[] = [];
	consultantTimeReportingCapList: EnumEntityTypeDto[] = [];

	employmentTypesEnum = EmploymentTypes;
	clientRateTypes: EnumEntityTypeDto[] = new Array<EnumEntityTypeDto>(
		new EnumEntityTypeDto({
			id: 1,
			name: 'Time based',
		}),
		new EnumEntityTypeDto({
			id: 2,
			name: 'Fixed',
		})
	);

	filteredAccountManagers: any[] = [];
	filteredSalesAccountManagers: any[] = [];
	filteredCommisionAccountManagers: any[] = [];
	filteredDirectClients: any[] = [];
	filteredEndClients: any[] = [];
	filteredConsultants: any[] = [];
	filteredRecipients: any[] = [];
	filteredReferencePersons: any[] = [];
	filteredEvaluationReferencePersons: any[] = [];
	filteredClientInvoicingRecipients: any[] = [];
	filteredFinalEvaluationReferencePersons: any[] = [];
	clientRateToEdit: PeriodClientSpecialRateDto;
	isClientRateEditing = false;
	clientFeeToEdit: PeriodClientSpecialFeeDto;
	isClientFeeEditing = false;
	consultantRateToEdit: PeriodConsultantSpecialRateDto;
	isConsultantRateEditing = false;
	consultantFeeToEdit: PeriodConsultantSpecialFeeDto;
	isConsultantFeeEditing = false;
	clientSpecialRateFilter = new UntypedFormControl('');
	clientSpecialRateList: ClientSpecialRateDto[] = [];
	clientSpecialFeeFilter = new UntypedFormControl('');
	clientSpecialFeeList: ClientSpecialFeeDto[] = [];
	filteredConsultantCountries: EnumEntityTypeDto[];
	filteredConsultantClientAddresses: any[] = [];
	filteredContractSigners: any[] = [];

	directClientIdTerminationSales: number | null;
	endClientIdTerminationSales: number | null;

	individualConsultantActionsAvailable: boolean;
	appEnv = environment;

	isCommissionEditing = false;
	isCommissionInitialAdd = false;
	commissionToEdit: {
		id: number | undefined;
		commissionType: any;
		amount: any;
		currency: any;
		commissionFrequency: any;
		recipientType: any;
		recipient: any;
	};

	private _unsubscribe = new Subject();

	constructor(
		injector: Injector,
		private _fb: UntypedFormBuilder,
		private _workflowDataService: WorkflowDataService,
		private activatedRoute: ActivatedRoute,
		private overlay: Overlay,
		private dialog: MatDialog,
		private router: Router,
		private _internalLookupService: InternalLookupService,
		private _lookupService: LookupServiceProxy,
		private _clientPeriodService: ClientPeriodServiceProxy,
		private _workflowServiceProxy: WorkflowServiceProxy,
		private _clientService: ClientsServiceProxy,
		private _consultantPeriodSerivce: ConsultantPeriodServiceProxy,
		private httpClient: HttpClient,
		private localHttpService: LocalHttpService,
		private _scrollToService: ScrollToService
	) {
		super(injector);
		this.salesClientDataForm = new WorkflowSalesClientDataForm();
		// this.salesMainDataForm = new WorkflowSalesMainForm();
		this.consultantsForm = new WorkflowSalesConsultantsForm();
		this.salesTerminateConsultantForm = new SalesTerminateConsultantForm();

		//#region form subscriptions
		// this.salesMainDataForm.salesAccountManagerIdValue?.valueChanges
		// 	.pipe(
		// 		takeUntil(this._unsubscribe),
		// 		debounceTime(300),
		// 		switchMap((value: any) => {
		// 			if (value) {
		// 				let toSend = {
		// 					name: value,
		// 					maxRecordsCount: 1000,
		// 				};
		// 				if (value?.id) {
		// 					toSend.name = value.id ? value.name : value;
		// 				}
		// 				return this._lookupService.employees(value);
		// 			} else {
		// 				return of([]);
		// 			}
		// 		})
		// 	)
		// 	.subscribe((list: EmployeeDto[]) => {
		// 		if (list.length) {
		// 			this.filteredSalesAccountManagers = list;
		// 		} else {
		// 			this.filteredSalesAccountManagers = [
		// 				{
		// 					name: 'No managers found',
		// 					externalId: '',
		// 					id: 'no-data',
		// 					selected: false,
		// 				},
		// 			];
		// 		}
		// 	});

		// this.salesMainDataForm.commissionAccountManagerIdValue?.valueChanges
		// 	.pipe(
		// 		takeUntil(this._unsubscribe),
		// 		debounceTime(300),
		// 		switchMap((value: any) => {
		// 			if (value) {
		// 				let toSend = {
		// 					name: value,
		// 					maxRecordsCount: 1000,
		// 				};
		// 				if (value?.id) {
		// 					toSend.name = value.id ? value.name : value;
		// 				}
		// 				return this._lookupService.employees(value);
		// 			} else {
		// 				return of([]);
		// 			}
		// 		})
		// 	)
		// 	.subscribe((list: EmployeeDto[]) => {
		// 		if (list.length) {
		// 			this.filteredCommisionAccountManagers = list;
		// 		} else {
		// 			this.filteredCommisionAccountManagers = [
		// 				{
		// 					name: 'No managers found',
		// 					externalId: '',
		// 					id: 'no-data',
		// 					selected: false,
		// 				},
		// 			];
		// 		}
		// 	});

		this.salesClientDataForm.directClientIdValue?.valueChanges
			.pipe(
				takeUntil(this._unsubscribe),
				debounceTime(300),
				switchMap((value: any) => {
					let toSend = {
						name: value ?? '',
						maxRecordsCount: 1000,
					};
					if (value?.clientId) {
						toSend.name = value.clientId ? value.clientName?.trim() : value?.trim();
					}
					return this._lookupService.clientsAll(toSend.name, toSend.maxRecordsCount);
				})
			)
			.subscribe((list: ClientResultDto[]) => {
				if (list.length) {
					this.filteredDirectClients = list;
				} else {
					this.filteredDirectClients = [
						{
							clientName: 'No records found',
							externalId: '',
							id: 'no-data',
							selected: false,
						},
					];
				}
			});

		this.salesClientDataForm.endClientIdValue?.valueChanges
			.pipe(
				takeUntil(this._unsubscribe),
				debounceTime(300),
				switchMap((value: any) => {
					let toSend = {
						name: value ?? '',
						maxRecordsCount: 1000,
					};
					if (value?.clientId) {
						toSend.name = value.clientId ? value.clientName?.trim() : value?.trim();
					}
					return this._lookupService.clientsAll(toSend.name, toSend.maxRecordsCount);
				})
			)
			.subscribe((list: ClientResultDto[]) => {
				if (list.length) {
					this.filteredEndClients = list;
				} else {
					this.filteredEndClients = [
						{
							clientName: 'No records found',
							externalId: '',
							id: 'no-data',
							selected: false,
						},
					];
				}
			});

		this.salesClientDataForm.invoicePaperworkContactIdValue?.valueChanges
			.pipe(
				takeUntil(this._unsubscribe),
				debounceTime(300),
				switchMap((value: any) => {
					let toSend = {
						clientId1: this.salesClientDataForm.directClientIdValue?.value?.clientId,
						clientId2: this.salesClientDataForm.endClientIdValue?.value?.clientId ?? undefined,
						name: value,
						maxRecordsCount: 1000,
					};
					if (value?.id) {
						toSend.name = value.id ? value.firstName : value;
					}
					return this._lookupService.contacts(toSend.clientId1, toSend.clientId2, toSend.name, toSend.maxRecordsCount);
				})
			)
			.subscribe((list: ContactResultDto[]) => {
				if (list.length) {
					this.filteredReferencePersons = list;
				} else {
					this.filteredReferencePersons = [{firstName: 'No records found', lastName: '', id: 'no-data'}];
				}
			});

		this.salesClientDataForm.clientInvoicingRecipientIdValue?.valueChanges
			.pipe(
				takeUntil(this._unsubscribe),
				debounceTime(300),
				switchMap((value: any) => {
					let toSend = {
						name: value ?? '',
						maxRecordsCount: 1000,
					};
					if (value?.clientId) {
						toSend.name = value.clientId ? value.clientName : value;
					}
					return this._lookupService.clientsAll(toSend.name, toSend.maxRecordsCount);
				})
			)
			.subscribe((list: ClientResultDto[]) => {
				if (list.length) {
					this.filteredClientInvoicingRecipients = list;
				} else {
					this.filteredClientInvoicingRecipients = [{ clientName: 'No records found', id: 'no-data' }];
				}
			});

		this.salesClientDataForm.evaluationsReferencePersonIdValue?.valueChanges
			.pipe(
				takeUntil(this._unsubscribe),
				debounceTime(300),
				switchMap((value: any) => {
					if (value) {
						let toSend = {
							clientId1: this.salesClientDataForm.directClientIdValue?.value?.clientId,
							clientId2: this.salesClientDataForm.endClientIdValue?.value?.clientId ?? undefined,
							name: value,
							maxRecordsCount: 1000,
						};
						if (value?.id) {
							toSend.name = value.id ? value.firstName : value;
						}
						return this._lookupService.contacts(
							toSend.clientId1,
							toSend.clientId2,
							toSend.name,
							toSend.maxRecordsCount
						);
					} else {
						return of([]);
					}
				})
			)
			.subscribe((list: ContactResultDto[]) => {
				if (list.length) {
					this.filteredEvaluationReferencePersons = list;
				} else {
					this.filteredEvaluationReferencePersons = [{firstName: 'No records found', lastName: '', id: 'no-data' }];
				}
			});

		this.salesTerminateConsultantForm.finalEvaluationReferencePerson?.valueChanges
			.pipe(
				takeUntil(this._unsubscribe),
				debounceTime(300),
				switchMap((value: any) => {
					if (value) {
						let toSend = {
							clientId1: this.directClientIdTerminationSales ?? undefined,
							clientId2: this.endClientIdTerminationSales ?? undefined,
							name: value ?? '',
							maxRecordsCount: 1000,
						};
						if (value?.id) {
							toSend.name = value.id ? value.firstName : value;
						}
						return this._lookupService.contacts(
							toSend.clientId1,
							toSend.clientId2,
							toSend.name,
							toSend.maxRecordsCount
						);
					} else {
						return of([]);
					}
				})
			)
			.subscribe((list: ContactResultDto[]) => {
				if (list.length) {
					this.filteredFinalEvaluationReferencePersons = list;
				} else {
					this.filteredFinalEvaluationReferencePersons = [{firstName: 'No records found', lastName: '', id: 'no-data', }];
				}
			});

		merge(
			this.salesClientDataForm.startDate!.valueChanges,
			this.salesClientDataForm.endDate!.valueChanges,
			this.salesClientDataForm.noEndDate!.valueChanges
		)
			.pipe(takeUntil(this._unsubscribe), debounceTime(300))
			.subscribe(() => {
				for (let consultant of this.consultants.controls) {
					if (consultant.get('consultantProjectDurationSameAsClient')!.value) {
						consultant
							.get('consultantProjectStartDate')
							?.setValue(this.salesClientDataForm.startDate?.value, { emitEvent: false });
						consultant
							.get('consultantProjectEndDate')
							?.setValue(this.salesClientDataForm.endDate?.value, { emitEvent: false });
						consultant
							.get('consultantProjectNoEndDate')
							?.setValue(this.salesClientDataForm.noEndDate?.value, { emitEvent: false });
						if (this.salesClientDataForm.noEndDate?.value) {
							consultant.get('consultantProjectEndDate')?.disable();
						} else {
							consultant.get('consultantProjectEndDate')?.enable();
						}
					}
				}
			});
	}

	ngOnInit(): void {
		this.activatedRoute.paramMap.pipe(takeUntil(this._unsubscribe)).subscribe((params) => {
			this.workflowId = params.get('id')!;
		});
		this._workflowDataService.updateWorkflowProgressStatus({
			currentStepIsCompleted: this.isCompleted,
			currentStepIsForcefullyEditing: this.editEnabledForcefuly,
		});
        this.getEnums();
		this.getSalesStepData();

		this._workflowDataService.startClientPeriodSalesSaved.pipe(takeUntil(this._unsubscribe)).subscribe((isDraft: boolean) => {
			if (isDraft && !this.editEnabledForcefuly) {
				this.saveStartChangeOrExtendClientPeriodSales(isDraft);
			} else {
				if (this.validateSalesForm()) {
					this.saveStartChangeOrExtendClientPeriodSales(isDraft);
				} else {
					this.scrollToFirstError(isDraft);
				}
			}
		});
		this._workflowDataService.consultantStartChangeOrExtendSalesSaved
			.pipe(takeUntil(this._unsubscribe))
			.subscribe((isDraft: boolean) => {
				if (isDraft && !this.editEnabledForcefuly) {
					this.saveStartChangeOrExtendConsultantPeriodSales(isDraft);
				} else {
					if (this.validateSalesForm()) {
						this.saveStartChangeOrExtendConsultantPeriodSales(isDraft);
					} else {
						this.scrollToFirstError(isDraft);
					}
				}
			});

		// Termination
		this._workflowDataService.consultantTerminationSalesSaved
			.pipe(takeUntil(this._unsubscribe))
			.subscribe((isDraft: boolean) => {
				if (isDraft && !this.editEnabledForcefuly) {
					this.saveTerminationConsultantSalesStep(isDraft);
				} else {
					if (this.validateSalesForm()) {
						this.saveTerminationConsultantSalesStep(isDraft);
					} else {
						this.scrollToFirstError(isDraft);
					}
				}
			});

		this._workflowDataService.workflowTerminationSalesSaved
			.pipe(takeUntil(this._unsubscribe))
			.subscribe((isDraft: boolean) => {
				if (isDraft && !this.editEnabledForcefuly) {
					this.saveWorkflowTerminationSalesStep(isDraft);
				} else {
					if (this.validateSalesForm()) {
						this.saveWorkflowTerminationSalesStep(isDraft);
					} else {
						this.scrollToFirstError(isDraft);
					}
				}
			});

		this._workflowDataService.workflowSideSectionChanged
			.pipe(takeUntil(this._unsubscribe))
			.subscribe((value: { consultant?: ConsultantResultDto | undefined; consultantPeriodId?: string | undefined }) => {
				this.editEnabledForcefuly = false;
				this.getSalesStepData(value?.consultant, value?.consultantPeriodId);
			});

		this._workflowDataService.cancelForceEdit.pipe(takeUntil(this._unsubscribe)).subscribe(() => {
			this.isCompleted = true;
			this.editEnabledForcefuly = false;
			this._workflowDataService.updateWorkflowProgressStatus({
				currentStepIsCompleted: this.isCompleted,
				currentStepIsForcefullyEditing: this.editEnabledForcefuly,
			});
			this.getSalesStepData();
		});

		this.individualConsultantActionsAvailable = environment.dev;
	}

	validateSalesForm() {
		this.salesClientDataForm.markAllAsTouched();
		this.mainDataComponent?.salesMainDataForm.markAllAsTouched();
		this.consultantsForm.markAllAsTouched();
		this.salesTerminateConsultantForm.markAllAsTouched();
		switch (this.activeSideSection.typeId) {
			case WorkflowProcessType.StartClientPeriod:
			case WorkflowProcessType.ChangeClientPeriod:
			case WorkflowProcessType.ExtendClientPeriod:
			case WorkflowProcessType.StartConsultantPeriod:
			case WorkflowProcessType.ChangeConsultantPeriod:
			case WorkflowProcessType.ExtendConsultantPeriod:
				return this.salesClientDataForm.valid && this.mainDataComponent?.salesMainDataForm.valid && this.consultantsForm.valid;
			case WorkflowProcessType.TerminateWorkflow:
			case WorkflowProcessType.TerminateConsultant:
				return this.salesTerminateConsultantForm.valid;
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
				this.saveSalesStep(isDraft);
			}
		}, 0);
	}

	saveSalesStep(isDraft: boolean) {
		switch (this._workflowDataService.workflowProgress.currentlyActiveSideSection) {
			case WorkflowProcessType.StartClientPeriod:
			case WorkflowProcessType.ChangeClientPeriod:
			case WorkflowProcessType.ExtendClientPeriod:
				this.saveStartChangeOrExtendClientPeriodSales(isDraft);
				break;
			case WorkflowProcessType.TerminateWorkflow:
				this.saveWorkflowTerminationSalesStep(isDraft);
				break;
			case WorkflowProcessType.TerminateConsultant:
				this.saveTerminationConsultantSalesStep(isDraft);
				break;
			case WorkflowProcessType.StartConsultantPeriod:
			case WorkflowProcessType.ChangeConsultantPeriod:
			case WorkflowProcessType.ExtendConsultantPeriod:
				this.saveStartChangeOrExtendConsultantPeriodSales(isDraft);
				break;
		}
	}

	toggleEditMode() {
		this.isCompleted = !this.isCompleted;
		this.editEnabledForcefuly = !this.editEnabledForcefuly;
		this._workflowDataService.updateWorkflowProgressStatus({
			currentStepIsCompleted: this.isCompleted,
			currentStepIsForcefullyEditing: this.editEnabledForcefuly,
		});
		this.getSalesStepData();
	}

	get canToggleEditMode() {
		return this.permissionsForCurrentUser!['Edit'] && this.isCompleted;
	}

	get readOnlyMode() {
		return (
			this.isCompleted ||
			(!this.permissionsForCurrentUser!['StartEdit'] &&
				!this.permissionsForCurrentUser!['Edit'] &&
				!this.permissionsForCurrentUser!['Completion'])
		);
	}

	directClientSelected(event: MatAutocompleteSelectedEvent) {
		this.salesClientDataForm.clientInvoicingRecipientIdValue?.setValue(event.option.value, { emitEvent: false });
		this.getRatesAndFees(event.option.value?.clientId);
		this.focusOutMethod();
	}

	getRatesAndFees(clientId: number) {
		this._clientService
			.specialRatesAll(clientId, false)
			.subscribe((result) => this.clientSpecialRateList = result);
		this._clientService
			.specialFeesAll(clientId, false)
			.subscribe((result) => this.clientSpecialFeeList = result);
	}

	ngOnDestroy(): void {
		this._unsubscribe.next();
		this._unsubscribe.complete();
	}

    getEnums() {
        forkJoin({
            currencies: this._internalLookupService.getCurrencies(),
            rateUnitTypes: this._internalLookupService.getCurrencies(),
            deliveryTypes: this._internalLookupService.getDeliveryTypes(),
            saleTypes: this._internalLookupService.getSaleTypes(),
            projectTypes: this._internalLookupService.getProjectTypes(),
            invoicingTimes: this._internalLookupService.getInvoicingTimes(),
            invoiceFrequencies: this._internalLookupService.getInvoiceFrequencies(),
            signerRoles: this._internalLookupService.getSignerRoles(),
            emagineOffices: this._internalLookupService.getEmagineOfficeList(),
            margins: this._internalLookupService.getMargins(),
            clientExtensionDeadlines: this._internalLookupService.getExtensionDeadlines(),
            clientExtensionDurations: this._internalLookupService.getExtensionDurations(),
            clientSpecialFeeFrequencies: this._internalLookupService.getSpecialFeeFrequencies(),
            clientSpecialFeeSpecifications: this._internalLookupService.getSpecialFeeSpecifications(),
            clientSpecialRateReportUnits: this._internalLookupService.getSpecialRateReportUnits(),
            clientSpecialRateSpecifications: this._internalLookupService.getSpecialRateSpecifications(),
            contractExpirationNotificationDuration: this._internalLookupService.getContractExpirationNotificationInterval(),
            clientTimeReportingCap: this._internalLookupService.getClientTimeReportingCap(),
            commissionFrequencies: this._internalLookupService.getCommissionFrequency(),
            commissionTypes: this._internalLookupService.getCommissionTypes(),
            commissionRecipientTypeList: this._internalLookupService.getCommissionRecipientTypes(),
            legalEntities: this._internalLookupService.getLegalEntities(),
            projectCategories: this._internalLookupService.getProjectCategory(),
            discounts: this._internalLookupService.getDiscounts(),
            nonStandartTerminationTimes: this._internalLookupService.getTerminationTimes(),
            terminationReasons: this._internalLookupService.getTerminationReasons(),
            expectedWorkloadUnits: this._internalLookupService.getExpectedWorkloadUnit(),
            employmentTypes: this._internalLookupService.getEmploymentTypes(),
            countries: this._internalLookupService.getCountries(),
            consultantTimeReportingCapList: this._internalLookupService.getConsultantTimeReportingCap()
        })
        .subscribe(result => {
            this.currencies = result.currencies;
            this.rateUnitTypes = result.rateUnitTypes;
            this.deliveryTypes = result.deliveryTypes;
            this.saleTypes = result.saleTypes;
            this.projectTypes = result.projectTypes;
            this.invoicingTimes = result.invoicingTimes;
            this.invoiceFrequencies = result.invoiceFrequencies;
            this.signerRoles = result.signerRoles;
            this.emagineOffices = result.emagineOffices;
            this.margins = result.margins;
            this.clientExtensionDeadlines = result.clientExtensionDeadlines;
            this.clientExtensionDurations = result.clientExtensionDurations;
            this.clientSpecialFeeFrequencies = result.clientSpecialFeeFrequencies;
            this.clientSpecialFeeSpecifications = result.clientSpecialFeeSpecifications;
            this.clientSpecialRateReportUnits = result.clientSpecialRateReportUnits;
            this.clientSpecialRateSpecifications = result.clientSpecialRateSpecifications;
            this.contractExpirationNotificationDuration = result.contractExpirationNotificationDuration;
            this.clientTimeReportingCap = result.clientTimeReportingCap;
            this.commissionFrequencies = result.commissionFrequencies;
            this.commissionTypes = result.commissionTypes;
            this.commissionRecipientTypeList = result.commissionRecipientTypeList;
            this.legalEntities = result.legalEntities;
            this.projectCategories = result.projectCategories;
            this.discounts = result.discounts;
            this.nonStandartTerminationTimes = result.nonStandartTerminationTimes;
            this.terminationReasons = result.terminationReasons;
            this.expectedWorkloadUnits = result.expectedWorkloadUnits;
            this.employmentTypes = result.employmentTypes;
            this.countries = result.countries;
            this.consultantTimeReportingCapList = result.consultantTimeReportingCapList;
        });
    }

	getDataBasedOnProjectType(event: MatSelectChange) {
		const projectTypeId = event.value;
		this.showMainSpinner();
		this._clientPeriodService
			.projectType(projectTypeId)
			.pipe(
				finalize(() => {
					this.hideMainSpinner();
				})
			)
			.subscribe((result) => {
				this.mainDataComponent?.salesMainDataForm.deliveryTypeId?.setValue(result.deliveryTypeId, { emitEvent: false });
				this.mainDataComponent?.salesMainDataForm.salesTypeId?.setValue(result.salesTypeId, { emitEvent: false });
				this.mainDataComponent?.salesMainDataForm.marginId?.setValue(result.marginId, { emitEvent: false });
			});
	}

	selectClientSpecialRate(event: any, rate: ClientSpecialRateDto, clientRateMenuTrigger: MatMenuTrigger) {
		event.stopPropagation();
		const formattedRate = new PeriodClientSpecialRateDto();
		formattedRate.id = undefined;
		formattedRate.clientSpecialRateId = rate.id;
		formattedRate.rateName = rate.internalName;
		formattedRate.reportingUnit = rate.specialRateReportingUnit;
		formattedRate.rateSpecifiedAs = rate.specialRateSpecifiedAs;
		if (formattedRate.rateSpecifiedAs?.id === 1) {
			formattedRate.clientRate = +((this.salesClientDataForm?.normalRate?.value * rate.clientRate!) / 100).toFixed(2);
			formattedRate.clientRateCurrencyId = this.salesClientDataForm.clientCurrency?.value?.id;
		} else {
			formattedRate.clientRate = rate.clientRate;
			formattedRate.clientRateCurrencyId = rate.clientRateCurrency?.id;
		}
		this.clientSpecialRateFilter.setValue('');
		clientRateMenuTrigger.closeMenu();
		this.addSpecialRate(formattedRate);
	}

	addSpecialRate(clientRate?: PeriodClientSpecialRateDto) {
		const form = this._fb.group({
			id: new UntypedFormControl(clientRate?.id ?? null),
			clientSpecialRateId: new UntypedFormControl(clientRate?.clientSpecialRateId ?? null),
			rateName: new UntypedFormControl(clientRate?.rateName ?? null),
			reportingUnit: new UntypedFormControl(clientRate?.reportingUnit ?? null),
			rateSpecifiedAs: new UntypedFormControl(clientRate?.rateSpecifiedAs ?? null),
			clientRate: new UntypedFormControl(clientRate?.clientRate ?? null),
			clientRateCurrency: new UntypedFormControl(
				this.findItemById(this.currencies, clientRate?.clientRateCurrencyId) ?? null
			),
			editable: new UntypedFormControl(clientRate ? false : true),
		});
		this.salesClientDataForm.clientRates.push(form);
	}

	get clientRates(): UntypedFormArray {
		return this.salesClientDataForm.get('clientRates') as UntypedFormArray;
	}

	removeClientRate(index: number) {
		this.clientRates.removeAt(index);
	}

	editOrSaveSpecialRate(isEditable: boolean, rateIndex: number) {
		if (isEditable) {
			// save
			this.clientRateToEdit = new PeriodClientSpecialRateDto();
			this.isClientRateEditing = false;
		} else {
			// make editable
			const clientRateValue = this.clientRates.at(rateIndex).value;
			this.clientRateToEdit = new PeriodClientSpecialRateDto({
				id: clientRateValue.id,
				clientSpecialRateId: clientRateValue.clientSpecialRateId,
				rateName: clientRateValue.rateName,
				reportingUnit: clientRateValue.reportingUnit,
				clientRate: clientRateValue.clientRate,
				clientRateCurrencyId: clientRateValue.clientRateCurrency?.id,
			});
			this.isClientRateEditing = true;
		}
		this.clientRates.at(rateIndex).get('editable')?.setValue(!isEditable, { emitEvent: false });
	}

	cancelEditClientRate(rateIndex: number) {
		const rateRow = this.clientRates.at(rateIndex);
		rateRow.get('clientRate')?.setValue(this.clientRateToEdit.clientRate, { emitEvent: false });
		rateRow
			.get('clientRateCurrency')
			?.setValue(this.findItemById(this.currencies, this.clientRateToEdit.clientRateCurrencyId), { emitEvent: false });
		this.clientRateToEdit = new PeriodClientSpecialFeeDto();
		this.isClientRateEditing = false;
		this.clientRates.at(rateIndex).get('editable')?.setValue(false, { emitEvent: false });
	}

	selectClientSpecialFee(event: any, fee: ClientSpecialFeeDto, clientFeeMenuTrigger: MatMenuTrigger) {
        event.stopPropagation();
		const formattedFee = new PeriodClientSpecialFeeDto();
		formattedFee.id = undefined;
		formattedFee.clientSpecialFeeId = fee.id;
		formattedFee.feeName = fee.internalName;
		formattedFee.frequency = fee.clientSpecialFeeFrequency;
		formattedFee.clientRate = fee.clientRate;
		formattedFee.clientRateCurrencyId = fee.clientRateCurrency?.id;
		this.clientSpecialFeeFilter.setValue('');
		clientFeeMenuTrigger.closeMenu();
		this.addClientFee(formattedFee);
	}

	addClientFee(clientFee?: PeriodClientSpecialFeeDto) {
		const form = this._fb.group({
			id: new UntypedFormControl(clientFee?.id ?? null),
			clientSpecialFeeId: new UntypedFormControl(clientFee?.clientSpecialFeeId ?? null),
			feeName: new UntypedFormControl(clientFee?.feeName ?? null),
			frequency: new UntypedFormControl(clientFee?.frequency ?? null),
			clientRate: new UntypedFormControl(clientFee?.clientRate ?? null),
			clientRateCurrency: new UntypedFormControl(
				this.findItemById(this.currencies, clientFee?.clientRateCurrencyId) ?? null
			),
			editable: new UntypedFormControl(clientFee ? false : true),
		});
		this.salesClientDataForm.clientFees.push(form);
	}

	get clientFees(): UntypedFormArray {
		return this.salesClientDataForm.get('clientFees') as UntypedFormArray;
	}

	removeClientFee(index: number) {
		this.clientFees.removeAt(index);
	}

	editOrSaveClientFee(isEditable: boolean, feeIndex: number) {
		if (isEditable) {
			this.clientFeeToEdit = new PeriodClientSpecialFeeDto();
			this.isClientFeeEditing = false;
		} else {
			const consultantFeeValue = this.clientFees.at(feeIndex).value;
			this.clientFeeToEdit = new PeriodClientSpecialFeeDto({
				id: consultantFeeValue.id,
				clientSpecialFeeId: consultantFeeValue.clientSpecialRateId,
				feeName: consultantFeeValue.rateName,
				frequency: consultantFeeValue.reportingUnit,
				clientRate: consultantFeeValue.proDataRateValue,
				clientRateCurrencyId: consultantFeeValue.proDataRateCurrency?.id,
			});
			this.isClientFeeEditing = true;
		}
		this.clientFees.at(feeIndex).get('editable')?.setValue(!isEditable, { emitEvent: false });
	}

	cancelEditClientFee(feeIndex: number) {
		const feeRow = this.clientFees.at(feeIndex);
		feeRow.get('clientRate')?.setValue(this.clientFeeToEdit.clientRate, { emitEvent: false });
		feeRow
			.get('clientRateCurrencyId')
			?.setValue(this.findItemById(this.currencies, this.clientFeeToEdit.clientRateCurrencyId), { emitEvent: false });
		this.clientFeeToEdit = new PeriodClientSpecialFeeDto();
		this.isClientFeeEditing = false;
		this.clientFees.at(feeIndex).get('editable')?.setValue(false, { emitEvent: false });
	}

	addSignerToForm(signer?: ContractSignerDto) {
		const form = this._fb.group({
			clientContact: new UntypedFormControl(signer?.contact ?? null, CustomValidators.autocompleteValidator(['id'])),
			clientRole: new UntypedFormControl(this.findItemById(this.signerRoles, signer?.signerRoleId) ?? null),
			clientSequence: new UntypedFormControl(signer?.signOrder ?? null),
		});
		this.salesClientDataForm.contractSigners.push(form);
		this.manageSignersContactAutocomplete(this.salesClientDataForm.contractSigners.length - 1);
	}

	manageSignersContactAutocomplete(signerIndex: number) {
		let arrayControl = this.salesClientDataForm.contractSigners.at(signerIndex);
		arrayControl!
			.get('clientContact')!
			.valueChanges.pipe(
				takeUntil(this._unsubscribe),
				debounceTime(300),
				switchMap((value: any) => {
					let toSend = {
						clientId1: this.salesClientDataForm.directClientIdValue?.value?.clientId,
						clientId2: this.salesClientDataForm.endClientIdValue?.value?.clientId ?? undefined,
						name: value,
						maxRecordsCount: 1000,
					};
					if (value?.id) {
						toSend.name = value.id ? value.firstName : value;
					}
					return this._lookupService.contacts(toSend.clientId1, toSend.clientId2, toSend.name, toSend.maxRecordsCount);
				})
			)
			.subscribe((list: ContactResultDto[]) => {
				if (list.length) {
					this.filteredContractSigners = list;
				} else {
					this.filteredContractSigners = [{firstName: 'No records found', lastName: '', id: 'no-data'}];
				}
			});
	}

	get contractSigners(): UntypedFormArray {
		return this.salesClientDataForm.get('contractSigners') as UntypedFormArray;
	}

	removeSigner(index: number) {
		this.contractSigners.removeAt(index);
	}

	addConsultantForm(consultant?: ConsultantSalesDataDto) {
		let consultantRate = this.findItemById(this.clientRateTypes, 1); // 1: time based
		if (consultant?.consultantRate?.isFixedRate) {
			consultantRate = this.findItemById(this.clientRateTypes, 2); // 2: fixed
		}
		let consultantDto = null;
		if (consultant?.consultantId) {
			consultantDto = new ConsultantWithSourcingRequestResultDto();
			consultantDto.consultant = consultant?.consultant;
			consultantDto.sourcingRequestConsultantId = consultant?.soldRequestConsultantId;
			consultantDto.sourcingRequestId = consultant?.requestId;
		}
		const form = this._fb.group({
			employmentType: new UntypedFormControl(this.findItemById(this.employmentTypes, consultant?.employmentTypeId) ?? null),
			consultantName: new UntypedFormControl(consultantDto ?? null, CustomValidators.autocompleteConsultantValidator()),
			consultantPeriodId: new UntypedFormControl(consultant?.consultantPeriodId ?? null),
			consultantNameOnly: new UntypedFormControl(consultant?.nameOnly ?? null),

			consultantProjectDurationSameAsClient: new UntypedFormControl(consultant?.durationSameAsClientPeriod ?? true),
			consultantProjectStartDate: new UntypedFormControl(consultant?.startDate ?? null),
			consultantProjectEndDate: new UntypedFormControl({
				value: consultant?.endDate ?? null,
				disabled: consultant?.noEndDate,
			}),
			consultantProjectNoEndDate: new UntypedFormControl(consultant?.noEndDate ?? false),

			consultantWorkplace: new UntypedFormControl(null),
			consultantWorkplaceClientAddress: new UntypedFormControl(consultant?.onsiteClient ?? null),
			consultantWorkplaceEmagineOffice: new UntypedFormControl(
				this.findItemById(this.emagineOffices, consultant?.emagineOfficeId) ?? null
			),
			consultantWorkplaceRemote: new UntypedFormControl(
				this.findItemById(this.countries, consultant?.remoteAddressCountryId) ?? null,
				CustomValidators.autocompleteValidator(['id'])
			),
			consultantWorkplacePercentageOnSite: new UntypedFormControl(consultant?.percentageOnSite ?? null, [
				Validators.min(1),
				Validators.max(100),
			]),

			consultantIsOnsiteWorkplace: new UntypedFormControl(consultant?.isOnsiteWorkplace ?? false),
			consultantIsEmagineOfficeWorkplace: new UntypedFormControl(consultant?.isEmagineOfficeWorkplace ?? false),
			consultantIsRemoteWorkplace: new UntypedFormControl(consultant?.isRemoteWorkplace ?? false),

			expectedWorkloadHours: new UntypedFormControl(consultant?.expectedWorkloadHours ?? null),
			expectedWorkloadUnitId: new UntypedFormControl(
				this.findItemById(this.expectedWorkloadUnits, consultant?.expectedWorkloadUnitId) ?? null
			),
			consultantCapOnTimeReporting: new UntypedFormControl(
				this.findItemById(this.consultantTimeReportingCapList, consultant?.consultantTimeReportingCapId ?? 4)
			), // ?? default value = no cap - id:4
			consultantTimeReportingCapMaxValue: new UntypedFormControl(consultant?.consultantTimeReportingCapMaxValue ?? null),
			consultantProdataEntity: new UntypedFormControl(
				this.findItemById(this.legalEntities, consultant?.pdcPaymentEntityId) ?? null
			),
			consultantPaymentType: new UntypedFormControl(consultantRate),
			consultantRate: new UntypedFormControl(consultant?.consultantRate?.normalRate ?? null),
			consultantRateUnitType: new UntypedFormControl(
				this.findItemById(this.rateUnitTypes, consultant?.consultantRate?.rateUnitTypeId) ?? null
			),
			consultantRateCurrency: new UntypedFormControl(
				this.findItemById(this.currencies, consultant?.consultantRate?.currencyId) ?? null
			),
			consultantPDCRate: new UntypedFormControl(consultant?.consultantRate?.prodataToProdataRate ?? null),
			consultantPDCRateUnitType: new UntypedFormControl(
				this.findItemById(this.rateUnitTypes, consultant?.consultantRate?.rateUnitTypeId) ?? null
			),
			consultantPDCRateCurrency: new UntypedFormControl(
				this.findItemById(this.currencies, consultant?.consultantRate?.prodataToProdataCurrencyId) ?? null
			),
			consultantInvoicingFrequency: new UntypedFormControl(
				this.findItemById(this.invoiceFrequencies, consultant?.consultantRate?.invoiceFrequencyId) ?? null
			),
			consultantInvoicingTime: new UntypedFormControl(
				this.findItemById(this.invoicingTimes, consultant?.consultantRate?.invoicingTimeId) ?? null
			),
			consultantInvoicingManualDate: new UntypedFormControl(consultant?.consultantRate?.manualDate ?? null),
			prodataToProdataInvoiceCurrency: new UntypedFormControl(
				this.findItemById(this.currencies, consultant?.consultantRate?.prodataToProdataInvoiceCurrencyId) ?? null
			),
			consultantSpecialRateFilter: new UntypedFormControl(''),
			specialRates: new UntypedFormArray([]),
			consultantSpecialFeeFilter: new UntypedFormControl(''),
			specialFees: new UntypedFormArray([]),
			consultantSpecialContractTermsNone: new UntypedFormControl(consultant?.noSpecialContractTerms ?? false),
			consultantSpecialContractTerms: new UntypedFormControl({
				value: consultant?.specialContractTerms ?? null,
				disabled: consultant?.noSpecialContractTerms,
			}),
			deliveryManagerSameAsAccountManager: new UntypedFormControl(consultant?.deliveryManagerSameAsAccountManager ?? false),
			deliveryAccountManager: new UntypedFormControl(
				{
					value: consultant?.deliveryAccountManager ?? '',
					disabled: consultant?.deliveryManagerSameAsAccountManager,
				},
				CustomValidators.autocompleteValidator(['id'])
			),
		});
		this.consultants.push(form);
		if (consultant?.periodConsultantSpecialRates?.length) {
			for (let rate of consultant?.periodConsultantSpecialRates) {
				this.addConsultantSpecialRate(this.consultants.length - 1, rate);
			}
		}
		if (consultant?.periodConsultantSpecialFees?.length) {
			for (let fee of consultant?.periodConsultantSpecialFees) {
				this.addConsultantSpecialFee(this.consultants.length - 1, fee);
			}
		}
		this.manageManagerAutocomplete(this.consultants.length - 1);
		this.manageConsultantAutocomplete(this.consultants.length - 1);
		this.manageConsultantClientAddressAutocomplete(this.consultants.length - 1);
		this.manageConsultantCountryAutocomplete(this.consultants.length - 1);
	}

	updateConsultantStepAnchors() {
		let consultantNames = this.consultants.value.map((item: any) => {
			if (item.employmentType?.id === EmploymentTypes.FeeOnly || item.employmentType?.id === EmploymentTypes.Recruitment) {
				return item.consultantNameOnly;
			} else {
				return item.consultantName?.consultant?.name;
			}
		});
		this._workflowDataService.consultantsAddedToStep.emit({
			stepType: StepType.Sales,
			processTypeId: this.activeSideSection.typeId!,
			consultantNames: consultantNames,
		});
		this._workflowDataService.workflowOverviewUpdated.emit(true);
	}

	manageManagerAutocomplete(consultantIndex: number) {
		let arrayControl = this.consultants.at(consultantIndex);
		arrayControl!
			.get('deliveryAccountManager')!
			.valueChanges.pipe(
				takeUntil(this._unsubscribe),
				debounceTime(300),
				switchMap((value: any) => {
					let toSend = {
						name: value,
						maxRecordsCount: 1000,
					};
					if (value?.id) {
						toSend.name = value.id ? value.name : value;
					}
					return this._lookupService.employees(value);
				})
			)
			.subscribe((list: EmployeeDto[]) => {
				if (list.length) {
					this.filteredAccountManagers = list;
				} else {
					this.filteredAccountManagers = [{name: 'No managers found', externalId: '', id: 'no-data', selected: false}];
				}
			});
	}

	manageConsultantClientAddressAutocomplete(consultantIndex: number) {
		let arrayControl = this.consultants.at(consultantIndex);
		arrayControl!
			.get('consultantWorkplaceClientAddress')!
			.valueChanges.pipe(
				takeUntil(this._unsubscribe),
				debounceTime(300),
				switchMap((value: any) => {
					if (value) {
						let toSend = {
							name: value,
							maxRecordsCount: 1000,
						};
						if (value?.id) {
							toSend.name = value.id ? value.clientName : value;
						}
						return this._lookupService.clientsAll(toSend.name, toSend.maxRecordsCount);
					} else {
						return of([]);
					}
				})
			)
			.subscribe((list: EmployeeDto[]) => {
				if (list.length) {
					this.filteredConsultantClientAddresses = list;
				} else {
					this.filteredConsultantClientAddresses = [{ clientName: 'No records found', id: 'no-data' }];
				}
			});
	}

	manageConsultantCountryAutocomplete(consultantIndex: number) {
		let arrayControl = this.consultants.at(consultantIndex);
		arrayControl!
			.get('consultantWorkplaceRemote')!
			.valueChanges.pipe(takeUntil(this._unsubscribe))
			.subscribe((value) => {
				if (typeof value === 'string') {
					this.filteredConsultantCountries = this._filterConsultantCountry(value);
				}
			});
	}

	private _filterConsultantCountry(value: string): CountryDto[] {
		const filterValue = value.toLowerCase();
		const result = this.countries.filter((option) => option.name!.toLowerCase().includes(filterValue));
		return result;
	}

	updateProdataUnitType(event: MatSelectChange, consultantIndex: number) {
		this.consultants.at(consultantIndex).get('consultantPDCRateUnitType')?.setValue(event.value, { emitEvent: false });
	}

	getConsultantRateControls(consultantIndex: number): AbstractControl[] | null {
		return (this.consultants.at(consultantIndex).get('specialRates') as UntypedFormArray).controls;
	}

	removeConsutlantRate(consultantIndex: number, specialRateIndex: number) {
		(this.consultants.at(consultantIndex).get('specialRates') as UntypedFormArray).removeAt(specialRateIndex);
	}

	editOrSaveConsultantRate(consultantIndex: number, specialRateIndex: number, isEditable: boolean) {
		if (isEditable) {
			this.consultantRateToEdit = new PeriodConsultantSpecialRateDto();
			this.isConsultantRateEditing = false;
		} else {
			const consultantRateValue = (this.consultants.at(consultantIndex).get('specialRates') as UntypedFormArray).at(
				specialRateIndex
			).value;
			this.consultantRateToEdit = new PeriodConsultantSpecialRateDto({
				id: consultantRateValue.id,
				clientSpecialRateId: consultantRateValue.clientSpecialRateId,
				rateName: consultantRateValue.rateName,
				reportingUnit: consultantRateValue.reportingUnit,
				prodataToProdataRate: consultantRateValue.prodataToProdataRate,
				prodataToProdataRateCurrencyId: consultantRateValue.prodataToProdataRateCurrency?.id,
				consultantRate: consultantRateValue.consultantRate,
				consultantRateCurrencyId: consultantRateValue.consultantRateCurrency?.id,
			});
			this.isConsultantRateEditing = true;
		}
		(this.consultants.at(consultantIndex).get('specialRates') as UntypedFormArray)
			.at(specialRateIndex)
			.get('editable')
			?.setValue(!isEditable, { emitEvent: false });
	}

	cancelEditConsultantRate(consultantIndex: number, specialRateIndex: number) {
		const rateRow = (this.consultants.at(consultantIndex).get('specialRates') as UntypedFormArray).at(specialRateIndex);
		rateRow.get('prodataToProdataRate')?.setValue(this.consultantRateToEdit.prodataToProdataRate, {
			emitEvent: false,
		});
		rateRow
			.get('prodataToProdataRateCurrency')
			?.setValue(this.findItemById(this.currencies, this.consultantRateToEdit.prodataToProdataRateCurrencyId), {
				emitEvent: false,
			});
		rateRow.get('consultantRate')?.setValue(this.consultantRateToEdit.consultantRate, {
			emitEvent: false,
		});
		rateRow
			.get('consultantRateCurrency')
			?.setValue(this.findItemById(this.currencies, this.consultantRateToEdit.consultantRateCurrencyId), {
				emitEvent: false,
			});
		this.isConsultantRateEditing = false;
		(this.consultants.at(consultantIndex).get('specialRates') as UntypedFormArray)
			.at(specialRateIndex)
			.get('editable')
			?.setValue(false, { emitEvent: false });
	}

	selectConsultantSpecialRate(
		event: any,
		consultantIndex: number,
		rate: ClientSpecialRateDto,
		consultantRateMenuTrigger: MatMenuTrigger
	) {
        event.stopPropagation();
		const consultantRate = new PeriodConsultantSpecialRateDto();
		consultantRate.id = undefined;
		consultantRate.clientSpecialRateId = rate.id;
		consultantRate.rateName = rate.internalName;
		consultantRate.reportingUnit = rate.specialRateReportingUnit;
		consultantRate.rateSpecifiedAs = rate.specialRateSpecifiedAs;
		if (consultantRate.rateSpecifiedAs?.id === 1) {
			consultantRate.prodataToProdataRate = +(
				(this.consultants.at(consultantIndex)!.get('consultantRate')!.value * rate.proDataToProDataRate!) /
				100
			).toFixed(2);
			consultantRate.prodataToProdataRateCurrencyId = this.consultants
				.at(consultantIndex)!
				.get('consultantRateCurrency')!.value?.id;
			consultantRate.consultantRate = +(
				(this.consultants.at(consultantIndex)!.get('consultantRate')!.value * rate.consultantRate!) /
				100
			).toFixed(2);
			consultantRate.consultantRateCurrencyId = this.consultants
				.at(consultantIndex)!
				.get('consultantRateCurrency')!.value?.id;
		} else {
			consultantRate.prodataToProdataRate = rate.proDataToProDataRate;
			consultantRate.prodataToProdataRateCurrencyId = rate.proDataToProDataRateCurrency?.id;
			consultantRate.consultantRate = rate.consultantRate;
			consultantRate.consultantRateCurrencyId = rate.consultantCurrency?.id;
		}
		consultantRateMenuTrigger.closeMenu();
		this.addConsultantSpecialRate(consultantIndex, consultantRate);
	}

	addConsultantSpecialRate(consultantIndex: NumberSymbol, consultantRate?: PeriodConsultantSpecialRateDto) {
		const form = this._fb.group({
			id: new UntypedFormControl(consultantRate?.id ?? null),
			clientSpecialRateId: new UntypedFormControl(consultantRate?.clientSpecialRateId ?? null),
			rateName: new UntypedFormControl(consultantRate?.rateName ?? null),
			reportingUnit: new UntypedFormControl(consultantRate?.reportingUnit ?? null),
			prodataToProdataRate: new UntypedFormControl(consultantRate?.prodataToProdataRate ?? null),
			prodataToProdataRateCurrency: new UntypedFormControl(
				this.findItemById(this.currencies, consultantRate?.prodataToProdataRateCurrencyId) ?? null
			),
			consultantRate: new UntypedFormControl(consultantRate?.consultantRate ?? null),
			consultantRateCurrency: new UntypedFormControl(
				this.findItemById(this.currencies, consultantRate?.consultantRateCurrencyId) ?? null
			),
			editable: new UntypedFormControl(false),
		});
		(this.consultants.at(consultantIndex).get('specialRates') as UntypedFormArray).push(form);
	}

	getConsultantFeeControls(consultantIndex: number): AbstractControl[] | null {
		return (this.consultants.at(consultantIndex).get('specialFees') as UntypedFormArray).controls;
	}

	removeConsutlantFee(consultantIndex: number, specialFeeIndex: number) {
		(this.consultants.at(consultantIndex).get('specialFees') as UntypedFormArray).removeAt(specialFeeIndex);
	}

	editOrSaveConsultantFee(consultantIndex: number, specialFeeIndex: number, isEditable: boolean) {
		if (isEditable) {
			this.consultantFeeToEdit = new PeriodConsultantSpecialRateDto();
			this.isConsultantFeeEditing = false;
		} else {
			const consultantFeeValue = (this.consultants.at(consultantIndex).get('specialFees') as UntypedFormArray).at(
				specialFeeIndex
			).value;
			this.consultantFeeToEdit = new PeriodConsultantSpecialFeeDto({
				id: consultantFeeValue.id,
				clientSpecialFeeId: consultantFeeValue.clientSpecialFeeId,
				feeName: consultantFeeValue.feeName,
				frequency: consultantFeeValue.frequency,
				prodataToProdataRate: consultantFeeValue.prodataToProdataRate,
				prodataToProdataRateCurrencyId: consultantFeeValue.prodataToProdataRateCurrency?.id,
				consultantRate: consultantFeeValue.consultantRate,
				consultantRateCurrencyId: consultantFeeValue.consultantRateCurrency?.id,
			});
			this.isConsultantFeeEditing = true;
		}
		(this.consultants.at(consultantIndex).get('specialFees') as UntypedFormArray)
			.at(specialFeeIndex)
			.get('editable')
			?.setValue(!isEditable, { emitEvent: false });
	}

	cancelEditConsultantFee(consultantIndex: number, specialFeeIndex: number) {
		const rateRow = (this.consultants.at(consultantIndex).get('specialFees') as UntypedFormArray).at(specialFeeIndex);
		rateRow.get('prodataToProdataRate')?.setValue(this.consultantFeeToEdit.prodataToProdataRate, {
			emitEvent: false,
		});
		rateRow
			.get('prodataToProdataRateCurrency')
			?.setValue(this.findItemById(this.currencies, this.consultantFeeToEdit.prodataToProdataRateCurrencyId), {
				emitEvent: false,
			});
		rateRow.get('consultantRate')?.setValue(this.consultantFeeToEdit.consultantRate, {
			emitEvent: false,
		});
		rateRow
			.get('consultantRateCurrency')
			?.setValue(this.findItemById(this.currencies, this.consultantFeeToEdit.consultantRateCurrencyId), {
				emitEvent: false,
			});
		this.isConsultantFeeEditing = false;
		(this.consultants.at(consultantIndex).get('specialFees') as UntypedFormArray)
			.at(specialFeeIndex)
			.get('editable')
			?.setValue(false, { emitEvent: false });
	}

	selectConsultantSpecialFee(
		event: any,
		consultantIndex: number,
		fee: ClientSpecialFeeDto,
		consultantFeeMenuTrigger: MatMenuTrigger
	) {
        event.stopPropagation();
		const consultantFee = new PeriodConsultantSpecialFeeDto();
		consultantFee.id = undefined;
		consultantFee.clientSpecialFeeId = fee.id;
		consultantFee.feeName = fee.internalName;
		consultantFee.frequency = fee.clientSpecialFeeFrequency;
		consultantFee.prodataToProdataRate = fee.prodataToProdataRate;
		consultantFee.prodataToProdataRateCurrencyId = fee.prodataToProdataRateCurrency?.id;
		consultantFee.consultantRate = fee.consultantRate;
		consultantFee.consultantRateCurrencyId = fee.consultantCurrency?.id;
		consultantFeeMenuTrigger.closeMenu();
		this.addConsultantSpecialFee(consultantIndex, consultantFee);
	}

	addConsultantSpecialFee(consultantIndex: number, consultantFee?: PeriodConsultantSpecialFeeDto) {
		const form = this._fb.group({
			id: new UntypedFormControl(consultantFee?.id ?? null),
			clientSpecialFeeId: new UntypedFormControl(consultantFee?.clientSpecialFeeId ?? null),
			feeName: new UntypedFormControl(consultantFee?.feeName ?? null),
			frequency: new UntypedFormControl(consultantFee?.frequency ?? null),
			prodataToProdataRate: new UntypedFormControl(consultantFee?.prodataToProdataRate ?? null),
			prodataToProdataRateCurrency: new UntypedFormControl(
				this.findItemById(this.currencies, consultantFee?.prodataToProdataRateCurrencyId) ?? null
			),
			consultantRate: new UntypedFormControl(consultantFee?.consultantRate ?? null),
			consultantRateCurrency: new UntypedFormControl(
				this.findItemById(this.currencies, consultantFee?.consultantRateCurrencyId) ?? null
			),
			editable: new UntypedFormControl(false),
		});
		(this.consultants.at(consultantIndex).get('specialFees') as UntypedFormArray).push(form);
	}

	manageConsultantAutocomplete(consultantIndex: number) {
		let arrayControl = this.consultants.at(consultantIndex);
		arrayControl!
			.get('consultantName')!
			.valueChanges.pipe(
				takeUntil(this._unsubscribe),
				debounceTime(300),
				switchMap((value: any) => {
					let toSend = {
						name: value ? value : '',
						clientId: this.salesClientDataForm.directClientIdValue!.value?.clientId,
						maxRecordsCount: 1000,
					};
					if (value) {
						toSend.name = value?.consultant?.id ? value.consultant.name : value;
					}
					if (toSend?.clientId && value) {
						return this._lookupService.consultantsWithSourcingRequest(
							toSend.clientId,
							toSend.name,
							toSend.maxRecordsCount
						);
					} else {
						return of([]);
					}
				})
			)
			.subscribe((list: ConsultantWithSourcingRequestResultDto[]) => {
				if (list.length) {
					this.filteredConsultants = list;
				} else {
					this.filteredConsultants = [{ consultant: { name: 'No consultant found' }, externalId: '', id: 'no-data'}];
				}
			});

		arrayControl!
			.get('consultantNameOnly')
			?.valueChanges.pipe(takeUntil(this._unsubscribe), debounceTime(2000))
			.subscribe((value: string) => {
				this.updateConsultantStepAnchors();
			});
	}

	confirmRemoveConsultant(index: number) {
		const consultant = this.consultants.at(index).value;
		const scrollStrategy = this.overlay.scrollStrategies.reposition();
		MediumDialogConfig.scrollStrategy = scrollStrategy;
		MediumDialogConfig.data = {
			confirmationMessageTitle: `Delete consultant`,
			confirmationMessage: `Are you sure you want to delete consultant ${
				consultant.consultantName?.consultant?.name ?? ''
			}?\n
                When you confirm the deletion, all the info contained inside this block will disappear.`,
			rejectButtonText: 'Cancel',
			confirmButtonText: 'Delete',
			isNegative: true,
		};
		const dialogRef = this.dialog.open(ConfirmationDialogComponent, MediumDialogConfig);

		dialogRef.componentInstance.onConfirmed.subscribe(() => {
			this.removeConsultant(index);
		});
	}

	removeConsultant(index: number) {
		this.consultantsForm.consultants.removeAt(index);
		this.updateConsultantStepAnchors();
	}

	get consultants(): UntypedFormArray {
		return this.consultantsForm.get('consultants') as UntypedFormArray;
	}

	saveStartChangeOrExtendClientPeriodSales(isDraft: boolean) {
		let input = this._packClientPeriodData();
		this.showMainSpinner();
		if (isDraft) {
			this._clientPeriodService
				.clientSalesPUT(this.periodId!, input)
				.pipe(
					finalize(() => {
						this.hideMainSpinner();
					})
				)
				.subscribe(() => {
					this.showNotify(NotifySeverity.Success, 'Saved sales step', 'Ok');
					this._workflowDataService.workflowTopSectionUpdated.emit();
					this._workflowDataService.workflowOverviewUpdated.emit(true);
					if (this.editEnabledForcefuly) {
						this.toggleEditMode();
					}
				});
		} else {
			this._clientPeriodService
				.editFinish(this.periodId!, input)
				.pipe(
					finalize(() => {
						this.hideMainSpinner();
					})
				)
				.subscribe(() => {
					this._workflowDataService.workflowSideSectionUpdated.emit({ isStatusUpdate: true });
					this._workflowDataService.workflowOverviewUpdated.emit(true);
					this.getSalesStepData();
				});
		}
	}

	getStartChangeOrExtendClientPeriodSales() {
		this.showMainSpinner();
		this._clientPeriodService
			.clientSalesGET(this.periodId!)
			.pipe(
				finalize(() => {
					this.hideMainSpinner();
				})
			)
			.subscribe((result) => {
				this.resetForms();
				this.mainDataComponent?.salesMainDataForm.patchValue(result?.salesMainData!, { emitEvent: false });
				result.salesMainData?.commissions?.forEach((commission: CommissionDto) => {
					this.mainDataComponent?.addCommission(false, commission);
				});
				this.mainDataComponent?.salesMainDataForm.discountId?.setValue(result?.salesMainData?.discountId ?? 1, { emitEvent: false }); // 1 - default value 'None'
				this.mainDataComponent?.salesMainDataForm.salesAccountManagerIdValue?.setValue(result?.salesMainData?.salesAccountManagerData, {
					emitEvent: false,
				});
				this.mainDataComponent?.salesMainDataForm.commissionAccountManagerIdValue?.setValue(
					result?.salesMainData?.commissionAccountManagerData,
					{ emitEvent: false }
				);
				let expirationNotificationIntervals = result.salesMainData?.contractExpirationNotificationIntervalIds;
				if (
					result?.salesMainData?.customContractExpirationNotificationDate !== null &&
					result?.salesMainData?.customContractExpirationNotificationDate !== undefined
				) {
					expirationNotificationIntervals!.push(999);
				}
				this.mainDataComponent?.salesMainDataForm.contractExpirationNotification?.setValue(expirationNotificationIntervals, {
					emitEvent: false,
				});
				if (result?.salesMainData?.noRemarks) {
					this.mainDataComponent?.salesMainDataForm.remarks?.disable({
						emitEvent: false,
					});
				}
				this.salesClientDataForm.patchValue(result, { emitEvent: false });
				this.salesClientDataForm.patchValue(result.salesClientData!, { emitEvent: false });
				this.salesClientDataForm.differentEndClient?.setValue(result.salesClientData?.differentEndClient ?? false, {
					emitEvent: false,
				}); // default value if false
				this.salesClientDataForm.directClientIdValue?.setValue(result?.salesClientData?.directClient, {
					emitEvent: false,
				});
				if (result?.salesClientData?.directClient?.clientId) {
					this.getRatesAndFees(result?.salesClientData?.directClient?.clientId);
				}
				this.salesClientDataForm.endClientIdValue?.setValue(result?.salesClientData?.endClient, { emitEvent: false });
				if (result?.noEndDate) {
					this.salesClientDataForm.endDate?.disable({
						emitEvent: false,
					});
				}
				this.salesClientDataForm.noClientExtensionOption?.setValue(
					result?.salesClientData?.noClientExtensionOption ?? true,
					{ emitEvent: false }
				); // no topion - default value
				this.salesClientDataForm.clientTimeReportingCapId?.setValue(
					result?.salesClientData?.clientTimeReportingCapId ?? 1,
					{ emitEvent: false }
				); // default idValue = 1
				let clientRateType = this.findItemById(this.clientRateTypes, 1); // default value is 'Time based'
				if (result.salesClientData?.clientRate?.isFixedRate) {
					clientRateType = this.findItemById(this.clientRateTypes, 2); // 2: 'Fixed'
				} else if (result.salesClientData?.clientRate?.isTimeBasedRate) {
					clientRateType = this.findItemById(this.clientRateTypes, 1); // 1: 'Time based'
				}
				this.salesClientDataForm.clientRateAndInvoicing?.setValue(clientRateType, { emitEVent: false });
				this.salesClientDataForm.normalRate?.setValue(result.salesClientData?.clientRate?.normalRate, {
					emitEVent: false,
				});
				this.salesClientDataForm.rateUnitTypeId?.setValue(result.salesClientData?.clientRate?.rateUnitTypeId, {
					emitEVent: false,
				});
				this.salesClientDataForm.clientCurrency?.setValue(
					this.findItemById(this.currencies, result.salesClientData?.clientRate?.currencyId),
					{ emitEVent: false }
				);
				this.salesClientDataForm.manualDate?.setValue(result.salesClientData?.clientRate?.manualDate, {
					emitEVent: false,
				});
				this.salesClientDataForm.invoiceCurrencyId?.setValue(result.salesClientData?.clientRate?.invoiceCurrencyId, {
					emitEVent: false,
				});
				if (this.salesClientDataForm.clientRateAndInvoicing?.value?.id === 1) {
					// Time based
					this.salesClientDataForm.clientInvoiceFrequency?.setValue(
						this.findItemById(this.invoiceFrequencies, result.salesClientData?.clientRate?.invoiceFrequencyId),
						{ emitEVent: false }
					);
				}
				if (this.salesClientDataForm.clientRateAndInvoicing?.value?.id === 2) {
					// Fixed
					this.salesClientDataForm.clientInvoiceTime?.setValue(
						this.findItemById(this.invoicingTimes, result.salesClientData?.clientRate?.invoicingTimeId),
						{ emitEVent: false }
					);
				}
				this.salesClientDataForm.clientInvoicingRecipientIdValue?.setValue(
					result.salesClientData?.clientInvoicingRecipient,
					{ emitEVent: false }
				);
				if (result?.salesClientData?.clientInvoicingRecipientSameAsDirectClient) {
					this.salesClientDataForm.clientInvoicingRecipientIdValue?.disable({ emitEvent: false });
				}
				this.salesClientDataForm.invoicePaperworkContactIdValue?.setValue(
					result?.salesClientData?.invoicingReferencePerson,
					{ emitEvent: false }
				);
				this.salesClientDataForm.evaluationsReferencePersonIdValue?.setValue(
					result?.salesClientData?.evaluationsReferencePerson,
					{ emitEvent: false }
				);
				this.salesClientDataForm.evaluationsDisabled?.setValue(result?.salesClientData?.evaluationsDisabled ?? false, {
					emitEvent: false,
				}); // enabled - defalut value
				if (result?.salesClientData?.noSpecialContractTerms) {
					this.salesClientDataForm.specialContractTerms?.disable();
				}
				result.salesClientData?.periodClientSpecialRates?.forEach((specialRate: PeriodClientSpecialRateDto) => {
					this.addSpecialRate(specialRate);
				});
				result.salesClientData?.periodClientSpecialFees?.forEach((specialFee: PeriodClientSpecialFeeDto) => {
					this.addClientFee(specialFee);
				});
				result?.salesClientData?.contractSigners?.forEach((signer: ContractSignerDto) => {
					this.addSignerToForm(signer);
				});
				if (result.consultantSalesData?.length) {
					result.consultantSalesData?.forEach((consultant) => {
						this.addConsultantForm(consultant);
					});
					this.updateConsultantStepAnchors();
				}
			});
	}

	clientRateTypeChange(value: EnumEntityTypeDto) {
		if (value.id) {
			this.salesClientDataForm.rateUnitTypeId?.setValue(null, { emitEvent: false });
			this.salesClientDataForm.normalRate?.setValue(null, { emitEvent: false });
			this.salesClientDataForm.clientCurrency?.setValue(null, { emitEvent: false });
		}
	}

	salesTypeChange(value: number) {
		if (value === 3) {
			// Managed Service
			const itemToPreselct = this.deliveryTypes.find((x) => x.id === 1); // Managed Service
			this.mainDataComponent?.salesMainDataForm.deliveryTypeId?.setValue(itemToPreselct?.id, {
				emitEvent: false,
			});
		}
	}

	changeConsultantWorkplace(event: MatCheckboxChange, consultantIndex: number) {
		if (event.checked) {
			this.consultants
				.at(consultantIndex)
				.get('consultantWorkplaceClientAddress')
				?.setValue(this.salesClientDataForm.directClientIdValue?.value, { emitEvent: false });
		}
	}

	updateConsultantDates(event: MatSelectChange, consultantIndex: number) {
		if (event.value) {
			this.consultants
				.at(consultantIndex)
				.get('consultantProjectStartDate')
				?.setValue(this.salesClientDataForm.startDate?.value, { emitEvent: false });
			this.consultants
				.at(consultantIndex)
				.get('consultantProjectEndDate')
				?.setValue(this.salesClientDataForm.endDate?.value, { emitEvent: false });
			this.consultants
				.at(consultantIndex)
				.get('consultantProjectNoEndDate')
				?.setValue(this.salesClientDataForm.noEndDate?.value, { emitEvent: false });
			if (this.salesClientDataForm.noEndDate?.value) {
				this.consultants.at(consultantIndex).get('consultantProjectEndDate')?.disable();
			} else {
				this.consultants.at(consultantIndex).get('consultantProjectEndDate')?.enable();
			}
		}
	}

	//#region Consultant menu actions
	changeConsultantData(index: number) {
		const consultantData = this.consultants.at(index).value;
		const scrollStrategy = this.overlay.scrollStrategies.reposition();
		MediumDialogConfig.scrollStrategy = scrollStrategy;
		MediumDialogConfig.data = {
			dialogType: ConsultantDiallogAction.Change,
			consultantData: {
				externalId: consultantData.consultantName.consultant.externalId,
				name: consultantData.consultantName.consultant.name,
			},
			dialogTitle: `Change consultant`,
			rejectButtonText: 'Cancel',
			confirmButtonText: 'Create',
			isNegative: false,
		};
		const dialogRef = this.dialog.open(WorkflowConsultantActionsDialogComponent, MediumDialogConfig);

		dialogRef.componentInstance.onConfirmed.subscribe((result) => {
			let input = new ChangeConsultantPeriodDto();
			input.cutoverDate = result.newCutoverDate;
			input.newLegalContractRequired = result.newLegalContractRequired;
			this._consultantPeriodSerivce
				.change(consultantData.consultantPeriodId, input)
				.pipe(finalize(() => {}))
				.subscribe((result) => {
					this._workflowDataService.workflowSideSectionAdded.emit(true);
					this._workflowDataService.workflowOverviewUpdated.emit(true);
				});
		});
	}

	extendConsultant(index: number) {
		const consultantData = this.consultants.at(index).value;
		const scrollStrategy = this.overlay.scrollStrategies.reposition();
		MediumDialogConfig.scrollStrategy = scrollStrategy;
		MediumDialogConfig.data = {
			dialogType: ConsultantDiallogAction.Extend,
			consultantData: {
				externalId: consultantData.consultantName.consultant.externalId,
				name: consultantData.consultantName.consultant.name,
			},
			dialogTitle: `Extend consultant`,
			rejectButtonText: 'Cancel',
			confirmButtonText: 'Create',
			isNegative: false,
		};
		const dialogRef = this.dialog.open(WorkflowConsultantActionsDialogComponent, MediumDialogConfig);

		dialogRef.componentInstance.onConfirmed.subscribe((result) => {
			let input = new ExtendConsultantPeriodDto();
			input.startDate = result.startDate;
			input.endDate = result.endDate;
			input.noEndDate = result.noEndDate;
			this._consultantPeriodSerivce
				.extend(consultantData.consultantPeriodId, input)
				.pipe(finalize(() => {}))
				.subscribe((result) => {
					this._workflowDataService.workflowSideSectionAdded.emit(true);
					this._workflowDataService.workflowOverviewUpdated.emit(true);
				});
		});
	}
	//#endregion Consultant menu actions

	//#region commissions form array
	// commissionRecipientTypeChanged(event: MatSelectChange, index: number) {
	// 	this.commissions.at(index).get('recipient')?.setValue(null, { emitEvent: false });
	// 	this.filteredRecipients = [];
	// }

	// addCommission(isInitial?: boolean, commission?: CommissionDto) {
	// 	let commissionRecipient;
	// 	switch (commission?.recipientTypeId) {
	// 		case 1: // Supplier
	// 			commissionRecipient = commission.supplier;
	// 			break;
	// 		case 2: // Consultant
	// 			commissionRecipient = commission.consultant;
	// 			break;
	// 		case 3: // Client
	// 			commissionRecipient = commission.client;
	// 			break;
	// 		case 4: // PDC entity
	// 			commissionRecipient = this.findItemById(this.legalEntities, commission.legalEntityId);
	// 			break;
	// 	}
	// 	const form = this._fb.group({
	// 		id: new UntypedFormControl(commission?.id ?? null),
	// 		type: new UntypedFormControl(
	// 			this.findItemById(this.commissionTypes, commission?.commissionTypeId) ?? null,
	// 			Validators.required
	// 		),
	// 		amount: new UntypedFormControl(commission?.amount ?? null, Validators.required),
	// 		currency: new UntypedFormControl(
	// 			this.findItemById(this.currencies, commission?.currencyId) ?? null,
	// 			Validators.required
	// 		),
	// 		recipientType: new UntypedFormControl(
	// 			this.findItemById(this.commissionRecipientTypeList, commission?.recipientTypeId) ?? null,
	// 			Validators.required
	// 		),
	// 		recipient: new UntypedFormControl(commissionRecipient ?? null, [
	// 			Validators.required,
	// 			CustomValidators.autocompleteValidator(['clientId', 'id', 'supplierId']),
	// 		]),
	// 		frequency: new UntypedFormControl(
	// 			this.findItemById(this.commissionFrequencies, commission?.commissionFrequencyId) ?? null,
	// 			Validators.required
	// 		),
	// 		oneTimeDate: new UntypedFormControl(commission?.oneTimeDate ?? null),
	// 		editable: new UntypedFormControl(commission?.id ? false : true),
	// 	});
	// 	this.salesMainDataForm.commissions.push(form);
	// 	if (isInitial) {
	// 		this.isCommissionEditing = true;
	// 		this.isCommissionInitialAdd = true;
	// 	}
	// 	this.manageCommissionAutocomplete(this.salesMainDataForm.commissions.length - 1);
	// }

	// manageCommissionAutocomplete(commissionIndex: number) {
	// 	let arrayControl = this.salesMainDataForm.commissions.at(commissionIndex);
	// 	arrayControl!
	// 		.get('recipient')!
	// 		.valueChanges.pipe(
	// 			takeUntil(this._unsubscribe),
	// 			debounceTime(300),
	// 			switchMap((value: any) => {
	// 				let toSend = {
	// 					name: value,
	// 					maxRecordsCount: 1000,
	// 				};
	// 				switch (arrayControl.value.recipientType.id) {
	// 					case 3: // Client
	// 						if (value) {
	// 							if (value?.id) {
	// 								toSend.name = value.id ? value.clientName : value;
	// 							}
	// 							return this._lookupService.clientsAll(toSend.name, toSend.maxRecordsCount);
	// 						} else {
	// 							return of([]);
	// 						}
	// 					case 2: // Consultant
	// 						if (value) {
	// 							if (value?.id) {
	// 								toSend.name = value.id ? value.name : value;
	// 							}
	// 							return this._lookupService.consultants(toSend.name, toSend.maxRecordsCount);
	// 						} else {
	// 							return of([]);
	// 						}
	// 					case 1: // Supplier
	// 						if (value) {
	// 							if (value?.id) {
	// 								toSend.name = value.id ? value.supplierName : value;
	// 							}
	// 							return this._lookupService.suppliers(toSend.name, toSend.maxRecordsCount);
	// 						} else {
	// 							return of([]);
	// 						}
	// 					default:
	// 						return of([]);
	// 				}
	// 			})
	// 		)
	// 		.subscribe((list: any[]) => {
	// 			if (list.length) {
	// 				this.filteredRecipients = list;
	// 			} else {
	// 				this.filteredRecipients = [
	// 					{
	// 						name: 'No records found',
	// 						supplierName: 'No supplier found',
	// 						clientName: 'No clients found',
	// 						id: 'no-data',
	// 					},
	// 				];
	// 			}
	// 		});
	// }

	// get commissions() {
	// 	return this.salesMainDataForm.commissions as UntypedFormArray;
	// }

	// removeCommission(index: number) {
	// 	this.isCommissionInitialAdd = false;
	// 	this.isCommissionEditing = false;
	// 	this.commissions.removeAt(index);
	// }

	// editOrSaveCommissionRow(index: number) {
	// 	const isEditable = this.commissions.at(index).get('editable')?.value;
	// 	if (isEditable) {
	// 		this.commissionToEdit = {
	// 			id: undefined,
	// 			commissionType: undefined,
	// 			amount: undefined,
	// 			currency: undefined,
	// 			commissionFrequency: undefined,
	// 			recipientType: undefined,
	// 			recipient: undefined,
	// 		};
	// 		this.isCommissionInitialAdd = false;
	// 		this.isCommissionEditing = false;
	// 	} else {
	// 		const commissionValue = this.commissions.at(index).value;
	// 		this.commissionToEdit = {
	// 			id: commissionValue.id,
	// 			commissionType: commissionValue.type,
	// 			amount: commissionValue.amount,
	// 			currency: commissionValue.currency,
	// 			commissionFrequency: commissionValue.frequency,
	// 			recipientType: commissionValue.recipientType,
	// 			recipient: commissionValue.recipient,
	// 		};

	// 		this.isCommissionEditing = true;
	// 	}
	// 	this.commissions.at(index).get('editable')?.setValue(!isEditable);
	// }

	// cancelEditCommissionRow(index: number) {
	// 	const commissionRow = this.commissions.at(index);
	// 	commissionRow.get('id')?.setValue(this.commissionToEdit?.id);
	// 	commissionRow.get('commissionType')?.setValue(this.commissionToEdit?.commissionType);
	// 	commissionRow.get('amount')?.setValue(this.commissionToEdit?.amount);
	// 	commissionRow.get('currency')?.setValue(this.commissionToEdit?.currency);
	// 	commissionRow.get('commissionFrequency')?.setValue(this.commissionToEdit?.commissionFrequency);
	// 	commissionRow.get('recipientType')?.setValue(this.commissionToEdit?.recipientType);
	// 	commissionRow.get('recipient')?.setValue(this.commissionToEdit?.recipient);
	// 	this.commissionToEdit = {
	// 		id: undefined,
	// 		commissionType: undefined,
	// 		amount: undefined,
	// 		currency: undefined,
	// 		commissionFrequency: undefined,
	// 		recipientType: undefined,
	// 		recipient: undefined,
	// 	};
	// 	this.isCommissionEditing = false;
	// 	this.isCommissionInitialAdd = false;
	// 	this.commissions.at(index).get('editable')?.setValue(false);
	// }
	//#endregion commissions form array

	//#region termination
	getWorkflowSalesStepConsultantTermination(consultant: ConsultantResultDto) {
		this.showMainSpinner();
		this._workflowServiceProxy
			.terminationConsultantSalesGET(this.workflowId!, consultant.id!)
			.pipe(
				finalize(() => {
					this.hideMainSpinner();
				})
			)
			.subscribe((result) => {
				this.resetForms();
                this.salesTerminateConsultantForm.patchValue(result, {emitEvent: false});
				// this.salesTerminateConsultantForm.terminationTime?.setValue(result?.terminationTime, { emitEvent: false });
				// this.salesTerminateConsultantForm.endDate?.setValue(result?.endDate, { emitEvent: false });
				// this.salesTerminateConsultantForm.terminationReason?.setValue(result?.terminationReason, { emitEvent: false });
				// this.salesTerminateConsultantForm.causeOfNonStandardTerminationTime?.setValue(result?.causeOfNonStandardTerminationTime, { emitEvent: false });
				// this.salesTerminateConsultantForm.additionalComments?.setValue(result?.additionalComments, { emitEvent: false });
				// this.salesTerminateConsultantForm.finalEvaluationReferencePerson?.setValue(result?.finalEvaluationReferencePerson,{ emitEvent: false });
				// this.salesTerminateConsultantForm.noEvaluation?.setValue(result?.noEvaluation, { emitEvent: false });
				// this.salesTerminateConsultantForm.causeOfNoEvaluation?.setValue(result?.causeOfNoEvaluation, {emitEvent: false});
				this.directClientIdTerminationSales = result.directClientId!;
				this.endClientIdTerminationSales = result.endClientId!;
			});
	}

	saveTerminationConsultantSalesStep(isDraft: boolean) {
		let input = this._packTerminateConsultantData();
		this.showMainSpinner();
		if (isDraft) {
			this._workflowServiceProxy
				.terminationConsultantSalesPUT(this.workflowId!, this.consultant.id, input)
				.pipe(finalize(() => this.hideMainSpinner()))
				.subscribe(() => {
					this._workflowDataService.workflowOverviewUpdated.emit(true);
					if (this.editEnabledForcefuly) {
						this.toggleEditMode();
					}
				});
		} else {
			this._workflowServiceProxy
				.terminationConsultantSalesComplete(this.workflowId!, this.consultant.id, input)
				.pipe(finalize(() => this.hideMainSpinner()))
				.subscribe(() => {
					this._workflowDataService.workflowSideSectionUpdated.emit({ isStatusUpdate: true });
					this._workflowDataService.workflowOverviewUpdated.emit(true);
					this.getSalesStepData();
				});
		}
	}

	getWorkflowSalesStepTermination() {
		this.showMainSpinner();
		this._workflowServiceProxy
			.terminationSalesGET(this.workflowId!)
			.pipe(
				finalize(() => {
					this.hideMainSpinner();
				})
			)
			.subscribe((result) => {
				this.resetForms();
				this.salesTerminateConsultantForm.patchValue(result, { emitEvent: false });
				this.salesTerminateConsultantForm.patchValue(result, { emitEvent: false });
				this.directClientIdTerminationSales = result.directClientId!;
				this.endClientIdTerminationSales = result.endClientId!;
			});
	}

	saveWorkflowTerminationSalesStep(isDraft: boolean) {
		let input = this._packTerminateWorkflowData();
		this.showMainSpinner();
		if (isDraft) {
			this._workflowServiceProxy
				.terminationSalesPUT(this.workflowId!, input)
				.pipe(finalize(() => this.hideMainSpinner()))
				.subscribe(() => {
					this._workflowDataService.workflowOverviewUpdated.emit(true);
					if (this.editEnabledForcefuly) {
						this.toggleEditMode();
					}
				});
		} else {
			this._workflowServiceProxy
				.terminationSalesComplete(this.workflowId!, input)
				.pipe(finalize(() => this.hideMainSpinner()))
				.subscribe(() => {
					this._workflowDataService.workflowSideSectionUpdated.emit({
						isStatusUpdate: true,
					});
					this._workflowDataService.workflowOverviewUpdated.emit(true);
					this.getSalesStepData();
				});
		}
	}

	terminateConsultant(index: number) {
		let consultantInformation = this.consultants.at(index).value.consultantName;
		const scrollStrategy = this.overlay.scrollStrategies.reposition();
		MediumDialogConfig.scrollStrategy = scrollStrategy;
		MediumDialogConfig.data = {
			confirmationMessageTitle: `Terminate consultant`,
			confirmationMessage: `Are you sure you want to terminate consultant ${
				consultantInformation?.consultant?.name ?? ''
			}?`,
			rejectButtonText: 'Cancel',
			confirmButtonText: 'Terminate',
			isNegative: true,
		};
		const dialogRef = this.dialog.open(ConfirmationDialogComponent, MediumDialogConfig);

		dialogRef.componentInstance.onConfirmed.subscribe(() => {
			this.terminateConsultantStart(consultantInformation?.consultant?.id!);
		});
	}

	terminateConsultantStart(index: number) {
		this._workflowServiceProxy
			.terminationConsultantStart(this.workflowId!, index)
			.pipe(finalize(() => {}))
			.subscribe(() => {
				this._workflowDataService.workflowSideSectionAdded.emit(true);
				this._workflowDataService.workflowOverviewUpdated.emit(true);
			});
	}
	//#endregion termination

	getSalesStepData(consultant?: ConsultantResultDto, consultantPeriodId?: string) {
		switch (this._workflowDataService.getWorkflowProgress.currentlyActiveSideSection) {
			case WorkflowProcessType.StartClientPeriod:
			case WorkflowProcessType.ExtendClientPeriod:
			case WorkflowProcessType.ChangeClientPeriod:
				this.getStartChangeOrExtendClientPeriodSales();
				break;
			case WorkflowProcessType.TerminateWorkflow:
				this.getWorkflowSalesStepTermination();
				break;
			case WorkflowProcessType.StartConsultantPeriod:
			case WorkflowProcessType.ExtendConsultantPeriod:
			case WorkflowProcessType.ChangeConsultantPeriod:
				let consultantPeriodIdParameter = consultantPeriodId ?? this.activeSideSection.consultantPeriodId;
				this.getStartChangeOrExtendConsutlantPeriodSales(consultantPeriodIdParameter!);
				break;
			case WorkflowProcessType.TerminateConsultant:
				let consultantParameter = consultant ?? this.consultant;
				this.getWorkflowSalesStepConsultantTermination(consultantParameter!);
				break;
		}
	}

	getStartChangeOrExtendConsutlantPeriodSales(consultantPeriodId: string) {
		this._consultantPeriodSerivce
			.consultantSalesGET(consultantPeriodId)
			.pipe(finalize(() => {}))
			.subscribe((result) => {
				this.resetForms();
				let clientDto = new ClientResultDto();
				clientDto.clientId = result.directClientIdValue;
				this.salesClientDataForm.directClientIdValue?.setValue(clientDto, { emitEvent: false });
				let clientRateType = this.findItemById(this.clientRateTypes, 1); // default value is 'Time based'
				if (result.clientRate?.isFixedRate) {
					clientRateType = this.findItemById(this.clientRateTypes, 2); // 2: 'Fixed'
				} else if (result.clientRate?.isTimeBasedRate) {
					clientRateType = this.findItemById(this.clientRateTypes, 1); // 1: 'Time based'
				}
				this.salesClientDataForm.clientRateAndInvoicing?.setValue(clientRateType, { emitEVent: false });
				this.salesClientDataForm.pdcInvoicingEntityId?.setValue(result?.clientPeriodPdcInvoicingEntityId, {
					emitEvent: false,
				});
				this.salesClientDataForm.normalRate?.setValue(result.clientRate?.normalRate, { emitEVent: false });
				this.salesClientDataForm.rateUnitTypeId?.setValue(result.clientRate?.rateUnitTypeId, { emitEVent: false });
				this.salesClientDataForm.clientCurrency?.setValue(
					this.findItemById(this.currencies, result.clientRate?.currencyId),
					{ emitEVent: false }
				);
				this.salesClientDataForm.invoiceCurrencyId?.setValue(result.clientRate?.invoiceCurrencyId, { emitEVent: false });
				if (this.salesClientDataForm.clientRateAndInvoicing?.value?.id === 1) {
					// Time based
					this.salesClientDataForm.clientInvoiceFrequency?.setValue(
						this.findItemById(this.invoiceFrequencies, result.clientRate?.invoiceFrequencyId),
						{ emitEVent: false }
					);
				}
				if (this.salesClientDataForm.clientRateAndInvoicing?.value?.id === 2) {
					// Fixed
					this.salesClientDataForm.clientInvoiceFrequency?.setValue(
						this.findItemById(this.invoicingTimes, result.clientRate?.invoicingTimeId),
						{ emitEVent: false }
					);
				}
				this.salesClientDataForm.manualDate?.setValue(result.clientRate?.manualDate, { emitEVent: false });

				this.mainDataComponent?.salesMainDataForm.remarks?.setValue(result?.remarks, {
					emitEvent: false,
				});
				this.mainDataComponent?.salesMainDataForm.noRemarks?.setValue(result?.noRemarks, {
					emitEvent: false,
				});
				if (result?.noRemarks) {
					this.mainDataComponent?.salesMainDataForm.remarks?.disable();
				}
				this.mainDataComponent?.salesMainDataForm.projectDescription?.setValue(result?.projectDescription, { emitEvent: false });
				this.mainDataComponent?.salesMainDataForm.projectName?.setValue(result?.projectName, { emitEvent: false });
				this.addConsultantForm(result?.consultantSalesData);
				this.updateConsultantStepAnchors();
			});
	}

	saveStartChangeOrExtendConsultantPeriodSales(isDraft: boolean) {
		let input = new ConsultantPeriodSalesDataDto();
		input = this.mainDataComponent?.salesMainDataForm.value;
		const consultant = this.consultants.at(0).value;
		let consultantInput = this._packConsultantFormData(consultant);
		input.consultantSalesData = consultantInput;
		this.showMainSpinner();
		if (isDraft) {
			this._consultantPeriodSerivce
				.consultantSalesPUT(this.activeSideSection.consultantPeriodId!, input)
				.pipe(finalize(() => this.hideMainSpinner()))
				.subscribe(() => {
					this._workflowDataService.workflowOverviewUpdated.emit(true);
					if (this.editEnabledForcefuly) {
						this.toggleEditMode();
					}
				});
		} else {
			this._consultantPeriodSerivce
				.editFinish4(this.activeSideSection.consultantPeriodId!, input)
				.pipe(finalize(() => this.hideMainSpinner()))
				.subscribe(() => {
					this._workflowDataService.workflowSideSectionUpdated.emit({
						isStatusUpdate: true,
					});
					this._workflowDataService.workflowOverviewUpdated.emit(true);
					this.getSalesStepData();
				});
		}
	}

	resetForms() {
		this.mainDataComponent?.salesMainDataForm.reset('', { emitEvent: false });
		this.salesClientDataForm.clientRates.controls = [];
		this.salesClientDataForm.clientFees.controls = [];
		this.salesClientDataForm.contractSigners.controls = [];
		this.mainDataComponent.salesMainDataForm.commissions.controls = [];
		this.salesClientDataForm.reset('', { emitEvent: false });
		this.consultantsForm.consultants.controls = [];
		this.directClientIdTerminationSales = null;
		this.endClientIdTerminationSales = null;
	}

	returnToSales() {
		switch (this._workflowDataService.workflowProgress.currentlyActiveSideSection) {
			case WorkflowProcessType.StartClientPeriod:
			case WorkflowProcessType.ChangeClientPeriod:
			case WorkflowProcessType.ExtendClientPeriod:
				this.showMainSpinner();
				this._clientPeriodService
					.reopen(this.periodId!)
					.pipe(
						finalize(() => {
							this.hideMainSpinner();
						})
					)
					.subscribe(() => this._workflowDataService.workflowSideSectionUpdated.emit({ isStatusUpdate: true }));
				break;

			case WorkflowProcessType.TerminateWorkflow:
				this.showMainSpinner();
				this._workflowServiceProxy
					.terminationSalesReopen(this.periodId!)
					.pipe(
						finalize(() => {
							this.hideMainSpinner();
						})
					)
					.subscribe(() => this._workflowDataService.workflowSideSectionUpdated.emit({ isStatusUpdate: true }));
				break;

			case WorkflowProcessType.TerminateConsultant:
				this.showMainSpinner();
				this._workflowServiceProxy
					.terminationConsultantSalesReopen(this.periodId!)
					.pipe(
						finalize(() => {
							this.hideMainSpinner();
						})
					)
					.subscribe(() => this._workflowDataService.workflowSideSectionUpdated.emit({ isStatusUpdate: true }));
				break;

			case WorkflowProcessType.StartConsultantPeriod:
			case WorkflowProcessType.ChangeConsultantPeriod:
			case WorkflowProcessType.ExtendConsultantPeriod:
				this.showMainSpinner();
				this._consultantPeriodSerivce
					.reopen2(this.periodId!)
					.pipe(
						finalize(() => {
							this.hideMainSpinner();
						})
					)
					.subscribe(() => this._workflowDataService.workflowSideSectionUpdated.emit({ isStatusUpdate: true }));
				break;
		}
	}

	openClientInNewTab(clientId: string) {
		const url = this.router.serializeUrl(this.router.createUrlTree([`/app/clients/${clientId}/rates-and-fees`]));
		window.open(url, '_blank');
	}

	openInHubspot(client: ClientResultDto) {
		if (this._internalLookupService.hubspotClientUrl?.length) {
			if (client.crmClientId !== null && client.crmClientId !== undefined) {
				window.open(
					this._internalLookupService.hubspotClientUrl.replace('{CrmClientId}', client.crmClientId!.toString()),
					'_blank'
				);
			}
		} else {
			this.localHttpService.getTokenPromise().then((response: AuthenticationResult) => {
				this.httpClient
					.get(`${this.apiUrl}/api/Clients/HubspotPartialUrlAsync`, {
						headers: new HttpHeaders({
							Authorization: `Bearer ${response.accessToken}`,
						}),
						responseType: 'text',
					})
					.subscribe((result: string) => {
						this._internalLookupService.hubspotClientUrl = result;
						if (client.crmClientId !== null && client.crmClientId !== undefined) {
							window.open(result.replace('{CrmClientId}', client.crmClientId!.toString()), '_blank');
						}
					});
			});
		}
	}

	private _packClientPeriodData(): ClientPeriodSalesDataDto {
		let input = new ClientPeriodSalesDataDto();
		input.salesMainData = new SalesMainDataDto(this.mainDataComponent?.salesMainDataForm.value);
		input.salesMainData.salesAccountManagerIdValue = this.mainDataComponent?.salesMainDataForm.salesAccountManagerIdValue?.value?.id;
		input.salesMainData.commissionAccountManagerIdValue = this.mainDataComponent?.salesMainDataForm.commissionAccountManagerIdValue?.value?.id;
		input.salesMainData.customContractExpirationNotificationDate =
			this.mainDataComponent?.salesMainDataForm.contractExpirationNotification?.value?.includes(999)
				? this.mainDataComponent?.salesMainDataForm.customContractExpirationNotificationDate?.value
				: null;
		input.salesMainData.contractExpirationNotificationIntervalIds =
			this.mainDataComponent?.salesMainDataForm.contractExpirationNotification?.value?.filter((x: number) => x !== 999);
		input.salesMainData.commissions = new Array<CommissionDto>();
		if (this.mainDataComponent?.salesMainDataForm.commissions.value?.length) {
			this.mainDataComponent?.salesMainDataForm.commissions.value.forEach((commission: any) => {
				let commissionInput = new CommissionDto();
				commissionInput.id = commission.id;
				commissionInput.amount = commission.amount;
				commissionInput.commissionTypeId = commission.type?.id;
				commissionInput.currencyId = commission.currency?.id;
				commissionInput.commissionFrequencyId = commission.frequency?.id;
				commissionInput.recipientTypeId = commission.recipientType?.id;
				switch (commission.recipientType?.id) {
					case 1: // Supplier
						commissionInput.supplierId = commission.recipient?.supplierId;
						break;
					case 2: //Consultant
						commissionInput.consultantId = commission.recipient?.id;
						break;
					case 3: // client
						commissionInput.clientId = commission.recipient?.clientId;
						break;
					case 4: // PDC entity
						commissionInput.legalEntityId = commission.recipient?.id;
						break;
				}
				if (commission.frequency?.id === 2) {
					// id = 2 == 'One time'
					commissionInput.oneTimeDate = commission.oneTimeDate;
				}
				input.salesMainData!.commissions?.push(commissionInput);
			});
		}
		input.salesClientData = new SalesClientDataDto(this.salesClientDataForm.value);
		input.startDate = this.salesClientDataForm.startDate?.value;
		input.noEndDate = this.salesClientDataForm.noEndDate?.value;
		input.endDate = this.salesClientDataForm.endDate?.value;
		input.salesClientData.directClientIdValue = this.salesClientDataForm.directClientIdValue?.value?.clientId;
		input.salesClientData.endClientIdValue = this.salesClientDataForm.endClientIdValue?.value?.clientId;
		input.salesClientData.clientRate = new ClientRateDto(this.salesClientDataForm.value);
		input.salesClientData.clientRate!.isTimeBasedRate = this.salesClientDataForm.clientRateAndInvoicing?.value?.id === 1; // 1: 'Time based';
		input.salesClientData.clientRate!.isFixedRate = this.salesClientDataForm.clientRateAndInvoicing?.value?.id === 2; // 2: 'Fixed';
		input.salesClientData.clientRate!.currencyId = this.salesClientDataForm.clientCurrency?.value?.id;
		input.salesClientData.clientRate!.invoiceFrequencyId = this.salesClientDataForm.clientInvoiceFrequency?.value?.id;
		input.salesClientData.clientRate!.invoicingTimeId = this.salesClientDataForm.clientInvoiceTime?.value?.id;
		input.salesClientData.noInvoicingReferenceNumber = this.salesClientDataForm.invoicingReferenceNumber?.value
			? false
			: true;
		input.salesClientData.clientInvoicingRecipientIdValue =
			this.salesClientDataForm.clientInvoicingRecipientIdValue?.value?.clientId;
		input.salesClientData.invoicingReferencePersonIdValue =
			this.salesClientDataForm.invoicePaperworkContactIdValue?.value?.id;
		if (this.salesClientDataForm.clientRates.value.length) {
			input.salesClientData!.periodClientSpecialRates = new Array<PeriodClientSpecialRateDto>();
			this.salesClientDataForm.clientRates.value.forEach((rate: any) => {
				let clientRate = new PeriodClientSpecialRateDto(rate);
				clientRate.clientRateCurrencyId = rate.clientRateCurrency?.id;
				input.salesClientData!.periodClientSpecialRates?.push(clientRate);
			});
		} else {
			input.salesClientData!.noSpecialRate = true;
		}
		if (this.salesClientDataForm.clientFees.value.length) {
			input.salesClientData!.periodClientSpecialFees = new Array<PeriodClientSpecialFeeDto>();
			this.salesClientDataForm.clientFees.value.forEach((fee: any) => {
				let clientFee = new PeriodClientSpecialFeeDto(fee);
				clientFee.clientRateCurrencyId = fee.clientRateCurrency?.id;
				input.salesClientData!.periodClientSpecialFees?.push(clientFee);
			});
		} else {
			input.salesClientData!.noSpecialFee = true;
		}
		input.salesClientData!.evaluationsReferencePersonIdValue =
			this.salesClientDataForm.evaluationsReferencePersonIdValue?.value?.id;
		input.salesClientData!.contractSigners = new Array<ContractSignerDto>();
		if (this.salesClientDataForm.contractSigners.value?.length) {
			this.salesClientDataForm.contractSigners.value.forEach((signer: any) => {
				let signerInput = new ContractSignerDto();
				signerInput.signOrder = signer.clientSequence;
				signerInput.contactId = signer.clientContact?.id;
				signerInput.contact = signer.clientContact;
				signerInput.signerRoleId = signer.clientRole?.id;
				input.salesClientData!.contractSigners?.push(signerInput);
			});
		}
		input.consultantSalesData = new Array<ConsultantSalesDataDto>();
		if (this.consultants.value?.length) {
			this.consultants.value.forEach((consultant: any) => {
				let consultantInput = this._packConsultantFormData(consultant);
				input.consultantSalesData!.push(consultantInput);
			});
		}
		return input;
	}

	private _packConsultantFormData(consultant: any): ConsultantSalesDataDto {
		let consultantInput = new ConsultantSalesDataDto();
		consultantInput.employmentTypeId = consultant.employmentType?.id;
		if (
			consultant.employmentType?.id === EmploymentTypes.FeeOnly ||
			consultant.employmentType?.id === EmploymentTypes.Recruitment
		) {
			consultantInput.nameOnly = consultant.consultantNameOnly;
			consultantInput.consultantPeriodId = consultant.consultantPeriodId;
		} else {
			consultantInput.consultantId = consultant.consultantName?.consultant?.id;
			consultantInput.soldRequestConsultantId = consultant.consultantName?.sourcingRequestConsultantId;
			consultantInput.consultantPeriodId = consultant.consultantPeriodId;
			consultantInput.consultant = new ConsultantResultDto();
			consultantInput.consultant = consultant.consultantName?.consultant;
			consultantInput.requestId = consultant.consultantName?.consultant?.sourcingRequestId;

			consultantInput.durationSameAsClientPeriod = consultant.consultantProjectDurationSameAsClient;
			consultantInput.startDate = consultant.consultantProjectStartDate;
			consultantInput.noEndDate = consultant.consultantProjectNoEndDate;
			consultantInput.endDate = consultant.consultantProjectEndDate;
			consultantInput.isOnsiteWorkplace = consultant.consultantIsOnsiteWorkplace;
			consultantInput.percentageOnSite = consultant.consultantWorkplacePercentageOnSite;
			consultantInput.isEmagineOfficeWorkplace = consultant.consultantIsEmagineOfficeWorkplace;
			consultantInput.isRemoteWorkplace = consultant.consultantIsRemoteWorkplace;
			consultantInput.noExpectedWorkload = consultant.noExpectedWorkload;
			consultantInput.expectedWorkloadHours = consultant.expectedWorkloadHours;
			consultantInput.consultantTimeReportingCapMaxValue = consultant.consultantTimeReportingCapMaxValue;

			consultantInput.onsiteClientId = consultant.consultantWorkplaceClientAddress?.clientId;
			consultantInput.emagineOfficeId = consultant.consultantWorkplaceEmagineOffice?.id;
			consultantInput.remoteAddressCountryId = consultant.consultantWorkplaceRemote?.id;
			consultantInput.expectedWorkloadUnitId = consultant.expectedWorkloadUnitId?.id;
			consultantInput.consultantTimeReportingCapId = consultant.consultantCapOnTimeReporting?.id;
			consultantInput.pdcPaymentEntityId = consultant.consultantProdataEntity?.id;

			consultantInput.consultantRate = new ConsultantRateDto();
			consultantInput.consultantRate.isTimeBasedRate = consultant.consultantPaymentType?.id === 1; // 1: 'Time based';
			consultantInput.consultantRate.isFixedRate = consultant.consultantPaymentType?.id === 2; // 2: 'Fixed';
			consultantInput.consultantRate.normalRate = consultant.consultantRate;
			consultantInput.consultantRate.currencyId = consultant.consultantRateCurrency?.id;
			consultantInput.consultantRate.rateUnitTypeId = consultant.consultantRateUnitType?.id;
			consultantInput.consultantRate.prodataToProdataRate = consultant.consultantPDCRate;
			consultantInput.consultantRate.prodataToProdataCurrencyId = consultant.consultantPDCRateCurrency?.id;
			consultantInput.consultantRate.prodataToProdataInvoiceCurrencyId = consultant.prodataToProdataInvoiceCurrency?.id;
			if (consultantInput.consultantRate.isTimeBasedRate) {
				consultantInput.consultantRate.invoiceFrequencyId = consultant.consultantInvoicingFrequency?.id;
			}
			if (consultantInput.consultantRate.isFixedRate) {
				consultantInput.consultantRate.invoicingTimeId = consultant.consultantInvoicingTime?.id;
			}
			if (consultant.consultantInvoicingTime?.name === 'Manual date') {
				consultantInput.consultantRate.manualDate = consultant.consultantInvoicingManualDate;
			}
			if (consultant.specialRates.length) {
				consultantInput.periodConsultantSpecialRates = new Array<PeriodConsultantSpecialRateDto>();
				for (let rate of consultant.specialRates) {
					let consultantSpecialRate = new PeriodConsultantSpecialRateDto();
					consultantSpecialRate = rate;
					consultantSpecialRate.prodataToProdataRateCurrencyId = rate.prodataToProdataRateCurrency?.id;
					consultantSpecialRate.consultantRateCurrencyId = rate.consultantRateCurrency?.id;
					consultantInput.periodConsultantSpecialRates.push(consultantSpecialRate);
				}
			} else {
				consultantInput.noSpecialRate = true;
			}
			if (consultant.specialFees.length) {
				consultantInput.periodConsultantSpecialFees = new Array<PeriodConsultantSpecialFeeDto>();
				for (let fee of consultant.specialFees) {
					let consultantSpecialFee = new PeriodConsultantSpecialFeeDto();
					consultantSpecialFee = fee;
					consultantSpecialFee.prodataToProdataRateCurrencyId = fee.prodataToProdataRateCurrency?.id;
					consultantSpecialFee.consultantRateCurrencyId = fee.consultantRateCurrency?.id;
					consultantInput.periodConsultantSpecialFees.push(consultantSpecialFee);
				}
			} else {
				consultantInput.noSpecialFee = true;
			}
			consultantInput.noSpecialContractTerms = consultant.consultantSpecialContractTermsNone;
			consultantInput.specialContractTerms = consultant.consultantSpecialContractTerms;
			consultantInput.deliveryManagerSameAsAccountManager = consultant.deliveryManagerSameAsAccountManager;
			consultantInput.deliveryAccountManagerIdValue = consultant.deliveryAccountManager?.id;
		}
		return consultantInput;
	}

	private _packTerminateWorkflowData(): WorkflowTerminationSalesDataCommandDto {
		let input = new WorkflowTerminationSalesDataCommandDto(this.salesTerminateConsultantForm.value);
		input.terminationReason = +this.salesTerminateConsultantForm?.terminationReason?.value;
		input.finalEvaluationReferencePersonId =
			this.salesTerminateConsultantForm?.finalEvaluationReferencePerson?.value?.id ?? null;
		return input;
	}

	private _packTerminateConsultantData(): ConsultantTerminationSalesDataCommandDto {
		let input = new ConsultantTerminationSalesDataCommandDto(this.salesTerminateConsultantForm.value);
		input.terminationReason = +this.salesTerminateConsultantForm?.terminationReason?.value;
		input.finalEvaluationReferencePersonId = !this.salesTerminateConsultantForm?.noEvaluation?.value
			? this.salesTerminateConsultantForm?.finalEvaluationReferencePerson?.value?.id
			: null;
		return input;
	}
}
