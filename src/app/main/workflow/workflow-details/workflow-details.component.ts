import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormArray } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgScrollbar } from 'ngx-scrollbar';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { WorkflowsServiceProxy, SalesServiceProxy, EnumServiceProxy, EnumEntityTypeDto, WorkflowSalesDataDto, ContractSignerDto, SignerRole, ClientRateDto, WorkflowConsultantDto } from 'src/shared/service-proxies/service-proxies';
import { WorkflowDataService } from '../workflow-data.service';
import { WorkflowSalesComponent } from '../workflow-sales/workflow-sales.component';
import { WorkflowNavigation, WorkflowContractsSummaryForm, WorkflowSalesExtensionForm, WorkflowTerminationSalesForm } from '../workflow.model';

@Component({
  selector: 'app-workflow-details',
  templateUrl: './workflow-details.component.html',
  styleUrls: ['./workflow-details.component.scss']
})
export class WorkflowDetailsComponent implements OnInit, OnDestroy {
    @ViewChild('scrollable', {static: true}) scrollBar: NgScrollbar;
    @ViewChild('workflowSales', {static: false}) workflowSales: WorkflowSalesComponent;

    workflowId: string;
    selectedIndex = 0;
    selectedStep = 'Sales';

    workflowNavigation = WorkflowNavigation;

    contactSummaryForm: WorkflowContractsSummaryForm;
    salesExtensionForm: WorkflowSalesExtensionForm;
    terminationSalesForm: WorkflowTerminationSalesForm;

    deliveryTypes: EnumEntityTypeDto[] = [];
    currencies: EnumEntityTypeDto[] = [];
    saleTypes: EnumEntityTypeDto[] = [];

    private _unsubscribe = new Subject();
    constructor(
        private _fb: FormBuilder,
        private _workflowService: WorkflowsServiceProxy,
        private _workflowSalesService: SalesServiceProxy,
        private _enumService: EnumServiceProxy,
        private _workflofDataService: WorkflowDataService,
        private activatedRoute: ActivatedRoute
    ) {
        this.contactSummaryForm = new WorkflowContractsSummaryForm();
        this.salesExtensionForm = new WorkflowSalesExtensionForm();
        this.terminationSalesForm = new WorkflowTerminationSalesForm();

    }

    ngOnInit(): void {
        this.activatedRoute.paramMap.pipe(
            takeUntil(this._unsubscribe)
        ).subscribe(params => {
            this.workflowId = params.get('id')!;
        });
        // get enums
        // this.getCurrencies();
        // this.getDeliveryTypes();
        // this.getSaleTypes();
        // init form to add signers array
        // this.addSignerToForm();
        // this.addConsultantForm();
        console.log('init');
        this._workflofDataService.getData();
        this.addContractSigner();
    }

    ngOnDestroy(): void {
        this._unsubscribe.next();
        this._unsubscribe.complete();
    }

    // getCurrencies() {
    //     this._enumService.currencies()
    //         .pipe(finalize(() => {

    //         }))
    //         .subscribe(result => {
    //             this.currencies = result;
    //         })
    // }

    // getDeliveryTypes() {
    //     this._enumService.deliveryTypes()
    //         .pipe(finalize(() => {

    //         }))
    //         .subscribe(result => {
    //             this.deliveryTypes = result;
    //         })
    // }

    // getSaleTypes() {
    //     this._enumService.salesTypes()
    //         .pipe(finalize(() => {

    //         }))
    //         .subscribe(result => {
    //             this.saleTypes = result;
    //         })
    // }

    // addSignerToForm() {
    //     const form = this._fb.group({
    //         clientName: new FormControl(null),
    //         clientRole: new FormControl(null),
    //         clientSigvens: new FormControl(null)
    //     });
    //     this.salesMainClientDataForm.clientSigners.push(form);
    // }

    // get clientSigners(): FormArray {
    //     return this.salesMainClientDataForm.get('clientSigners') as FormArray;
    // }

    // removeSigner(index: number) {
    //     this.clientSigners.removeAt(index);
    // }

    // addConsultantForm() {
    //     const form = this._fb.group({
    //         consultantType: new FormControl(null),
    //         consultantEvaluationsProData: new FormControl(null),
    //         disableEvaluations: new FormControl(false),
    //         consultantContractSigners: new FormArray([this.addConsultantSignerToForm()]),
    //         consultantSpecialContractTerms: new FormControl(null),
    //         consultantRate: new FormControl(null),
    //         consultantProjectStartDate: new FormControl(null),
    //         consultantProjectEndDate: new FormControl(null),
    //         consultantProjectNoEndDate: new FormControl(false),
    //         consultantProjectSameAsClientDuration: new FormControl(false)
    //     });
    //     this.consultantsForm.consultantData.push(form);
    // }

    // addConsultantSignerToForm() {
    //     const form = this._fb.group({
    //         clientName: new FormControl(null),
    //         clientRole: new FormControl(null),
    //         clientSigvens: new FormControl(null)
    //     });
    //     return form;
    // }

    // removeConsultant(index: number) {
    //     this.consultantsForm.consultantData.removeAt(index);
    // }

    // removeConsultantSigner(consultantIndex: number, signerIndex: number) {
    //     (this.consultantsForm.consultantData.at(consultantIndex).get('consultantContractSigners') as FormArray).removeAt(signerIndex);
    // }

    // addConsultantSigner(consultantIndex: number) {
    //     const form = this._fb.group({
    //         clientName: new FormControl(null),
    //         clientRole: new FormControl(null),
    //         clientSigvens: new FormControl(null)
    //     });
    //     (this.consultantsForm.consultantData.at(consultantIndex).get('consultantContractSigners') as FormArray).push(form);
    // }

    // removeConsulant(index: number) {
    //     this.consultantsForm.consultantData.removeAt(index);
    // }

    // getConsultantContractSignersControls(index: number) {
    //     return (this.consultantsForm.consultantData.at(index).get('consultantContractSigners') as FormArray).controls;
    // }

    addContractSigner() {
        const form = this._fb.group({
            name: new FormControl(null),
            role: new FormControl(null)
        });
        this.contactSummaryForm.contractData.push(form);
    }

    get contractData(): FormArray {
        return this.contactSummaryForm.get('contractData') as FormArray;
    }

    removeContractSigner(index: number) {
        this.contractData.removeAt(index);
    }

    selectionChange(event: StepperSelectionEvent) {
        this.selectedStep = this.formatStepLabel(event.selectedStep.label);
        if (this.selectedStep.startsWith('ExtensionSales')) {
            this.selectedIndex = parseInt(this.selectedStep.match(/\d/g)!.join(''));
        }
    }

    parseDisplayNameToName(name: string) {
        switch (name) {
            case 'CV update':
                return 'CvUpdate';
            case 'What\'s next?':
                return 'WhatsNext';
            case 'Extension Sales':
                return 'ExtensionSales';
            case 'Extension Contracts':
                return 'ExtensionContracts'
            case 'Termination Sales':
                return 'TerminationSales'
            case 'Termination Contracts':
                return 'TerminationContracts'
            case 'Change In WFData':
                return 'ChangeInWFData'
            default:
                return name;
        }
    }

    formatStepLabel(label: string) {
        return label.replace(/[^A-Z0-9]/ig, '');
    }

    starWorkflow() {
        this._workflowService.start()
            .subscribe(result => {
                this.workflowId = result.workflowId!;
            });
    }

    saveSalesMainData() {
        // let input: SalesMainDataUpdateRequestDto = new SalesMainDataUpdateRequestDto();
        // input.salesTypeId = this.salesMainDataForm.salesType?.value;
        // input.isNearshore = this.salesMainDataForm.nearshoreOffshore?.value === 'Nearshore';
        // input.isOffshore = this.salesMainDataForm.nearshoreOffshore?.value  === 'Offshore';
        // input.isNormal = false; // ISNORMAL ??
        // input.isIntracompanySale = this.intracompanyActive;
        // input.intracompanyAccountManagerId = this.salesMainDataForm.intracompanyAccountManager?.value;
        // input.intracompanyTenantId = this.salesMainDataForm.intracompanyAccountManager?.value; // tenant?
        // input.salesAccountManagerId = this.salesMainDataForm.salesAccountManager?.value;
        // input.commissionAccountManagerId = this.salesMainDataForm.commissionAccountManager?.value;
        // this._workflowSalesService.mainData(this.workflowId, input)
        //     .pipe(finalize(() => {

        //     }))
        //     .subscribe(result => {

        //     });
    }

    saveSalesClientData() {
        // let input: SalesClientDataUpdateRequestDto = new SalesClientDataUpdateRequestDto();
        // input.directClientId = this.salesMainClientDataForm.directClient?.value;
        // input.clientInvoicingRecipientSameAsDirectClient = this.salesMainClientDataForm.isClientInvoicingNone?.value;
        // input.clientInvoicingRecipientId = this.salesMainClientDataForm.clientInvoicingRecipient?.value;
        // input.invoicingReferencePersonId = this.salesMainClientDataForm.clientInvoicingPeriod?.value;
        // input.evaluationsDisabled = this.salesMainClientDataForm.disableEvaluations?.value;
        // input.evaluationsDisabledReason = this.salesMainClientDataForm.disableEvaluations?.value;
        // input.evaluationsReferencePersonId = this.salesMainClientDataForm.evaluationReferencePerson?.value;
        // input.clientSpecialContractTerms = this.salesMainClientDataForm.specialContractTerms?.value;
        // input.invoicingReferenceNumber = this.salesMainClientDataForm.invoicingReferenceNumber?.value;

        // input.contractSigners = [];
        // for (let i = 0; i < this.salesMainClientDataForm.clientSigners.value.length; i++) {
        //     let signer = this.salesMainClientDataForm.clientSigners.value[i];
        //     let contractSigner = new ContractSignerDto();
        //     contractSigner.order = i + 1;
        //     contractSigner.contractSignerId = signer.clientSigvens;
        //     contractSigner.signerRole = new SignerRole();
        //     contractSigner.signerRole.roleName = signer.clientRole;
        //     input.contractSigners.push(contractSigner);
        // }
        // this._workflowSalesService.clientData(this.workflowId, input)
        //     .pipe(finalize(() => {

        //     }))
        //     .subscribe(result => {

        //     });
    }

    addNewExtension() {
        let newId = this.workflowNavigation[this.workflowNavigation.length - 1].id + 1;
        let extensionIndex = this.workflowNavigation.filter(x => x.name.startsWith('ExtensionSales')).length;
        this.workflowNavigation.push(
            {
                id: newId,
                name: `ExtensionSales${extensionIndex + 1}`,
                displayName: `Extension Sales - ${extensionIndex + 1}`,
                selected: false,
                finished: false,
                state: '',
                index: extensionIndex + 1
            },
            {
                id: newId + 1,
                name: `ExtensionContracts${extensionIndex + 1}`,
                displayName: `Extension Contracts - ${extensionIndex + 1}`,
                selected: false,
                finished: false,
                state: '',
                index: extensionIndex + 1
            }
        );
        this.initSalesExtensionForm();
        this.initContractExtensionForm();
        this.scrollBar.update();
    }

    getExtensionsCount() {
        return this.workflowNavigation.filter(x => x.name.startsWith('ExtensionSales'));
    }

    getExtensionSalesNameWithIndex(index: number) {
        return `ExtensionSales${index}`;
    }

    getExtensionContractsNameWithIndex(index: number) {
        return `ExtensionContracts${index}`;
    }

    initSalesExtensionForm() {
        const form = this._fb.group({
            extensionEndDate: new FormControl(null),
            noExtensionEndDate: new FormControl(false),
            workflowInformation: new FormControl(null)
        });
        this.salesExtensionForm.salesExtension.push(form);
    }

    initContractExtensionForm() {
        // add controls for extension contracts form
    }

    removeSalesExtension(index: number) {
        this.salesExtensionForm.salesExtension.removeAt(index);
    }

    get salesExtension() {
        return this.salesExtensionForm.get('salesExtension') as FormArray;
    }

    addNewTermination() {
        const index = this.workflowNavigation.findIndex(x => x.name === 'TerminationSales');
        if (index < 0) {
            let newId = this.workflowNavigation[this.workflowNavigation.length - 1].id + 1;
            this.workflowNavigation.push(
                {
                    id: newId,
                    name: 'TerminationSales',
                    displayName: 'Termination Sales',
                    finished: false,
                    selected: false,
                    state: '',
                    index: 0
                },
                {
                    id: newId + 1,
                    name: 'TerminationContracts',
                    displayName: 'Termination Contracts',
                    selected: false,
                    finished: false,
                    state: '',
                    index: 0
                }
            );
        }
        this.scrollBar.update();

    }

    done() {
        if (this.selectedStep === 'Sales') {
            this.saveSalesStep();
        }
        if (this.selectedStep === 'Contracts') {
            this.saveContractsStep();
        }
        if (this.selectedStep === 'Account') {
            this.saveAccountStep();
        }
        if (this.selectedStep.startsWith('ExtensionSales')) {
            this.saveSalesExtensionStep(this.selectedIndex - 1);
        }
        if (this.selectedStep.startsWith('ExtensionContracts')) {
            this.saveContractExtensionStep(this.selectedIndex - 1);
        }
        if (this.selectedStep.startsWith('TerminationSales')) {
            this.saveSalesTerminationStep();
        }
        if (this.selectedStep.startsWith('TerminationContracts')) {
            this.saveContractTerminationStep();
        }
    }

    saveSalesStep() {
        this.workflowSales.saveSalesStep(this.workflowId);
    }

    saveContractsStep() {

    }

    saveAccountStep() {

    }

    saveSalesExtensionStep(index: number) {
        console.log(this.salesExtensionForm.value.salesExtension[index]);
    }

    saveContractExtensionStep(index: number) {

    }

    saveSalesTerminationStep() {

    }

    saveContractTerminationStep() {

    }

}
