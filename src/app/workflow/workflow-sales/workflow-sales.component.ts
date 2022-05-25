import { Overlay } from '@angular/cdk/overlay';
import { NumberSymbol } from '@angular/common';
import { Component, Injector, Input, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDialog } from '@angular/material/dialog';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { MatSelectChange } from '@angular/material/select';
import { ActivatedRoute } from '@angular/router';
import { Observable, of, Subject } from 'rxjs';
import { debounceTime, finalize, map, switchMap, takeUntil } from 'rxjs/operators';
import { InternalLookupService } from 'src/app/shared/common/internal-lookup.service';
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { AppComponentBase, NotifySeverity } from 'src/shared/app-component-base';
import { ClientPeriodSalesDataDto, ClientPeriodServiceProxy, ClientRateDto, CommissionDto, ConsultantRateDto, ConsultantSalesDataDto, ContractSignerDto, EmployeeDto, EnumEntityTypeDto, EnumServiceProxy, LookupServiceProxy, PeriodClientSpecialFeeDto, PeriodClientSpecialRateDto, SalesClientDataDto, SalesMainDataDto, WorkflowProcessType, WorkflowServiceProxy, ConsultantResultDto, ClientResultDto, ContactResultDto, ConsultantTerminationSalesDataCommandDto, WorkflowTerminationSalesDataCommandDto, PeriodConsultantSpecialFeeDto, PeriodConsultantSpecialRateDto, ClientSpecialRateDto, ClientsServiceProxy, ClientSpecialFeeDto, ClientSalesServiceProxy, ConsultantPeriodServiceProxy, ConsultantPeriodSalesDataDto, ConsultantSalesServiceProxy, ExtendConsultantPeriodDto, ChangeConsultantPeriodDto } from 'src/shared/service-proxies/service-proxies';
import { WorkflowConsultantActionsDialogComponent } from '../workflow-consultant-actions-dialog/workflow-consultant-actions-dialog.component';
import { WorkflowDataService } from '../workflow-data.service';
import { ConsultantDiallogAction, SalesTerminateConsultantForm, TenantList, WorkflowSalesAdditionalDataForm, WorkflowSalesClientDataForm, WorkflowSalesConsultantsForm, WorkflowSalesMainForm } from './workflow-sales.model';

@Component({
    selector: 'app-workflow-sales',
    templateUrl: './workflow-sales.component.html',
    styleUrls: ['./workflow-sales.component.scss']
})
export class WorkflowSalesComponent extends AppComponentBase implements OnInit {
    @Input() workflowId: string;
    @Input() periodId: string | undefined;
    // Changed all above to enum
    @Input() activeSideSection: number;
    @Input() isCompleted: boolean;

    @Input() permissionsForCurrentUser: { [key: string]: boolean; } | undefined;
    editEnabledForcefuly = false;
    consultantId = 1; // FIXME: fix after be changes
    consultantInformation: ConsultantResultDto; // FIXME: fix after be changes
    // workflowSideSections = WorkflowSideSections;
    workflowSideSections = WorkflowProcessType;
    // SalesStep
    intracompanyActive = false;
    salesClientDataForm: WorkflowSalesClientDataForm;
    salesMainDataForm: WorkflowSalesMainForm;
    consultantsForm: WorkflowSalesConsultantsForm;
    additionalDataForm: WorkflowSalesAdditionalDataForm;
    salesTerminateConsultantForm: SalesTerminateConsultantForm;

    clientSpecialRateActive = false;
    clientSpecialFeesActive = false;

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
    clientSpecialRateOrFeeDirections: EnumEntityTypeDto[] = [];
    clientSpecialRateReportUnits: EnumEntityTypeDto[] = [];
    clientSpecialRateSpecifications: EnumEntityTypeDto[] = [];
    contractExpirationNotificationDuration: EnumEntityTypeDto[] = [];
    clientTimeReportingCap: EnumEntityTypeDto[] = [];
    commissionFrequencies: EnumEntityTypeDto[] = [];
    commissionTypes: EnumEntityTypeDto[] = [];
    commissionRecipientTypeList: EnumEntityTypeDto[] = [];
    tenants: EnumEntityTypeDto[] = [];
    projectCategories: EnumEntityTypeDto[] = [];
    discounts: EnumEntityTypeDto[] = [];
    expectedWorkloadUnits: EnumEntityTypeDto[] = [];
    nonStandartTerminationTimes: { [key: string]: string; };
    terminationReasons: { [key: string]: string; };
    employmentTypes: EnumEntityTypeDto[] = [];
    countries: EnumEntityTypeDto[] = [];
    consultantTimeReportingCapList: EnumEntityTypeDto[] = [];

    // new UI
    clientRateTypes: EnumEntityTypeDto[] = new Array<EnumEntityTypeDto>(
        new EnumEntityTypeDto({
            id: 1,
            name: 'Time based'
            }
        ),
        new EnumEntityTypeDto(
            {
                id: 2,
                name: 'Fixed'
            }
        )
    );

    showMore = false;

    filteredAccountManagers: any[] = [];
    filteredSalesAccountManagers: any[] = [];
    filteredCommisionAccountManagers: any[] = [];
    filteredDirectClients: any[] = [];
    filteredEndClients: any[] = []
    filteredConsultants: any[] = [];
    filteredRecipients: any[] = [];
    filteredReferencePersons: any[] = [];
    filteredEvaluationReferencePersons: any[] = [];
    filteredClientInvoicingRecipients: any[] = [];
    filteredFinalEvaluationReferencePersons: any[] = [];
    consultantRateToEdit: PeriodConsultantSpecialRateDto;
    isConsultantRateEditing = false;
    consultantFeeToEdit: PeriodConsultantSpecialFeeDto;
    isConsultantFeeEditing = false;

    clientSpecialRateFilter = new FormControl('');
    clientSpecialRateList: ClientSpecialRateDto[] = [];
    filteredClientSpecialRates: Observable<ClientSpecialRateDto[] | undefined>;

    clientSpecialFeeFilter = new FormControl('');
    clientSpecialFeeList: ClientSpecialFeeDto[] = [];
    filteredClientSpecialFees: Observable<ClientSpecialFeeDto[] | undefined>;

    filteredConsultantSpecialRates: ClientSpecialFeeDto[];
    filteredConsultantSpecialFees: ClientSpecialFeeDto[];
    contractExpirationNotificationDisplay: string;

    filteredConsultantCountries: EnumEntityTypeDto[];
    filteredConsultantClientAddresses: any[] = [];
    filteredContractSigners: any[] = [];

    clientIdFromTerminationSales: number;

    private _unsubscribe = new Subject();

    constructor(
        injector: Injector,
        private _fb: FormBuilder,
        private _enumService: EnumServiceProxy,
        private _workflowDataService: WorkflowDataService,
        // private _workflowService: WorkflowsServiceProxy,
        private activatedRoute: ActivatedRoute,
        private overlay: Overlay,
        private dialog: MatDialog,
        private _internalLookupService: InternalLookupService,
        private _lookupService: LookupServiceProxy,
        private _clientPeriodService: ClientPeriodServiceProxy,
        private _workflowServiceProxy: WorkflowServiceProxy,
        private _clientSalesService: ClientSalesServiceProxy,
        private _clientService: ClientsServiceProxy,
        private _consultantPeriodSerivce: ConsultantPeriodServiceProxy,
        private _consultantSalesSerivce: ConsultantSalesServiceProxy
    ) {
        super(injector);
        this.salesClientDataForm = new WorkflowSalesClientDataForm();
        this.salesMainDataForm = new WorkflowSalesMainForm();
        this.consultantsForm = new WorkflowSalesConsultantsForm();
        this.additionalDataForm = new WorkflowSalesAdditionalDataForm();
        this.salesTerminateConsultantForm = new SalesTerminateConsultantForm();

        //#region form subscriptions
        this.salesMainDataForm.salesAccountManagerIdValue?.valueChanges
            .pipe(
                takeUntil(this._unsubscribe),
                debounceTime(300),
                switchMap((value: any) => {
                    let toSend = {
                        name: value,
                        maxRecordsCount: 1000,
                    };
                    if (value?.id) {
                        toSend.name = value.id
                            ? value.name
                            : value;
                    }
                    return this._lookupService.employees(value);
                }),
            ).subscribe((list: EmployeeDto[]) => {
                if (list.length) {
                    this.filteredSalesAccountManagers = list;
                } else {
                    this.filteredSalesAccountManagers = [{ name: 'No managers found', externalId: '', id: 'no-data', selected: false }];
                }
            });

        this.salesMainDataForm.commissionAccountManagerIdValue?.valueChanges
            .pipe(
                takeUntil(this._unsubscribe),
                debounceTime(300),
                switchMap((value: any) => {
                    let toSend = {
                        name: value,
                        maxRecordsCount: 1000,
                    };
                    if (value?.id) {
                        toSend.name = value.id
                            ? value.name
                            : value;
                    }
                    return this._lookupService.employees(value);
                }),
            ).subscribe((list: EmployeeDto[]) => {
                if (list.length) {
                    this.filteredCommisionAccountManagers = list;
                } else {
                    this.filteredCommisionAccountManagers = [{ name: 'No managers found', externalId: '', id: 'no-data', selected: false }];
                }
            });

        this.salesClientDataForm.directClientIdValue?.valueChanges
            .pipe(
                takeUntil(this._unsubscribe),
                debounceTime(300),
                switchMap((value: any) => {
                    let toSend = {
                        name: value ?? '',
                        maxRecordsCount: 1000,
                    };
                    if (value?.id) {
                        toSend.name = value.id
                            ? value.clientNam?.trim()
                            : value?.trim();
                    }
                    return this._lookupService.clients(toSend.name, toSend.maxRecordsCount);
                }),
            ).subscribe((list: ClientResultDto[]) => {
                if (list.length) {
                    this.filteredDirectClients = list;
                } else {
                    this.filteredDirectClients = [{ clientName: 'No records found', externalId: '', id: 'no-data', selected: false }];
                }
            });

        this.salesClientDataForm.endClientIdValue?.valueChanges
            .pipe(
                takeUntil(this._unsubscribe),
                debounceTime(300),
                switchMap((value: any) => {
                    let toSend = {
                        name: value,
                        maxRecordsCount: 1000,
                    };
                    if (value?.id) {
                        toSend.name = value.id
                            ? value.clientName?.trim()
                            : value?.trim();
                    }
                    return this._lookupService.clients(toSend.name, toSend.maxRecordsCount);
                }),
            ).subscribe((list: ClientResultDto[]) => {
                if (list.length) {
                    this.filteredEndClients = list;
                } else {
                    this.filteredEndClients = [{ clientName: 'No records found', externalId: '', id: 'no-data', selected: false }];
                }
            });

        this.salesClientDataForm.invoicingReferencePersonIdValue?.valueChanges
            .pipe(
                takeUntil(this._unsubscribe),
                debounceTime(300),
                switchMap((value: any) => {
                    let toSend = {
                        clientId: this.salesClientDataForm.directClientIdValue?.value?.clientId,
                        name: value,
                        maxRecordsCount: 1000,
                    };
                    if (value?.id) {
                        toSend.name = value.id
                            ? value.firstName
                            : value;
                    }
                    return this._lookupService.contacts(toSend.clientId, toSend.name, toSend.maxRecordsCount);
                }),
            ).subscribe((list: ContactResultDto[]) => {
                if (list.length) {
                    this.filteredReferencePersons = list;
                } else {
                    this.filteredReferencePersons = [{ firstName: 'No records found', lastName: '', id: 'no-data' }];
                }
            });

        this.salesClientDataForm.clientInvoicingRecipientIdValue?.valueChanges
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
                            toSend.name = value.id
                                ? value.clientName
                                : value;
                        }
                        return this._lookupService.clients(toSend.name, toSend.maxRecordsCount);
                    } else {
                        return of([]);
                    }
                }),
            ).subscribe((list: ClientResultDto[]) => {
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
                    let toSend = {
                        clientId: this.salesClientDataForm.directClientIdValue?.value?.clientId,
                        name: value,
                        maxRecordsCount: 1000,
                    };
                    if (value?.id) {
                        toSend.name = value.id
                            ? value.firstName
                            : value;
                    }
                    return this._lookupService.contacts(toSend.clientId, toSend.name, toSend.maxRecordsCount);
                }),
            ).subscribe((list: ContactResultDto[]) => {
                if (list.length) {
                    this.filteredEvaluationReferencePersons = list;
                } else {
                    this.filteredEvaluationReferencePersons = [{ firstName: 'No records found', lastName: '', id: 'no-data' }];
                }
            });

            this.salesTerminateConsultantForm.finalEvaluationReferencePerson?.valueChanges
            .pipe(
                takeUntil(this._unsubscribe),
                debounceTime(300),
                switchMap((value: any) => {
                    let toSend = {
                        clientId: this.clientIdFromTerminationSales,
                        name: value ?? '',
                        maxRecordsCount: 1000,
                    };
                    if (value?.id) {
                        toSend.name = value.id
                            ? value.firstName
                            : value;
                    }
                    return this._lookupService.contacts(toSend.clientId, toSend.name, toSend.maxRecordsCount);
                }),
            ).subscribe((list: ContactResultDto[]) => {
                if (list.length) {
                    this.filteredFinalEvaluationReferencePersons = list;
                } else {
                    this.filteredFinalEvaluationReferencePersons = [{ firstName: 'No records found', lastName: '', id: 'no-data' }];
                }
            });

    }

    ngOnInit(): void {
        this.activatedRoute.paramMap.pipe(
            takeUntil(this._unsubscribe)
        ).subscribe(params => {
            this.workflowId = params.get('id')!;
        });

        console.log(this.permissionsForCurrentUser!["Edit"]);

        this.filteredClientSpecialRates = this.clientSpecialRateFilter.valueChanges
            .pipe(
            map(value => {
                if (typeof value === 'string') {
                    return this._filterClientRates(value);
                }
            })
        );

        this.filteredClientSpecialFees = this.clientSpecialFeeFilter.valueChanges
            .pipe(
            map(value => {
                if (typeof value === 'string') {
                    return this._filterClientFees(value);
                }
            })
        );

        // get enums
        this.getCurrencies();
        this.getDeliveryTypes();
        this.getSaleTypes();
        this.getProjectTypes();
        this.getInvoicingTimes();
        this.getUnitTypes();
        this.getInvoiceFrequencies();
        this.getSignerRoles();
        this.getMargins();
        this.getExtensionDeadlines();
        this.getExtensionDurations();
        this.getSpecialFeeFrequencies();
        this.getSpecialFeeSpecifications();
        this.getSpecialRateOrFeeDirections();
        this.getSpecialRateReportUnits();
        this.getSpecialRateSpecifications();
        this.getContractExpirationNotificationInterval();
        this.getClientTimeReportingCap();
        this.getEmagineOfficeList();
        this.getCommissionFrequency();
        this.getCommissionTypes();
        this.getCommissionRecipientTypes();
        this.getTenants();
        this.getProjectCategory();
        this.getDiscounts();
        this.getTerminationTimes();
        this.getTerminationReasons();
        this.getEmploymentTypes();
        this.getExpectedWorkloadUnit();
        this.getCountries();
        this.getConsultantTimeReportingCap();

        this.detectActiveSideSection();

        this._workflowDataService.startClientPeriodSalesSaved
            .pipe(takeUntil(this._unsubscribe))
            .subscribe((value: boolean) => {
                this.saveStartChangeOrExtendClientPeriodSales(value);
            });
        this._workflowDataService.consultantStartChangeOrExtendSalesSaved
            .pipe(takeUntil(this._unsubscribe))
            .subscribe((value: boolean) => {
                this.saveStartChangeOrExtendConsultantPeriodSales(value);
            });

        // Termination
        this._workflowDataService.consultantTerminationSalesSaved
            .pipe(takeUntil(this._unsubscribe))
            .subscribe((value: boolean) => {
                this.saveTerminationConsultantSalesStep(value);
            });

        this._workflowDataService.workflowTerminationSalesSaved
            .pipe(takeUntil(this._unsubscribe))
            .subscribe((value: boolean) => {
                this.saveWorkflowTerminationSalesStep(value);
            });

        this._workflowDataService.workflowSideSectionChanged
            .pipe(takeUntil(this._unsubscribe))
            .subscribe((value: boolean) => {
                console.log(value);
                //TODO: add all side sections
                this.detectActiveSideSection();
            });
    }

    toggleEditMode() {
        this.isCompleted = !this.isCompleted;
        this.editEnabledForcefuly = !this.editEnabledForcefuly;
    }

    get canToggleEditMode() {
        return this.permissionsForCurrentUser!["Edit"] && (this.isCompleted || this.editEnabledForcefuly);
    }

    get readOnlyMode() {
        return this.isCompleted;
    }

    private _filterClientRates(value: string): ClientSpecialRateDto[] {
        const filterValue = value.toLowerCase();
        const selectedIds: number[] = this.salesClientDataForm.clientRates.value.map((x: any) => x.id);
        const result = this.clientSpecialRateList.filter(option => option.publicName!.toLowerCase().includes(filterValue)).filter(x =>  !selectedIds.includes(x.id!));
        return result;
    }

    private _filterClientFees(value: string): ClientSpecialFeeDto[] {
        const filterValue = value.toLowerCase();
        const selectedIds: number[] = this.salesClientDataForm.clientFees.value.map((x: any) => x.id);
        const result = this.clientSpecialFeeList.filter(option => option.publicName!.toLowerCase().includes(filterValue)).filter(x =>  !selectedIds.includes(x.id!));
        return result;
    }

    directClientSelected(event: MatAutocompleteSelectedEvent) {
        this.getRatesAndFees(event.option.value?.clientId);
    }

    getRatesAndFees(clientId: number) {
        this._clientService.specialRatesGet(clientId, true)
        .pipe(finalize(() => {

        }))
        .subscribe(result => {
            this.clientSpecialRateList = result;
        });
    this._clientService.specialFeesGet(clientId, true)
        .pipe(finalize(() => {

        }))
        .subscribe(result => {
            this.clientSpecialFeeList = result;
        });
    }


    ngOnDestroy(): void {
        this._unsubscribe.next();
        this._unsubscribe.complete();
    }

    //#region dataFetch

    getCurrencies() {
        this._internalLookupService.getCurrencies()
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.currencies = result;
            });
    }

    getUnitTypes() {
        this._internalLookupService.getUnitTypes()
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.rateUnitTypes = result;
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

    getInvoicingTimes() {
        this._internalLookupService.getInvoicingTimes()
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.invoicingTimes = result;
            });
    }

    getInvoiceFrequencies() {
        this._internalLookupService.getInvoiceFrequencies()
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.invoiceFrequencies = result;
            });
    }

    getSignerRoles() {
        this._internalLookupService.getSignerRoles()
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.signerRoles = result;
            });
    }

    getEmagineOfficeList() {
        this._internalLookupService.getEmagineOfficeList()
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.emagineOffices = result;
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

    getExtensionDeadlines() {
        this._internalLookupService.getExtensionDeadlines()
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.clientExtensionDeadlines = result;
            });
    }

    getExtensionDurations() {
        this._internalLookupService.getExtensionDurations()
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.clientExtensionDurations = result;
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

    getSpecialFeeSpecifications() {
        this._internalLookupService.getSpecialFeeSpecifications()
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.clientSpecialFeeSpecifications = result;
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

    getSpecialRateSpecifications() {
        this._internalLookupService.getSpecialRateSpecifications()
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.clientSpecialRateSpecifications = result;
            });
    }

    getContractExpirationNotificationInterval() {
        this._internalLookupService.getContractExpirationNotificationInterval()
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.contractExpirationNotificationDuration = result;
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

    getCommissionFrequency() {
        this._internalLookupService.getCommissionFrequency()
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.commissionFrequencies = result;
            });
    }

    getCommissionTypes() {
        this._internalLookupService.getCommissionTypes()
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.commissionTypes = result;
            });
    }

    getCommissionRecipientTypes() {
        this._internalLookupService.getCommissionRecipientTypes()
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.commissionRecipientTypeList = result;
            });
    }

    getTenants() {
        this._internalLookupService.getTenants()
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.tenants = result;
            });
    }

    getProjectCategory() {
        this._internalLookupService.getProjectCategory()
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.projectCategories = result;
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

    getTerminationTimes() {
        this._internalLookupService.getTerminationTimes()
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.nonStandartTerminationTimes = result;
                console.log(this.nonStandartTerminationTimes['Before end of contract'])
            });
    }

    getTerminationReasons() {
        this._internalLookupService.getTerminationReasons()
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.terminationReasons = result;
            });
    }

    getExpectedWorkloadUnit() {
        this._internalLookupService.getExpectedWorkloadUnit()
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.expectedWorkloadUnits = result;
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

    getCountries() {
        this._internalLookupService.getCountries()
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.countries = result;
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

    //#endregion dataFetch

    getDataBasedOnProjectType(event: MatSelectChange) {
        const projectTypeId = event.value.id;
        this.showMainSpinner();
        this._clientPeriodService.projectType(projectTypeId)
            .pipe(finalize(() => {
                this.hideMainSpinner();
            }))
            .subscribe(result => {
                this.salesMainDataForm.deliveryType?.setValue(this.findItemById(this.deliveryTypes, result.deliveryTypeId), {emitEvent: false});
                this.salesMainDataForm.salesType?.setValue(this.findItemById(this.saleTypes, result.salesTypeId), {emitEvent: false});
                this.salesMainDataForm.margin?.setValue(this.findItemById(this.margins, result.marginId), {emitEvent: false});
            });
    }

    selectClientSpecialRate(event: any, rate: ClientSpecialRateDto, clientRateMenuTrigger: MatMenuTrigger) {
        event.stopPropagation();
        const formattedRate = new PeriodClientSpecialRateDto();
        formattedRate.id = undefined;
        formattedRate.clientSpecialRateId = rate.id;
        formattedRate.rateName = rate.publicName;
        formattedRate.rateDirection = rate.specialRateOrFeeDirection;
        formattedRate.reportingUnit = rate.specialRateReportingUnit;
        formattedRate.clientRate = rate.clientRate;
        formattedRate.clientRateCurrencyId = rate.clientRateCurrency?.id;
        this.clientSpecialRateFilter.setValue('');
        clientRateMenuTrigger.closeMenu();
        this.addSpecialRate(formattedRate);
    }

    addSpecialRate(clientRate?: PeriodClientSpecialRateDto) {
        const form = this._fb.group({
            id: new FormControl(clientRate?.id ?? null),
            clientSpecialRateId: new FormControl(clientRate?.clientSpecialRateId ?? null),
            rateName: new FormControl(clientRate?.rateName ?? null),
            rateDirection: new FormControl(clientRate?.rateDirection ?? null),
            reportingUnit: new FormControl(clientRate?.reportingUnit ?? null),
            clientRateValue: new FormControl(clientRate?.clientRate ?? null),
            clientRateCurrency: new FormControl(this.findItemById(this.currencies, clientRate?.clientRateCurrencyId) ?? null),
            editable: new FormControl(clientRate ? false : true)
        });
        this.salesClientDataForm.clientRates.push(form);
    }

    get clientRates(): FormArray {
        return this.salesClientDataForm.get('clientRates') as FormArray;
    }

    removeClientRate(index: number) {
        this.clientRates.removeAt(index);
    }

    editOrSaveSpecialRate(isEditMode: boolean, index: number) {
        this.clientRates.at(index).get('editable')?.setValue(!isEditMode, {emitEvent: false});
    }

    selectClientSpecialFee(event: any, fee: ClientSpecialFeeDto, clientFeeMenuTrigger: MatMenuTrigger) {
        const formattedFee = new PeriodClientSpecialFeeDto();
        formattedFee.id = undefined;
        formattedFee.clientSpecialFeeId = fee.id;
        formattedFee.feeName = fee.publicName;
        formattedFee.feeDirection = fee.specialRateOrFeeDirection;
        formattedFee.frequency = fee.clientSpecialFeeFrequency;
        formattedFee.clientRate = fee.clientRate;
        formattedFee.clientRateCurrencyId = fee.clientRateCurrency?.id;
        this.clientSpecialFeeFilter.setValue('');
        clientFeeMenuTrigger.closeMenu();
        this.addClientFee(formattedFee);
    }

    addClientFee(clientFee?: PeriodClientSpecialFeeDto) {
        const form = this._fb.group({
            id: new FormControl(clientFee?.id ?? null),
            clientSpecialFeeId: new FormControl(clientFee?.clientSpecialFeeId ?? null),
            feeName: new FormControl(clientFee?.feeName ?? null),
            feeDirection: new FormControl(clientFee?.feeDirection ?? null),
            feeFrequency: new FormControl(clientFee?.frequency ?? null),
            clientRateValue: new FormControl(clientFee?.clientRate ?? null),
            clientRateCurrency: new FormControl(this.findItemById(this.currencies, clientFee?.clientRateCurrencyId) ?? null),
            editable: new FormControl(clientFee ? false : true)
        });
        this.salesClientDataForm.clientFees.push(form);
    }

    get clientFees(): FormArray {
        return this.salesClientDataForm.get('clientFees') as FormArray;
    }

    removeClientFee(index: number) {
        this.clientFees.removeAt(index);
    }

    editOrSaveClientFee(isEditMode: boolean, index: number) {
        this.clientFees.at(index).get('editable')?.setValue(!isEditMode, {emitEvent: false});
    }

    addSignerToForm(signer?: ContractSignerDto) {
        const form = this._fb.group({
            clientContact: new FormControl(signer?.contact ?? null),
            clientRole: new FormControl(signer?.signerRoleId ?? null),
            clientSequence: new FormControl(signer?.signOrder ?? null)
        });
        this.salesClientDataForm.contractSigners.push(form);
        this.manageSignersContactAutocomplete(this.salesClientDataForm.contractSigners.length - 1);
    }

    manageSignersContactAutocomplete(signerIndex: number) {
        let arrayControl = this.salesClientDataForm.contractSigners.at(signerIndex);
        arrayControl!.get('clientContact')!.valueChanges
            .pipe(
                takeUntil(this._unsubscribe),
                debounceTime(300),
                switchMap((value: any) => {
                    let toSend = {
                        clientId: this.salesClientDataForm.directClientIdValue?.value?.clientId,
                        name: value,
                        maxRecordsCount: 1000,
                    };
                    if (value?.id) {
                        toSend.name = value.id
                            ? value.firstName
                            : value;
                    }
                    return this._lookupService.contacts(toSend.clientId, toSend.name, toSend.maxRecordsCount);
                }),
            ).subscribe((list: ContactResultDto[]) => {
                if (list.length) {
                    this.filteredContractSigners = list;
                } else {
                    this.filteredContractSigners = [{ firstName: 'No records found', lastName: '', id: 'no-data' }];
                }
            });
    }

    get contractSigners(): FormArray {
        return this.salesClientDataForm.get('contractSigners') as FormArray;
    }

    removeSigner(index: number) {
        this.contractSigners.removeAt(index);
    }

    addConsultantForm(consultant?: ConsultantSalesDataDto) {
        const form = this._fb.group({
            employmentType: new FormControl(this.findItemById(this.employmentTypes, consultant?.employmentTypeId) ?? null),
            consultantName: new FormControl(consultant?.consultant ?? null),
            consultantPeriodId: new FormControl(consultant?.consultantPeriodId ?? null),
            consultantNameOnly: new FormControl(consultant?.nameOnly ?? null),

            consultantProjectDurationSameAsClient: new FormControl(true),
            consultantProjectStartDate: new FormControl(consultant?.startDate ?? null),
            consultantProjectEndDate: new FormControl({value: consultant?.endDate ?? null, disabled: consultant?.noEndDate}),
            consultantProjectNoEndDate: new FormControl(consultant?.noEndDate ?? false),

            consultantWorkplace: new FormControl(null),
            consultantWorkplaceClientAddress: new FormControl(consultant?.onsiteClient ?? null),
            consultantWorkplaceEmagineOffice: new FormControl(this.findItemById(this.emagineOffices, consultant?.emagineOfficeId) ?? null),
            consultantWorkplaceRemote: new FormControl(this.findItemById(this.countries, consultant?.remoteAddressCountryId) ?? null),
            consultantWorkplacePercentageOnSite: new FormControl(consultant?.percentageOnSite ?? null),

            consultantIsOnsiteWorkplace: new FormControl(consultant?.isOnsiteWorkplace ?? false),
            consultantIsEmagineOfficeWorkplace: new FormControl(consultant?.isEmagineOfficeWorkplace ?? false),
            consultantIsRemoteWorkplace: new FormControl(consultant?.isRemoteWorkplace ?? false),

            expectedWorkloadHours: new FormControl(consultant?.expectedWorkloadHours ?? null),
            expectedWorkloadUnitId: new FormControl(consultant?.expectedWorkloadUnitId ?? null),
            consultantCapOnTimeReporting: new FormControl(this.findItemById(this.consultantTimeReportingCapList, consultant?.consultantTimeReportingCapId ?? 4)), // ?? default value = no cap - id:4
            consultantTimeReportingCapMaxValue: new FormControl(consultant?.consultantTimeReportingCapMaxValue ?? null),
            consultantCapOnTimeReportingCurrency: new FormControl(null), // remove
            consultantProdataEntity: new FormControl(this.findItemById(this.tenants, consultant?.pdcPaymentEntityId) ?? null),
            consultantPaymentType: new FormControl(this.findItemById(this.clientRateTypes, consultant?.consultantRate?.isTimeBasedRate ? 1 : 2)),  // 1: 'Time based', 2: 'Fixed'
            consultantRate: new FormControl(consultant?.consultantRate?.normalRate ?? null),
            consultantRateUnitType: new FormControl(this.findItemById(this.rateUnitTypes, consultant?.consultantRate?.rateUnitTypeId) ?? null),
            consultantRateCurrency: new FormControl(this.findItemById(this.currencies, consultant?.consultantRate?.currencyId) ?? null),
            consultantPDCRate: new FormControl(consultant?.consultantRate?.prodataToProdataRate ?? null),
            consultantPDCRateUnitType: new FormControl(null), // ??
            consultantPDCRateCurrency: new FormControl(this.findItemById(this.currencies, consultant?.consultantRate?.prodataToProdataCurrencyId) ?? null),

            consultantInvoicingFrequency: new FormControl(this.findItemById(this.invoiceFrequencies, consultant?.consultantRate?.invoiceFrequencyId) ?? null),
            consultantInvoicingTime: new FormControl(this.findItemById(this.invoicingTimes, consultant?.consultantRate?.invoicingTimeId) ?? null),
            consultantInvoicingManualDate: new FormControl(consultant?.consultantRate?.manualDate ?? null),

            consultantSpecialRateFilter: new FormControl(''),
            specialRates: new FormArray([]),
            consultantSpecialFeeFilter: new FormControl(''),
            specialFees: new FormArray([]),

            consultantSpecialContractTermsNone: new FormControl(consultant?.noSpecialContractTerms ?? false),
            consultantSpecialContractTerms: new FormControl({value: consultant?.specialContractTerms ?? null, disabled: consultant?.noSpecialContractTerms}),

            deliveryManagerSameAsAccountManager: new FormControl(consultant?.deliveryManagerSameAsAccountManager ?? false),
            deliveryAccountManager: new FormControl(consultant?.deliveryAccountManager ?? ''),
        });
        this.consultantsForm.consultantData.push(form);
        if (consultant?.periodConsultantSpecialRates?.length) {
            for (let rate of consultant?.periodConsultantSpecialRates) {
                this.addConsultantSpecialRate(this.consultantsForm.consultantData.length - 1, rate);
            }
        }
        if (consultant?.periodConsultantSpecialFees?.length) {
            for (let fee of consultant?.periodConsultantSpecialFees) {
                this.addConsultantSpecialFee(this.consultantsForm.consultantData.length - 1, fee);
            }
        }
        this.manageManagerAutocomplete(this.consultantsForm.consultantData.length - 1);
        this.manageConsultantAutocomplete(this.consultantsForm.consultantData.length - 1);
        this.manageConsultantRateAutocomplete(this.consultantsForm.consultantData.length - 1);
        this.manageConsultantFeeAutocomplete(this.consultantsForm.consultantData.length - 1);
        this.manageConsultantClientAddressAutocomplete(this.consultantsForm.consultantData.length - 1);
        this.manageConsultantCountryAutocomplete(this.consultantsForm.consultantData.length - 1);
    }

    manageManagerAutocomplete(consultantIndex: number) {
        let arrayControl = this.consultantsForm.consultantData.at(consultantIndex);
        arrayControl!.get('deliveryAccountManager')!.valueChanges
            .pipe(
                takeUntil(this._unsubscribe),
                debounceTime(300),
                switchMap((value: any) => {
                    let toSend = {
                        name: value,
                        maxRecordsCount: 1000,
                    };
                    if (value?.id) {
                        toSend.name = value.id
                            ? value.name
                            : value;
                    }
                    return this._lookupService.employees(value);
                }),
            ).subscribe((list: EmployeeDto[]) => {
                if (list.length) {
                    this.filteredAccountManagers = list;
                } else {
                    this.filteredAccountManagers = [{ name: 'No managers found', externalId: '', id: 'no-data', selected: false }];
                }
            });
    }

    manageConsultantClientAddressAutocomplete(consultantIndex: number) {
        let arrayControl = this.consultantsForm.consultantData.at(consultantIndex);
        arrayControl!.get('consultantWorkplaceClientAddress')!.valueChanges
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
                            toSend.name = value.id
                                ? value.clientName
                                : value;
                        }
                        return this._lookupService.clients(toSend.name, toSend.maxRecordsCount);
                    } else {
                        return of([]);
                    }
                }),
            ).subscribe((list: EmployeeDto[]) => {
                if (list.length) {
                    this.filteredConsultantClientAddresses = list;
                } else {
                    this.filteredConsultantClientAddresses = [{ clientName: 'No records found', id: 'no-data' }];
                }
            });
    }

    manageConsultantCountryAutocomplete(consultantIndex: number) {
        let arrayControl = this.consultantsForm.consultantData.at(consultantIndex);
        arrayControl!.get('consultantWorkplaceRemote')!.valueChanges
        .pipe(takeUntil(this._unsubscribe))
        .subscribe(value => {
                if (typeof value === 'string') {
                    this.filteredConsultantCountries = this._filterConsultantCountry(value);
                }
            }
        );
    }

    private _filterConsultantCountry(value: string): EnumEntityTypeDto[] {
        const filterValue = value.toLowerCase();
        const result = this.countries.filter(option => option.name!.toLowerCase().includes(filterValue));
        return result;
    }

    manageConsultantRateAutocomplete(consultantIndex: number) {
        let arrayControl = this.consultantsForm.consultantData.at(consultantIndex);
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
        // FIXME: do we need to have only 1 entrance for rate/fees ?
        // const selectedIds: number[] = this.consultantsForm.consultantData.at(consultantIndex).get('specialRates')!.value.map((x: any) => x.id);
        // const result = this.clientSpecialRateList.filter(option => option.publicName!.toLowerCase().includes(filterValue)).filter(x =>  !selectedIds.includes(x.id!));
        const result = this.clientSpecialRateList.filter(option => option.publicName!.toLowerCase().includes(filterValue));
        return result;
    }

    manageConsultantFeeAutocomplete(consultantIndex: number) {
        let arrayControl = this.consultantsForm.consultantData.at(consultantIndex);
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
        // FIXME: do we need to have only 1 entrance for rate/fees ?
        // const selectedIds: number[] = this.consultantsForm.consultantData.at(consultantIndex).get('specialFees')!.value.map((x: any) => x.id);
        // const result = this.clientSpecialFeeList.filter(option => option.publicName!.toLowerCase().includes(filterValue)).filter(x =>  !selectedIds.includes(x.id!));
        const result = this.clientSpecialFeeList.filter(option => option.publicName!.toLowerCase().includes(filterValue));
        return result;
    }

    getConsultantRateControls(consultantIndex: number): AbstractControl[] | null {
        return (this.consultantsForm.consultantData.at(consultantIndex).get('specialRates') as FormArray).controls;
    }

    removeConsutlantRate(consultantIndex: number, specialRateIndex: number) {
        (this.consultantsForm.consultantData.at(consultantIndex).get('specialRates') as FormArray).removeAt(specialRateIndex);
    }

    editOrSaveConsultantRate(consultantIndex: number, specialRateIndex: number, isEditable: boolean) {
        if (isEditable) {
            // save
            this.consultantRateToEdit = new PeriodConsultantSpecialRateDto();
            this.isConsultantRateEditing = false;
        } else {
            // make editable
            const consultantRateValue = (this.consultantsForm.consultantData.at(consultantIndex).get('specialRates') as FormArray).at(specialRateIndex).value;
            this.consultantRateToEdit = new PeriodConsultantSpecialRateDto({
                id: consultantRateValue.id,
                clientSpecialRateId: consultantRateValue.clientSpecialRateId,
                rateName: consultantRateValue.rateName,
                rateDirection: consultantRateValue.rateDirection,
                reportingUnit: consultantRateValue.reportingUnit,
                prodataToProdataRate: consultantRateValue.prodataToProdataRate,
                prodataToProdataRateCurrencyId: consultantRateValue.prodataToProdataRateCurrency?.id,
                consultantRate: consultantRateValue.consultantRate,
                consultantRateCurrencyId: consultantRateValue.consultantRateCurrency?.id
            });
            this.isConsultantRateEditing = true;
        }
        (this.consultantsForm.consultantData.at(consultantIndex).get('specialRates') as FormArray).at(specialRateIndex).get('editable')?.setValue(!isEditable, {emitEvent: false});
    }

    cancelEditConsultantRate(consultantIndex: number, specialRateIndex: number) {
        const rateRow = (this.consultantsForm.consultantData.at(consultantIndex).get('specialRates') as FormArray).at(specialRateIndex);
        rateRow.get('prodataToProdataRate')?.setValue(this.consultantRateToEdit.prodataToProdataRate, {emitEvent: false});
        rateRow.get('prodataToProdataRateCurrency')?.setValue(this.findItemById(this.currencies, this.consultantRateToEdit.prodataToProdataRateCurrencyId), {emitEvent: false});
        rateRow.get('consultantRate')?.setValue(this.consultantRateToEdit.consultantRate, {emitEvent: false});
        rateRow.get('consultantRateCurrency')?.setValue(this.findItemById(this.currencies, this.consultantRateToEdit.consultantRateCurrencyId), {emitEvent: false});
        this.isConsultantRateEditing = false;
        (this.consultantsForm.consultantData.at(consultantIndex).get('specialRates') as FormArray).at(specialRateIndex).get('editable')?.setValue(false, {emitEvent: false});
    }

    selectConsultantSpecialRate(event: any, consultantIndex: number, rate: ClientSpecialRateDto, consultantRateMenuTrigger: MatMenuTrigger) {
        const consultantRate = new PeriodConsultantSpecialRateDto();
        consultantRate.id = undefined;
        consultantRate.clientSpecialRateId = rate.id;
        consultantRate.rateName = rate.publicName;
        consultantRate.rateDirection = rate.specialRateOrFeeDirection;
        consultantRate.reportingUnit = rate.specialRateReportingUnit;
        consultantRate.prodataToProdataRate = rate.proDataToProDataRate;
        consultantRate.prodataToProdataRateCurrencyId = rate.proDataToProDataRateCurrency?.id;
        consultantRate.consultantRate = rate.consultantRate;
        consultantRate.consultantRateCurrencyId = rate.consultantCurrency?.id;
        consultantRateMenuTrigger.closeMenu();
        this.addConsultantSpecialRate(consultantIndex, consultantRate);
    }

    addConsultantSpecialRate(consultantIndex: NumberSymbol, consultantRate?: PeriodConsultantSpecialRateDto) {
        const form = this._fb.group({
            id: new FormControl(consultantRate?.id ?? null),
            clientSpecialRateId: new FormControl(consultantRate?.clientSpecialRateId ?? null),
            rateName: new FormControl(consultantRate?.rateName ?? null),
            rateDirection: new FormControl(consultantRate?.rateDirection ?? null),
            reportingUnit: new FormControl(consultantRate?.reportingUnit ?? null),
            prodataToProdataRate: new FormControl(consultantRate?.prodataToProdataRate ?? null),
            prodataToProdataRateCurrency: new FormControl(this.findItemById(this.currencies, consultantRate?.prodataToProdataRateCurrencyId) ?? null),
            consultantRate: new FormControl(consultantRate?.consultantRate ?? null),
            consultantRateCurrency: new FormControl(this.findItemById(this.currencies, consultantRate?.consultantRateCurrencyId) ?? null),
            editable: new FormControl(false)
        });
        (this.consultantsForm.consultantData.at(consultantIndex).get('specialRates') as FormArray).push(form);
    }

    getConsultantFeeControls(consultantIndex: number): AbstractControl[] | null {
        return (this.consultantsForm.consultantData.at(consultantIndex).get('specialFees') as FormArray).controls;
    }

    removeConsutlantFee(consultantIndex: number, specialFeeIndex: number) {
        (this.consultantsForm.consultantData.at(consultantIndex).get('specialFees') as FormArray).removeAt(specialFeeIndex);
    }

    editOrSaveConsultantFee(consultantIndex: number, specialFeeIndex: number, isEditable: boolean) {
        if (isEditable) {
            // save
            this.consultantFeeToEdit = new PeriodConsultantSpecialRateDto();
            this.isConsultantFeeEditing = false;
        } else {
            // make editable
            const consultantFeeValue = (this.consultantsForm.consultantData.at(consultantIndex).get('specialFees') as FormArray).at(specialFeeIndex).value;
            this.consultantFeeToEdit = new PeriodConsultantSpecialFeeDto({
                id: consultantFeeValue.id,
                clientSpecialFeeId: consultantFeeValue.clientSpecialFeeId,
                feeName: consultantFeeValue.feeName,
                feeDirection: consultantFeeValue.feeDirection,
                frequency: consultantFeeValue.frequency,
                prodataToProdataRate: consultantFeeValue.prodataToProdataRate,
                prodataToProdataRateCurrencyId: consultantFeeValue.prodataToProdataRateCurrency?.id,
                consultantRate: consultantFeeValue.consultantRate,
                consultantRateCurrencyId: consultantFeeValue.consultantRateCurrency?.id
            });
            this.isConsultantFeeEditing = true;
        }
        (this.consultantsForm.consultantData.at(consultantIndex).get('specialFees') as FormArray).at(specialFeeIndex).get('editable')?.setValue(!isEditable, {emitEvent: false});
    }

    cancelEditConsultantFee(consultantIndex: number, specialFeeIndex: number) {
        const rateRow = (this.consultantsForm.consultantData.at(consultantIndex).get('specialFees') as FormArray).at(specialFeeIndex);
        rateRow.get('prodataToProdataRate')?.setValue(this.consultantFeeToEdit.prodataToProdataRate, {emitEvent: false});
        rateRow.get('prodataToProdataRateCurrency')?.setValue(this.findItemById(this.currencies, this.consultantFeeToEdit.prodataToProdataRateCurrencyId), {emitEvent: false});
        rateRow.get('consultantRate')?.setValue(this.consultantFeeToEdit.consultantRate, {emitEvent: false});
        rateRow.get('consultantRateCurrency')?.setValue(this.findItemById(this.currencies, this.consultantFeeToEdit.consultantRateCurrencyId), {emitEvent: false});
        this.isConsultantFeeEditing = false;
        (this.consultantsForm.consultantData.at(consultantIndex).get('specialFees') as FormArray).at(specialFeeIndex).get('editable')?.setValue(false, {emitEvent: false});
    }

    selectConsultantSpecialFee(event: any, consultantIndex: number, fee: ClientSpecialFeeDto, consultantFeeMenuTrigger: MatMenuTrigger) {
        const consultantFee = new PeriodConsultantSpecialFeeDto();
        consultantFee.id = undefined;
        consultantFee.clientSpecialFeeId = fee.id;
        consultantFee.feeName = fee.publicName;
        consultantFee.feeDirection = fee.specialRateOrFeeDirection;
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
            id: new FormControl(consultantFee?.id ?? null),
            clientSpecialFeeId: new FormControl(consultantFee?.clientSpecialFeeId ?? null),
            feeName: new FormControl(consultantFee?.feeName ?? null),
            feeDirection: new FormControl(consultantFee?.feeDirection ?? null),
            frequency: new FormControl(consultantFee?.frequency ?? null),
            prodataToProdataRate: new FormControl(consultantFee?.prodataToProdataRate ?? null),
            prodataToProdataRateCurrency: new FormControl(this.findItemById(this.currencies, consultantFee?.prodataToProdataRateCurrencyId) ?? null),
            consultantRate: new FormControl(consultantFee?.consultantRate ?? null),
            consultantRateCurrency: new FormControl(this.findItemById(this.currencies, consultantFee?.consultantRateCurrencyId) ?? null),
            editable: new FormControl(false)
        });
        (this.consultantsForm.consultantData.at(consultantIndex).get('specialFees') as FormArray).push(form);
    }

    manageConsultantAutocomplete(consultantIndex: number) {
        let arrayControl = this.consultantsForm.consultantData.at(consultantIndex);
        arrayControl!.get('consultantName')!.valueChanges
            .pipe(
                takeUntil(this._unsubscribe),
                debounceTime(300),
                switchMap((value: any) => {
                    let toSend = {
                        name: value,
                        maxRecordsCount: 1000,
                    };
                    if (value?.id) {
                        toSend.name = value.id
                            ? value.name
                            : value;
                    }
                    return this._lookupService.consultants(toSend.name, toSend.maxRecordsCount);
                }),
            ).subscribe((list: ConsultantResultDto[]) => {
                if (list.length) {
                    this.filteredConsultants = list;
                } else {
                    this.filteredConsultants = [{ name: 'No consultant found', externalId: '', id: 'no-data' }];
                }
            });

    }

    confirmRemoveConsultant(index: number) {
        const consultant = this.consultantsForm.consultantData.at(index).value;
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
                confirmationMessageTitle: `Are you sure you want to delete consultant ${consultant.consultantName?.name ?? ''}?`,
                confirmationMessage: 'When you confirm the deletion, all the info contained inside this block will disappear.',
                rejectButtonText: 'Cancel',
                confirmButtonText: 'Delete',
                isNegative: true
            }
        });

        dialogRef.componentInstance.onConfirmed.subscribe(() => {
            this.removeConsultant(index);
        });

        dialogRef.componentInstance.onRejected.subscribe(() => {
            // nthng
        });
    }

    removeConsultant(index: number) {
        this.consultantsForm.consultantData.removeAt(index);
    }

    get consultantData(): FormArray {
        return this.consultantsForm.get('consultantData') as FormArray;
    }

    saveStartChangeOrExtendClientPeriodSales(isDraft: boolean) {
        let input = new ClientPeriodSalesDataDto();
        input.salesMainData = new SalesMainDataDto();
        input.salesClientData = new SalesClientDataDto();
        input.consultantSalesData = new Array<ConsultantSalesDataDto>();

        input.salesMainData.projectTypeId = this.salesMainDataForm.projectType?.value?.id;
        input.salesMainData.salesTypeId = this.salesMainDataForm.salesType?.value?.id;
        input.salesMainData.deliveryTypeId = this.salesMainDataForm.deliveryType?.value?.id;
        input.salesMainData.marginId = this.salesMainDataForm.margin?.value?.id;
        input.salesMainData.projectCategoryId = this.salesMainDataForm.projectCategory?.value?.id;
        input.salesMainData.projectDescription = this.salesMainDataForm.projectDescription?.value;
        input.salesMainData.discountId = this.salesMainDataForm.discounts?.value?.id;
        input.salesMainData.salesAccountManagerIdValue = this.salesMainDataForm.salesAccountManagerIdValue?.value?.id;
        input.salesMainData.commissionAccountManagerIdValue = this.salesMainDataForm.commissionAccountManagerIdValue?.value?.id;
        if (this.salesMainDataForm.contractExpirationNotification?.value?.includes(999)) { // hardcoded ID for manual date
            const index = this.salesMainDataForm.contractExpirationNotification?.value?.indexOf(999);
            this.salesMainDataForm.contractExpirationNotification?.value?.splice(index, 1);
        }
        input.salesMainData.contractExpirationNotificationIntervalIds = this.salesMainDataForm.contractExpirationNotification?.value;
        input.salesMainData.customContractExpirationNotificationDate = this.salesMainDataForm.customContractExpirationNotificationDate?.value;

        input.salesMainData.remarks = this.salesMainDataForm.remarks?.value;
        input.salesMainData.noRemarks = this.salesMainDataForm.noRemarks?.value;

        input.salesMainData.commissions = new Array<CommissionDto>();
        if (this.salesMainDataForm.commissions.value?.length) {
            this.salesMainDataForm.commissions.value.forEach((commission: any) => {
                let commissionInput = new CommissionDto();
                commissionInput.id = commission.id;
                commissionInput.commissionTypeId = commission.type?.id;
                commissionInput.amount = commission.value;
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
                        commissionInput.tenantId = commission.recipient?.id;
                        break;
                }
                // id = 2 == 'One time'
                if (commission.frequency?.id === 2) {
                    commissionInput.oneTimeDate = commission.oneTimeDate;
                }

                input.salesMainData!.commissions?.push(commissionInput);
            });
        }

        input.salesClientData.differentEndClient = this.salesClientDataForm.differentEndClient?.value;
        input.salesClientData.directClientIdValue = this.salesClientDataForm.directClientIdValue?.value?.clientId;
        input.salesClientData.endClientIdValue = this.salesClientDataForm.endClientIdValue?.value?.clientId;
        input.startDate = this.salesClientDataForm.clientContractStartDate?.value;
        input.noEndDate = this.salesClientDataForm.clientContractNoEndDate?.value;
        input.endDate = this.salesClientDataForm.clientContractEndDate?.value;
        input.salesClientData.noClientExtensionOption = this.salesClientDataForm.noClientExtensionOption?.value;
        input.salesClientData.clientExtensionDurationId = this.salesClientDataForm.clientExtensionDuration?.value?.id;
        input.salesClientData.clientExtensionDeadlineId = this.salesClientDataForm.clientExtensionDeadline?.value?.id;
        input.salesClientData.clientExtensionSpecificDate = this.salesClientDataForm.clientExtensionEndDate?.value;
        input.salesClientData.clientTimeReportingCapId = this.salesClientDataForm.capOnTimeReporting?.value;
        input.salesClientData.clientTimeReportingCapMaxValue = this.salesClientDataForm.capOnTimeReportingValue?.value;
        input.salesClientData.pdcInvoicingEntityId = this.salesClientDataForm.pdcInvoicingEntityId?.value?.id;

        input.salesClientData.clientRate = new ClientRateDto();
        input.salesClientData.clientRate.isTimeBasedRate = this.salesClientDataForm.clientRateAndInvoicing?.value?.id === 1; // 1: 'Time based';
        input.salesClientData.clientRate.isFixedRate = this.salesClientDataForm.clientRateAndInvoicing?.value?.id === 2; // 2: 'Fixed';
        input.salesClientData.clientRate.currencyId = this.salesClientDataForm.clientCurrency?.value
        input.salesClientData.clientRate.invoiceCurrencyId = this.salesClientDataForm.clientInvoiceCurrency?.value;
        input.salesClientData.clientRate.normalRate = this.salesClientDataForm.clientPrice?.value;
        input.salesClientData.clientRate.rateUnitTypeId = this.salesClientDataForm.rateUnitTypeId?.value;
        input.salesClientData.clientRate.invoiceFrequencyId = this.salesClientDataForm.clientInvoiceFrequency?.value?.id;
        input.salesClientData.clientRate.invoicingTimeId = this.salesClientDataForm.clientInvoiceTime?.value?.id;
        input.salesClientData.clientRate.manualDate = this.salesClientDataForm.clientInvoicingDate?.value;
        // input.salesClientData.clientRate.invoicingTimeId = this.salesClientDataForm.clientInvoicingDate?.value;
        // input.salesClientData.clientRate.price =
        // input.salesClientData.clientRate.invoicingTimeId =

        input.salesClientData.noInvoicingReferenceNumber = this.salesClientDataForm.invoicingReferenceNumber?.value ? false : true;
        input.salesClientData.invoicingReferenceNumber = this.salesClientDataForm.invoicingReferenceNumber?.value;
        input.salesClientData.clientInvoicingRecipientSameAsDirectClient = this.salesClientDataForm.clientInvoicingRecipientSameAsDirectClient?.value;
        input.salesClientData.clientInvoicingRecipientIdValue = this.salesClientDataForm.clientInvoicingRecipientIdValue?.value?.clientId;
        input.salesClientData.noInvoicingReferencePerson = this.salesClientDataForm.noInvoicingReferencePerson?.value;
        input.salesClientData.invoicingReferencePersonIdValue = this.salesClientDataForm.invoicingReferencePersonIdValue?.value?.id;

        if (this.salesClientDataForm.clientRates.value.length) {
            input.salesClientData.periodClientSpecialRates = new Array<PeriodClientSpecialRateDto>();
            this.salesClientDataForm.clientRates.value.forEach((rate: any) => {
                const clientRate = new PeriodClientSpecialRateDto();
                clientRate.id = rate.id;
                clientRate.clientSpecialRateId = rate.clientSpecialRateId;
                clientRate.rateName = rate.rateName;
                clientRate.rateDirection = rate.rateDirection;
                clientRate.reportingUnit = rate.reportingUnit;
                clientRate.clientRate = rate.clientRateValue;
                clientRate.clientRateCurrencyId = rate.clientRateCurrency?.id;
                input.salesClientData!.periodClientSpecialRates?.push(clientRate);
            });
        } else {
            input.salesClientData.noSpecialRate = true;
        }

        if (this.salesClientDataForm.clientFees.value.length) {
            input.salesClientData.periodClientSpecialFees = new Array<PeriodClientSpecialFeeDto>();
            this.salesClientDataForm.clientFees.value.forEach((fee: any) => {
                const clientFee = new PeriodClientSpecialFeeDto();
                clientFee.id = fee.id;
                clientFee.clientSpecialFeeId = fee.clientSpecialFeeId;
                clientFee.feeName = fee.feeName;
                clientFee.feeDirection = fee.feeDirection;
                clientFee.frequency = fee.feeFrequency;
                clientFee.clientRate = fee.clientRateValue;
                clientFee.clientRateCurrencyId = fee.clientRateCurrency?.id;
                input.salesClientData!.periodClientSpecialFees?.push(clientFee);
            });
        } else {
            input.salesClientData.noSpecialFee = true;
        }

        input.salesClientData.evaluationsReferencePersonIdValue = this.salesClientDataForm.evaluationsReferencePersonIdValue?.value?.id;
        input.salesClientData.evaluationsDisabled = this.salesClientDataForm.evaluationsDisabled?.value;
        input.salesClientData.evaluationsDisabledReason = this.salesClientDataForm.evaluationsDisabledReason?.value;
        input.salesClientData.noSpecialContractTerms = this.salesClientDataForm.noSpecialContractTerms?.value;
        input.salesClientData.specialContractTerms = this.salesClientDataForm.specialContractTerms?.value;

        input.salesClientData.contractSigners = new Array<ContractSignerDto>();
        if (this.salesClientDataForm.contractSigners.value?.length) {
            this.salesClientDataForm.contractSigners.value.forEach((signer: any) => {
                let signerInput = new ContractSignerDto();
                signerInput.signOrder = signer.clientSequence;
                signerInput.contactId = signer.clientContact?.id;
                signerInput.contact = signer.clientContact;
                signerInput.signerRoleId = signer.clientRole;
                input.salesClientData!.contractSigners?.push(signerInput);
            });
        }
        input.consultantSalesData = new Array<ConsultantSalesDataDto>();
        if (this.consultantsForm.consultantData.value?.length) {
            this.consultantsForm.consultantData.value.forEach((consultant: any) => {
                let consultantInput = new ConsultantSalesDataDto();
                consultantInput.employmentTypeId = consultant.employmentType?.id;
                //  IF employment type is 'Fee only' - id: 10 or 'Recruitment' - id:11 only name is stored
                if (consultant.employmentType?.id === 10 || consultant.employmentType?.id === 11) {
                    consultantInput.nameOnly = consultant.consultantNameOnly;
                } else {
                    consultantInput.consultantId = consultant.consultantName?.id
                    consultantInput.consultant = new ConsultantResultDto();

                    consultantInput.consultant.id = consultant.consultantName?.id
                    consultantInput.consultant.name = consultant.consultantName?.name;
                    consultantInput.consultant.legacyId = consultant.consultantName?.legacyId;
                    consultantInput.consultant.companyName = consultant.consultantName?.companyName;
                    consultantInput.consultant.tenantId = consultant.consultantName?.tenantId;
                    consultantInput.consultant.externalId = consultant.consultantName?.externalId;
                    consultantInput.consultant.city = consultant.consultantName?.city;
                    consultantInput.consultant.countryId = consultant.consultantName?.contryId;

                    consultantInput.startDate = consultant.consultantProjectStartDate;
                    consultantInput.noEndDate = consultant.consultantProjectNoEndDate;
                    consultantInput.endDate = consultant.consultantProjectEndDate;

                    consultantInput.isOnsiteWorkplace = consultant.consultantIsOnsiteWorkplace;
                    consultantInput.onsiteClientId = consultant.consultantWorkplaceClientAddress?.clientId;
                    consultantInput.percentageOnSite = consultant.consultantWorkplacePercentageOnSite;

                    consultantInput.isEmagineOfficeWorkplace = consultant.consultantIsEmagineOfficeWorkplace;
                    consultantInput.emagineOfficeId = consultant.consultantWorkplaceEmagineOffice?.id;

                    consultantInput.isRemoteWorkplace = consultant.consultantIsRemoteWorkplace;
                    consultantInput.remoteAddressCountryId = consultant.consultantWorkplaceRemote?.id;

                    consultantInput.noExpectedWorkload = consultant.noExpectedWorkload;
                    consultantInput.expectedWorkloadHours = consultant.expectedWorkloadHours;
                    consultantInput.expectedWorkloadUnitId = consultant.expectedWorkloadUnitId;
                    consultantInput.consultantTimeReportingCapId = consultant.consultantCapOnTimeReporting?.id;
                    consultantInput.consultantTimeReportingCapMaxValue = consultant.consultantTimeReportingCapMaxValue;
                    consultantInput.pdcPaymentEntityId = consultant.consultantProdataEntity?.id;

                    consultantInput.consultantRate = new ConsultantRateDto();
                    consultantInput.consultantRate.isTimeBasedRate = consultant.consultantPaymentType?.id === 1; // 1: 'Time based';
                    consultantInput.consultantRate.isFixedRate = consultant.consultantPaymentType?.id === 2;  // 2: 'Fixed';
                    consultantInput.consultantRate.normalRate = consultant.consultantRate;
                    consultantInput.consultantRate.currencyId = consultant.consultantRateCurrency?.id;
                    consultantInput.consultantRate.rateUnitTypeId = consultant.consultantRateUnitType?.id;
                    consultantInput.consultantRate.prodataToProdataRate = consultant.consultantPDCRate;
                    consultantInput.consultantRate.prodataToProdataCurrencyId = consultant.consultantPDCRateCurrency?.id;
                    consultantInput.consultantRate.prodataToProdataInvoiceCurrencyId = consultant.prodataToProdataInvoiceCurrencyId;
                    if (consultantInput.consultantRate.isTimeBasedRate) {
                        consultantInput.consultantRate.invoiceFrequencyId = consultant.consultantInvoicingFrequency?.id;
                    }
                    if (consultantInput.consultantRate.isFixedRate) {
                        consultantInput.consultantRate.invoicingTimeId = consultant.consultantInvoicingTime?.id;
                    }
                    consultantInput.consultantRate.manualDate = consultant.manualDate;

                    if (consultant.specialRates.length) {
                        consultantInput.periodConsultantSpecialRates = new Array<PeriodConsultantSpecialRateDto>();
                        for (let rate of consultant.specialRates) {
                            const consultantSpecialRate = new PeriodConsultantSpecialRateDto();
                            consultantSpecialRate.id = rate.id;
                            consultantSpecialRate.clientSpecialRateId = rate.clientSpecialRateId;
                            consultantSpecialRate.rateName = rate.rateName;
                            consultantSpecialRate.rateDirection = rate.rateDirection;
                            consultantSpecialRate.reportingUnit = rate.reportingUnit;
                            consultantSpecialRate.prodataToProdataRate = rate.prodataToProdataRate;
                            consultantSpecialRate.prodataToProdataRateCurrencyId = rate.prodataToProdataRateCurrency?.id;
                            consultantSpecialRate.consultantRate = rate.consultantRate;
                            consultantSpecialRate.consultantRateCurrencyId = rate.consultantRateCurrency?.id;
                            consultantInput.periodConsultantSpecialRates.push(consultantSpecialRate);
                        }
                    } else {
                        consultantInput.noSpecialRate = true;
                    }

                    if (consultant.specialFees.length) {
                        consultantInput.periodConsultantSpecialFees = new Array<PeriodConsultantSpecialFeeDto>();
                        for (let fee of consultant.specialFees) {
                            const consultantSpecialFee = new PeriodConsultantSpecialFeeDto();
                            consultantSpecialFee.id = fee.id;
                            consultantSpecialFee.clientSpecialFeeId = fee.clientSpecialFeeId;
                            consultantSpecialFee.feeName = fee.feeName;
                            consultantSpecialFee.feeDirection = fee.feeDirection;
                            consultantSpecialFee.frequency = fee.frequency;
                            consultantSpecialFee.prodataToProdataRate = fee.prodataToProdataRate;
                            consultantSpecialFee.prodataToProdataRateCurrencyId = fee.prodataToProdataRateCurrency?.id;
                            consultantSpecialFee.consultantRate = fee.consultantRate;
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

                input.consultantSalesData!.push(consultantInput);
            });
        }
        this.showMainSpinner();
        if (isDraft) {
            this._clientPeriodService.clientSalesPut(this.periodId!, input)
                .pipe(finalize(() => {
                    this.hideMainSpinner();
                }))
                .subscribe(result => {
                    this.showNotify(NotifySeverity.Success, 'Saved sales step', 'Okay');
                })
        } else {
            this._clientSalesService.editFinish(this.periodId!, input)
                .pipe(finalize(() => {
                    this.hideMainSpinner();
                }))
                .subscribe(result => {
                    this._workflowDataService.workflowSideSectionUpdated.emit(true);
                })
        }

    }

    getStartChangeOrExtendClientPeriodSales() {
        this.showMainSpinner();
        this._clientPeriodService.clientSalesGet(this.periodId!)
            .pipe(finalize(() => {
                this.hideMainSpinner();
            }))
            .subscribe(result => {
                // Project
                this.salesMainDataForm.projectType?.setValue(this.findItemById(this.projectTypes, result?.salesMainData?.projectTypeId), {emitEvent: false});
                this.salesMainDataForm.salesType?.setValue(this.findItemById(this.saleTypes, result?.salesMainData?.salesTypeId), {emitEvent: false});
                this.salesMainDataForm.deliveryType?.setValue(this.findItemById(this.deliveryTypes, result?.salesMainData?.deliveryTypeId), {emitEvent: false});
                this.salesMainDataForm.projectCategory?.setValue(this.findItemById(this.projectCategories, result?.salesMainData?.projectCategoryId), {emitEvent: false});
                this.salesMainDataForm.margin?.setValue(this.findItemById(this.margins, result?.salesMainData?.marginId), {emitEvent: false});
                this.salesMainDataForm.projectDescription?.setValue(result?.salesMainData?.projectDescription, {emitEvent: false});

                // Invoicing
                result.salesMainData?.commissions?.forEach((commission: CommissionDto) => {
                    this.addCommission(commission);
                })
                this.salesMainDataForm.discounts?.setValue(this.findItemById(this.discounts, result?.salesMainData?.discountId ?? 1), {emitEvent: false}); // 1 - default value 'None'

                // Account Manager
                this.salesMainDataForm.salesAccountManagerIdValue?.setValue(result?.salesMainData?.salesAccountManagerData, {emitEvent: false});
                this.salesMainDataForm.commissionAccountManagerIdValue?.setValue(result?.salesMainData?.commissionAccountManagerData, {emitEvent: false});
                this.contractExpirationNotificationDisplay = this.formatExpirationNotificationsForDisplay(result?.salesMainData?.contractExpirationNotificationIntervalIds);

                if (result?.salesMainData?.customContractExpirationNotificationDate !== null || result?.salesMainData?.customContractExpirationNotificationDate !== undefined) {
                    result?.salesMainData?.contractExpirationNotificationIntervalIds!.push(999);
                }
                this.salesMainDataForm.contractExpirationNotification?.setValue(result?.salesMainData?.contractExpirationNotificationIntervalIds, {emitEvent: false});
                this.salesMainDataForm.customContractExpirationNotificationDate?.setValue(result?.salesMainData?.customContractExpirationNotificationDate, {emitEvent: false});
                this.salesMainDataForm.remarks?.setValue(result?.salesMainData?.remarks, {emitEvent: false});
                this.salesMainDataForm.noRemarks?.setValue(result?.salesMainData?.noRemarks, {emitEVent: false});
                if (result?.salesMainData?.noRemarks) {
                    this.salesMainDataForm.remarks?.disable({emitEvent: false});
                }

                // Client
                this.salesClientDataForm.differentEndClient?.setValue(result.salesClientData?.differentEndClient ?? false, {emitEvent: false}); // default value if false
                this.salesClientDataForm.directClientIdValue?.setValue(result?.salesClientData?.directClient, {emitEvent: false});
                if (result?.salesClientData?.directClient?.clientId) {
                    this.getRatesAndFees(result?.salesClientData?.directClient?.clientId);
                }
                this.salesClientDataForm.endClientIdValue?.setValue(result?.salesClientData?.endClient, {emitEvent: false});
                //Duration
                this.salesClientDataForm.clientContractStartDate?.setValue(result?.startDate, {emitEvent: false});
                this.salesClientDataForm.clientContractEndDate?.setValue(result?.endDate, {emitEvent: false});
                this.salesClientDataForm.clientContractNoEndDate?.setValue(result?.noEndDate, {emitEvent: false});
                if (result?.noEndDate) {
                    this.salesClientDataForm.clientContractEndDate?.disable({emitEvent: false});
                }
                this.salesClientDataForm.noClientExtensionOption?.setValue(result?.salesClientData?.noClientExtensionOption ?? true, {emitEvent: false}); // no topion - default value
                this.salesClientDataForm.clientExtensionDuration?.setValue(this.findItemById(this.clientExtensionDurations, result?.salesClientData?.clientExtensionDurationId), {emitEvent: false});
                this.salesClientDataForm.clientExtensionDeadline?.setValue(this.findItemById(this.clientExtensionDeadlines, result?.salesClientData?.clientExtensionDeadlineId), {emitEvent: false});
                // Project
                this.salesClientDataForm.capOnTimeReporting?.setValue(result?.salesClientData?.clientTimeReportingCapId ?? 1, {emitEvent: false}); // default idValue = 1
                this.salesClientDataForm.capOnTimeReportingValue?.setValue(result?.salesClientData?.clientTimeReportingCapMaxValue, {emitEvent: false});
                // Invoicing
                this.salesClientDataForm.pdcInvoicingEntityId?.setValue(this.findItemById(this.tenants, result?.salesClientData?.pdcInvoicingEntityId), {emitEvent: false});
                let clientRateType = this.findItemById(this.clientRateTypes, 2); // default value is 'fixed'
                if (result.salesClientData?.clientRate?.isFixedRate) {
                    clientRateType = this.findItemById(this.clientRateTypes, 2); // 2: 'Fixed'
                } else if (result.salesClientData?.clientRate?.isTimeBasedRate) {
                    clientRateType = this.findItemById(this.clientRateTypes, 1); // 1: 'Time based'
                }
                this.salesClientDataForm.clientRateAndInvoicing?.setValue(clientRateType, {emitEVent: false});

                this.salesClientDataForm.clientPrice?.setValue(result.salesClientData?.clientRate?.normalRate, {emitEVent: false});
                this.salesClientDataForm.rateUnitTypeId?.setValue(result.salesClientData?.clientRate?.rateUnitTypeId, {emitEVent: false});
                this.salesClientDataForm.clientCurrency?.setValue(result.salesClientData?.clientRate?.currencyId, {emitEVent: false});
                this.salesClientDataForm.clientInvoiceCurrency?.setValue(result.salesClientData?.clientRate?.invoiceCurrencyId, {emitEVent: false});
                if (this.salesClientDataForm.clientRateAndInvoicing?.value?.id === 1) { // Time based
                    this.salesClientDataForm.clientInvoiceFrequency?.setValue(this.findItemById(this.invoiceFrequencies, result.salesClientData?.clientRate?.invoiceFrequencyId), {emitEVent: false});
                }
                if (this.salesClientDataForm.clientRateAndInvoicing?.value?.id === 2) { // Fixed
                    this.salesClientDataForm.clientInvoiceFrequency?.setValue(this.findItemById(this.invoicingTimes, result.salesClientData?.clientRate?.invoicingTimeId), {emitEVent: false});
                }
                this.salesClientDataForm.clientInvoicingDate?.setValue(result.salesClientData?.clientRate?.manualDate, {emitEVent: false});

                this.salesClientDataForm.invoicingReferenceNumber?.setValue(result.salesClientData?.invoicingReferenceNumber, {emitEVent: false});
                this.salesClientDataForm.clientInvoicingRecipientIdValue?.setValue(result.salesClientData?.clientInvoicingRecipient, {emitEVent: false});
                this.salesClientDataForm.clientInvoicingRecipientSameAsDirectClient?.setValue(result?.salesClientData?.clientInvoicingRecipientSameAsDirectClient, {emitEvent: false});
                if (result?.salesClientData?.clientInvoicingRecipientSameAsDirectClient) {
                    this.salesClientDataForm.clientInvoicingRecipientIdValue?.disable({emitEvent: false});
                }
                this.salesClientDataForm.invoicingReferencePersonIdValue?.setValue(result?.salesClientData?.invoicingReferencePerson, {emitEvent: false});
                this.salesClientDataForm.noInvoicingReferencePerson?.setValue(result?.salesClientData?.noInvoicingReferencePerson, {emitEvent: false});
                if (result?.salesClientData?.noInvoicingReferencePerson) {
                    this.salesClientDataForm.invoicingReferencePersonIdValue?.disable({emitEvent: false});
                }

                // Rates & Fees
                result.salesClientData?.periodClientSpecialRates?.forEach((specialRate: PeriodClientSpecialRateDto) => {
                    this.addSpecialRate(specialRate);
                });

                result.salesClientData?.periodClientSpecialFees?.forEach((specialFee: PeriodClientSpecialFeeDto) => {
                    this.addClientFee(specialFee);
                });

                // Evaluations
                this.salesClientDataForm.evaluationsReferencePersonIdValue?.setValue(result?.salesClientData?.evaluationsReferencePerson, {emitEvent: false});
                this.salesClientDataForm.evaluationsDisabled?.setValue(result?.salesClientData?.evaluationsDisabled ?? false, {emitEvent: false}); // enabled - defalut value
                this.salesClientDataForm.evaluationsDisabledReason?.setValue(result?.salesClientData?.evaluationsDisabledReason, {emitEvent: false});
                // Contract
                this.salesClientDataForm.noSpecialContractTerms?.setValue(result?.salesClientData?.noSpecialContractTerms, {emitEvent: false});
                this.salesClientDataForm.specialContractTerms?.setValue(result?.salesClientData?.specialContractTerms, {emitEvent: false});
                if (result?.salesClientData?.noSpecialContractTerms) {
                    this.salesClientDataForm.specialContractTerms?.disable();
                }
                result?.salesClientData?.contractSigners?.forEach((signer: ContractSignerDto) => {
                    this.addSignerToForm(signer);
                });

                // Consultant
                if (result.consultantSalesData?.length) {
                    result.consultantSalesData?.forEach(consultant => {
                        this.addConsultantForm(consultant);
                    });
                }
            });
    }

    clientRateTypeChange(value: EnumEntityTypeDto) {
        if (value) {
            this.salesClientDataForm.rateUnitTypeId?.setValue(null, {emitEvent: false});
            this.salesClientDataForm.clientPrice?.setValue(null, {emitEvent: false});
            this.salesClientDataForm.clientCurrency?.setValue(null, {emitEvent: false});
        }
    }

    salesTypeChange(value: EnumEntityTypeDto) {
        if (value.id === 3) { // Managed Service
            const itemToPreselct = this.deliveryTypes.find(x => x.id === 1); // Managed Service
            this.salesMainDataForm.deliveryType?.setValue(itemToPreselct, {emitEvent: false});
        }
    }

    //#region Consultant menu actions
    changeConsultantData(index: number) {
        const consultantData = this.consultantsForm.consultantData.at(index).value;
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
            let input = new ChangeConsultantPeriodDto();
            input.cutoverDate = result.cutoverDate;
            input.newLegalContractRequired = result.newLegalContractRequired;
            this._consultantPeriodSerivce.change(consultantData.consultantPeriodId, input)
                .pipe(finalize(() => {}))
                .subscribe(result => {
                    this._workflowDataService.workflowSideSectionAdded.emit(true);
                });
        });

        dialogRef.componentInstance.onRejected.subscribe(() => {
            // nthng
        });
    }

    extendConsultant(index: number) {
        const consultantData = this.consultantsForm.consultantData.at(index).value;
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
            let input = new ExtendConsultantPeriodDto();
            input.startDate = result.startDate;
            input.endDate = result.endDate;
            input.noEndDate = result.noEndDate;
            this._consultantPeriodSerivce.extend(consultantData.consultantPeriodId, input)
                .pipe(finalize(() => {}))
                .subscribe(result => {
                    this._workflowDataService.workflowSideSectionAdded.emit(true);
                });
            this._workflowDataService.workflowSideSectionAdded.emit(true);
        });

        dialogRef.componentInstance.onRejected.subscribe(() => {
            // nthng
        });
    }

    //#endregion Consultant menu actions

    //#region commissions form array
    commissionRecipientTypeChanged(event: MatSelectChange, index: number) {
        this.commissions.at(index).get('recipient')?.setValue(null, {emitEvent: false});
        this.filteredRecipients = [];
    }

    addCommission(commission?: CommissionDto) {
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
                commissionRecipient = this.findItemById(this.tenants, commission.tenantId);
                break;
        }
        const form = this._fb.group({
            id: new FormControl(commission?.id ?? null),
            type: new FormControl(this.findItemById(this.commissionTypes, commission?.commissionTypeId) ?? null),
            value: new FormControl(commission?.amount ?? null),
            currency: new FormControl(this.findItemById(this.currencies, commission?.currencyId) ?? null),
            recipientType: new FormControl(this.findItemById(this.commissionRecipientTypeList, commission?.recipientTypeId) ?? null),
            recipient: new FormControl(commissionRecipient ?? null),
            frequency: new FormControl(this.findItemById(this.commissionFrequencies, commission?.commissionFrequencyId) ?? null),
            oneTimeDate: new FormControl(commission?.oneTimeDate ?? null),
            editable: new FormControl(commission?.id ? false : true)
        });
        this.salesMainDataForm.commissions.push(form);
        this.manageCommissionAutocomplete(this.salesMainDataForm.commissions.length - 1);
    }

    manageCommissionAutocomplete(commissionIndex: number) {
        let arrayControl = this.salesMainDataForm.commissions.at(commissionIndex);
        arrayControl!.get('recipient')!.valueChanges
            .pipe(
                takeUntil(this._unsubscribe),
                debounceTime(300),
                switchMap((value: any) => {
                    let toSend = {
                        name: value,
                        maxRecordsCount: 1000,
                    };
                    switch (arrayControl.value.recipientType.id) {
                        case 3: // Client
                            if (value?.id) {
                                toSend.name = value.id
                                    ? value.clientName
                                    : value;
                            }
                            return this._lookupService.clients(toSend.name, toSend.maxRecordsCount);
                        case 2: // Consultant
                            if (value?.id) {
                                toSend.name = value.id
                                    ? value.name
                                    : value;
                            }
                            return this._lookupService.consultants(toSend.name, toSend.maxRecordsCount);
                        case 1: // Supplier
                            if (value?.id) {
                                toSend.name = value.id
                                    ? value.supplierName
                                    : value;
                            }
                            return this._lookupService.suppliers(toSend.name, toSend.maxRecordsCount);
                        default:
                            return of([]);
                    }
                }),
            ).subscribe((list: any[]) => {
                if (list.length) {
                    this.filteredRecipients = list;
                } else {
                    this.filteredRecipients = [{ name: 'No records found', id: 'no-data' }];
                }
            });
    }

    get commissions() {
        return this.salesMainDataForm.commissions as FormArray;
    }

    removeCommission(index: number) {
        this.commissions.removeAt(index);
    }

    toggleEditCommissionRow(index: number) {
        const isEditable = this.commissions.at(index).get('editable')?.value;
        this.commissions.at(index).get('editable')?.setValue(!isEditable);
    }

    //#endregion commissions form array

    //#region termination

    getWorkflowSalesStepConsultantTermination() {
        this._workflowServiceProxy.terminationConsultantSalesGet(this.workflowId!, this.consultantId!)
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                // End of Consultant Contract
                this.salesTerminateConsultantForm.terminationTime?.setValue(result?.terminationTime, {emitEvent: false});
                this.salesTerminateConsultantForm.endDate?.setValue(result?.endDate, {emitEvent: false});
                this.salesTerminateConsultantForm.terminationReason?.setValue(result?.terminationReason, {emitEvent: false}); // add findItemById function
                this.salesTerminateConsultantForm.causeOfNonStandardTerminationTime?.setValue(result?.causeOfNonStandardTerminationTime, {emitEvent: false});
                this.salesTerminateConsultantForm.additionalComments?.setValue(result?.additionalComments, {emitEvent: false});

                //Final Evaluation
                this.salesTerminateConsultantForm.finalEvaluationReferencePerson?.setValue(result?.finalEvaluationReferencePerson, {emitEvent: false}); // add findItemById function
                this.salesTerminateConsultantForm.noEvaluation?.setValue(result?.noEvaluation, {emitEvent: false});
                this.salesTerminateConsultantForm.causeOfNoEvaluation?.setValue(result?.causeOfNoEvaluation, {emitEvent: false});

                // example with findItemById
                // this.salesMainDataForm.projectType?.setValue(this.findItemById(this.projectTypes, result?.salesMainData?.projectTypeId), {emitEvent: false});
            });
    }

    saveTerminationConsultantSalesStep(isDraft: boolean) {
        let input = new ConsultantTerminationSalesDataCommandDto();
        input.terminationTime =  this.salesTerminateConsultantForm?.terminationTime?.value;
        input.endDate = this.salesTerminateConsultantForm?.endDate?.value;
        input.terminationReason = +this.salesTerminateConsultantForm?.terminationReason?.value;
        input.causeOfNonStandardTerminationTime = this.salesTerminateConsultantForm?.causeOfNonStandardTerminationTime?.value;
        input.additionalComments = this.salesTerminateConsultantForm?.additionalComments?.value;

        input.finalEvaluationReferencePersonId = this.salesTerminateConsultantForm?.finalEvaluationReferencePerson?.value.id; // FIXME: fix after be changes add .id
        input.noEvaluation = this.salesTerminateConsultantForm?.noEvaluation?.value;
        input.causeOfNoEvaluation =  this.salesTerminateConsultantForm.causeOfNoEvaluation?.value;

        this.showMainSpinner();
        if (isDraft) {
            this._workflowServiceProxy.terminationConsultantSalesPut(this.workflowId!, this.consultantId, input)
                .pipe(finalize(() => this.hideMainSpinner()))
                .subscribe(result => {
    
                })
        } else {
            this._workflowServiceProxy.terminationConsultantSalesComplete(this.workflowId!, this.consultantId, input)
            .pipe(finalize(() => this.hideMainSpinner()))
            .subscribe(result => {
                this._workflowDataService.workflowSideSectionUpdated.emit(true);
            })
        }
    }

    getWorkflowSalesStepTermination() {
        this._workflowServiceProxy.terminationSalesGet(this.workflowId!)
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                // End of Consultant Contract
                this.salesTerminateConsultantForm.terminationTime?.setValue(result?.terminationTime, {emitEvent: false});
                this.salesTerminateConsultantForm.endDate?.setValue(result?.endDate, {emitEvent: false});
                this.salesTerminateConsultantForm.terminationReason?.setValue(result?.terminationReason, {emitEvent: false}); // add findItemById function
                this.salesTerminateConsultantForm.causeOfNonStandardTerminationTime?.setValue(result?.causeOfNonStandardTerminationTime, {emitEvent: false});
                this.salesTerminateConsultantForm.additionalComments?.setValue(result?.additionalComments, {emitEvent: false});

                //Final Evaluation
                this.clientIdFromTerminationSales = result.clientId!;
                this.salesTerminateConsultantForm.finalEvaluationReferencePerson?.setValue(result?.finalEvaluationReferencePerson, {emitEvent: false}); // add findItemById function
                this.salesTerminateConsultantForm.noEvaluation?.setValue(result?.noEvaluation, {emitEvent: false});
                this.salesTerminateConsultantForm.causeOfNoEvaluation?.setValue(result?.causeOfNoEvaluation, {emitEvent: false});

                // example with findItemById
                // this.salesMainDataForm.projectType?.setValue(this.findItemById(this.projectTypes, result?.salesMainData?.projectTypeId), {emitEvent: false});
            });
    }

    saveWorkflowTerminationSalesStep(isDraft: boolean) {
        let input = new WorkflowTerminationSalesDataCommandDto();
        input.terminationTime =  this.salesTerminateConsultantForm?.terminationTime?.value;
        input.endDate = this.salesTerminateConsultantForm?.endDate?.value;
        input.terminationReason = +this.salesTerminateConsultantForm?.terminationReason?.value;
        input.causeOfNonStandardTerminationTime = this.salesTerminateConsultantForm?.causeOfNonStandardTerminationTime?.value;
        input.additionalComments = this.salesTerminateConsultantForm?.additionalComments?.value;

        input.finalEvaluationReferencePersonId = this.salesTerminateConsultantForm?.finalEvaluationReferencePerson?.value.id; // FIXME: fix after be changes add .id
        input.noEvaluation = this.salesTerminateConsultantForm?.noEvaluation?.value;
        input.causeOfNoEvaluation =  this.salesTerminateConsultantForm.causeOfNoEvaluation?.value;
        this.showMainSpinner();
        if (isDraft) {
            this._workflowServiceProxy.terminationSalesPut(this.workflowId!, input)
                .pipe(finalize(() => this.showMainSpinner()))
                .subscribe(result => {
    
                })
        } else {
            this._workflowServiceProxy.terminationSalesComplete(this.workflowId!, input)
            .pipe(finalize(() => this.showMainSpinner()))
            .subscribe(result => {
                this._workflowDataService.workflowSideSectionUpdated.emit(true);
            })
        }
    }

    terminateConsultant(index: number) {
        this.consultantInformation = this.consultantsForm.consultantData.at(index).value.consultantName;

        console.log('terminate consultant ',  this.consultantInformation.id);
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
                confirmationMessageTitle: `Are you sure you want to terminate consultant ${this.consultantInformation?.name ?? ''}?`,
                // confirmationMessage: 'When you confirm the termination, all the info contained inside this block will disappear.',
                rejectButtonText: 'Cancel',
                confirmButtonText: 'Terminate',
                isNegative: true
            }
        });

        dialogRef.componentInstance.onConfirmed.subscribe(() => {
            this.terminateConsultantStart(this.consultantInformation?.id!);
        });

        dialogRef.componentInstance.onRejected.subscribe(() => {
            // nthng
        });
    }

    terminateConsultantStart(index: number) {
        this._workflowServiceProxy.terminationConsultantStart(this.workflowId!, index)
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this._workflowDataService.workflowSideSectionAdded.emit(true);
            });
    }

    //#endregion termination

    detectActiveSideSection() {
        switch (this._workflowDataService.getWorkflowProgress.currentlyActiveSideSection) {
            // Client period
            case WorkflowProcessType.StartClientPeriod:
            case WorkflowProcessType.ExtendClientPeriod:
            case WorkflowProcessType.ChangeClientPeriod:
                this.getStartChangeOrExtendClientPeriodSales();
                break;
            case WorkflowProcessType.TerminateWorkflow:
                this.getWorkflowSalesStepTermination();
                break;
            // Consultant period
            case WorkflowProcessType.StartConsultantPeriod:
            case WorkflowProcessType.ExtendConsultantPeriod:
            case WorkflowProcessType.ChangeConsultantPeriod:
                this.getStartChangeOrExtendConsutlantPeriodSales();
                break;
            case WorkflowProcessType.TerminateConsultant:
                this.getWorkflowSalesStepConsultantTermination();
                break;
        }
    }

    getStartChangeOrExtendConsutlantPeriodSales() {
        this._consultantPeriodSerivce.consultantSalesGet(this.periodId!)
            .pipe(finalize(() => {}))
            .subscribe(result => {
                this.resetForms();
                this.salesMainDataForm.remarks?.setValue(result?.remarks, {emitEvent: false});
                this.salesMainDataForm.noRemarks?.setValue(result?.noRemarks, {emitEvent: false});
                if (result?.noRemarks) {
                    this.salesMainDataForm.remarks?.disable();
                }
                this.salesMainDataForm.projectDescription?.setValue(result?.projectDescription, {emitEvent: false});
                this.addConsultantForm(result?.consultantSalesData);
            });
    }

    saveStartChangeOrExtendConsultantPeriodSales(isDraft: boolean) {
        let input = new ConsultantPeriodSalesDataDto();
        input.remarks = this.salesMainDataForm.remarks?.value;
        input.noRemarks = this.salesMainDataForm.noRemarks?.value;
        input.projectDescription = this.salesMainDataForm.projectDescription?.value;
        input.consultantSalesData = new ConsultantSalesDataDto();
        let consultantInput = new ConsultantSalesDataDto();
        const consultant = this.consultantsForm.consultantData.at(0).value;
        consultantInput.employmentTypeId = consultant.employmentType?.id;
        //  IF employment type is 'Fee only' - id: 10 or 'Recruitment' - id:11 only name is stored
        if (consultant.employmentType?.id === 10 || consultant.employmentType?.id === 11) {
            consultantInput.nameOnly = consultant.consultantNameOnly;
        } else {
            consultantInput.consultantId = consultant.consultantName?.id
            consultantInput.consultant = new ConsultantResultDto();

            consultantInput.consultant.id = consultant.consultantName?.id
            consultantInput.consultant.name = consultant.consultantName?.name;
            consultantInput.consultant.legacyId = consultant.consultantName?.legacyId;
            consultantInput.consultant.companyName = consultant.consultantName?.companyName;
            consultantInput.consultant.tenantId = consultant.consultantName?.tenantId;
            consultantInput.consultant.externalId = consultant.consultantName?.externalId;
            consultantInput.consultant.city = consultant.consultantName?.city;
            consultantInput.consultant.countryId = consultant.consultantName?.contryId;

            consultantInput.startDate = consultant.consultantProjectStartDate;
            consultantInput.noEndDate = consultant.consultantProjectNoEndDate;
            consultantInput.endDate = consultant.consultantProjectEndDate;

            consultantInput.isOnsiteWorkplace = consultant.consultantIsOnsiteWorkplace;
            consultantInput.onsiteClientId = consultant.consultantWorkplaceClientAddress?.clientId;
            consultantInput.percentageOnSite = consultant.consultantWorkplacePercentageOnSite;

            consultantInput.isEmagineOfficeWorkplace = consultant.consultantIsEmagineOfficeWorkplace;
            consultantInput.emagineOfficeId = consultant.consultantWorkplaceEmagineOffice?.id;

            consultantInput.isRemoteWorkplace = consultant.consultantIsRemoteWorkplace;
            consultantInput.remoteAddressCountryId = consultant.consultantWorkplaceRemote?.id;

            consultantInput.noExpectedWorkload = consultant.noExpectedWorkload;
            consultantInput.expectedWorkloadHours = consultant.expectedWorkloadHours;
            consultantInput.expectedWorkloadUnitId = consultant.expectedWorkloadUnitId;
            consultantInput.consultantTimeReportingCapId = consultant.consultantCapOnTimeReporting?.id;
            consultantInput.consultantTimeReportingCapMaxValue = consultant.consultantTimeReportingCapMaxValue;
            consultantInput.pdcPaymentEntityId = consultant.consultantProdataEntity?.id;

            consultantInput.consultantRate = new ConsultantRateDto();
            consultantInput.consultantRate.isTimeBasedRate = consultant.consultantPaymentType?.id === 1; // 1: 'Time based';
            consultantInput.consultantRate.isFixedRate = consultant.consultantPaymentType?.id === 2;  // 2: 'Fixed';
            consultantInput.consultantRate.normalRate = consultant.consultantRate;
            consultantInput.consultantRate.currencyId = consultant.consultantRateCurrency?.id;
            consultantInput.consultantRate.rateUnitTypeId = consultant.consultantRateUnitType?.id;
            consultantInput.consultantRate.prodataToProdataRate = consultant.consultantPDCRate;
            consultantInput.consultantRate.prodataToProdataCurrencyId = consultant.consultantPDCRateCurrency?.id;
            consultantInput.consultantRate.prodataToProdataInvoiceCurrencyId = consultant.prodataToProdataInvoiceCurrencyId;
            if (consultantInput.consultantRate.isTimeBasedRate) {
                consultantInput.consultantRate.invoiceFrequencyId = consultant.consultantInvoicingFrequency?.id;
            }
            if (consultantInput.consultantRate.isFixedRate) {
                consultantInput.consultantRate.invoicingTimeId = consultant.consultantInvoicingTime?.id;
            }
            consultantInput.consultantRate.manualDate = consultant.manualDate;

            if (consultant.specialRates.length) {
                consultantInput.periodConsultantSpecialRates = new Array<PeriodConsultantSpecialRateDto>();
                for (let rate of consultant.specialRates) {
                    const consultantSpecialRate = new PeriodConsultantSpecialRateDto();
                    consultantSpecialRate.id = rate.id;
                    consultantSpecialRate.clientSpecialRateId = rate.clientSpecialRateId;
                    consultantSpecialRate.rateName = rate.rateName;
                    consultantSpecialRate.rateDirection = rate.rateDirection;
                    consultantSpecialRate.reportingUnit = rate.reportingUnit;
                    consultantSpecialRate.prodataToProdataRate = rate.prodataToProdataRate;
                    consultantSpecialRate.prodataToProdataRateCurrencyId = rate.prodataToProdataRateCurrency?.id;
                    consultantSpecialRate.consultantRate = rate.consultantRate;
                    consultantSpecialRate.consultantRateCurrencyId = rate.consultantRateCurrency?.id;
                    consultantInput.periodConsultantSpecialRates.push(consultantSpecialRate);
                }
            } else {
                consultantInput.noSpecialRate = true;
            }

            if (consultant.specialFees.length) {
                consultantInput.periodConsultantSpecialFees = new Array<PeriodConsultantSpecialFeeDto>();
                for (let fee of consultant.specialFees) {
                    const consultantSpecialFee = new PeriodConsultantSpecialFeeDto();
                    consultantSpecialFee.id = fee.id;
                    consultantSpecialFee.clientSpecialFeeId = fee.clientSpecialFeeId;
                    consultantSpecialFee.feeName = fee.feeName;
                    consultantSpecialFee.feeDirection = fee.feeDirection;
                    consultantSpecialFee.frequency = fee.frequency;
                    consultantSpecialFee.prodataToProdataRate = fee.prodataToProdataRate;
                    consultantSpecialFee.prodataToProdataRateCurrencyId = fee.prodataToProdataRateCurrency?.id;
                    consultantSpecialFee.consultantRate = fee.consultantRate;
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
        input.consultantSalesData = consultantInput;
        this.showMainSpinner();
        if (isDraft) {
            this._consultantPeriodSerivce.consultantSalesPut(this.periodId!, input)
                .pipe(finalize(() => this.hideMainSpinner()))
                .subscribe(result => {

                });
        } else {
            this._consultantSalesSerivce.editFinish(this.periodId!, input)
                .pipe(finalize(() => this.hideMainSpinner()))
                .subscribe(result => {
                    this._workflowDataService.workflowSideSectionUpdated.emit(true);
                });
        }
    }

    resetForms() {
        this.salesMainDataForm.reset('', {emitEvent: false});
        this.salesClientDataForm.reset('', {emitEvent: false});
        this.consultantsForm.consultantData.controls = [];
    }

    //#region formatting

    compareWithFn(listOfItems: any, selectedItem: any) {
        return listOfItems && selectedItem && listOfItems.id === selectedItem.id;;
    }

    displayNameFn(option: any) {
        return option?.name;
    }

    displayPublicNameFn(option: any) {
        return option?.publicName;
    }

    displayClientNameFn(option: any) {
        return option?.clientName?.trim();
    }

    displayRecipient(recipientTypeName: string) {
        if (recipientTypeName === 'Client') {
            return
        }
    }

    displayRecipientFn(option: any) {
        if (option?.name) {
            return option?.name;
        } else if (option?.clientName) {
            return option?.clientName;
        } else if (option?.supplierName) {
            return option?.supplierName;
        }
    }

    displayFullNameFn(option: any) {
        return option ? option?.firstName + ' ' + option?.lastName : '';
    }

    getTenantCodeFromId(tenantId: number) {
        const tenant = TenantList.find(x => x.id === tenantId);
        return tenant?.code;
    }

    formatExpirationNotificationsForDisplay(data: number[] | undefined): string {
        let contractExpirationNotificationDisplay: any[] = [];
        if (data?.length) {
            contractExpirationNotificationDisplay = data?.map(x => this.findItemById(this.contractExpirationNotificationDuration, x));
            return contractExpirationNotificationDisplay?.length ? this.mapListByProperty(contractExpirationNotificationDisplay, 'name') : '-';
        } else {
            return '-';
        }
    }
    //#endregion formatting


}
