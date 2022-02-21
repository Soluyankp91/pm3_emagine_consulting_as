import { Overlay } from '@angular/cdk/overlay';
import { Component, Injector, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { InternalLookupService } from 'src/app/shared/common/internal-lookup.service';
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { AppComopnentBase } from 'src/shared/app-component-base';
import { ClientPeriodSalesDataDto, ClientPeriodServiceProxy, ClientRateDto, ConsultantRateDto, ConsultantSalesDataDto, ContractSignerDto, EnumEntityTypeDto, EnumServiceProxy, SalesClientDataDto, SalesMainDataDto, SignerRole } from 'src/shared/service-proxies/service-proxies';
import { WorkflowConsultantActionsDialogComponent } from '../workflow-consultant-actions-dialog/workflow-consultant-actions-dialog.component';
import { WorkflowDataService } from '../workflow-data.service';
import { ChangeConsultantDto, ExtendConsultantDto, TerminateConsultantDto, WorkflowProcessType, WorkflowSideSections, WorkflowTopSections } from '../workflow.model';
import { ConsultantDiallogAction, ConsultantTypes, InputReadonlyState, InputReadonlyStates, WorkflowSalesAdditionalDataForm, WorkflowSalesClientDataForm, WorkflowSalesConsultantsForm, WorkflowSalesMainForm } from './workflow-sales.model';
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

    // workflowSideSections = WorkflowSideSections;
    workflowSideSections = WorkflowProcessType;
    // SalesStep
    intracompanyActive = false;
    salesMainClientDataForm: WorkflowSalesClientDataForm;
    salesMainDataForm: WorkflowSalesMainForm;
    consultantsForm: WorkflowSalesConsultantsForm;
    additionalDataForm: WorkflowSalesAdditionalDataForm;

    clientSpecialRateActive = false;
    clientSpecialFeesActive = false;

    deliveryTypes: EnumEntityTypeDto[] = [];
    currencies: EnumEntityTypeDto[] = [];
    saleTypes: EnumEntityTypeDto[] = [];
    invoicingTimes: EnumEntityTypeDto[] = [];
    rateUnitTypes: EnumEntityTypeDto[] = [];
    invoiceFrequencies: EnumEntityTypeDto[] = [];
    signerRoles: EnumEntityTypeDto[] = [];
    margins: EnumEntityTypeDto[] = [];
    clientExtensionDeadlines: EnumEntityTypeDto[] = [];
    clientExtensionDurations: EnumEntityTypeDto[] = [];
    clientSpecialFeeFrequencies: EnumEntityTypeDto[] = [];
    clientSpecialFeeSpecifications: EnumEntityTypeDto[] = [];
    clientSpecialRateOrFeeDirections: EnumEntityTypeDto[] = [];
    clientSpecialRateReportUnits: EnumEntityTypeDto[] = [];
    clientSpecialRateSpecifications: EnumEntityTypeDto[] = [];
    contractExpirationNotificationDuration: EnumEntityTypeDto[] = [];

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
        private _lookupService: InternalLookupService,
        // private _startWorkflowService: StartWorkflowControllerServiceProxy
        private _clientPeriodService: ClientPeriodServiceProxy
    ) {
        super(injector);
        this.salesMainClientDataForm = new WorkflowSalesClientDataForm();
        this.salesMainDataForm = new WorkflowSalesMainForm();
        this.consultantsForm = new WorkflowSalesConsultantsForm();
        this.additionalDataForm = new WorkflowSalesAdditionalDataForm();
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

        // init form arrays
        this.addSignerToForm();
        this.addConsultantForm();

        this.getWorkflowSalesStep();

        this._workflowDataService.workflowSalesSaved
            .pipe(takeUntil(this._unsubscribe))
            .subscribe((value: boolean) => {
                // NB: boolean SAVE DRAFT or COMPLETE in future
                this.saveSalesStep();
            });

        this.updateReadonlyState();
    }
    get readOnlyMode() {
        return this._workflowDataService.getWorkflowProgress.isWorkflowSalesSaved;
    }

    updateReadonlyState() {
        // detect if WF Completed
        // then all inputs are readonly
        if (this._workflowDataService.getWorkflowProgress.isPrimaryWorkflowCompleted) {
            this.readonlyInput.forEach(item => {
                item.readonly = true;
            });
            // this.updateReadonlyState();
        }
        // else if extensions disable only needed controls
        // const controlsToDisable = ['salesType', 'deliveryType', ...];
    }

    isReadonlyInput(controlName: string): boolean {
        const controlToDetect = this.readonlyInput.find(x => x.name === controlName);
        return controlToDetect ? controlToDetect.readonly : false;
    }

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
        this._lookupService.getCurrencies()
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.currencies = result;
            });
    }

    getUnitTypes() {
        this._lookupService.getUnitTypes()
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.rateUnitTypes = result;
            });
    }

    getDeliveryTypes() {
        this._lookupService.getDeliveryTypes()
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.deliveryTypes = result;
            });
    }

    getSaleTypes() {
        this._lookupService.getSaleTypes()
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.saleTypes = result;
            });
    }

    getInvoicingTimes() {
        this._lookupService.getInvoicingTimes()
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.invoicingTimes = result;
            });
    }

    getInvoiceFrequencies() {
        this._lookupService.getInvoiceFrequencies()
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.invoiceFrequencies = result;
            });
    }

    getSignerRoles() {
        this._lookupService.getSignerRoles()
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.signerRoles = result;
            });
    }


    getMargins() {
        this._lookupService.getMargins()
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.margins = result;
            });
    }

    getExtensionDeadlines() {
        this._lookupService.getExtensionDeadlines()
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.clientExtensionDeadlines = result;
            });
    }

    getExtensionDurations() {
        this._lookupService.getExtensionDurations()
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.clientExtensionDurations = result;
            });
    }

    getSpecialFeeFrequencies() {
        this._lookupService.getSpecialFeeFrequencies()
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.clientSpecialFeeFrequencies = result;
            });
    }

    getSpecialFeeSpecifications() {
        this._lookupService.getSpecialFeeSpecifications()
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.clientSpecialFeeSpecifications = result;
            });
    }

    getSpecialRateOrFeeDirections() {
        this._lookupService.getSpecialRateOrFeeDirections()
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.clientSpecialRateOrFeeDirections = result;
            });
    }

    getSpecialRateReportUnits() {
        this._lookupService.getSpecialRateReportUnits()
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.clientSpecialRateReportUnits = result;
            });
    }

    getSpecialRateSpecifications() {
        this._lookupService.getSpecialRateSpecifications()
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.clientSpecialRateSpecifications = result;
            });
    }

    getContractExpirationNotificationInterval() {
        this._lookupService.getContractExpirationNotificationInterval()
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.contractExpirationNotificationDuration = result;
            });
    }

    //#endregion dataFetch

    addSignerToForm() {
        const form = this._fb.group({
            clientName: new FormControl(null),
            clientRole: new FormControl(null),
            clientSequence: new FormControl(null)
        });
        this.salesMainClientDataForm.contractSigners.push(form);
    }

    get contractSigners(): FormArray {
        return this.salesMainClientDataForm.get('contractSigners') as FormArray;
    }

    removeSigner(index: number) {
        this.contractSigners.removeAt(index);
    }

    addConsultantForm() {
        const form = this._fb.group({
            consultantType: new FormControl(null),
            consultantName: new FormControl(null),

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

            consultantAccountManager: new FormControl(false)
        });
        this.consultantsForm.consultantData.push(form);
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
        input.salesMainData.noRemarks = !this.salesMainDataForm.isRemarks?.value;

        input.salesClientData.differentEndClient = this.salesMainClientDataForm.isDirectClient?.value;
        input.salesClientData.directClientIdValue = this.salesMainClientDataForm.directClientIdValue?.value;
        input.salesClientData.endClientIdValue = this.salesMainClientDataForm.endClientIdValue?.value;
        input.salesClientData.startDate = this.salesMainClientDataForm.clientContractStartDate?.value;
        input.salesClientData.noEndDate = this.salesMainClientDataForm.clientContractNoEndDate?.value;
        input.salesClientData.endDate = this.salesMainClientDataForm.clientContractEndDate?.value;
        input.salesClientData.noClientExtensionOption = !this.salesMainClientDataForm.clientExtensionNoEndDate?.value;
        input.salesClientData.clientExtensionDurationId = this.salesMainClientDataForm.clientExtensionDuration?.value;
        input.salesClientData.clientExtensionDeadlineId = this.salesMainClientDataForm.clientExtensionDeadline?.value;
        input.salesClientData.clientExtensionSpecificDate = this.salesMainClientDataForm.clientExtensionEndDate?.value;
        input.salesClientData.clientTimeReportingCapId = this.salesMainClientDataForm.capOnTimeReporting?.value?.id;
        input.salesClientData.clientTimeReportingCapMaxValue = this.salesMainClientDataForm.capOnTimeReportingValue?.value;
        input.salesClientData.pdcInvoicingEntityId = this.salesMainClientDataForm.pdcInvoicingEntityId?.value;

        input.salesClientData.clientRate = new ClientRateDto();
        input.salesClientData.clientRate.isTimeBasedRate = this.salesMainClientDataForm.clientRateAndInvoicing?.value?.name === 'Time base';
        input.salesClientData.clientRate.isFixedRate = this.salesMainClientDataForm.clientRateAndInvoicing?.value?.name === 'Fixed';
        input.salesClientData.clientRate.currencyId = this.salesMainClientDataForm.clientCurrency?.value
        input.salesClientData.clientRate.invoiceCurrencyId = this.salesMainClientDataForm.clientInvoiceCurrency?.value;
        input.salesClientData.clientRate.normalRate = this.salesMainClientDataForm.clientPrice?.value;
        input.salesClientData.clientRate.rateUnitTypeId = this.salesMainClientDataForm.rateUnitTypeId?.value;
        input.salesClientData.clientRate.invoiceFrequencyId = this.salesMainClientDataForm.clientInvoicingTime?.value;
        input.salesClientData.clientRate.manualDate = this.salesMainClientDataForm.clientInvoicingDate?.value;
        // input.salesClientData.clientRate.invoicingTimeId = this.salesMainClientDataForm.clientInvoicingDate?.value;
        // input.salesClientData.clientRate.price =
        // input.salesClientData.clientRate.invoicingTimeId =

        input.salesClientData.noInvoicingReferenceNumber = this.salesMainClientDataForm.invoicingReferenceNumber?.value ?? false;
        input.salesClientData.invoicingReferenceNumber = this.salesMainClientDataForm.invoicingReferenceNumber?.value;
        input.salesClientData.clientInvoicingRecipientSameAsDirectClient = this.salesMainClientDataForm.clientInvoicingRecipientSameAsDirectClient?.value;
        input.salesClientData.clientInvoicingRecipientIdValue = this.salesMainClientDataForm.clientInvoicingRecipientIdValue?.value;
        input.salesClientData.noInvoicingReferencePerson = this.salesMainClientDataForm.noInvoicingReferencePerson?.value;
        input.salesClientData.invoicingReferencePersonIdValue = this.salesMainClientDataForm.invoicingReferencePersonIdValue?.value?.id;

        // TODO: ADD when UI + API For client rates/fee inside WF will be ready
        // input.salesClientData.noClientSpecialRate = this.salesMainClientDataForm.value.
        // input.salesClientData.clientSpecialRates = this.salesMainClientDataForm.value.
        // input.salesClientData.noClientSpecialFee = this.salesMainClientDataForm.value.
        // input.salesClientData.clientSpecialFees = this.salesMainClientDataForm.value.

        input.salesClientData.evaluationsReferencePersonIdValue = this.salesMainClientDataForm.evaluationsReferencePersonIdValue?.value?.id;
        input.salesClientData.evaluationsDisabled = this.salesMainClientDataForm.evaluationsDisabled?.value;
        input.salesClientData.evaluationsDisabledReason = this.salesMainClientDataForm.evaluationsDisabledReason?.value;
        input.salesClientData.noSpecialContractTerms = this.salesMainClientDataForm.noSpecialContractTerms?.value;
        input.salesClientData.specialContractTerms = this.salesMainClientDataForm.specialContractTerms?.value;

        input.salesClientData.contractSigners = new Array<ContractSignerDto>();
        this.salesMainClientDataForm.contractSigners.value.forEach((signer: any) => {
            let signerInput = new ContractSignerDto();
            signerInput.signOrder = signer.clientSequence;
            signerInput.contactId = signer.clientName;
            signerInput.signerRole = signer.clientRole;
        });

        this.consultantsForm.consultantData.value.forEach((consultant: any) => {
            let consultantInput = new ConsultantSalesDataDto();
            consultantInput.employmentTypeId = consultant.consultantType;
            consultantInput.consultantId = consultant.consultantName;

            // ??
            // consultantInput.nameOnly = consultant.nameOnly;
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
                this.salesMainDataForm.salesType?.setValue(this.findItemById(this.saleTypes, result?.salesMainData?.salesTypeId), {emitEvent: false});
                this.salesMainDataForm.deliveryType?.setValue(this.findItemById(this.deliveryTypes, result?.salesMainData?.deliveryTypeId), {emitEvent: false});
                this.salesMainDataForm.margin?.setValue(result?.salesMainData?.marginId, {emitEvent: false});
                this.salesMainDataForm.projectDescription?.setValue(result?.salesMainData?.projectDescription, {emitEvent: false});
                this.salesMainDataForm.remarks?.setValue(result?.salesMainData?.remarks, {emitEvent: false});
                this.salesMainDataForm.salesAccountManagerIdValue?.setValue(result?.salesMainData?.salesAccountManagerIdValue, {emitEvent: false});
                this.salesMainDataForm.commissionAccountManagerIdValue?.setValue(result?.salesMainData?.commissionAccountManagerIdValue, {emitEvent: false});

                this.salesMainClientDataForm.directClientIdValue?.setValue(result?.salesClientData?.directClientIdValue, {emitEvent: false});
                this.salesMainClientDataForm.pdcInvoicingEntityId?.setValue(result?.salesClientData?.pdcInvoicingEntityId, {emitEvent: false});
                this.salesMainClientDataForm.invoicingReferencePersonIdValue?.setValue(result?.salesClientData?.invoicingReferencePersonIdValue, {emitEvent: false});
                this.salesMainClientDataForm.clientInvoicingRecipientSameAsDirectClient?.setValue(result?.salesClientData?.clientInvoicingRecipientSameAsDirectClient, {emitEvent: false});

            });
    }

    toggleClientFees() {
        this.salesMainClientDataForm.clientFees?.setValue(null, {emitEvent: false})
        this.salesMainClientDataForm.clientFeesCurrency?.setValue(null, {emitEvent: false});
        this.clientSpecialFeesActive = !this.clientSpecialFeesActive;
    }

    toggleSpecialClientRates() {
        this.salesMainClientDataForm.clientSpecialRatePrice?.setValue(null, {emitEvent: false})
        this.salesMainClientDataForm.clientSpecialRateCurrency?.setValue(null, {emitEvent: false});
        this.clientSpecialRateActive = !this.clientSpecialRateActive;
    }

    clientRateTypeChange(value: EnumEntityTypeDto) {
        if (value) {
            this.salesMainClientDataForm.rateUnitTypeId?.setValue(null, {emitEvent: false});
            this.salesMainClientDataForm.clientPrice?.setValue(null, {emitEvent: false});
            this.salesMainClientDataForm.clientCurrency?.setValue(null, {emitEvent: false});
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


    addCommission() {
        const form = this._fb.group({
            type: new FormControl(null),
            value: new FormControl(''),
            recipientType: new FormControl(null),
            recipient: new FormControl(null),
            frequency: new FormControl(null),
            editable: new FormControl(false)
        });
        this.salesMainDataForm.commissions.push(form);
    }

    get commissions() {
        return this.salesMainDataForm.commissions as FormArray;
    }

    removeCommission(index: number) {
        this.commissions.removeAt(index);
    }

    editCommissionRow(index: number) {
        const isEditable = this.commissions.at(index).get('editable')?.value;
        this.commissions.at(index).get('editable')?.setValue(!isEditable);
    }
}
