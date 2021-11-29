import { ComponentType } from '@angular/cdk/portal';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { AfterViewInit, ChangeDetectorRef, Component, ComponentFactoryResolver, ComponentRef, OnDestroy, OnInit, TemplateRef, Type, ViewChild, ViewContainerRef } from '@angular/core';
import { FormBuilder, FormControl, FormArray } from '@angular/forms';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ActivatedRoute } from '@angular/router';
import { NgScrollbar } from 'ngx-scrollbar';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { WorkflowsServiceProxy, SalesServiceProxy, EnumServiceProxy, EnumEntityTypeDto } from 'src/shared/service-proxies/service-proxies';
import { ExtensionSalesComponent } from '../extension-sales/extension-sales.component';
import { PrimaryWorkflowComponent } from '../primary-workflow/primary-workflow.component';
import { WorkflowDataService } from '../workflow-data.service';
import { WorkflowOverviewComponent } from '../workflow-overview/workflow-overview.component';
import { WorkflowSalesComponent } from '../workflow-sales/workflow-sales.component';
import { WorkflowNavigation, WorkflowContractsSummaryForm, WorkflowSalesExtensionForm, WorkflowTerminationSalesForm, SideMenuTabsDto, WorkflowProgressStatus, WorkflowSections, WorkflowSteps } from '../workflow.model';

@Component({
  selector: 'app-workflow-details',
  templateUrl: './workflow-details.component.html',
  styleUrls: ['./workflow-details.component.scss']
})

export class WorkflowDetailsComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild('overviewComponent') overviewComponent!: TemplateRef<any>;
    @ViewChild('workflowComponent') workflowComponent!: TemplateRef<any>;
    @ViewChild('extensionComponent') extensionComponent!: TemplateRef<any>;
    @ViewChild('terminationComponent') terminationComponent!: TemplateRef<any>;
    public components = [
        {
            name: 'Overview',
            component: 'WorkflowOverviewComponent'
        },
        {
            name: 'Worfklow',
            component: 'PrimaryWorkflowComponent'
        },
        {
            name: 'Extension',
            component: 'ExtensionSalesComponent'
        },
        {
            name: 'Termination',
            component: 'ExtensionSalesComponent'
        }
    ];

    componentToRender: TemplateRef<any>;

    @ViewChild('componentContainer', {read: ViewContainerRef, static: false}) public componentContainer: ViewContainerRef;


    @ViewChild('scrollable', {static: true}) scrollBar: NgScrollbar;
    @ViewChild('salesScrollbar', {static: true}) salesScrollbar: NgScrollbar;
    @ViewChild('workflowSales', {static: false}) workflowSales: WorkflowSalesComponent;
    @ViewChild('extensionSales', {static: false}) extensionSales: ExtensionSalesComponent;
    menuIndex = 0;
    workflowId: number;
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
    comopnentInitalized = false;
    constructor(
        private _fb: FormBuilder,
        private _workflowService: WorkflowsServiceProxy,
        private _workflowSalesService: SalesServiceProxy,
        private _enumService: EnumServiceProxy,
        public _workflowDataService: WorkflowDataService,
        private activatedRoute: ActivatedRoute,
        private cdr: ChangeDetectorRef,
        private componentFactoryResolver: ComponentFactoryResolver
    ) {
        this.salesExtensionForm = new WorkflowSalesExtensionForm();
        this.terminationSalesForm = new WorkflowTerminationSalesForm();
        this.componentToRender = this.overviewComponent;

    }

    ngOnInit(): void {
        this.activatedRoute.paramMap.pipe(
            takeUntil(this._unsubscribe)
        ).subscribe(params => {
            this.workflowId = +params.get('id')!;
        });
        this.comopnentInitalized = true;
        this._workflowDataService.getData();
        // this.addContractSigner();
    }

    ngAfterViewInit(): void {
    }

    ngOnDestroy(): void {
        this._unsubscribe.next();
        this._unsubscribe.complete();
    }

    detectComponentToRender(tab: SideMenuTabsDto): ComponentType<any> {
        switch (this.formatStepLabel(tab.displayName)) {
            case 'Overview':
                return WorkflowOverviewComponent;
            case 'Workflow':
                return PrimaryWorkflowComponent;
            case 'Extension':
                return ExtensionSalesComponent;
            case 'Termination':
                return ExtensionSalesComponent;
            default:
                return WorkflowOverviewComponent;
        }
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
        this._workflowDataService.workflowSalesSaved.emit();
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
        // this.salesScrollbar.update();
    }

    tabChanged(event: MatTabChangeEvent) {
        console.log('change tab PW');
        this.selectedTabIndex = event.index;
        this.selectedTabName = this.formatStepLabel(event.tab.textLabel);
        this.extensionIndex = this.selectedTabName.startsWith('Extension') ? parseInt(event.tab.textLabel.match(/\d/g)!.join('')) : 0;
        let newStatus = new WorkflowProgressStatus();
        newStatus.currentlyActiveSection = this.mapSelectedTabNameToEnum(this.selectedTabName);
        // FIXME: just for test
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
            // NB: because overview doesn't have sticky-bottom toolbar
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
                    case WorkflowSteps.Finance:
                        console.log('save WF Finance');
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
                    case WorkflowSteps.Finance:
                        console.log('save Extension Finance');
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
                    case WorkflowSteps.Finance:
                        console.log('save Termination Finance');
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
                    case WorkflowSteps.Finance:
                        console.log('Complete WF Finance');
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
                    case WorkflowSteps.Finance:
                        console.log('Complete Extension Finance');
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
                    case WorkflowSteps.Finance:
                        console.log('Complete Termination Finance');
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
