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
import { ClientRateDto, ConsultantSalesDataDto, ContractSignerDto, EnumEntityTypeDto, EnumServiceProxy, SalesAdditionalDataDto, SalesClientDataDto, SalesMainDataDto, SignerRole, StartWorkflowControllerServiceProxy, WorkflowSalesDataDto, WorkflowsServiceProxy } from 'src/shared/service-proxies/service-proxies';
import { WorkflowConsultantActionsDialogComponent } from '../workflow-consultant-actions-dialog/workflow-consultant-actions-dialog.component';
import { WorkflowDataService } from '../workflow-data.service';
import { ChangeConsultantDto, ExtendConsultantDto, TerminateConsultantDto, WorkflowSideSections, WorkflowTopSections } from '../workflow.model';
import { ConsultantDiallogAction, ConsultantTypes, InputReadonlyState, InputReadonlyStates, WorkflowSalesAdditionalDataForm, WorkflowSalesClientDataForm, WorkflowSalesConsultantsForm, WorkflowSalesMainForm } from './workflow-sales.model';
@Component({
    selector: 'app-workflow-sales',
    templateUrl: './workflow-sales.component.html',
    styleUrls: ['./workflow-sales.component.scss']
})
export class WorkflowSalesComponent extends AppComopnentBase implements OnInit {
    @Input() workflowId: string;

    @Input() primaryWorkflow: boolean;
    @Input() changeWorkflow: boolean;
    @Input() extendWorkflow: boolean;
    @Input() addConsultant: boolean;
    @Input() changeConsultant: boolean;

    // Changed all above to enum
    @Input() activeSideSection: number;

    workflowSideSections = WorkflowSideSections;
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
        private _workflowService: WorkflowsServiceProxy,
        private _workflowDataService: WorkflowDataService,
        private activatedRoute: ActivatedRoute,
        private overlay: Overlay,
        private dialog: MatDialog,
        private _lookupService: InternalLookupService,
        private _startWorkflowService: StartWorkflowControllerServiceProxy
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

        // init form arrays
        this.addSignerToForm();
        this.addConsultantForm();

        this.getWorkflowSalesStep();

        this._workflowDataService.workflowSalesSaved
            .pipe(takeUntil(this._unsubscribe))
            .subscribe((value: boolean) => {
                // NB: SAVE DRAFT or COMPLETE
                this.saveSalesStep(value);
            });

        this.updateReadonlyState();
    }
    get readOnlyMode() {
        return this._workflowDataService.getWorkflowProgress.isPrimaryWorkflowCompleted;
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
            consultantWorkplaceOnsite: new FormControl(null),
            consultantWorkplaceRemote: new FormControl(null),
            consultantWorkplaceMixPercentage: new FormControl(null),

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

    saveSalesStep(isDraft: boolean) {
        let input = new WorkflowSalesDataDto();
        input.salesMainData = new SalesMainDataDto();
        input.salesMainData.salesTypeId = this.salesMainDataForm.salesType?.value?.id;
        input.salesMainData.deliveryTypeId = this.salesMainDataForm.deliveryType?.value?.id;
        input.salesMainData.salesAccountManagerIdValue = this.salesMainDataForm.salesAccountManagerIdValue?.value;
        input.salesMainData.commissionAccountManagerIdValue = this.salesMainDataForm.commissionAccountManagerIdValue?.value;
        input.salesMainData.projectDescription = this.salesMainDataForm.projectDescription?.value;

        input.salesClientData = new SalesClientDataDto();
        input.salesClientData.directClientIdValue = this.salesMainClientDataForm.directClientIdValue?.value;
        input.salesClientData.endClientIdValue = this.salesMainClientDataForm.pdcInvoicingEntityId?.value;
        input.salesClientData.pdcInvoicingEntityId = this.salesMainClientDataForm.pdcInvoicingEntityId?.value;
        input.salesClientData.clientInvoicingRecipientSameAsDirectClient = this.salesMainClientDataForm.clientInvoicingRecipientSameAsDirectClient?.value;
        // FIXME: fix after design changes
        input.salesClientData.clientInvoicingRecipientIdValue = this.salesMainClientDataForm.clientInvoicingRecipientIdValue?.value?.id;
        // FIXME: fix after design changes
        input.salesClientData.noInvoicingReferencePerson = this.salesMainClientDataForm.noInvoicingReferencePerson?.value ? this.salesMainClientDataForm.noInvoicingReferencePerson?.value : false;
        // FIXME: fix after design changes
        input.salesClientData.invoicingReferencePersonIdValue = this.salesMainClientDataForm.invoicingReferencePersonIdValue?.value?.id;
        // FIXME: fix after design changes
        input.salesClientData.evaluationsReferencePersonIdValue = this.salesMainClientDataForm.evaluationsReferencePersonIdValue?.value?.id;
        input.salesClientData.evaluationsDisabled = this.salesMainClientDataForm.evaluationsDisabled?.value ? this.salesMainClientDataForm.evaluationsDisabled?.value : false;
        input.salesClientData.evaluationsDisabledReason = this.salesMainClientDataForm.evaluationsDisabledReason?.value;
        input.salesClientData.contractSigners = [];
        // FIXME: fix after BE changes
        // for (let i = 0; i < this.salesMainClientDataForm.contractSigners.value.length; i++) {
        //     let signer = this.salesMainClientDataForm.contractSigners.value[i];
        //     let contractSigner = new ContractSignerDto();
        //     contractSigner.signOrder = i + 1;
        //     contractSigner.contactId = signer.clientSequence;
        //     contractSigner.signerRole = new SignerRole();
        //     input.salesClientData.contractSigners.push(contractSigner);
        // }

        input.salesClientData.noSpecialContractTerms = this.salesMainClientDataForm.noSpecialContractTerms?.value ? this.salesMainClientDataForm.noSpecialContractTerms?.value : false;
        input.salesClientData.specialContractTerms = this.salesMainClientDataForm.specialContractTerms?.value;
        // FIXME: fix after design changes
        input.salesClientData.noInvoicingReferenceNumber = false;
        input.salesClientData.invoicingReferenceNumber = this.salesMainClientDataForm.invoicingReferenceNumber?.value;
        input.salesClientData.clientRate = new ClientRateDto();
        // input.clientRate.isTimeBasedRate = this.salesMainClientDataForm.isTimeBasedRate.value;
        // input.clientRate.isFixedRate = this.salesMainClientDataForm.isFixedRate.value;
        input.salesClientData.clientRate.currencyId = this.salesMainClientDataForm.clientCurrency?.value;
        input.salesClientData.clientRate.invoiceCurrencyId = this.salesMainClientDataForm.clientInvoiceCurrency?.value;
        // input.clientRate.normalRate = this.salesMainClientDataForm.normalRate.value;
        // input.clientRate.rateUnitTypeId = this.salesMainClientDataForm.rateUnitTypeId.value;
        // input.clientRate.customInvoiceFrequency = this.salesMainClientDataForm.customInvoiceFrequency.value;
        // input.clientRate.price = this.salesMainClientDataForm.price.value;
        // input.clientRate.invoicingTimeId = this.salesMainClientDataForm.invoicingTimeId.value;

        // FIXME: fix after design changes
        input.salesClientData.noClientSpecialRate = false;
        // input.salesClientData.clientSpecialRates = this.salesMainClientDataForm.clientSpecialRates.value; // number[]

        input.salesClientData.noClientSpecialFee = !this.clientSpecialFeesActive;
        input.salesClientData.clientSpecialFees = [];
        // FIXME: fix after design changes
        // "clientSpecialFees": [
        //     0
        // ],

        input.salesClientData.contractStartDate = this.salesMainClientDataForm.clientContractStartDate?.value;
        input.salesClientData.contractEndDate = this.salesMainClientDataForm.clientContractEndDate?.value;
        input.salesClientData.noContractEndDate = this.salesMainClientDataForm.clientContractNoEndDate?.value ? this.salesMainClientDataForm.clientContractNoEndDate?.value : false;

        input.salesClientData.noClientExtensionOption = this.salesMainClientDataForm.clientExtensionNoEndDate?.value ? this.salesMainClientDataForm.clientExtensionNoEndDate?.value : false;
        input.salesClientData.clientExtensionDurationId = this.salesMainClientDataForm.clientExtensionStartDate?.value;
        input.salesClientData.clientExtensionDeadlineId = this.salesMainClientDataForm.clientExtensionDeadline?.value;

        input.consultantSalesDatas = new Array<ConsultantSalesDataDto>();
        // for (let i = 0; i < this.consultantsForm.consultantData.value.length; i++) {
        //     let consultant = this.consultantsForm.consultantData.value[i];
        //     let workflowConsultant = new ConsultantSalesDataDto();
        //     workflowConsultant.idValue = consultant.idValue;
        //     workflowConsultant.employmentTypeId = consultant.employmentTypeId;
        //     workflowConsultant.nameOnly = consultant.nameOnly;
        //     workflowConsultant.pdcPaymentEntityId = consultant.pdcPaymentEntityId;
        //     workflowConsultant.specialContractTerms = consultant.specialContractTerms;
        //     workflowConsultant.contractStartDate = consultant.contractStartDate;
        //     workflowConsultant.isNoContractEndDate = consultant.isNoContractEndDate;
        //     workflowConsultant.contractEndDate = consultant.contractEndDate;
        //     workflowConsultant.isOnsiteWorkplace = consultant.isOnsiteWorkplace;
        //     workflowConsultant.isRemoteWorkplace = consultant.isRemoteWorkplace;
        //     workflowConsultant.isMixedWorkplace = consultant.isMixedWorkplace;
        //     workflowConsultant.mainOnsiteClientId = consultant.mainOnsiteClientId;
        //     workflowConsultant.mainRemoteAddressCountryId = consultant.mainRemoteAddressCountryId;
        //     workflowConsultant.noExpectedWorkload = consultant.noExpectedWorkload;
        //     workflowConsultant.expectedWorkloadHours = consultant.expectedWorkloadHours;
        //     workflowConsultant.expectedWorkloadUnitId = consultant.expectedWorkloadUnitId;
        //     workflowConsultant.noCap = consultant.noCap;
        //     workflowConsultant.sharedCap = consultant.sharedCap;
        //     workflowConsultant.capOnMaxNumberOfUnits = consultant.capOnMaxNumberOfUnits;
        //     workflowConsultant.capOnMaxTotalValue = consultant.capOnMaxTotalValue;
        //     workflowConsultant.deliveryManagerSameAsAccountManager = consultant.deliveryManagerSameAsAccountManager;
        //     workflowConsultant.deliveryAccountManagerIdValue = consultant.deliveryAccountManagerIdValue;
        //     input.consultantSalesDatas.push(consultant);
        // }

        input.salesAdditionalData = new SalesAdditionalDataDto();
        input.salesAdditionalData.marginId = this.salesMainDataForm.margin?.value;
        input.salesAdditionalData.remarks = this.additionalDataForm.remarks?.value;
        input.salesAdditionalData.noSharedCap = this.salesMainClientDataForm.capOnTimeReporting?.value;

        // if (isDraft) {

        // } else {
            this._startWorkflowService.salesPut(this.workflowId, input)
                .pipe(finalize(() => {
                }))
                .subscribe(result => {

                });
        // }
    }

    getWorkflowSalesStep() {
        this._startWorkflowService.salesGet(this.workflowId)
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.salesMainDataForm.salesType?.setValue(this.findItemById(this.saleTypes, result?.salesMainData?.salesTypeId), {emitEvent: false});
                this.salesMainDataForm.deliveryType?.setValue(this.findItemById(this.deliveryTypes, result?.salesMainData?.deliveryTypeId), {emitEvent: false});
                this.salesMainDataForm.margin?.setValue(result?.salesAdditionalData?.marginId, {emitEvent: false});
                this.salesMainDataForm.projectDescription?.setValue(result?.salesMainData?.projectDescription, {emitEvent: false});
                this.salesMainDataForm.remarks?.setValue(result?.salesAdditionalData?.remarks, {emitEvent: false});
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
    }

    //#endregion Consultant menu actions

}
