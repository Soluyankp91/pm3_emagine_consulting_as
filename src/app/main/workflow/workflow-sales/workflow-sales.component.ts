import { Overlay } from '@angular/cdk/overlay';
import { Component, Injector, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, finalize, switchMap, takeUntil } from 'rxjs/operators';
import { InternalLookupService } from 'src/app/shared/common/internal-lookup.service';
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { AppComopnentBase } from 'src/shared/app-component-base';
import { ClientPeriodSalesDataDto, ClientPeriodServiceProxy, ClientRateDto, ClientSpecialFeeDto, ClientSpecialRateDto, CommissionDto, ConsultantRateDto, ConsultantSalesDataDto, ConsultantTerminationSalesDataDto, ContractSignerDto, EmployeeDto, EnumEntityTypeDto, EnumServiceProxy, LookupServiceProxy, PeriodClientSpecialFeeDto, PeriodClientSpecialRateDto, SalesClientDataDto, SalesMainDataDto, WorkflowProcessType, WorkflowServiceProxy, WorkflowTerminationSalesDataDto } from 'src/shared/service-proxies/service-proxies';
import { WorkflowConsultantActionsDialogComponent } from '../workflow-consultant-actions-dialog/workflow-consultant-actions-dialog.component';
import { WorkflowDataService } from '../workflow-data.service';
import { ChangeConsultantDto, ConsultantTypes, ExtendConsultantDto, TerminateConsultantDto, WorkflowTopSections } from '../workflow.model';
import { ConsultantDiallogAction, InputReadonlyStates, SalesTerminateConsultantForm, WorkflowSalesAdditionalDataForm, WorkflowSalesClientDataForm, WorkflowSalesConsultantsForm, WorkflowSalesMainForm } from './workflow-sales.model';
@Component({
    selector: 'app-workflow-sales',
    templateUrl: './workflow-sales.component.html',
    styleUrls: ['./workflow-sales.component.scss']
})
export class WorkflowSalesComponent extends AppComopnentBase implements OnInit {
    @Input() workflowId: string;
    @Input() clientPeriodId: string | undefined;

    @Input() primaryWorkflow: boolean;
    @Input() changeWorkflow: boolean;
    @Input() extendWorkflow: boolean;
    @Input() addConsultant: boolean;
    @Input() changeConsultant: boolean;

    // Changed all above to enum
    @Input() activeSideSection: number;

    consultantId = 1;
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
        ),
        new EnumEntityTypeDto(
            {
                id: 3,
                name: 'Milestones'
            }
        )
    );

    showMore = false;
    consultantTypes = ConsultantTypes;

    filteredAccountManagers: any[] = [];
    filteredSalesAccountManagers: any[] = [];
    filteredCommisionAccountManagers: any[] = [];
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
        // init form arrays ?
        this.addSignerToForm();
        this.addConsultantForm();

        this.getWorkflowSalesStep();

        this._workflowDataService.workflowSalesSaved
            .pipe(takeUntil(this._unsubscribe))
            .subscribe((value: boolean) => {
                // NB: boolean SAVE DRAFT or COMPLETE in future
                this.saveSalesStep();
            });

        // this.updateReadonlyState();
    }
    get readOnlyMode() {
        return this._workflowDataService.getWorkflowProgress.isWorkflowSalesSaved;
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

    //#endregion dataFetch

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
            clientRateCurrency: new FormControl(clientFee?.clientRateCurrencyId ?? null),
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
            consultantName: new FormControl(consultant?.nameOnly ?? null),

            consultantProjectDuration: new FormControl(null),
            consultantProjectStartDate: new FormControl(null),
            consultantProjectEndDate: new FormControl(null),
            consultantProjectNoEndDate: new FormControl(false),

            consultantWorkplace: new FormControl(null),
            consultantWorkplaceCliendAddress: new FormControl(null),
            consultantWorkplaceEmagineOffice: new FormControl(null),
            consultantWorkplaceRemote: new FormControl(null),
            consultantWorkplacePercentageOnSite: new FormControl(null),

            consultantIsOnsiteWorkplace: new FormControl(false),
            consultantIsEmagineOfficeWorkplace: new FormControl(false),
            consultantIsRemoteWorkplace: new FormControl(false),

            consultantExpectedWorkloadHours: new FormControl(null),
            consultantExpectedWorkloadPeriod: new FormControl(null),
            consultantCapOnTimeReporting: new FormControl(null),
            consultantCapOnTimeReportingValue: new FormControl(null),
            consultantCapOnTimeReportingCurrency: new FormControl(null),
            consultantProdataEntity: new FormControl(null),
            consultantPrice: new FormControl(null),
            consultantRate: new FormControl(null),
            consultantRateUnitType: new FormControl(null),
            consultantRateCurrency: new FormControl(null),
            consultantPDCRate: new FormControl(null),
            consultantPDCRateUnitType: new FormControl(null),
            consultantPDCRateCurrency: new FormControl(null),

            consultantSpecialContractTerms: new FormControl(null),
            consultantSpecialContractTermsNone: new FormControl(false),

            consultantAccountManager: new FormControl('')
        });
        this.consultantsForm.consultantData.push(form);
        this.manageManagerAutocomplete(this.consultantsForm.consultantData.length - 1);
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
                confirmationMessageTitle: `Are you sure you want to delete consultant ${consultant.consultantName ?? ''}?`,
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
        input.salesMainData.noRemarks = !this.salesMainDataForm.noRemarks?.value;

        input.salesMainData.commissions = new Array<CommissionDto>();
        if (this.salesMainDataForm.commissions.value?.length) {
            this.salesMainDataForm.commissions.value.forEach((commission: any) => {
                let commissionInput = new CommissionDto();
                commissionInput.id = commission.id;
                commissionInput.commissionTypeId = commission.type;
                commissionInput.amount = commission.value;
                commissionInput.currencyId = commission.currency;
                commissionInput.commissionFrequencyId = commission.frequency;
                commissionInput.recipientTypeId = commission.recipientType;
                // TODO: BE MISSING
                // commissionInput.recipientTypeId = commission.recipient;
                // TODO: DESIGN MISSING
                // commissionInput.oneTimeDate = commission.oneTimeDate;
                // commissionInput.supplierId = commission.supplierId;
                // commissionInput.tenantId = commission.tenantId;
                // commissionInput.consultantId = commission.consultantId;
                // commissionInput.clientId = commission.clientId;

                input.salesMainData!.commissions?.push(commissionInput);
            });
        }

        input.salesClientData.differentEndClient = this.salesClientDataForm.differentEndClient?.value;
        input.salesClientData.directClientIdValue = this.salesClientDataForm.directClientIdValue?.value;
        input.salesClientData.endClientIdValue = this.salesClientDataForm.endClientIdValue?.value;
        input.salesClientData.startDate = this.salesClientDataForm.clientContractStartDate?.value;
        input.salesClientData.noEndDate = this.salesClientDataForm.clientContractNoEndDate?.value;
        input.salesClientData.endDate = this.salesClientDataForm.clientContractEndDate?.value;
        input.salesClientData.noClientExtensionOption = this.salesClientDataForm.noClientExtensionOption?.value;
        input.salesClientData.clientExtensionDurationId = this.salesClientDataForm.clientExtensionDuration?.value;
        input.salesClientData.clientExtensionDeadlineId = this.salesClientDataForm.clientExtensionDeadline?.value;
        input.salesClientData.clientExtensionSpecificDate = this.salesClientDataForm.clientExtensionEndDate?.value;
        input.salesClientData.clientTimeReportingCapId = this.salesClientDataForm.capOnTimeReporting?.value?.id;
        input.salesClientData.clientTimeReportingCapMaxValue = this.salesClientDataForm.capOnTimeReportingValue?.value;
        input.salesClientData.pdcInvoicingEntityId = this.salesClientDataForm.pdcInvoicingEntityId?.value;

        input.salesClientData.clientRate = new ClientRateDto();
        input.salesClientData.clientRate.isTimeBasedRate = this.salesClientDataForm.clientRateAndInvoicing?.value?.name === 'Time base';
        input.salesClientData.clientRate.isFixedRate = this.salesClientDataForm.clientRateAndInvoicing?.value?.name === 'Fixed';
        input.salesClientData.clientRate.currencyId = this.salesClientDataForm.clientCurrency?.value
        input.salesClientData.clientRate.invoiceCurrencyId = this.salesClientDataForm.clientInvoiceCurrency?.value;
        input.salesClientData.clientRate.normalRate = this.salesClientDataForm.clientPrice?.value;
        input.salesClientData.clientRate.rateUnitTypeId = this.salesClientDataForm.rateUnitTypeId?.value;
        input.salesClientData.clientRate.invoiceFrequencyId = this.salesClientDataForm.clientInvoiceFrequency?.value?.id;
        input.salesClientData.clientRate.manualDate = this.salesClientDataForm.clientInvoicingDate?.value;
        // input.salesClientData.clientRate.invoicingTimeId = this.salesClientDataForm.clientInvoicingDate?.value;
        // input.salesClientData.clientRate.price =
        // input.salesClientData.clientRate.invoicingTimeId =

        input.salesClientData.noInvoicingReferenceNumber = this.salesClientDataForm.invoicingReferenceNumber?.value ? true : false;
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
                signerInput.signerRole = signer.clientRole;
            });
        }
        input.consultantSalesData = new Array<ConsultantSalesDataDto>();
        if (this.consultantsForm.consultantData.value?.length) {
            this.consultantsForm.consultantData.value.forEach((consultant: any) => {
                let consultantInput = new ConsultantSalesDataDto();
                consultantInput.employmentTypeId = consultant.consultantType;
                // consultantInput.consultantId = consultant.consultantName;

                // ??
                consultantInput.nameOnly = consultant.consultantName;
                // ??

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
                consultantInput.consultantRate.isTimeBasedRate = consultant.isTimeBasedRate;
                consultantInput.consultantRate.isFixedRate = consultant.isFixedRate;
                consultantInput.consultantRate.normalRate = consultant.normalRate;
                consultantInput.consultantRate.currencyId = consultant.currencyId;
                consultantInput.consultantRate.prodataToProdataRate = consultant.prodataToProdataRate;
                consultantInput.consultantRate.prodataToProdataCurrencyId = consultant.prodataToProdataCurrencyId;
                consultantInput.consultantRate.prodataToProdataInvoiceCurrencyId = consultant.prodataToProdataInvoiceCurrencyId;
                consultantInput.consultantRate.manualDate = consultant.manualDate;
                consultantInput.consultantRate.rateUnitTypeId = consultant.rateUnitTypeId;
                consultantInput.consultantRate.invoiceFrequencyId = consultant.invoiceFrequencyId;
                consultantInput.consultantRate.invoicingTimeId = consultant.invoicingTimeId;

                consultantInput.noSpecialContractTerms = consultant.noSpecialContractTerms;
                consultantInput.specialContractTerms = consultant.specialContractTerms;
                consultantInput.deliveryManagerSameAsAccountManager = consultant.deliveryManagerSameAsAccountManager;
                consultantInput.deliveryAccountManagerIdValue = consultant.deliveryAccountManagerIdValue;

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
                this.salesMainDataForm.projectCategory?.setValue(result?.salesMainData?.projectCategoryId, {emitEvent: false});
                this.salesMainDataForm.margin?.setValue(result?.salesMainData?.marginId, {emitEvent: false});
                this.salesMainDataForm.projectDescription?.setValue(result?.salesMainData?.projectDescription, {emitEvent: false});

                // Invoicing
                // add discounts
                result.salesMainData?.commissions?.forEach(commission => {
                    this.addCommission(commission);
                })

                // Account Manager
                this.salesMainDataForm.salesAccountManagerIdValue?.setValue(result?.salesMainData?.salesAccountManagerIdValue, {emitEvent: false});
                this.salesMainDataForm.commissionAccountManagerIdValue?.setValue(result?.salesMainData?.commissionAccountManagerIdValue, {emitEvent: false});
                this.salesMainDataForm.contractExpirationNotification?.setValue(result?.salesMainData?.contractExpirationNotificationIntervalIds, {emitEvent: false});
                this.salesMainDataForm.customContractExpirationNotificationDate?.setValue(result?.salesMainData?.customContractExpirationNotificationDate, {emitEvent: false});
                this.salesMainDataForm.remarks?.setValue(result?.salesMainData?.remarks, {emitEvent: false});
                this.salesMainDataForm.noRemarks?.setValue(result?.salesMainData?.noRemarks, {emitEVent: false});

                // Client
                this.salesClientDataForm.differentEndClient?.setValue(result.salesClientData?.differentEndClient, {emitEvent: false});
                this.salesClientDataForm.directClientIdValue?.setValue(result?.salesClientData?.directClientIdValue, {emitEvent: false});
                this.salesClientDataForm.endClientIdValue?.setValue(result?.salesClientData?.endClientIdValue, {emitEvent: false});
                //Duration
                this.salesClientDataForm.clientContractStartDate?.setValue(result?.salesClientData?.startDate, {emitEvent: false});
                this.salesClientDataForm.clientContractEndDate?.setValue(result?.salesClientData?.endDate, {emitEvent: false});
                this.salesClientDataForm.clientContractNoEndDate?.setValue(result?.salesClientData?.noEndDate, {emitEvent: false});
                this.salesClientDataForm.noClientExtensionOption?.setValue(result?.salesClientData?.noClientExtensionOption, {emitEvent: false});
                this.salesClientDataForm.clientExtensionDuration?.setValue(result?.salesClientData?.clientExtensionDurationId, {emitEvent: false});
                this.salesClientDataForm.clientExtensionDeadline?.setValue(result?.salesClientData?.clientExtensionDeadlineId, {emitEvent: false});
                // Project
                this.salesClientDataForm.capOnTimeReporting?.setValue(this.findItemById(this.clientTimeReportingCap, result?.salesClientData?.clientTimeReportingCapId), {emitEvent: false});
                this.salesClientDataForm.capOnTimeReportingValue?.setValue(result?.salesClientData?.clientTimeReportingCapMaxValue, {emitEvent: false});
                // Invoicing
                this.salesClientDataForm.pdcInvoicingEntityId?.setValue(result?.salesClientData?.pdcInvoicingEntityId, {emitEvent: false});
                let clientRateType = '';
                if (result.salesClientData?.clientRate?.isFixedRate) {
                    clientRateType = 'Fixed';
                } else if (result.salesClientData?.clientRate?.isFixedRate) {
                    clientRateType = 'Time based';
                }
                this.salesClientDataForm.clientRateAndInvoicing?.setValue(clientRateType, {emitEVent: false});

                this.salesClientDataForm.clientPrice?.setValue(result.salesClientData?.clientRate?.normalRate, {emitEVent: false});
                this.salesClientDataForm.rateUnitTypeId?.setValue(result.salesClientData?.clientRate?.rateUnitTypeId, {emitEVent: false});
                this.salesClientDataForm.clientCurrency?.setValue(result.salesClientData?.clientRate?.currencyId, {emitEVent: false});
                this.salesClientDataForm.clientInvoiceCurrency?.setValue(result.salesClientData?.clientRate?.invoiceCurrencyId, {emitEVent: false});
                this.salesClientDataForm.clientInvoiceFrequency?.setValue(result.salesClientData?.clientRate?.invoiceFrequencyId, {emitEVent: false});
                this.salesClientDataForm.clientInvoicingDate?.setValue(result.salesClientData?.clientRate?.manualDate, {emitEVent: false});

                this.salesClientDataForm.invoicingReferenceNumber?.setValue(result.salesClientData?.invoicingReferenceNumber, {emitEVent: false});
                this.salesClientDataForm.clientInvoicingRecipientIdValue?.setValue(result.salesClientData?.clientInvoicingRecipientIdValue, {emitEVent: false});
                this.salesClientDataForm.clientInvoicingRecipientSameAsDirectClient?.setValue(result?.salesClientData?.clientInvoicingRecipientSameAsDirectClient, {emitEvent: false});
                this.salesClientDataForm.invoicingReferencePersonIdValue?.setValue(result?.salesClientData?.invoicingReferencePersonIdValue, {emitEvent: false});
                this.salesClientDataForm.noInvoicingReferencePerson?.setValue(result?.salesClientData?.noInvoicingReferencePerson, {emitEvent: false});

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
                result.consultantSalesData?.forEach(consultant => {
                    this.addConsultantForm(consultant);
                });
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
        if (value.name === 'ManagedService') {
            const itemToPreselct = this.deliveryTypes.find(x => x.name === 'ManagedService')
            this.salesMainDataForm.deliveryType?.setValue(itemToPreselct, {emitEvent: false});
        }
    }

    findItemById(list: EnumEntityTypeDto[], id?: number) {
        if (id) {
            return list.find((x: any) => x.id === id);
        } else {
            return null;
        }
    }

    findItemByName(list: EnumEntityTypeDto[], name?: string) {
        if (name) {
            return list.find((x: any) => x.name === name);
        } else {
            return null;
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
            console.log('new date ', result?.newCutoverDate, 'new contract required ', result?.newLegalContractRequired);
            //  TODO: call API to change consultant
            if (this._workflowDataService.getWorkflowProgress.currentlyActiveSection === WorkflowTopSections.Workflow) {
                this._workflowDataService.workflowSideNavigation.unshift(ChangeConsultantDto);
            } else if (this._workflowDataService.getWorkflowProgress.currentlyActiveSection === WorkflowTopSections.Extension) {
                const currentExtension = this._workflowDataService.extensionSideNavigation.find(x => x.index === this._workflowDataService.getWorkflowProgress.currentlyActiveExtensionIndex);
                currentExtension!.sideNav.unshift(ChangeConsultantDto);
            }
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
            console.log('start date ', result?.startDate, 'end date ', result?.endDate, 'no end date ', result?.noEndDate);
            // TODO: call API to change consultant
            if (this._workflowDataService.getWorkflowProgress.currentlyActiveSection === WorkflowTopSections.Workflow) {
                this._workflowDataService.workflowSideNavigation.unshift(ExtendConsultantDto);
            } else if (this._workflowDataService.getWorkflowProgress.currentlyActiveSection === WorkflowTopSections.Extension) {
                const currentExtension = this._workflowDataService.extensionSideNavigation.find(x => x.index === this._workflowDataService.getWorkflowProgress.currentlyActiveExtensionIndex);
                currentExtension!.sideNav.unshift(ExtendConsultantDto);
            }
            this._workflowDataService.workflowSideSectionAdded.emit(true);
        });

        dialogRef.componentInstance.onRejected.subscribe(() => {
            // nthng
        });
    }

    terminateConsultant(index: number) {
        const consultantData = this.consultantsForm.consultantData.at(index).value;
        console.log('terminate consultant ', consultantData);
        if (this._workflowDataService.getWorkflowProgress.currentlyActiveSection === WorkflowTopSections.Workflow) {
            this._workflowDataService.workflowSideNavigation.unshift(TerminateConsultantDto);
        } else if (this._workflowDataService.getWorkflowProgress.currentlyActiveSection === WorkflowTopSections.Extension) {
            const currentExtension = this._workflowDataService.extensionSideNavigation.find(x => x.index === this._workflowDataService.getWorkflowProgress.currentlyActiveExtensionIndex);
            currentExtension!.sideNav.unshift(TerminateConsultantDto);
        }
        this._workflowDataService.workflowSideSectionAdded.emit(true);

    }

    //#endregion Consultant menu actions


    addCommission(commission?: CommissionDto) {
        const form = this._fb.group({
            id: new FormControl(commission?.id ?? null),
            type: new FormControl(commission?.commissionTypeId ?? null),
            value: new FormControl(commission?.amount ?? null),
            currency: new FormControl(commission?.currencyId ?? null),
            recipientType: new FormControl(commission?.recipientTypeId ?? null),
            recipient: new FormControl(null),
            frequency: new FormControl(commission?.commissionFrequencyId ?? null),
            editable: new FormControl(commission?.id ? false : true)
        });
        this.salesMainDataForm.commissions.push(form);
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

    // Termination

    getWorkflowSalesStepConsultantTermination() {
        this._workflowServiceProxy.terminationConsultantSalesGet(this.workflowId!, this.consultantId!)
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                // End of Consultant Contract
                this.salesTerminateConsultantForm.terminationBeforeEndOfContract?.setValue(result?.terminationBeforeEndOfContract, {emitEvent: false});
                this.salesTerminateConsultantForm.endDate?.setValue(result?.endDate, {emitEvent: false});
                this.salesTerminateConsultantForm.terminationReason?.setValue(result?.terminationReason, {emitEvent: false}); // add findItemById function
                this.salesTerminateConsultantForm.causeOfTerminationBeforeEndOfContract?.setValue(result?.causeOfTerminationBeforeEndOfContract, {emitEvent: false});
                this.salesTerminateConsultantForm.additionalComments?.setValue(result?.additionalComments, {emitEvent: false});

                //Final Evaluation
                this.salesTerminateConsultantForm.finalEvaluationReferencePersonId?.setValue(result?.finalEvaluationReferencePersonId, {emitEvent: false}); // add findItemById function
                this.salesTerminateConsultantForm.noEvaluation?.setValue(result?.noEvaluation, {emitEvent: false});
                this.salesTerminateConsultantForm.causeOfNoEvaluation?.setValue(result?.causeOfNoEvaluation, {emitEvent: false});

                // example with findItemById
                // this.salesMainDataForm.projectType?.setValue(this.findItemById(this.projectTypes, result?.salesMainData?.projectTypeId), {emitEvent: false});
            });
    }

    updateTerminationConsultantSalesStep() {
        let input = new ConsultantTerminationSalesDataDto();
        input.terminationBeforeEndOfContract =  this.salesTerminateConsultantForm?.terminationBeforeEndOfContract?.value;
        input.endDate = this.salesTerminateConsultantForm?.endDate?.value;
        input.terminationReason = this.salesTerminateConsultantForm?.terminationReason?.value;
        input.causeOfTerminationBeforeEndOfContract = this.salesTerminateConsultantForm?.causeOfTerminationBeforeEndOfContract?.value;
        input.additionalComments = this.salesTerminateConsultantForm?.additionalComments?.value;

        input.finalEvaluationReferencePersonId = this.salesTerminateConsultantForm?.finalEvaluationReferencePersonId?.value.id;
        input.noEvaluation = this.salesTerminateConsultantForm?.noEvaluation?.value;
        input.causeOfNoEvaluation =  this.salesTerminateConsultantForm.causeOfNoEvaluation?.value;

        this._workflowServiceProxy.terminationConsultantSalesPut(this.workflowId!, this.consultantId, input)
            .pipe(finalize(() => {

            }))
            .subscribe(result => {

            })
    }

    completeTerminationConsultantSalesStep() {
        let input = new ConsultantTerminationSalesDataDto();

        input.terminationBeforeEndOfContract =  this.salesTerminateConsultantForm?.terminationBeforeEndOfContract?.value;
        input.endDate = this.salesTerminateConsultantForm?.endDate?.value;
        input.terminationReason = this.salesTerminateConsultantForm?.terminationReason?.value;
        input.causeOfTerminationBeforeEndOfContract = this.salesTerminateConsultantForm?.causeOfTerminationBeforeEndOfContract?.value;
        input.additionalComments = this.salesTerminateConsultantForm?.additionalComments?.value;

        input.finalEvaluationReferencePersonId = this.salesTerminateConsultantForm?.finalEvaluationReferencePersonId?.value.id;
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
                this.salesTerminateConsultantForm.terminationBeforeEndOfContract?.setValue(result?.terminationBeforeEndOfContract, {emitEvent: false});
                this.salesTerminateConsultantForm.endDate?.setValue(result?.endDate, {emitEvent: false});
                this.salesTerminateConsultantForm.terminationReason?.setValue(result?.terminationReason, {emitEvent: false}); // add findItemById function
                this.salesTerminateConsultantForm.causeOfTerminationBeforeEndOfContract?.setValue(result?.causeOfTerminationBeforeEndOfContract, {emitEvent: false});
                this.salesTerminateConsultantForm.additionalComments?.setValue(result?.additionalComments, {emitEvent: false});

                //Final Evaluation
                this.salesTerminateConsultantForm.finalEvaluationReferencePersonId?.setValue(result?.finalEvaluationReferencePersonId, {emitEvent: false}); // add findItemById function
                this.salesTerminateConsultantForm.noEvaluation?.setValue(result?.noEvaluation, {emitEvent: false});
                this.salesTerminateConsultantForm.causeOfNoEvaluation?.setValue(result?.causeOfNoEvaluation, {emitEvent: false});

                // example with findItemById
                // this.salesMainDataForm.projectType?.setValue(this.findItemById(this.projectTypes, result?.salesMainData?.projectTypeId), {emitEvent: false});
            });
    }

    updateTerminationSalesStep() {
        let input = new WorkflowTerminationSalesDataDto();
        input.terminationBeforeEndOfContract =  this.salesTerminateConsultantForm?.terminationBeforeEndOfContract?.value;
        input.endDate = this.salesTerminateConsultantForm?.endDate?.value;
        input.terminationReason = this.salesTerminateConsultantForm?.terminationReason?.value;
        input.causeOfTerminationBeforeEndOfContract = this.salesTerminateConsultantForm?.causeOfTerminationBeforeEndOfContract?.value;
        input.additionalComments = this.salesTerminateConsultantForm?.additionalComments?.value;

        input.finalEvaluationReferencePersonId = this.salesTerminateConsultantForm?.finalEvaluationReferencePersonId?.value.id;
        input.noEvaluation = this.salesTerminateConsultantForm?.noEvaluation?.value;
        input.causeOfNoEvaluation =  this.salesTerminateConsultantForm.causeOfNoEvaluation?.value;

        this._workflowServiceProxy.terminationSalesPut(this.workflowId!, input)
            .pipe(finalize(() => {

            }))
            .subscribe(result => {

            })
    }

    completeTerminationSalesStep() {
        let input = new WorkflowTerminationSalesDataDto();
        input.terminationBeforeEndOfContract =  this.salesTerminateConsultantForm?.terminationBeforeEndOfContract?.value;
        input.endDate = this.salesTerminateConsultantForm?.endDate?.value;
        input.terminationReason = this.salesTerminateConsultantForm?.terminationReason?.value;
        input.causeOfTerminationBeforeEndOfContract = this.salesTerminateConsultantForm?.causeOfTerminationBeforeEndOfContract?.value;
        input.additionalComments = this.salesTerminateConsultantForm?.additionalComments?.value;

        input.finalEvaluationReferencePersonId = this.salesTerminateConsultantForm?.finalEvaluationReferencePersonId?.value.id;
        input.noEvaluation = this.salesTerminateConsultantForm?.noEvaluation?.value;
        input.causeOfNoEvaluation =  this.salesTerminateConsultantForm.causeOfNoEvaluation?.value;

        this._workflowServiceProxy.terminationSalesPut(this.workflowId!, input)
            .pipe(finalize(() => {

            }))
            .subscribe(result => {

            })
    }
}
