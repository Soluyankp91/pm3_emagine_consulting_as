import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormArray } from '@angular/forms';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ActivatedRoute } from '@angular/router';
import { NgScrollbar } from 'ngx-scrollbar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EnumEntityTypeDto, WorkflowsServiceProxy, SalesServiceProxy, EnumServiceProxy } from 'src/shared/service-proxies/service-proxies';
import { ExtensionSalesComponent } from '../extension-sales/extension-sales.component';
import { PrimaryWorkflowComponent } from '../primary-workflow/primary-workflow.component';
import { WorkflowDataService } from '../workflow-data.service';
import { WorkflowSalesComponent } from '../workflow-sales/workflow-sales.component';
import { WorkflowNavigation, WorkflowContractsSummaryForm, WorkflowSalesExtensionForm, WorkflowTerminationSalesForm, SideMenuTabsDto, WorkflowSections, WorkflowProgressStatus, WorkflowSteps } from '../workflow.model';

@Component({
    selector: 'app-workflow-third',
    templateUrl: './workflow-third.component.html',
    styleUrls: ['./workflow-third.component.scss']
})
export class WorkflowThirdComponent implements OnInit {
    @ViewChild('scrollable', {static: true}) scrollBar: NgScrollbar;
    @ViewChild('salesScrollbar', {static: true}) salesScrollbar: NgScrollbar;
    @ViewChild('workflowSales', {static: false}) workflowSales: WorkflowSalesComponent;
    @ViewChild('extensionSales', {static: false}) extensionSales: ExtensionSalesComponent;
    @ViewChild('primaryWorkflow', {static: false}) primaryWorkflow: PrimaryWorkflowComponent;
    menuIndex = 0;
    workflowId: string;
    selectedIndex = 0;
    selectedStep = 'Sales';

    workflowNavigation = WorkflowNavigation;

    // contactSummaryForm: WorkflowContractsSummaryForm;
    salesExtensionForm: WorkflowSalesExtensionForm;
    terminationSalesForm: WorkflowTerminationSalesForm;

    deliveryTypes: EnumEntityTypeDto[] = [];
    currencies: EnumEntityTypeDto[] = [];
    saleTypes: EnumEntityTypeDto[] = [];

    isExpanded = true;


    // tabs navigation
    selectedTabIndex: number;
    selectedTabName = 'Overview';
    extensionIndex: number;
    private _unsubscribe = new Subject();
    constructor(
        private _fb: FormBuilder,
        private _workflowService: WorkflowsServiceProxy,
        private _workflowSalesService: SalesServiceProxy,
        private _enumService: EnumServiceProxy,
        public _workflowDataService: WorkflowDataService,
        private activatedRoute: ActivatedRoute
    ) {
        // this.contactSummaryForm = new WorkflowContractsSummaryForm();
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
        // this.addContractSigner();
    }

    ngOnDestroy(): void {
        this._unsubscribe.next();
        this._unsubscribe.complete();
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
        this.primaryWorkflow.saveSalesStep(this.workflowId);
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

    // new
    expandCollapseHeader() {
        this.isExpanded = !this.isExpanded;
        this.salesScrollbar.update();
    }

    tabChanged(event: MatTabChangeEvent) {
        this.selectedTabIndex = event.index;
        this.selectedTabName = this.formatStepLabel(event.tab.textLabel);
        this.extensionIndex = this.selectedTabName.startsWith('Extension') ? parseInt(event.tab.textLabel.match(/\d/g)!.join('')) : 0;
        let newStatus = new WorkflowProgressStatus();
        newStatus.currentlyActiveSection = this.mapSelectedTabNameToEnum(this.selectedTabName);
        newStatus.currentlyActiveStep = WorkflowSteps.Sales;
        this._workflowDataService.updateWorkflowProgressStatus(newStatus);
    }

    mapSectionName(value: number | undefined) {
        return value ? WorkflowSections[value] : '';
    }

    mapStepName(value: number | undefined) {
        return value ? WorkflowSteps[value] : '';
    }

    mapSelectedTabNameToEnum(tabName: string) {
        switch (tabName) {
            case 'Extension':
                return WorkflowSections.Extension;
            case 'Workflow':
                return WorkflowSections.Workflow;
            case 'Workflow':
                return WorkflowSections.Overview;
            case 'ChangeInWF':
                return WorkflowSections.ChangesInWF;
            case 'Termination':
                return WorkflowSections.Termination;
        }
    }

    formatStepLabel(label: string) {
        return label.replace(/[^A-Z]/ig, '');
    }

    isExpandedAndToolbarVisible() {
        if (this.isExpanded) {
            if (this.selectedTabName !== 'Overview') {
                return 'calc(80vh - 110px)';
            } else {
                return 'calc(80vh - 50px)';
            }
        } else if (this.selectedTabName !== 'Overview') {
            return 'calc(100vh - 110px)';
        } else {
            return 'calc(100vh - 50px)';
        }
    }

    saveDraft() {
        switch (this._workflowDataService.workflowProgress.currentlyActiveSection) {
            case WorkflowSections.Overview:
                console.log('save Overview');
                break;
            case WorkflowSections.Workflow:
                switch (this._workflowDataService.workflowProgress.currentlyActiveStep) {
                    case WorkflowSteps.Sales:
                        this.saveSalesStep();
                        console.log('save WF Sales');
                        break;
                    case WorkflowSteps.Contracts:
                        console.log('save WF Contracts');
                        break;
                    case WorkflowSteps.Accounts:
                        console.log('save WF Accounts');
                        break;
                }
                break;
            case WorkflowSections.Extension:
                switch (this._workflowDataService.workflowProgress.currentlyActiveStep) {
                    case WorkflowSteps.Sales:
                        console.log('save Extension Sales');
                        break;
                    case WorkflowSteps.Contracts:
                        console.log('save Extension Contracts');
                        break;
                    case WorkflowSteps.Accounts:
                        console.log('save Extension Accounts');
                        break;
                }
                break;
            case WorkflowSections.Termination:
                switch (this._workflowDataService.workflowProgress.currentlyActiveStep) {
                    case WorkflowSteps.Sales:
                        console.log('save Termination Sales');
                        break;
                    case WorkflowSteps.Contracts:
                        console.log('save Termination Contracts');
                        break;
                    case WorkflowSteps.Accounts:
                        console.log('save Termination Accounts');
                        break;
                }
                break;
        }
    }

    completeStep() {
        switch (this._workflowDataService.workflowProgress.currentlyActiveSection) {
            case WorkflowSections.Overview:
                console.log('Complete Overview');
                break;
            case WorkflowSections.Workflow:
                switch (this._workflowDataService.workflowProgress.currentlyActiveStep) {
                    case WorkflowSteps.Sales:
                        console.log('Complete WF Sales');
                        break;
                    case WorkflowSteps.Contracts:
                        console.log('Complete WF Contracts');
                        break;
                    case WorkflowSteps.Accounts:
                        console.log('Complete WF Accounts');
                        break;
                }
                break;
            case WorkflowSections.Extension:
                switch (this._workflowDataService.workflowProgress.currentlyActiveStep) {
                    case WorkflowSteps.Sales:
                        //  FIXME: only for test
                        this._workflowDataService.updateWorkflowProgressStatus({isExtensionCompleted: true});
                        console.log('Complete Extension Sales');
                        break;
                    case WorkflowSteps.Contracts:
                        console.log('Complete Extension Contracts');
                        break;
                    case WorkflowSteps.Accounts:
                        console.log('Complete Extension Accounts');
                        break;
                }
                break;
            case WorkflowSections.Termination:
                switch (this._workflowDataService.workflowProgress.currentlyActiveStep) {
                    case WorkflowSteps.Sales:
                        console.log('Complete Termination Sales');
                        break;
                    case WorkflowSteps.Contracts:
                        console.log('Complete Termination Contracts');
                        break;
                    case WorkflowSteps.Accounts:
                        console.log('Complete Termination Accounts');
                        break;
                }
                break;
        }
    }

    // add Termiantion
    addTermination() {
        this._workflowDataService.topMenuTabs.push(
            {
                name: `Termination`,
                displayName: `Termination`,
                index: 1
            }
        )

        let newStatus = new WorkflowProgressStatus();
        newStatus.isTerminationAdded = true;
        this._workflowDataService.updateWorkflowProgressStatus({isTerminationAdded: true});
    }

    addExtension() {
        const existingExtension = this._workflowDataService.topMenuTabs.find(x => x.name.startsWith('Extension'));
        this._workflowDataService.topMenuTabs.push(
            {
                name: `Extension${existingExtension ? existingExtension.index + 1 : 1}`,
                displayName: `Extension${existingExtension ? existingExtension.index + 1 : 1}`,
                index: existingExtension ? existingExtension.index + 1 : 1
            }
        )

        // TODO: detect which exactly extension was added & saved to disable\enable button
        this._workflowDataService.updateWorkflowProgressStatus({isExtensionAdded: true, isExtensionCompleted: false});

    }
}
