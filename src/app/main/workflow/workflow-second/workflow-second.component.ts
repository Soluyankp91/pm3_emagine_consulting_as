import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormArray } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgScrollbar } from 'ngx-scrollbar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EnumEntityTypeDto, WorkflowsServiceProxy, SalesServiceProxy, EnumServiceProxy } from 'src/shared/service-proxies/service-proxies';
import { WorkflowDataService } from '../workflow-data.service';
import { WorkflowSalesComponent } from '../workflow-sales/workflow-sales.component';
import { WorkflowNavigation, WorkflowContractsSummaryForm, WorkflowSalesExtensionForm, WorkflowTerminationSalesForm, SideMenuTabsDto } from '../workflow.model';

@Component({
  selector: 'app-workflow-second',
  templateUrl: './workflow-second.component.html',
  styleUrls: ['./workflow-second.component.scss']
})
export class WorkflowSecondComponent implements OnInit {
    @ViewChild('scrollable', {static: true}) scrollBar: NgScrollbar;
    @ViewChild('workflowSales', {static: false}) workflowSales: WorkflowSalesComponent;
    menuIndex = 0;
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
        public _workflowDataService: WorkflowDataService,
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
        this._workflowDataService.getData();
        this.addContractSigner();
    }

    ngOnDestroy(): void {
        this._unsubscribe.next();
        this._unsubscribe.complete();
    }

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
        if (this.selectedStep.startsWith('ExtensionSales') || this.selectedStep.startsWith('NewExtension')) {
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

    addExtension() {
        let newId = this.workflowNavigation[this.workflowNavigation.length - 1].id + 1;
        let extensionIndex = this.workflowNavigation.filter(x => x.name.startsWith('NewExtension')).length;
        this.workflowNavigation.push(
            {
                id: newId,
                name: `NewExtension${extensionIndex + 1}`,
                displayName: `New Extension - ${extensionIndex + 1}`,
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

    getNewExtensionsCount() {
        return this.workflowNavigation.filter(x => x.name.startsWith('NewExtension'));
    }

    getExtensionSalesNameWithIndex(index: number) {
        return `ExtensionSales${index}`;
    }

    getExtensionNameWithIndex(index: number) {
        return `NewExtension${index}`;
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

    changeSideNavTab(tab: SideMenuTabsDto, index: number) {
        if (tab.name === 'Workflow') {
            this.menuIndex = index;
        } else if (tab.name === 'Consultant') {
            this.menuIndex = index;
            // logic for consultants
        }
    }

}
