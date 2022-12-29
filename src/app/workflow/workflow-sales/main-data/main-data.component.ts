import { Component, Injector, Input, OnDestroy, OnInit } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';
import { debounceTime, finalize,  switchMap, takeUntil} from 'rxjs/operators';
import { forkJoin, of, Subject } from 'rxjs';
import { InternalLookupService } from 'src/app/shared/common/internal-lookup.service';
import { AppComponentBase } from 'src/shared/app-component-base';
import { ClientPeriodServiceProxy, CommissionDto, ConsultantPeriodServiceProxy, EmployeeDto, EnumEntityTypeDto, LegalEntityDto, LookupServiceProxy, WorkflowProcessType, WorkflowServiceProxy } from 'src/shared/service-proxies/service-proxies';
import { WorkflowDataService } from '../../workflow-data.service';
import { WorkflowProcessWithAnchorsDto } from '../../workflow-period/workflow-period.model';
import { WorkflowSalesMainForm } from '../workflow-sales.model';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms';
import { CustomValidators } from 'src/shared/utils/custom-validators';

@Component({
	selector: 'app-main-data',
	templateUrl: './main-data.component.html',
	styleUrls: ['../workflow-sales.component.scss'],
})
export class MainDataComponent extends AppComponentBase implements OnInit, OnDestroy {
	@Input() periodId: string | undefined;
    @Input() readOnlyMode: boolean;
    @Input() editEnabledForcefuly: boolean;
    @Input() isCompleted: boolean;
    @Input() canToggleEditMode: boolean;
    @Input() activeSideSection: WorkflowProcessWithAnchorsDto;
    @Input() permissionsForCurrentUser: { [key: string]: boolean } | undefined;

    workflowSideSections = WorkflowProcessType;
	salesMainDataForm: WorkflowSalesMainForm;

    currencies: EnumEntityTypeDto[];
    // rateUnitTypes: EnumEntityTypeDto[];
    deliveryTypes: EnumEntityTypeDto[];
    saleTypes: EnumEntityTypeDto[];
    projectTypes: EnumEntityTypeDto[];
    // invoicingTimes: EnumEntityTypeDto[];
    // invoiceFrequencies: EnumEntityTypeDto[];
    // signerRoles: EnumEntityTypeDto[];
    // emagineOffices: EnumEntityTypeDto[];
    margins: EnumEntityTypeDto[];
    discounts: EnumEntityTypeDto[];
    projectCategories: EnumEntityTypeDto[];
    commissionTypes: EnumEntityTypeDto[];
    commissionRecipientTypeList: EnumEntityTypeDto[];
    commissionFrequencies: EnumEntityTypeDto[];
    legalEntities: LegalEntityDto[];
    contractExpirationNotificationDuration: { [key: string]: string };

    filteredSalesAccountManagers: EmployeeDto[] = [];
	filteredCommisionAccountManagers: EmployeeDto[] = [];

    filteredRecipients: any[] = [];
    isCommissionInitialAdd = false;
    isCommissionEditing = false;
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
        private _internalLookupService: InternalLookupService,
        private _clientPeriodService: ClientPeriodServiceProxy,
        private _workflowServiceProxy: WorkflowServiceProxy,
        private _consultantPeriodSerivce: ConsultantPeriodServiceProxy,
        private _lookupService: LookupServiceProxy
    ) {
        super(injector);
        this.salesMainDataForm = new WorkflowSalesMainForm();

        this.salesMainDataForm.salesAccountManagerIdValue?.valueChanges
			.pipe(
				takeUntil(this._unsubscribe),
				debounceTime(300),
				switchMap((value: any) => {
					if (value) {
						let toSend = {
							name: value,
							maxRecordsCount: 1000,
						};
						if (value?.id) {
							toSend.name = value.id ? value.name : value;
						}
						return this._lookupService.employees(value);
					} else {
						return of([]);
					}
				})
			)
			.subscribe((list: EmployeeDto[]) => {
				if (list.length) {
					this.filteredSalesAccountManagers = list;
				} else {
					this.filteredSalesAccountManagers = [
                        new EmployeeDto(
                            {
                                name: 'No managers found',
                                externalId: '',
                                id: undefined
                            }
                        )
					];
				}
			});

		this.salesMainDataForm.commissionAccountManagerIdValue?.valueChanges
			.pipe(
				takeUntil(this._unsubscribe),
				debounceTime(300),
				switchMap((value: any) => {
					if (value) {
						let toSend = {
							name: value,
							maxRecordsCount: 1000,
						};
						if (value?.id) {
							toSend.name = value.id ? value.name : value;
						}
						return this._lookupService.employees(value);
					} else {
						return of([]);
					}
				})
			)
			.subscribe((list: EmployeeDto[]) => {
				if (list.length) {
					this.filteredCommisionAccountManagers = list;
				} else {
					this.filteredCommisionAccountManagers = [
						new EmployeeDto(
                            {
                                name: 'No managers found',
                                externalId: '',
                                id: undefined
                            }
                        )
					];
				}
			});
    }

	ngOnInit(): void {
        this._getEnums();
    }

    ngOnDestroy(): void {
        this._unsubscribe.next();
        this._unsubscribe.complete();
    }

    private _getEnums() {
        forkJoin({
            currencies: this._internalLookupService.getCurrencies(),
            // rateUnitTypes: this._internalLookupService.getCurrencies(),
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
            this.deliveryTypes = result.deliveryTypes;
            this.saleTypes = result.saleTypes;
            this.projectTypes = result.projectTypes;
            this.margins = result.margins;
            this.contractExpirationNotificationDuration = result.contractExpirationNotificationDuration;
            this.commissionFrequencies = result.commissionFrequencies;
            this.commissionTypes = result.commissionTypes;
            this.commissionRecipientTypeList = result.commissionRecipientTypeList;
            this.legalEntities = result.legalEntities;
            this.projectCategories = result.projectCategories;
            this.discounts = result.discounts;
            // this.rateUnitTypes = result.rateUnitTypes;
            // this.invoicingTimes = result.invoicingTimes;
            // this.invoiceFrequencies = result.invoiceFrequencies;
            // this.signerRoles = result.signerRoles;
            // this.emagineOffices = result.emagineOffices;
            // this.clientExtensionDeadlines = result.clientExtensionDeadlines;
            // this.clientExtensionDurations = result.clientExtensionDurations;
            // this.clientSpecialFeeFrequencies = result.clientSpecialFeeFrequencies;
            // this.clientSpecialFeeSpecifications = result.clientSpecialFeeSpecifications;
            // this.clientSpecialRateReportUnits = result.clientSpecialRateReportUnits;
            // this.clientSpecialRateSpecifications = result.clientSpecialRateSpecifications;
            // this.clientTimeReportingCap = result.clientTimeReportingCap;
            // this.nonStandartTerminationTimes = result.nonStandartTerminationTimes;
            // this.terminationReasons = result.terminationReasons;
            // this.expectedWorkloadUnits = result.expectedWorkloadUnits;
            // this.employmentTypes = result.employmentTypes;
            // this.countries = result.countries;
            // this.consultantTimeReportingCapList = result.consultantTimeReportingCapList;
        });
    }

    toggleEditMode() {
		this.isCompleted = !this.isCompleted;
		this.editEnabledForcefuly = !this.editEnabledForcefuly;
		this._workflowDataService.updateWorkflowProgressStatus({
			currentStepIsCompleted: this.isCompleted,
			currentStepIsForcefullyEditing: this.editEnabledForcefuly,
		});
		// this.getSalesStepData();
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
				this.salesMainDataForm.deliveryTypeId?.setValue(result.deliveryTypeId, { emitEvent: false });
				this.salesMainDataForm.salesTypeId?.setValue(result.salesTypeId, { emitEvent: false });
				this.salesMainDataForm.marginId?.setValue(result.marginId, { emitEvent: false });
			});
	}

    salesTypeChange(value: number) {
		if (value === 3) {
			// Managed Service
			const itemToPreselct = this.deliveryTypes.find((x) => x.id === 1); // Managed Service
			this.salesMainDataForm.deliveryTypeId?.setValue(itemToPreselct?.id, {
				emitEvent: false,
			});
		}
	}

    commissionRecipientTypeChanged(event: MatSelectChange, index: number) {
		this.commissions.at(index).get('recipient')?.setValue(null, { emitEvent: false });
		this.filteredRecipients = [];
	}

	addCommission(isInitial?: boolean, commission?: CommissionDto) {
		let commissionRecipient;
		switch (commission?.recipientTypeId) {
			case 1: // Supplier
				commissionRecipient = commission.supplier;
				break;
			case 2: // Consultant
				commissionRecipient = commission.consultant;
				break;
			case 3: // Client
				commissionRecipient = commission.client;
				break;
			case 4: // PDC entity
				commissionRecipient = this.findItemById(this.legalEntities, commission.legalEntityId);
				break;
		}
		const form = this._fb.group({
			id: new UntypedFormControl(commission?.id ?? null),
			type: new UntypedFormControl(
				this.findItemById(this.commissionTypes, commission?.commissionTypeId) ?? null,
				Validators.required
			),
			amount: new UntypedFormControl(commission?.amount ?? null, Validators.required),
			currency: new UntypedFormControl(
				this.findItemById(this.currencies, commission?.currencyId) ?? null,
				Validators.required
			),
			recipientType: new UntypedFormControl(
				this.findItemById(this.commissionRecipientTypeList, commission?.recipientTypeId) ?? null,
				Validators.required
			),
			recipient: new UntypedFormControl(commissionRecipient ?? null, [
				Validators.required,
				CustomValidators.autocompleteValidator(['clientId', 'id', 'supplierId']),
			]),
			frequency: new UntypedFormControl(
				this.findItemById(this.commissionFrequencies, commission?.commissionFrequencyId) ?? null,
				Validators.required
			),
			oneTimeDate: new UntypedFormControl(commission?.oneTimeDate ?? null),
			editable: new UntypedFormControl(commission?.id ? false : true),
		});
		this.salesMainDataForm.commissions.push(form);
		if (isInitial) {
			this.isCommissionEditing = true;
			this.isCommissionInitialAdd = true;
		}
		this.manageCommissionAutocomplete(this.salesMainDataForm.commissions.length - 1);
	}

	manageCommissionAutocomplete(commissionIndex: number) {
		let arrayControl = this.salesMainDataForm.commissions.at(commissionIndex);
		arrayControl!
			.get('recipient')!
			.valueChanges.pipe(
				takeUntil(this._unsubscribe),
				debounceTime(300),
				switchMap((value: any) => {
					let toSend = {
						name: value,
						maxRecordsCount: 1000,
					};
					switch (arrayControl.value.recipientType.id) {
						case 3: // Client
							if (value) {
								if (value?.id) {
									toSend.name = value.id ? value.clientName : value;
								}
								return this._lookupService.clientsAll(toSend.name, toSend.maxRecordsCount);
							} else {
								return of([]);
							}
						case 2: // Consultant
							if (value) {
								if (value?.id) {
									toSend.name = value.id ? value.name : value;
								}
								return this._lookupService.consultants(toSend.name, toSend.maxRecordsCount);
							} else {
								return of([]);
							}
						case 1: // Supplier
							if (value) {
								if (value?.id) {
									toSend.name = value.id ? value.supplierName : value;
								}
								return this._lookupService.suppliers(toSend.name, toSend.maxRecordsCount);
							} else {
								return of([]);
							}
						default:
							return of([]);
					}
				})
			)
			.subscribe((list: any[]) => {
				if (list.length) {
					this.filteredRecipients = list;
				} else {
					this.filteredRecipients = [
						{
							name: 'No records found',
							supplierName: 'No supplier found',
							clientName: 'No clients found',
							id: 'no-data',
						},
					];
				}
			});
	}

	get commissions() {
		return this.salesMainDataForm.commissions as UntypedFormArray;
	}

	removeCommission(index: number) {
		this.isCommissionInitialAdd = false;
		this.isCommissionEditing = false;
		this.commissions.removeAt(index);
	}

	editOrSaveCommissionRow(index: number) {
		const isEditable = this.commissions.at(index).get('editable')?.value;
		if (isEditable) {
			this.commissionToEdit = {
				id: undefined,
				commissionType: undefined,
				amount: undefined,
				currency: undefined,
				commissionFrequency: undefined,
				recipientType: undefined,
				recipient: undefined,
			};
			this.isCommissionInitialAdd = false;
			this.isCommissionEditing = false;
		} else {
			const commissionValue = this.commissions.at(index).value;
			this.commissionToEdit = {
				id: commissionValue.id,
				commissionType: commissionValue.type,
				amount: commissionValue.amount,
				currency: commissionValue.currency,
				commissionFrequency: commissionValue.frequency,
				recipientType: commissionValue.recipientType,
				recipient: commissionValue.recipient,
			};

			this.isCommissionEditing = true;
		}
		this.commissions.at(index).get('editable')?.setValue(!isEditable);
	}

	cancelEditCommissionRow(index: number) {
		const commissionRow = this.commissions.at(index);
		commissionRow.get('id')?.setValue(this.commissionToEdit?.id);
		commissionRow.get('commissionType')?.setValue(this.commissionToEdit?.commissionType);
		commissionRow.get('amount')?.setValue(this.commissionToEdit?.amount);
		commissionRow.get('currency')?.setValue(this.commissionToEdit?.currency);
		commissionRow.get('commissionFrequency')?.setValue(this.commissionToEdit?.commissionFrequency);
		commissionRow.get('recipientType')?.setValue(this.commissionToEdit?.recipientType);
		commissionRow.get('recipient')?.setValue(this.commissionToEdit?.recipient);
		this.commissionToEdit = {
			id: undefined,
			commissionType: undefined,
			amount: undefined,
			currency: undefined,
			commissionFrequency: undefined,
			recipientType: undefined,
			recipient: undefined,
		};
		this.isCommissionEditing = false;
		this.isCommissionInitialAdd = false;
		this.commissions.at(index).get('editable')?.setValue(false);
	}
}
