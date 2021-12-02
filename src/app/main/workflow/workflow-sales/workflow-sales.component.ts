import { Overlay } from '@angular/cdk/overlay';
import { Component, Injector, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { AppComopnentBase } from 'src/shared/app-component-base';
import { ClientRateDto, ConsultantSalesDataDto, ContractSignerDto, EnumEntityTypeDto, EnumServiceProxy, SalesAdditionalDataDto, SalesClientDataDto, SalesMainDataDto, SignerRole, WorkflowSalesDataDto, WorkflowsServiceProxy } from 'src/shared/service-proxies/service-proxies';
import { WorkflowDataService } from '../workflow-data.service';
import { ConsultantTypes, WorkflowSalesAdditionalDataForm, WorkflowSalesClientDataForm, WorkflowSalesConsultantsForm, WorkflowSalesMainForm } from './workflow-sales.model';
@Component({
    selector: 'app-workflow-sales',
    templateUrl: './workflow-sales.component.html',
    styleUrls: ['./workflow-sales.component.scss']
})
export class WorkflowSalesComponent extends AppComopnentBase implements OnInit {
    @Input() workflowId: number;
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
    constructor(
        injector: Injector,
        private _fb: FormBuilder,
        private _enumService: EnumServiceProxy,
        private _workflowService: WorkflowsServiceProxy,
        private _workflodDataService: WorkflowDataService,
        private activatedRoute: ActivatedRoute,
        private overlay: Overlay,
        private dialog: MatDialog
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
            this.workflowId = +params.get('id')!;
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

        this._workflodDataService.workflowSalesSaved
            .pipe(takeUntil(this._unsubscribe))
            .subscribe(() => {
                this.saveSalesStep();
            });
    }

    ngOnDestroy(): void {
        this._unsubscribe.next();
        this._unsubscribe.complete();
    }

    //#region dataFetch

    getCurrencies() {
        this._workflodDataService.getCurrencies()
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.currencies = result;
            });
    }

    getUnitTypes() {
        this._workflodDataService.getUnitTypes()
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.rateUnitTypes = result;
            });
    }

    getDeliveryTypes() {
        this._workflodDataService.getDeliveryTypes()
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.deliveryTypes = result;
            });
    }

    getSaleTypes() {
        this._workflodDataService.getSaleTypes()
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.saleTypes = result;
            });
    }

    getInvoicingTimes() {
        this._workflodDataService.getInvoicingTimes()
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.invoicingTimes = result;
            });
    }

    getInvoiceFrequencies() {
        this._workflodDataService.getInvoiceFrequencies()
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.invoiceFrequencies = result;
            });
    }

    getSignerRoles() {
        this._workflodDataService.getSignerRoles()
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.signerRoles = result;
            });
    }


    getMargins() {
        this._workflodDataService.getMargins()
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.margins = result;
            });
    }

    getExtensionDeadlines() {
        this._workflodDataService.getExtensionDeadlines()
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.clientExtensionDeadlines = result;
            });
    }

    getExtensionDurations() {
        this._workflodDataService.getExtensionDurations()
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.clientExtensionDurations = result;
            });
    }

    getSpecialFeeFrequencies() {
        this._workflodDataService.getSpecialFeeFrequencies()
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.clientSpecialFeeFrequencies = result;
            });
    }

    getSpecialFeeSpecifications() {
        this._workflodDataService.getSpecialFeeSpecifications()
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.clientSpecialFeeSpecifications = result;
            });
    }

    getSpecialRateOrFeeDirections() {
        this._workflodDataService.getSpecialRateOrFeeDirections()
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.clientSpecialRateOrFeeDirections = result;
            });
    }

    getSpecialRateReportUnits() {
        this._workflodDataService.getSpecialRateReportUnits()
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.clientSpecialRateReportUnits = result;
            });
    }

    getSpecialRateSpecifications() {
        this._workflodDataService.getSpecialRateSpecifications()
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
        this.salesMainClientDataForm.clientSigners.push(form);
    }

    get clientSigners(): FormArray {
        return this.salesMainClientDataForm.get('clientSigners') as FormArray;
    }

    removeSigner(index: number) {
        this.clientSigners.removeAt(index);
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

        dialogRef.componentInstance.onConfimrmed.subscribe(() => {
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

    saveSalesStep() {
        let input = new WorkflowSalesDataDto();
        input.salesMainData = new SalesMainDataDto();
        input.salesMainData.salesTypeId = this.salesMainDataForm.salesType?.value?.id;
        input.salesMainData.deliveryTypeId = this.salesMainDataForm.deliveryType?.value?.id;
        input.salesMainData.salesAccountManagerIdValue = this.salesMainDataForm.salesAccountManager?.value;
        input.salesMainData.commissionAccountManagerIdValue = this.salesMainDataForm.commissionAccountManager?.value;
        input.salesMainData.projectDescription = this.salesMainDataForm.projectDescription?.value;

        input.salesClientData = new SalesClientDataDto();
        input.salesClientData.directClientIdValue = this.salesMainClientDataForm.directClient?.value;
        input.salesClientData.endClientIdValue = this.salesMainClientDataForm.invoicingProDataEntity?.value;
        input.salesClientData.pdcInvoicingEntityId = this.salesMainClientDataForm.clientInvoicingReferencePerson?.value;
        input.salesClientData.clientInvoicingRecipientSameAsDirectClient = this.salesMainClientDataForm.sameAsDirectClient?.value;
        // FIXME: fix after design changes
        input.salesClientData.clientInvoicingRecipientIdValue = this.salesMainClientDataForm.invoicingProDataEntity?.value;
        // FIXME: fix after design changes
        input.salesClientData.noInvoicingReferencePerson = this.salesMainClientDataForm.isClientInvoicingNone?.value ? this.salesMainClientDataForm.isClientInvoicingNone?.value : false;
        // FIXME: fix after design changes
        input.salesClientData.invoicingReferencePersonIdValue = this.salesMainClientDataForm.clientInvoicingReferencePerson?.value;
        // FIXME: fix after design changes
        input.salesClientData.evaluationsReferencePersonIdValue = this.salesMainClientDataForm.evaluationReferencePerson?.value;
        input.salesClientData.evaluationsDisabled = this.salesMainClientDataForm.disableEvaluations?.value ? this.salesMainClientDataForm.disableEvaluations?.value : false;
        input.salesClientData.evaluationsDisabledReason = this.salesMainClientDataForm.disableEvaluationsReason?.value;
        input.salesClientData.contractSigners = [];
        // for (let i = 0; i < this.salesMainClientDataForm.clientSigners.value.length; i++) {
        //     let signer = this.salesMainClientDataForm.clientSigners.value[i];
        //     let contractSigner = new ContractSignerDto();
        //     contractSigner.signOrder = i + 1;
        //     contractSigner.contactId = signer.clientSequence;
        //     contractSigner.signerRole = new SignerRole();
        //     input.salesClientData.contractSigners.push(contractSigner);
        // }
        input.salesClientData.noSpecialContractTerms = this.salesMainClientDataForm.isSpecialContractTermsNone?.value ? this.salesMainClientDataForm.isSpecialContractTermsNone?.value : false;
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

        this._workflowService.salesPut(this.workflowId, input)
            .pipe(finalize(() => {
            }))
            .subscribe(result => {

            });
    }

    getWorkflowSalesStep() {
        this._workflowService.salesGet(this.workflowId)
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.salesMainDataForm.salesType?.setValue(this.findItemById(this.saleTypes, result?.salesMainData?.salesTypeId), {emitEvent: false});
                this.salesMainDataForm.deliveryType?.setValue(this.findItemById(this.deliveryTypes, result?.salesMainData?.deliveryTypeId), {emitEvent: false});
                this.salesMainDataForm.margin?.setValue(result?.salesAdditionalData?.marginId, {emitEvent: false});
                this.salesMainDataForm.projectDescription?.setValue(result?.salesMainData?.projectDescription, {emitEvent: false});
                this.salesMainDataForm.remarks?.setValue(result?.salesAdditionalData?.remarks, {emitEvent: false});
                this.salesMainDataForm.salesAccountManager?.setValue(result?.salesMainData?.salesAccountManagerIdValue, {emitEvent: false});
                this.salesMainDataForm.commissionAccountManager?.setValue(result?.salesMainData?.commissionAccountManagerIdValue, {emitEvent: false});

                this.salesMainClientDataForm.directClient?.setValue(result?.salesClientData?.directClientIdValue, {emitEvent: false});
                this.salesMainClientDataForm.invoicingProDataEntity?.setValue(result?.salesClientData?.endClientIdValue, {emitEvent: false});
                this.salesMainClientDataForm.clientInvoicingReferencePerson?.setValue(result?.salesClientData?.pdcInvoicingEntityId, {emitEvent: false});
                this.salesMainClientDataForm.sameAsDirectClient?.setValue(result?.salesClientData?.clientInvoicingRecipientSameAsDirectClient, {emitEvent: false});

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


    // form validations
    disableOrEnableInput(boolValue: boolean, control: AbstractControl | null | undefined) {
        if (boolValue) {
            // FIXME: do we need to clear input if it will be disabled ?
            control!.setValue(null, {emitEvent: false});
            control!.disable();
        } else {
            control!.enable();
        }
    }

}
