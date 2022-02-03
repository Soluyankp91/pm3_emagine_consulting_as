import { CdkScrollable, Overlay, ScrollDispatcher } from '@angular/cdk/overlay';
import { ComponentType } from '@angular/cdk/portal';
import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ActivatedRoute } from '@angular/router';
import { NgScrollbar } from 'ngx-scrollbar';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { ClientPeriodDto, EnumEntityTypeDto, WorkflowDto, WorkflowServiceProxy } from 'src/shared/service-proxies/service-proxies';
import { WorkflowExtensionComponent } from '../workflow-extension/workflow-extension.component';
import { PrimaryWorkflowComponent } from '../primary-workflow/primary-workflow.component';
import { WorkflowDataService } from '../workflow-data.service';
import { WorkflowOverviewComponent } from '../workflow-overview/workflow-overview.component';
import { WorkflowSalesComponent } from '../workflow-sales/workflow-sales.component';
import { WorkflowSalesExtensionForm, WorkflowTerminationSalesForm, TopMenuTabsDto, WorkflowProgressStatus, WorkflowTopSections, WorkflowSteps, WorkflowSideSections, WorkflowDiallogAction, AddConsultantDto, ChangeWorkflowDto, ExtendWorkflowDto } from '../workflow.model';
import { InternalLookupService } from 'src/app/shared/common/internal-lookup.service';
import { SideNavigationParentItemDto } from '../workflow-extension/workflow-extension.model';
import { WorkflowActionsDialogComponent } from '../workflow-actions-dialog/workflow-actions-dialog.component';

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
    workflowId: string;
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
    topMenuTabs: TopMenuTabsDto[];

    sectionIndex: number;

    workflowResponse: WorkflowDto;
    clientPeriods: ClientPeriodDto[] | undefined = [];
    private _unsubscribe = new Subject();
    constructor(
        public _workflowDataService: WorkflowDataService,
        private activatedRoute: ActivatedRoute,
        private overlay: Overlay,
        private dialog: MatDialog,
        private scrollDispatcher: ScrollDispatcher,
        private zone: NgZone,
        private _lookupService: InternalLookupService,
        private _workflowService: WorkflowServiceProxy
    ) {
        this.salesExtensionForm = new WorkflowSalesExtensionForm();
        this.terminationSalesForm = new WorkflowTerminationSalesForm();
    }

    ngOnInit(): void {
        this.activatedRoute.paramMap.pipe(
            takeUntil(this._unsubscribe)
        ).subscribe(params => {
            this.workflowId = params.get('id')!;
        });
        this.topMenuTabs = new Array<TopMenuTabsDto>(...this._workflowDataService.topMenuTabs);
        this.componentInitalized = true;
        this._lookupService.getData();
        this.getTopLevelMenu();
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

    getTopLevelMenu() {
        this._workflowService.clientPeriods(this.workflowId)
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.clientPeriods = result.clientPeriods;
            });
    }

    detectComponentToRender(tab: TopMenuTabsDto): ComponentType<any> {
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

    detectExtensionIndex(tab: TopMenuTabsDto) {
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
        if (this.selectedTabName === 'Workflow') {
            newStatus.currentlyActiveSideSection = WorkflowSideSections.StartWorkflow;
        } else if (this.selectedTabName.startsWith('Extension')) {
            newStatus.currentlyActiveSideSection = WorkflowSideSections.ExtendWorkflow;
        }

        this._workflowDataService.updateWorkflowProgressStatus(newStatus);
    }

    mapSideSectionName(value: number | undefined) {
        return value ? WorkflowSideSections[value] : '';
    }

    mapSectionName(value: number | undefined) {
        return value ? WorkflowTopSections[value] : '';
    }

    mapStepName(value: number | undefined) {
        return value ? WorkflowSteps[value] : '';
    }

    mapSelectedTabNameToEnum(tabName: string) {
        switch (tabName) {
            case 'Extension':
                return WorkflowTopSections.Extension;
            case 'Workflow':
                return WorkflowTopSections.Workflow;
            case 'Workflow':
                return WorkflowTopSections.Overview;
            case 'ChangeInWF':
                return WorkflowTopSections.ChangesInWF;
            case 'Termination':
                return WorkflowTopSections.Termination;
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
        // TODO: move in global WF model file - tool for detection from where and what we want to save
        // enum SaveOptions {
        //     Draft = 1,
        //     Complete = 2
        // };
        switch (this._workflowDataService.workflowProgress.currentlyActiveSection) {
            case WorkflowTopSections.Overview:
                console.log('save Overview');
                break;
            case WorkflowTopSections.Workflow:
                switch (this._workflowDataService.workflowProgress.currentlyActiveSideSection) {
                    case WorkflowSideSections.StartWorkflow:
                        switch (this._workflowDataService.workflowProgress.currentlyActiveStep) {
                            case WorkflowSteps.Sales:
                                // TODO: update event triggers\handlers  - tool for detection from where and what we want to save
                                // this.saveSalesStep(SaveOptions.Draft, WorkflowSideSections.StartWorkflow);
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
                    case WorkflowSideSections.AddConsultant:
                        switch (this._workflowDataService.workflowProgress.currentlyActiveStep) {
                            case WorkflowSteps.Sales:
                                // this.saveSalesStep(true);
                                console.log('save WF AddConsSales');
                                break;
                            case WorkflowSteps.Contracts:
                                console.log('save WF AddConsContracts');
                                break;
                            case WorkflowSteps.Finance:
                                console.log('save WF AddConsFinance');
                                break;
                        }
                    break;
                    case WorkflowSideSections.ChangeWorkflow:
                        switch (this._workflowDataService.workflowProgress.currentlyActiveStep) {
                            case WorkflowSteps.Sales:
                                // this.saveSalesStep(true);
                                console.log('save WF ChnageWFSales');
                                break;
                            case WorkflowSteps.Contracts:
                                console.log('save WF ChnageWFContracts');
                                break;
                            case WorkflowSteps.Finance:
                                console.log('save WF ChnageWFFinance');
                                break;
                        }
                    break;
                }
                break;
            case WorkflowTopSections.Extension:
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
            case WorkflowTopSections.Termination:
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
            case WorkflowTopSections.Overview:
                console.log('Complete Overview');
                break;
            case WorkflowTopSections.Workflow:
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
            case WorkflowTopSections.Extension:
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
            case WorkflowTopSections.Termination:
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
        // TODO: change new tab to side section
        // this.topMenuTabs.push(
        //     {
        //         name: `Termination`,
        //         displayName: `Termination`,
        //         index: 0,
        //         additionalInfo: 'New'
        //     }
        // )

        // let newStatus = new WorkflowProgressStatus();
        // newStatus.isTerminationAdded = true;
        // this._workflowDataService.updateWorkflowProgressStatus({isTerminationAdded: true});
    }

    addExtension() {
        const scrollStrategy = this.overlay.scrollStrategies.reposition();
        const dialogRef = this.dialog.open(WorkflowActionsDialogComponent, {
            width: '450px',
            minHeight: '180px',
            height: 'auto',
            scrollStrategy,
            backdropClass: 'backdrop-modal--wrapper',
            autoFocus: false,
            panelClass: 'confirmation-modal',
            data: {
                dialogType: WorkflowDiallogAction.Extend,
                dialogTitle: 'Extend Workflow',
                rejectButtonText: 'Cancel',
                confirmButtonText: 'Create',
                isNegative: false
            }
        });

        dialogRef.componentInstance.onConfirmed.subscribe(() => {
            // confirmed
            let existingExtensions = this.topMenuTabs.filter(x => x.name.startsWith('Extension'));
            let newExtensionIndex = existingExtensions.length ? Math.max.apply(Math, existingExtensions.map(function(o) { return o.index + 1; })) : 0;
            // this._workflowDataService.topMenuTabs.push(
            this.topMenuTabs.push(
                {
                    name: `Extension${newExtensionIndex}`,
                    displayName: `Extension ${newExtensionIndex}`,
                    index: newExtensionIndex,
                    additionalInfo: 'New'
                }
            )
            this._workflowDataService.extensionSideNavigation.push(
                {
                    // TODO: move in constant variable, e.g. NewExtensionDto
                    name: `Extension${newExtensionIndex}`,
                    index: newExtensionIndex,
                    sideNav: [ExtendWorkflowDto]
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

    changeWorkflow() {
        const scrollStrategy = this.overlay.scrollStrategies.reposition();
        const dialogRef = this.dialog.open(WorkflowActionsDialogComponent, {
            width: '500px',
            minWidth: '450px',
            minHeight: '180px',
            height: 'auto',
            scrollStrategy,
            backdropClass: 'backdrop-modal--wrapper',
            autoFocus: false,
            panelClass: 'confirmation-modal',
            data: {
                dialogType: WorkflowDiallogAction.Change,
                dialogTitle: 'Change Workflow data',
                rejectButtonText: 'Cancel',
                confirmButtonText: 'Create',
                isNegative: false
            }
        });

        dialogRef.componentInstance.onConfirmed.subscribe(() => {
            // confirmed
            // for PrimaryWorkflow
            if (this._workflowDataService.getWorkflowProgress.currentlyActiveSection === WorkflowTopSections.Workflow) {
                this._workflowDataService.workflowSideNavigation.unshift(ChangeWorkflowDto);
                this.updateWorkflowProgress(this._workflowDataService.workflowSideNavigation[0]);
            } else if (this._workflowDataService.getWorkflowProgress.currentlyActiveSection === WorkflowTopSections.Extension) {
                // for WorkflowExtension
                const currentExtension = this._workflowDataService.extensionSideNavigation.find(x => x.index === this._workflowDataService.getWorkflowProgress.currentlyActiveExtensionIndex);
                currentExtension!.sideNav.unshift(ChangeWorkflowDto);
                this.updateWorkflowProgress(this._workflowDataService.workflowSideNavigation[0]);
            }
        });

        dialogRef.componentInstance.onRejected.subscribe(() => {
            // rejected
        });
    }

    addConsultant() {
        const scrollStrategy = this.overlay.scrollStrategies.reposition();
        const dialogRef = this.dialog.open(WorkflowActionsDialogComponent, {
            minWidth: '450px',
            minHeight: '180px',
            height: 'auto',
            width: 'auto',
            scrollStrategy,
            backdropClass: 'backdrop-modal--wrapper',
            autoFocus: false,
            panelClass: 'confirmation-modal',
            data: {
                dialogType: WorkflowDiallogAction.Add,
                dialogTitle: 'Add consultant',
                rejectButtonText: 'Cancel',
                confirmButtonText: 'Create',
                isNegative: false
            }
        });

        dialogRef.componentInstance.onConfirmed.subscribe(() => {
            // confirmed
             // for PrimaryWorkflow
             if (this._workflowDataService.getWorkflowProgress.currentlyActiveSection === WorkflowTopSections.Workflow) {
                this._workflowDataService.workflowSideNavigation.unshift(AddConsultantDto);
                this.updateWorkflowProgress(this._workflowDataService.workflowSideNavigation[0]);
            } else if (this._workflowDataService.getWorkflowProgress.currentlyActiveSection === WorkflowTopSections.Extension) {
                // for WorkflowExtension
                const currentExtension = this._workflowDataService.extensionSideNavigation.find(x => x.index === this._workflowDataService.getWorkflowProgress.currentlyActiveExtensionIndex);
                currentExtension!.sideNav.unshift(ChangeWorkflowDto);
                this.updateWorkflowProgress(this._workflowDataService.workflowSideNavigation[0]);
            }
        });

        dialogRef.componentInstance.onRejected.subscribe(() => {
            // rejected
        });
    }

    updateWorkflowProgress(item: SideNavigationParentItemDto) {
        const firstitemInSection = this._workflowDataService.workflowSideNavigation.find(x => x.displayName === item.displayName)?.subItems[0];
        this._workflowDataService.workflowProgress.currentlyActiveStep = firstitemInSection!.id * 1;
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

    makeExtensionActiveTab(index: number) {
        const extensions = this.topMenuTabs.filter(x => x.name.startsWith('Extension'));
        const neededExtension = extensions.find(x => x.index === index);
        this.selectedIndex = this.topMenuTabs.findIndex(x => x === neededExtension);
        this.selectedTabName = this.formatStepLabel(neededExtension?.name!);
    }
}
