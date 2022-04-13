import { Overlay } from '@angular/cdk/overlay';
import { Component, Injector, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { ActivatedRoute } from '@angular/router';
import { of, Subject } from 'rxjs';
import { debounceTime, finalize, switchMap, takeUntil } from 'rxjs/operators';
import { InternalLookupService } from 'src/app/shared/common/internal-lookup.service';
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { AppComopnentBase } from 'src/shared/app-component-base';
import { ClientPeriodSalesDataDto, ClientPeriodServiceProxy, ClientRateDto, CommissionDto, ConsultantRateDto, ConsultantSalesDataDto, ContractSignerDto, EmployeeDto, EnumEntityTypeDto, EnumServiceProxy, LookupServiceProxy, PeriodClientSpecialFeeDto, PeriodClientSpecialRateDto, SalesClientDataDto, SalesMainDataDto, WorkflowProcessType, WorkflowServiceProxy, ConsultantResultDto, ClientResultDto, ContactResultDto, ConsultantTerminationSalesDataCommandDto, WorkflowTerminationSalesDataCommandDto } from 'src/shared/service-proxies/service-proxies';
import { WorkflowConsultantActionsDialogComponent } from '../workflow-consultant-actions-dialog/workflow-consultant-actions-dialog.component';
import { WorkflowDataService } from '../workflow-data.service';
import { ConsultantTypes } from '../workflow.model';
import { ConsultantDiallogAction, InputReadonlyStates, SalesTerminateConsultantForm, TenantList, WorkflowSalesAdditionalDataForm, WorkflowSalesClientDataForm, WorkflowSalesConsultantsForm, WorkflowSalesMainForm } from './workflow-sales.model';
@Component({
    selector: 'app-workflow-sales',
    templateUrl: './workflow-sales.component.html',
    styleUrls: ['./workflow-sales.component.scss']
})
export class WorkflowSalesComponent extends AppComopnentBase implements OnInit {
    @Input() workflowId: string;
    @Input() clientPeriodId: string | undefined;
    // Changed all above to enum
    @Input() activeSideSection: number;
    @Input() isCompleted: boolean;

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
    nonStandartTerminationTimes: { [key: string]: string; };

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
    consultantTypes = ConsultantTypes;

    filteredAccountManagers: any[] = [];
    filteredSalesAccountManagers: any[] = [];
    filteredCommisionAccountManagers: any[] = [];
    filteredDirectClients: any[] = [];
    filteredEndClients: any[] = []
    filteredConsultants: any[] = [];
    filteredRecipients: any[] = [];
    filteredReferencePersons: any[] = [];
    filteredClientInvoicingRecipients: any[] = [];
    private _unsubscribe = new Subject();

    // Read-onluy state for inputs
    readonlyInput = InputReadonlyStates;
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
        private _workflowServiceProxy: WorkflowServiceProxy
    ) {
        super(injector);
        this.salesClientDataForm = new WorkflowSalesClientDataForm();
        this.salesMainDataForm = new WorkflowSalesMainForm();
        this.consultantsForm = new WorkflowSalesConsultantsForm();
        this.additionalDataForm = new WorkflowSalesAdditionalDataForm();
        this.salesTerminateConsultantForm = new SalesTerminateConsultantForm();

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
                    console.log('s');
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
                    console.log('s2');
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
                        clientId: undefined,
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
                    this.filteredReferencePersons = [{ firstName: 'No records found', id: 'no-data' }];
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
    }

    manageManagerAutocomplete(consultantIndex: number) {
        let arrayControl = this.consultantsForm.consultantData.at(consultantIndex);
        arrayControl!.get('consultantAccountManager')!.valueChanges
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

    ngOnInit(): void {
        this.activatedRoute.paramMap.pipe(
            takeUntil(this._unsubscribe)
        ).subscribe(params => {
            this.workflowId = params.get('id')!;
        });
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

        // init form arrays ?
        // this.addSignerToForm();
        // this.addConsultantForm();

        this.getWorkflowSalesStep();

        this._workflowDataService.workflowSalesSaved
            .pipe(takeUntil(this._unsubscribe))
            .subscribe((value: boolean) => {
                // NB: boolean SAVE DRAFT or COMPLETE in future
                this.saveSalesStep();
            });

        // this.updateReadonlyState();

        // Termination
        this._workflowDataService.workflowConsultantTerminationSalesSaved
            .pipe(takeUntil(this._unsubscribe))
            .subscribe((value: boolean) => {
                this.updateTerminationConsultantSalesStep();
            });

        this._workflowDataService.workflowConsultantTerminationSalesCompleted
            .pipe(takeUntil(this._unsubscribe))
            .subscribe((value: boolean) => {
                this.completeTerminationConsultantSalesStep();
            });

        this._workflowDataService.workflowTerminationSalesSaved
            .pipe(takeUntil(this._unsubscribe))
            .subscribe((value: boolean) => {
                this.updateTerminationSalesStep();
            });

        this._workflowDataService.workflowTerminationSalesCompleted
            .pipe(takeUntil(this._unsubscribe))
            .subscribe((value: boolean) => {
                this.completeTerminationSalesStep();
            });

        this._workflowDataService.workflowSideSectionChanged
            .pipe(takeUntil(this._unsubscribe))
            .subscribe((value: boolean) => {
                //TODO: add all side sections
                this.detectActiveSideSection();
            });

        this.detectActiveSideSection();
    }

    get readOnlyMode() {
        return this.isCompleted;
    }

    // updateReadonlyState() {
    //     // detect if WF Completed
    //     // then all inputs are readonly
    //     if (this._workflowDataService.getWorkflowProgress.isPrimaryWorkflowCompleted) {
    //         this.readonlyInput.forEach(item => {
    //             item.readonly = true;
    //         });
    //         // this.updateReadonlyState();
    //     }
    //     // else if extensions disable only needed controls
    //     // const controlsToDisable = ['salesType', 'deliveryType', ...];
    // }

    // isReadonlyInput(controlName: string): boolean {
    //     const controlToDetect = this.readonlyInput.find(x => x.name === controlName);
    //     return controlToDetect ? controlToDetect.readonly : false;
    // }

    changeReadonly() {
        this.readonlyInput.forEach(item => {
            item.readonly = !item.readonly;
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

    getNonStandartTerminationTimes() {
        this._internalLookupService.getNonStandartTerminationTimes()
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.nonStandartTerminationTimes = result;
            });
    }

    //#endregion dataFetch

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
            clientName: new FormControl(null),
            clientRole: new FormControl(null),
            clientSequence: new FormControl(null)
        });
        this.salesClientDataForm.contractSigners.push(form);
    }

    get contractSigners(): FormArray {
        return this.salesClientDataForm.get('contractSigners') as FormArray;
    }

    removeSigner(index: number) {
        this.contractSigners.removeAt(index);
    }

    addConsultantForm(consultant?: ConsultantSalesDataDto) {
        const form = this._fb.group({
            consultantType: new FormControl(consultant?.employmentTypeId ?? null),
            consultantName: new FormControl(consultant?.consultant ?? null),

            consultantProjectDurationSameAsClient: new FormControl(true),
            consultantProjectStartDate: new FormControl(consultant?.startDate ?? null),
            consultantProjectEndDate: new FormControl({value: consultant?.endDate ?? null, disabled: consultant?.noEndDate}),
            consultantProjectNoEndDate: new FormControl(consultant?.noEndDate ?? false),

            consultantWorkplace: new FormControl(null),
            consultantWorkplaceCliendAddress: new FormControl(consultant?.onsiteClientId ?? null),
            consultantWorkplaceEmagineOffice: new FormControl(consultant?.emagineOfficeId ?? null),
            consultantWorkplaceRemote: new FormControl(consultant?.remoteAddressCountryId ?? null),
            consultantWorkplacePercentageOnSite: new FormControl(consultant?.percentageOnSite ?? null),

            consultantIsOnsiteWorkplace: new FormControl(consultant?.isOnsiteWorkplace ?? false),
            consultantIsEmagineOfficeWorkplace: new FormControl(consultant?.isEmagineOfficeWorkplace ?? false),
            consultantIsRemoteWorkplace: new FormControl(consultant?.isRemoteWorkplace ?? false),

            consultantExpectedWorkloadHours: new FormControl(null), // ?
            consultantExpectedWorkloadPeriod: new FormControl(null),
            consultantCapOnTimeReporting: new FormControl('No cap'), // ?? default value = no cap
            consultantCapOnTimeReportingValue: new FormControl(null),
            consultantCapOnTimeReportingCurrency: new FormControl(null), // remove
            consultantProdataEntity: new FormControl(consultant?.pdcPaymentEntityId ?? null),
            consultantPaymentType: new FormControl(consultant?.consultantRate?.isTimeBasedRate ? 'Time based' : 'Fixed'),
            consultantRate: new FormControl(consultant?.consultantRate?.normalRate ?? null),
            consultantRateUnitType: new FormControl(this.findItemById(this.rateUnitTypes, consultant?.consultantRate?.rateUnitTypeId) ?? null),
            consultantRateCurrency: new FormControl(this.findItemById(this.currencies, consultant?.consultantRate?.currencyId) ?? null),
            consultantPDCRate: new FormControl(consultant?.consultantRate?.prodataToProdataRate ?? null),
            consultantPDCRateUnitType: new FormControl(null), // ??
            consultantPDCRateCurrency: new FormControl(this.findItemById(this.currencies, consultant?.consultantRate?.prodataToProdataCurrencyId) ?? null),

            consultantSpecialContractTerms: new FormControl(consultant?.specialContractTerms ?? null),
            consultantSpecialContractTermsNone: new FormControl(consultant?.noSpecialContractTerms ?? false),

            consultantAccountManager: new FormControl(consultant?.deliveryAccountManagerIdValue ?? '')
        });
        this.consultantsForm.consultantData.push(form);
        this.manageManagerAutocomplete(this.consultantsForm.consultantData.length - 1);
        this.manageConsultantAutocomplete(this.consultantsForm.consultantData.length - 1);
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

    get consultantData(): FormArray {
        return this.consultantsForm.get('consultantData') as FormArray;
    }

    saveSalesStep() {
        let input = new ClientPeriodSalesDataDto();
        input.salesMainData = new SalesMainDataDto();
        input.salesClientData = new SalesClientDataDto();
        input.consultantSalesData = new Array<ConsultantSalesDataDto>();

        input.salesMainData.projectTypeId = this.salesMainDataForm.projectType?.value?.id;
        input.salesMainData.salesTypeId = this.salesMainDataForm.salesType?.value?.id;
        input.salesMainData.deliveryTypeId = this.salesMainDataForm.deliveryType?.value?.id;
        input.salesMainData.marginId = this.salesMainDataForm.margin?.value;
        input.salesMainData.projectCategoryId = this.salesMainDataForm.projectCategory?.value?.id;
        input.salesMainData.projectDescription = this.salesMainDataForm.projectDescription?.value;
        input.salesMainData.discountId = this.salesMainDataForm.discounts?.value;
        input.salesMainData.salesAccountManagerIdValue = this.salesMainDataForm.salesAccountManagerIdValue?.value?.id;
        input.salesMainData.commissionAccountManagerIdValue = this.salesMainDataForm.commissionAccountManagerIdValue?.value?.id;
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
        input.salesClientData.startDate = this.salesClientDataForm.clientContractStartDate?.value;
        input.salesClientData.noEndDate = this.salesClientDataForm.clientContractNoEndDate?.value;
        input.salesClientData.endDate = this.salesClientDataForm.clientContractEndDate?.value;
        input.salesClientData.noClientExtensionOption = this.salesClientDataForm.noClientExtensionOption?.value;
        input.salesClientData.clientExtensionDurationId = this.salesClientDataForm.clientExtensionDuration?.value;
        input.salesClientData.clientExtensionDeadlineId = this.salesClientDataForm.clientExtensionDeadline?.value?.id;
        input.salesClientData.clientExtensionSpecificDate = this.salesClientDataForm.clientExtensionEndDate?.value;
        input.salesClientData.clientTimeReportingCapId = this.salesClientDataForm.capOnTimeReporting?.value;
        input.salesClientData.clientTimeReportingCapMaxValue = this.salesClientDataForm.capOnTimeReportingValue?.value;
        input.salesClientData.pdcInvoicingEntityId = this.salesClientDataForm.pdcInvoicingEntityId?.value;

        input.salesClientData.clientRate = new ClientRateDto();
        input.salesClientData.clientRate.isTimeBasedRate = this.salesClientDataForm.clientRateAndInvoicing?.value === 'Time based';
        input.salesClientData.clientRate.isFixedRate = this.salesClientDataForm.clientRateAndInvoicing?.value === 'Fixed';
        input.salesClientData.clientRate.currencyId = this.salesClientDataForm.clientCurrency?.value
        input.salesClientData.clientRate.invoiceCurrencyId = this.salesClientDataForm.clientInvoiceCurrency?.value;
        input.salesClientData.clientRate.normalRate = this.salesClientDataForm.clientPrice?.value;
        input.salesClientData.clientRate.rateUnitTypeId = this.salesClientDataForm.rateUnitTypeId?.value;
        input.salesClientData.clientRate.invoiceFrequencyId = this.salesClientDataForm.clientInvoiceFrequency?.value?.id;
        input.salesClientData.clientRate.manualDate = this.salesClientDataForm.clientInvoicingDate?.value;
        // input.salesClientData.clientRate.invoicingTimeId = this.salesClientDataForm.clientInvoicingDate?.value;
        // input.salesClientData.clientRate.price =
        // input.salesClientData.clientRate.invoicingTimeId =

        input.salesClientData.noInvoicingReferenceNumber = this.salesClientDataForm.invoicingReferenceNumber?.value ? false : true;
        input.salesClientData.invoicingReferenceNumber = this.salesClientDataForm.invoicingReferenceNumber?.value;
        input.salesClientData.clientInvoicingRecipientSameAsDirectClient = this.salesClientDataForm.clientInvoicingRecipientSameAsDirectClient?.value;
        input.salesClientData.clientInvoicingRecipientIdValue = this.salesClientDataForm.clientInvoicingRecipientIdValue?.value;
        input.salesClientData.noInvoicingReferencePerson = this.salesClientDataForm.noInvoicingReferencePerson?.value;
        input.salesClientData.invoicingReferencePersonIdValue = this.salesClientDataForm.invoicingReferencePersonIdValue?.value?.id;

        // TODO: ADD when UI + API For client rates/fee inside WF will be ready
        // input.salesClientData.noClientSpecialRate = this.salesClientDataForm.value.
        // input.salesClientData.clientSpecialRates = this.salesClientDataForm.value.
        // input.salesClientData.noClientSpecialFee = this.salesClientDataForm.value.
        // input.salesClientData.clientSpecialFees = this.salesClientDataForm.value.

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
                signerInput.contactId = signer.clientName;
                // signerInput.contact = signer.client;
                signerInput.signerRoleId = signer.clientRole;
            });
        }
        input.consultantSalesData = new Array<ConsultantSalesDataDto>();
        if (this.consultantsForm.consultantData.value?.length) {
            this.consultantsForm.consultantData.value.forEach((consultant: any) => {
                let consultantInput = new ConsultantSalesDataDto();
                consultantInput.employmentTypeId = consultant.consultantType;
                consultantInput.consultantId = consultant.consultantName?.id
                consultantInput.nameOnly = consultant.consultantName?.name;
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
                consultantInput.onsiteClientId = consultant.consultantWorkplaceCliendAddress;

                consultantInput.isEmagineOfficeWorkplace = consultant.consultantIsEmagineOfficeWorkplace;
                consultantInput.emagineOfficeId = consultant.consultantWorkplaceEmagineOffice;

                consultantInput.isRemoteWorkplace = consultant.consultantIsRemoteWorkplace;
                consultantInput.remoteAddressCountryId = consultant.consultantWorkplaceRemote;
                consultantInput.percentageOnSite = consultant.consultantWorkplacePercentageOnSite;

                consultantInput.noExpectedWorkload = consultant.noExpectedWorkload;
                consultantInput.expectedWorkloadHours = consultant.expectedWorkloadHours;
                consultantInput.expectedWorkloadUnitId = consultant.expectedWorkloadUnitId;
                consultantInput.consultantTimeReportingCapId = consultant.consultantTimeReportingCapId;
                consultantInput.consultantTimeReportingCapMaxValue = consultant.consultantTimeReportingCapMaxValue;
                consultantInput.pdcPaymentEntityId = consultant.consultantProdataEntity;

                consultantInput.consultantRate = new ConsultantRateDto();
                consultantInput.consultantRate.isTimeBasedRate = consultant.consultantPaymentType === 'Time based';
                consultantInput.consultantRate.isFixedRate = consultant.consultantPaymentType === 'Fixed';
                consultantInput.consultantRate.normalRate = consultant.consultantRate;
                consultantInput.consultantRate.currencyId = consultant.consultantRateCurrency?.id;
                consultantInput.consultantRate.rateUnitTypeId = consultant.consultantRateUnitType?.id;
                consultantInput.consultantRate.prodataToProdataRate = consultant.consultantPDCRate;
                consultantInput.consultantRate.prodataToProdataCurrencyId = consultant.consultantPDCRateCurrency?.id;
                consultantInput.consultantRate.prodataToProdataInvoiceCurrencyId = consultant.prodataToProdataInvoiceCurrencyId;
                consultantInput.consultantRate.manualDate = consultant.manualDate;
                consultantInput.consultantRate.invoiceFrequencyId = consultant.invoiceFrequencyId;
                consultantInput.consultantRate.invoicingTimeId = consultant.invoicingTimeId;

                consultantInput.noSpecialContractTerms = consultant.consultantSpecialContractTermsNone;
                consultantInput.specialContractTerms = consultant.consultantSpecialContractTerms;
                consultantInput.deliveryManagerSameAsAccountManager = consultant.deliveryManagerSameAsAccountManager;
                consultantInput.deliveryAccountManagerIdValue = consultant.consultantAccountManager?.id;

                input.consultantSalesData!.push(consultantInput);
            });
        }

        this._clientPeriodService.salesPut(this.clientPeriodId!, input)
            .pipe(finalize(() => {

            }))
            .subscribe(result => {

            })
    }

    getWorkflowSalesStep() {
        this._clientPeriodService.salesGet(this.clientPeriodId!)
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                // Project
                this.salesMainDataForm.projectType?.setValue(this.findItemById(this.projectTypes, result?.salesMainData?.projectTypeId), {emitEvent: false});
                this.salesMainDataForm.salesType?.setValue(this.findItemById(this.saleTypes, result?.salesMainData?.salesTypeId), {emitEvent: false});
                this.salesMainDataForm.deliveryType?.setValue(this.findItemById(this.deliveryTypes, result?.salesMainData?.deliveryTypeId), {emitEvent: false});
                this.salesMainDataForm.projectCategory?.setValue(this.findItemById(this.projectCategories, result?.salesMainData?.projectCategoryId), {emitEvent: false});
                this.salesMainDataForm.margin?.setValue(result?.salesMainData?.marginId, {emitEvent: false});
                this.salesMainDataForm.projectDescription?.setValue(result?.salesMainData?.projectDescription, {emitEvent: false});

                // Invoicing
                result.salesMainData?.commissions?.forEach(commission => {
                    this.addCommission(commission);
                })
                this.salesMainDataForm.discounts?.setValue(result?.salesMainData?.discountId ?? 1, {emitEvent: false}); // 1 - default value 'None'

                // Account Manager
                this.salesMainDataForm.salesAccountManagerIdValue?.setValue(result?.salesMainData?.salesAccountManagerIdValue, {emitEvent: false});
                this.salesMainDataForm.commissionAccountManagerIdValue?.setValue(result?.salesMainData?.commissionAccountManagerIdValue, {emitEvent: false});
                this.salesMainDataForm.contractExpirationNotification?.setValue(result?.salesMainData?.contractExpirationNotificationIntervalIds, {emitEvent: false});
                this.salesMainDataForm.customContractExpirationNotificationDate?.setValue(result?.salesMainData?.customContractExpirationNotificationDate, {emitEvent: false});
                this.salesMainDataForm.remarks?.setValue(result?.salesMainData?.remarks, {emitEvent: false});
                this.salesMainDataForm.noRemarks?.setValue(result?.salesMainData?.noRemarks, {emitEVent: false});
                if (result?.salesMainData?.noRemarks) {
                    this.salesMainDataForm.remarks?.disable({emitEvent: false});
                }

                // Client
                this.salesClientDataForm.differentEndClient?.setValue(result.salesClientData?.differentEndClient ?? false, {emitEvent: false}); // default value if false
                this.salesClientDataForm.directClientIdValue?.setValue(result?.salesClientData?.directClientIdValue, {emitEvent: false});
                this.salesClientDataForm.endClientIdValue?.setValue(result?.salesClientData?.endClientIdValue, {emitEvent: false});
                //Duration
                this.salesClientDataForm.clientContractStartDate?.setValue(result?.salesClientData?.startDate, {emitEvent: false});
                this.salesClientDataForm.clientContractEndDate?.setValue(result?.salesClientData?.endDate, {emitEvent: false});
                this.salesClientDataForm.clientContractNoEndDate?.setValue(result?.salesClientData?.noEndDate, {emitEvent: false});
                if (result?.salesClientData?.noEndDate) {
                    this.salesClientDataForm.clientContractEndDate?.disable({emitEvent: false});
                }
                this.salesClientDataForm.noClientExtensionOption?.setValue(result?.salesClientData?.noClientExtensionOption, {emitEvent: false});
                this.salesClientDataForm.clientExtensionDuration?.setValue(result?.salesClientData?.clientExtensionDurationId, {emitEvent: false});
                this.salesClientDataForm.clientExtensionDeadline?.setValue(this.findItemById(this.clientExtensionDeadlines, result?.salesClientData?.clientExtensionDeadlineId), {emitEvent: false});
                // Project
                this.salesClientDataForm.capOnTimeReporting?.setValue(result?.salesClientData?.clientTimeReportingCapId ?? 1, {emitEvent: false}); // default idValue = 1
                this.salesClientDataForm.capOnTimeReportingValue?.setValue(result?.salesClientData?.clientTimeReportingCapMaxValue, {emitEvent: false});
                // Invoicing
                this.salesClientDataForm.pdcInvoicingEntityId?.setValue(result?.salesClientData?.pdcInvoicingEntityId, {emitEvent: false});
                let clientRateType = 'Fixed'; // default value
                if (result.salesClientData?.clientRate?.isFixedRate) {
                    clientRateType = 'Fixed';
                } else if (result.salesClientData?.clientRate?.isTimeBasedRate) {
                    clientRateType = 'Time based';
                }
                this.salesClientDataForm.clientRateAndInvoicing?.setValue(clientRateType, {emitEVent: false}); // default value is 'Fixed'

                this.salesClientDataForm.clientPrice?.setValue(result.salesClientData?.clientRate?.normalRate, {emitEVent: false});
                this.salesClientDataForm.rateUnitTypeId?.setValue(result.salesClientData?.clientRate?.rateUnitTypeId, {emitEVent: false});
                this.salesClientDataForm.clientCurrency?.setValue(result.salesClientData?.clientRate?.currencyId, {emitEVent: false});
                this.salesClientDataForm.clientInvoiceCurrency?.setValue(result.salesClientData?.clientRate?.invoiceCurrencyId, {emitEVent: false});
                this.salesClientDataForm.clientInvoiceFrequency?.setValue(result.salesClientData?.clientRate?.invoiceFrequencyId, {emitEVent: false});
                this.salesClientDataForm.clientInvoicingDate?.setValue(result.salesClientData?.clientRate?.manualDate, {emitEVent: false});

                this.salesClientDataForm.invoicingReferenceNumber?.setValue(result.salesClientData?.invoicingReferenceNumber, {emitEVent: false});
                this.salesClientDataForm.clientInvoicingRecipientIdValue?.setValue(result.salesClientData?.clientInvoicingRecipientIdValue, {emitEVent: false});
                this.salesClientDataForm.clientInvoicingRecipientSameAsDirectClient?.setValue(result?.salesClientData?.clientInvoicingRecipientSameAsDirectClient, {emitEvent: false});
                if (result?.salesClientData?.clientInvoicingRecipientSameAsDirectClient) {
                    this.salesClientDataForm.clientInvoicingRecipientIdValue?.disable({emitEvent: false});
                }
                this.salesClientDataForm.invoicingReferencePersonIdValue?.setValue(result?.salesClientData?.invoicingReferencePersonIdValue, {emitEvent: false});
                this.salesClientDataForm.noInvoicingReferencePerson?.setValue(result?.salesClientData?.noInvoicingReferencePerson, {emitEvent: false});
                if (result?.salesClientData?.noInvoicingReferencePerson) {
                    this.salesClientDataForm.invoicingReferencePersonIdValue?.disable({emitEvent: false});
                }

                // Rates & Fees
                result.salesClientData?.periodClientSpecialRates?.forEach(specialRate => {
                    this.addSpecialRate(specialRate);
                });

                result.salesClientData?.periodClientSpecialFees?.forEach(specialFee => {
                    this.addClientFee(specialFee);
                });

                // Evaluations
                this.salesClientDataForm.evaluationsReferencePersonIdValue?.setValue(result?.salesClientData?.evaluationsReferencePersonIdValue, {emitEvent: false});
                this.salesClientDataForm.evaluationsDisabled?.setValue(result?.salesClientData?.evaluationsDisabled, {emitEvent: false});
                this.salesClientDataForm.evaluationsDisabledReason?.setValue(result?.salesClientData?.evaluationsDisabledReason, {emitEvent: false});
                // Contract
                this.salesClientDataForm.noSpecialContractTerms?.setValue(result?.salesClientData?.noSpecialContractTerms, {emitEvent: false});
                this.salesClientDataForm.specialContractTerms?.setValue(result?.salesClientData?.specialContractTerms, {emitEvent: false});
                result?.salesClientData?.contractSigners?.forEach(signer => {
                    this.addSignerToForm(signer);
                });

                // Consultant
                // console.log('s');
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
            //  TODO: call API to change consultant
            this._workflowDataService.workflowSideSectionAdded.emit(true);
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
            // TODO: call API to change consultant
            this._workflowDataService.workflowSideSectionAdded.emit(true);
        });

        dialogRef.componentInstance.onRejected.subscribe(() => {
            // nthng
        });
    }

    // Termination
    terminateConsultant(index: number) {
        this.consultantInformation = this.consultantsForm.consultantData.at(index).value.consultantName;
        this._workflowServiceProxy.terminationConsultantStart(this.workflowId!, this.consultantInformation.id)
        .pipe(finalize(() => {

        }))
        .subscribe(result => {
            this._workflowDataService.workflowSideSectionAdded.emit(true);
        });
    }

    terminateWorkflow() {
        this._workflowServiceProxy.terminationStart(this.workflowId!)
        .pipe(finalize(() => {

        }))
        .subscribe(result => {
            this._workflowDataService.workflowSideSectionAdded.emit(true);
        });
    }

    //#endregion Consultant menu actions

    commissionRecipientTypeChanged(event: MatSelectChange, index: number) {
        console.log(event);
        this.commissions.at(index).get('recipient')?.setValue(null, {emitEvent: false});
        this.filteredRecipients = [];
    }

    addCommission(commission?: CommissionDto) {
        let commissionRecipient;
        switch (commission?.recipientTypeId) {
            case 1: // Supplier
                commissionRecipient = commission.supplierId;
                break;
            case 2: // Consultant
                commissionRecipient = commission.consultantId;
                break;
            case 3: // Client
                commissionRecipient = commission.clientId;
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

    compareWithFn(listOfItems: any, selectedItem: any) {
        return listOfItems && selectedItem && listOfItems.id === selectedItem.id;;
    }

    displayNameFn(option: any) {
        return option?.name;
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

    // Termination

    getWorkflowSalesStepConsultantTermination() {
        this._workflowServiceProxy.terminationConsultantSalesGet(this.workflowId!, this.consultantId!)
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                // End of Consultant Contract
                this.salesTerminateConsultantForm.nonStandardTerminationTime?.setValue(result?.nonStandardTerminationTime, {emitEvent: false});
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

    updateTerminationConsultantSalesStep() {
        let input = new ConsultantTerminationSalesDataCommandDto();
        input.nonStandardTerminationTime =  this.salesTerminateConsultantForm?.nonStandardTerminationTime?.value;
        input.endDate = this.salesTerminateConsultantForm?.endDate?.value;
        input.terminationReason = this.salesTerminateConsultantForm?.terminationReason?.value;
        input.causeOfNonStandardTerminationTime = this.salesTerminateConsultantForm?.causeOfNonStandardTerminationTime?.value;
        input.additionalComments = this.salesTerminateConsultantForm?.additionalComments?.value;

        input.finalEvaluationReferencePersonId = this.salesTerminateConsultantForm?.finalEvaluationReferencePerson?.value; // FIXME: fix after be changes add .id
        input.noEvaluation = this.salesTerminateConsultantForm?.noEvaluation?.value;
        input.causeOfNoEvaluation =  this.salesTerminateConsultantForm.causeOfNoEvaluation?.value;

        this._workflowServiceProxy.terminationConsultantSalesPut(this.workflowId!, this.consultantId, input)
            .pipe(finalize(() => {

            }))
            .subscribe(result => {

            })
    }

    completeTerminationConsultantSalesStep() {
        let input = new ConsultantTerminationSalesDataCommandDto();

        input.nonStandardTerminationTime =  this.salesTerminateConsultantForm?.nonStandardTerminationTime?.value;
        input.endDate = this.salesTerminateConsultantForm?.endDate?.value;
        input.terminationReason = this.salesTerminateConsultantForm?.terminationReason?.value;
        input.causeOfNonStandardTerminationTime = this.salesTerminateConsultantForm?.causeOfNonStandardTerminationTime?.value;
        input.additionalComments = this.salesTerminateConsultantForm?.additionalComments?.value;

        input.finalEvaluationReferencePersonId = this.salesTerminateConsultantForm?.finalEvaluationReferencePerson?.value; // FIXME: fix after be changes add .id
        input.noEvaluation = this.salesTerminateConsultantForm?.noEvaluation?.value;
        input.causeOfNoEvaluation =  this.salesTerminateConsultantForm.causeOfNoEvaluation?.value;

        this._workflowServiceProxy.terminationConsultantSalesComplete(this.workflowId!, this.consultantId, input)
            .pipe(finalize(() => {

            }))
            .subscribe(result => {

            })
    }

    getWorkflowSalesStepTermination() {
        this._workflowServiceProxy.terminationSalesGet(this.workflowId!)
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                // End of Consultant Contract
                this.salesTerminateConsultantForm.nonStandardTerminationTime?.setValue(result?.nonStandardTerminationTime, {emitEvent: false});
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

    updateTerminationSalesStep() {
        let input = new WorkflowTerminationSalesDataCommandDto();
        input.nonStandardTerminationTime =  this.salesTerminateConsultantForm?.nonStandardTerminationTime?.value;
        input.endDate = this.salesTerminateConsultantForm?.endDate?.value;
        input.terminationReason = this.salesTerminateConsultantForm?.terminationReason?.value;
        input.causeOfNonStandardTerminationTime = this.salesTerminateConsultantForm?.causeOfNonStandardTerminationTime?.value;
        input.additionalComments = this.salesTerminateConsultantForm?.additionalComments?.value;

        input.finalEvaluationReferencePersonId = this.salesTerminateConsultantForm?.finalEvaluationReferencePerson?.value; // FIXME: fix after be changes add .id
        input.noEvaluation = this.salesTerminateConsultantForm?.noEvaluation?.value;
        input.causeOfNoEvaluation =  this.salesTerminateConsultantForm.causeOfNoEvaluation?.value;

        this._workflowServiceProxy.terminationSalesPut(this.workflowId!, input)
            .pipe(finalize(() => {

            }))
            .subscribe(result => {

            })
    }

    completeTerminationSalesStep() {
        let input = new WorkflowTerminationSalesDataCommandDto();
        input.nonStandardTerminationTime =  this.salesTerminateConsultantForm?.nonStandardTerminationTime?.value;
        input.endDate = this.salesTerminateConsultantForm?.endDate?.value;
        input.terminationReason = this.salesTerminateConsultantForm?.terminationReason?.value;
        input.causeOfNonStandardTerminationTime = this.salesTerminateConsultantForm?.causeOfNonStandardTerminationTime?.value;
        input.additionalComments = this.salesTerminateConsultantForm?.additionalComments?.value;

        input.finalEvaluationReferencePersonId = this.salesTerminateConsultantForm?.finalEvaluationReferencePerson?.value; // FIXME: fix after be changes add .id
        input.noEvaluation = this.salesTerminateConsultantForm?.noEvaluation?.value;
        input.causeOfNoEvaluation =  this.salesTerminateConsultantForm.causeOfNoEvaluation?.value;

        this._workflowServiceProxy.terminationSalesComplete(this.workflowId!, input)
            .pipe(finalize(() => {

            }))
            .subscribe(result => {

            })
    }

    detectActiveSideSection() {
        switch (this._workflowDataService.getWorkflowProgress.currentlyActiveSideSection) {
            case WorkflowProcessType.TerminateWorkflow:
                this.getWorkflowSalesStepTermination();
                break;
            case WorkflowProcessType.TerminateConsultant:
                this.getWorkflowSalesStepConsultantTermination();
                break;
        }
    }

}
