import { CdkScrollable, Overlay, ScrollDispatcher } from '@angular/cdk/overlay';
import { ComponentType } from '@angular/cdk/portal';
import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ActivatedRoute } from '@angular/router';
import { NgScrollbar } from 'ngx-scrollbar';
import { Subject } from 'rxjs';
import { startWith, takeUntil } from 'rxjs/operators';
import { EnumEntityTypeDto } from 'src/shared/service-proxies/service-proxies';
import { ExtendWorkflowDialogComponent } from '../extend-workflow-dialog/extend-workflow-dialog.component';
import { WorkflowExtensionComponent } from '../workflow-extension/workflow-extension.component';
import { PrimaryWorkflowComponent } from '../primary-workflow/primary-workflow.component';
import { WorkflowChangeDialogComponent } from '../workflow-change-dialog/workflow-change-dialog.component';
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
    @ViewChild('scroller', {static: true}) scroller: ElementRef<HTMLElement>;

    @ViewChild('scrollable', {static: true}) scrollBar: NgScrollbar;
    @ViewChild('salesScrollbar', {static: true}) salesScrollbar: NgScrollbar;
    @ViewChild('workflowSales', {static: false}) workflowSales: WorkflowSalesComponent;
    @ViewChild('extensionSales', {static: false}) extensionSales: WorkflowExtensionComponent;
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

    showToolbar = false;

    // tabs navigation
    selectedTabIndex: number;
    selectedTabName = 'Overview';
    extensionIndex: number | null;
    componentInitalized = false;
    menuTabs: SideMenuTabsDto[];
    private _unsubscribe = new Subject();
    constructor(
        public _workflowDataService: WorkflowDataService,
        private activatedRoute: ActivatedRoute,
        private overlay: Overlay,
        private dialog: MatDialog,
        private scrollDispatcher: ScrollDispatcher, private zone: NgZone
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
        this.scrollDispatcher.scrolled()
            .pipe(
                takeUntil(this._unsubscribe)
            )
            .subscribe((cdk: CdkScrollable | any) => {
                this.zone.run(() => {
                    const scrollPosition = cdk.getElementRef().nativeElement.scrollTop;
                    if (scrollPosition > 120) { // 120 - header height
                        this.showToolbar = true;
                    } else {
                        this.showToolbar = false;
                    }
                });
            });
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
                return WorkflowExtensionComponent;
            case 'Termination':
                return WorkflowExtensionComponent;
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

    saveSalesStep(isDraft = false) {
        this._workflowDataService.workflowSalesSaved.emit(isDraft);
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
        this.extensionIndex = this.selectedTabName.startsWith('Extension') ? parseInt(event.tab.textLabel.match(/\d/g)!.join('')) : null;
        let newStatus = new WorkflowProgressStatus();
        newStatus.currentlyActiveSection = this.mapSelectedTabNameToEnum(this.selectedTabName);

        newStatus.currentlyActiveExtensionIndex = this.extensionIndex;
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
                return 'calc(80vh - 120px)';
            } else {
                return 'calc(80vh - 60px)';
            }
        } else if (this.selectedTabName !== 'Overview') {
            return 'calc(100vh - 120px)';
        } else {
            return 'calc(100vh - 60px)';
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
                        this.saveSalesStep(true);
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
                        this._workflowDataService.updateWorkflowProgressStatus({isWorkflowAccountsSaved: true, isPrimaryWorkflowCompleted: true});
                        break;
                }
                break;
            case WorkflowSections.Extension:
                switch (this._workflowDataService.workflowProgress.currentlyActiveStep) {
                    case WorkflowSteps.Sales:
                        //  FIXME: only for test
                        this._workflowDataService.updateWorkflowProgressStatus({isExtensionCompleted: true, lastSavedExtensionIndex: this.extensionIndex});
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
                index: 0,
                additionalInfo: 'New'
            }
        )

        let newStatus = new WorkflowProgressStatus();
        newStatus.isTerminationAdded = true;
        this._workflowDataService.updateWorkflowProgressStatus({isTerminationAdded: true});
    }

    addExtension() {
        const scrollStrategy = this.overlay.scrollStrategies.reposition();
        const dialogRef = this.dialog.open(ExtendWorkflowDialogComponent, {
            width: '450px',
            minHeight: '180px',
            height: 'auto',
            scrollStrategy,
            backdropClass: 'backdrop-modal--wrapper',
            autoFocus: false,
            panelClass: 'confirmation-modal',
            data: {
                dialogHeader: 'Extend workflow',
                formFieldLabel: 'Select extension end date',
                formFieldPlaceholder: 'Start date'
            }
        });

        dialogRef.componentInstance.onConfimrmed.subscribe(() => {
            // confirmed
            let existingExtensions = this.menuTabs.filter(x => x.name.startsWith('Extension'));
            let newExtensionIndex = existingExtensions.length ? Math.max.apply(Math, existingExtensions.map(function(o) { return o.index + 1; })) : 0;
            // this._workflowDataService.topMenuTabs.push(
            this.menuTabs.push(
                {
                    name: `Extension${newExtensionIndex}`,
                    displayName: `Extension ${newExtensionIndex}`,
                    index: newExtensionIndex,
                    additionalInfo: 'New'
                }
            )
            this._workflowDataService.extensionSideNavigation.push(
                {
                    name: `Extension${newExtensionIndex}`,
                    index: newExtensionIndex,
                    sideNav: [
                        {
                            displayName: 'Extend Workflow',
                            name: 'workflowStartOrExtend',
                            responsiblePerson: 'Andersen Rasmus2',
                            dateRange: '02.01.2021 - 31.12.2021',
                            subItems: [
                                {
                                    id: 1,
                                    name: "ExtendSales",
                                    displayName: "Sales",
                                    isCompleted: false,
                                    assignedPerson: 'Roberto Olberto'
                                },
                                {
                                    id: 2,
                                    name: "ExtendContracts",
                                    displayName: "Contracts",
                                    isCompleted: false,
                                    assignedPerson: 'Roberto Olberto'
                                }
                            ]
                        }
                    ]

                }
            )
            this.makeExtensionActiveTab(newExtensionIndex);

            // TODO: detect which exactly extension was added & saved to disable\enable button
            this._workflowDataService.updateWorkflowProgressStatus({isExtensionAdded: true, isExtensionCompleted: false, numberOfAddedExtensions: newExtensionIndex + 1});
        });

        dialogRef.componentInstance.onRejected.subscribe(() => {
            // rejected
        });

    }

    makeExtensionActiveTab(index: number) {
        const extensions = this.menuTabs.filter(x => x.name.startsWith('Extension'));
        const neededExtension = extensions.find(x => x.index === index);
        this.selectedIndex = this.menuTabs.findIndex(x => x === neededExtension);
        this.selectedTabName = this.formatStepLabel(neededExtension?.name!);
    }

    changeWorkflow() {
        const scrollStrategy = this.overlay.scrollStrategies.reposition();
        const dialogRef = this.dialog.open(WorkflowChangeDialogComponent, {
            width: '450px',
            minHeight: '180px',
            height: 'auto',
            scrollStrategy,
            backdropClass: 'backdrop-modal--wrapper',
            autoFocus: false,
            panelClass: 'confirmation-modal',
            data: {
                dialogHeader: 'Add change',
                formFieldLabel: 'Select date, when the change should take effect',
                formFieldPlaceholder: 'Start date'
            }
        });

        dialogRef.componentInstance.onConfimrmed.subscribe(() => {
            // confirmed
        });

        dialogRef.componentInstance.onRejected.subscribe(() => {
            // rejected
        });
    }


    disableAddExtension() {
        if (this._workflowDataService.getWorkflowProgress?.isExtensionAdded) {
            // validate by indexes
            if (!this._workflowDataService.getWorkflowProgress?.isExtensionCompleted) {
                return true;
            } else {
                return this._workflowDataService.getWorkflowProgress.lastSavedExtensionIndex !== this._workflowDataService.getWorkflowProgress.numberOfAddedExtensions! - 1;
            }
        } else if (this._workflowDataService.getWorkflowProgress.isPrimaryWorkflowCompleted) {
            return false;
        } else {
            return true;
        }
    }
}
