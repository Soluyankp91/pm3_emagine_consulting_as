import { ComponentType } from '@angular/cdk/portal';
import { AfterViewInit, Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ActivatedRoute } from '@angular/router';
import { NgScrollbar } from 'ngx-scrollbar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EnumEntityTypeDto } from 'src/shared/service-proxies/service-proxies';
import { ExtensionSalesComponent } from '../extension-sales/extension-sales.component';
import { PrimaryWorkflowComponent } from '../primary-workflow/primary-workflow.component';
import { WorkflowDataService } from '../workflow-data.service';
import { WorkflowOverviewComponent } from '../workflow-overview/workflow-overview.component';
import { WorkflowSalesComponent } from '../workflow-sales/workflow-sales.component';
import { WorkflowSalesExtensionForm, WorkflowTerminationSalesForm, SideMenuTabsDto, WorkflowProgressStatus, WorkflowSections, WorkflowSteps } from '../workflow.model';

@Component({
  selector: 'app-workflow-details',
  templateUrl: './workflow-details.component.html',
  styleUrls: ['./workflow-details.component.scss']
})

export class WorkflowDetailsComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild('scrollable', {static: true}) scrollBar: NgScrollbar;
    @ViewChild('salesScrollbar', {static: true}) salesScrollbar: NgScrollbar;
    @ViewChild('workflowSales', {static: false}) workflowSales: WorkflowSalesComponent;
    @ViewChild('extensionSales', {static: false}) extensionSales: ExtensionSalesComponent;
    menuIndex = 0;
    workflowId: number;
    selectedIndex = 0;
    selectedStep = 'Sales';

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
    componentInitalized = false;
    menuTabs: SideMenuTabsDto[];
    constructor(
        public _workflowDataService: WorkflowDataService,
        private activatedRoute: ActivatedRoute,
    ) {
        this.salesExtensionForm = new WorkflowSalesExtensionForm();
        this.terminationSalesForm = new WorkflowTerminationSalesForm();
    }

    ngOnInit(): void {
        this.activatedRoute.paramMap.pipe(
            takeUntil(this._unsubscribe)
        ).subscribe(params => {
            this.workflowId = +params.get('id')!;
        });
        this.menuTabs = new Array<SideMenuTabsDto>(...this._workflowDataService.topMenuTabs);
        this.componentInitalized = true;
        this._workflowDataService.getData();
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

    detectExtensionIndex(tab: SideMenuTabsDto) {
        if (tab.name.startsWith('Extension')) {
            return tab.index;
        } else {
            return null;
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
        // this._workflowDataService.topMenuTabs.push(
        this.menuTabs.push(
            {
                name: `Termination`,
                displayName: `Termination`,
                index: 0
            }
        )

        let newStatus = new WorkflowProgressStatus();
        newStatus.isTerminationAdded = true;
        this._workflowDataService.updateWorkflowProgressStatus({isTerminationAdded: true});
    }

    addExtension() {
        let existingExtensions = this.menuTabs.filter(x => x.name.startsWith('Extension'));
        let newExtensionIndex = existingExtensions.length ? Math.max.apply(Math, existingExtensions.map(function(o) { return o.index + 1; })) : 0;
        // this._workflowDataService.topMenuTabs.push(
        this.menuTabs.push(
            {
                name: `Extension${newExtensionIndex}`,
                displayName: `Extension ${newExtensionIndex}`,
                index: newExtensionIndex
            }
        )

        // TODO: detect which exactly extension was added & saved to disable\enable button
        this._workflowDataService.updateWorkflowProgressStatus({isExtensionAdded: true, isExtensionCompleted: false});

    }
}
