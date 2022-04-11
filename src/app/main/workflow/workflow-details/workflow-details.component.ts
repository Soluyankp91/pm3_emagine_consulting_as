import { CdkScrollable, Overlay, ScrollDispatcher } from '@angular/cdk/overlay';
import { AfterViewInit, Component, ElementRef, Injector, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ActivatedRoute } from '@angular/router';
import { NgScrollbar } from 'ngx-scrollbar';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { ClientPeriodDto, EnumEntityTypeDto, WorkflowDto, WorkflowProcessType, WorkflowServiceProxy } from 'src/shared/service-proxies/service-proxies';
import { WorkflowDataService } from '../workflow-data.service';
import { WorkflowSalesComponent } from '../workflow-sales/workflow-sales.component';
import { WorkflowProgressStatus, WorkflowTopSections, WorkflowSteps, WorkflowDiallogAction } from '../workflow.model';
import { InternalLookupService } from 'src/app/shared/common/internal-lookup.service';
import { WorkflowActionsDialogComponent } from '../workflow-actions-dialog/workflow-actions-dialog.component';
import { AppComopnentBase } from 'src/shared/app-component-base';

@Component({
  selector: 'app-workflow-details',
  templateUrl: './workflow-details.component.html',
  styleUrls: ['./workflow-details.component.scss']
})

export class WorkflowDetailsComponent extends AppComopnentBase implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild('scroller', {static: true}) scroller: ElementRef<HTMLElement>;
    @ViewChild('scrollable', {static: true}) scrollBar: NgScrollbar;
    @ViewChild('workflowSales', {static: false}) workflowSales: WorkflowSalesComponent;

    menuIndex = 0;
    workflowId: string;
    selectedIndex = 0;
    selectedStep = 'Sales';

    deliveryTypes: EnumEntityTypeDto[] = [];
    currencies: EnumEntityTypeDto[] = [];
    saleTypes: EnumEntityTypeDto[] = [];

    showToolbar = false;

    // tabs navigation
    selectedTabIndex: number;
    selectedTabName = 'Overview';
    extensionIndex: number | null;

    sectionIndex: number;

    workflowResponse: WorkflowDto;
    clientPeriods: ClientPeriodDto[] | undefined = [];

    workflowClientPeriodTypes: EnumEntityTypeDto[] = [];
    workflowConsultantPeriodTypes: EnumEntityTypeDto[] = [];
    workflowPeriodStepTypes: EnumEntityTypeDto[] = [];

    private _unsubscribe = new Subject();
    constructor(
        injector: Injector,
        public _workflowDataService: WorkflowDataService,
        private activatedRoute: ActivatedRoute,
        private overlay: Overlay,
        private dialog: MatDialog,
        private scrollDispatcher: ScrollDispatcher,
        private zone: NgZone,
        private _lookupService: InternalLookupService,
        private _workflowServiceProxy: WorkflowServiceProxy
    ) {
        super(injector);
    }

    ngOnInit(): void {
        this.activatedRoute.paramMap.pipe(
            takeUntil(this._unsubscribe)
        ).subscribe(params => {
            this.workflowId = params.get('id')!;
        });
        this._lookupService.getData();
        this.getTopLevelMenu();
        this.getClientPeriodTypes();
        this.getConsultantPeriodTypes();
        this.getPeriodStepTypes();
    }

    getClientPeriodTypes() {
        this._lookupService.getWorkflowClientPeriodTypes()
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.workflowClientPeriodTypes = result;
            });
    }

    getConsultantPeriodTypes() {
        this._lookupService.getWorkflowConsultantPeriodTypes()
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.workflowConsultantPeriodTypes = result;
            });
    }

    getPeriodStepTypes() {
        this._lookupService.getWorkflowPeriodStepTypes()
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.workflowPeriodStepTypes = result;
            });
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
        this.showMainSpinner();
        this._workflowServiceProxy.clientPeriods(this.workflowId)
            .pipe(finalize(() => {
                this.hideMainSpinner();
            }))
            .subscribe(result => {
                this.clientPeriods = result.clientPeriods;
            });
    }

    saveSalesStep(isDraft = false) {
        this._workflowDataService.workflowSalesSaved.emit(isDraft);
    }

    // Termination
    saveSalesTerminationStep(isDraft = false) {
        this._workflowDataService.workflowTerminationSalesSaved.emit(isDraft);
    }

    saveSalesConsultantTerminationStep(isDraft = false) {
        this._workflowDataService.workflowConsultantTerminationSalesSaved.emit(isDraft);
    }

    saveContractsTerminationStep(isDraft = false) {
        this._workflowDataService.workflowTerminationContractsSaved.emit(isDraft);
    }

    saveContractsConsultantTerminationStep(isDraft = false) {
        this._workflowDataService.workflowConsultantTerminationContractsSaved.emit(isDraft);
    }

    saveSourcingTerminationStep(isDraft = false) {
        this._workflowDataService.workflowTerminationSourcingSaved.emit(isDraft);
    }

    saveSourcingConsultantTerminationStep(isDraft = false) {
        this._workflowDataService.workflowConsultantTerminationSourcingSaved.emit(isDraft);
    }

    completeSalesTerminationStep(isDraft = false) {
        this._workflowDataService.workflowTerminationSalesCompleted.emit(isDraft);
    }

    completeSalesConsultantTerminationStep(isDraft = false) {
        this._workflowDataService.workflowConsultantTerminationSalesCompleted.emit(isDraft);
    }

    completeContractsTerminationStep(isDraft = false) {
        this._workflowDataService.workflowTerminationContractsCompleted.emit(isDraft);
    }

    completeContractsConsultantTerminationStep(isDraft = false) {
        this._workflowDataService.workflowConsultantTerminationContractsCompleted.emit(isDraft);
    }

    completeSourcingTerminationStep(isDraft = false) {
        this._workflowDataService.workflowTerminationSourcingCompleted.emit(isDraft);
    }

    completeSourcingConsultantTerminationStep(isDraft = false) {
        this._workflowDataService.workflowConsultantTerminationSourcingCompleted.emit(isDraft);
    }

    tabChanged(event: MatTabChangeEvent) {
        console.log('change tab PW');
        this.selectedTabIndex = event.index;
        this.selectedTabName = event.tab.textLabel;
        let newStatus = new WorkflowProgressStatus();
        // FIXME: just for test
        newStatus.currentlyActiveStep = WorkflowSteps.Sales;
        if (this.selectedTabName === 'Overview') {
            newStatus.currentlyActiveSection = WorkflowTopSections.Overview;
        } else {
            newStatus.currentlyActiveSection = this.detectTopLevelMenu(this.selectedTabName);
        }

        this._workflowDataService.updateWorkflowProgressStatus(newStatus);
    }

    detectTopLevelMenu(clientPeriodName: string) {
        const selectedTopMenu = this.clientPeriods?.find(x => x.name === clientPeriodName);
        const clientPeriodType = this.workflowClientPeriodTypes.find(type => type.id === selectedTopMenu?.typeId);
        console.log(clientPeriodType);
        // FIXME: change after BE updates
        switch (clientPeriodType?.id) {
            case 1: // Start period
                return WorkflowTopSections.Workflow;
            case 2: // Change period
                return WorkflowTopSections.ChangesInWF;
            case 3: // Extend period
                return WorkflowTopSections.Extension;
        }
    }

    mapSideSectionName(value: number | undefined) {
        return value ? WorkflowProcessType[value] : '';
    }

    mapSectionName(value: number | undefined) {
        return value ? WorkflowTopSections[value] : '';
    }

    mapStepType(stepType: EnumEntityTypeDto) {
        switch (stepType?.name) {
            case 'Sales':
                return WorkflowSteps.Sales;
            case 'Contract':
                return WorkflowSteps.Contracts;
            case 'Finance':
                return WorkflowSteps.Finance;
            case 'Sourcing':
                return WorkflowSteps.Sourcing;
            default:
                return null;
        }
    }

    mapStepName(value: number | undefined) {
        let selectedStepEnum = this.mapStepType(this.workflowPeriodStepTypes?.find(x => x.id === value)!)!;
        return value ? WorkflowSteps[selectedStepEnum] : '';
    }

    mapSelectedTabNameToEnum(tabName: string) {
        switch (tabName) {
            case 'Extension':
                return WorkflowTopSections.Extension;
            case 'Workflow':
                return WorkflowTopSections.Workflow;
            case 'Overview':
                return WorkflowTopSections.Overview;
            case 'ChangeInWF':
                return WorkflowTopSections.ChangesInWF;
            case 'Termination':
                return WorkflowTopSections.Termination;
        }
    }

    saveDraft() {
        // TODO: move in global WF model file - tool for detection from where and what we want to save
        // enum SaveOptions {
        //     Draft = 1,
        //     Complete = 2
        // };
        switch (this._workflowDataService.workflowProgress.currentlyActiveSection) {
            case WorkflowTopSections.Workflow:
                switch (this._workflowDataService.workflowProgress.currentlyActiveSideSection) {
                    case WorkflowProcessType.StartClientPeriod:
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
                    case WorkflowProcessType.TerminateConsultant:
                        switch (this._workflowDataService.workflowProgress.currentlyActiveStep) {
                            case WorkflowSteps.Sales:
                                this.saveSalesConsultantTerminationStep(true);
                                console.log('save draft WF Term Cons Sales');
                                break;
                            case WorkflowSteps.Contracts:
                                this.saveContractsConsultantTerminationStep(true);
                                console.log('save draft WF Term Cons Contracts');
                                break;
                            case WorkflowSteps.Sourcing:
                                this.saveSourcingConsultantTerminationStep(true);
                                console.log('save draft WF Term Cons Sourcing');
                                break;
                        }
                    break;
                    case WorkflowProcessType.TerminateWorkflow:
                        switch (this._workflowDataService.workflowProgress.currentlyActiveStep) {
                            case WorkflowSteps.Sales:
                                this.saveSalesTerminationStep(true);
                                console.log('save draft WF Term Sales');
                                break;
                            case WorkflowSteps.Contracts:
                                this.saveContractsTerminationStep(true);
                                console.log('save draft WF Term Contracts');
                                break;
                            case WorkflowSteps.Sourcing:
                                this.saveSourcingTerminationStep(true);
                                console.log('save draft WF Term Sourcing');
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
                // switch (this._workflowDataService.workflowProgress.currentlyActiveStep) {
                    // case WorkflowSteps.Sales:
                    //     console.log('Complete WF Sales');
                    //     this._workflowDataService.updateWorkflowProgressStatus({isWorkflowSalesSaved: true});
                    // break;
                    // case WorkflowSteps.Contracts:
                    //     console.log('Complete WF Contracts');
                    //     this._workflowDataService.updateWorkflowProgressStatus({isWorkflowContractsSaved: true});
                    // break;
                    // case WorkflowSteps.Finance:
                    //     console.log('Complete WF Finance');
                    //     this._workflowDataService.updateWorkflowProgressStatus({isWorkflowAccountsSaved: true, isPrimaryWorkflowCompleted: true});
                    // break;
                switch(this._workflowDataService.workflowProgress.currentlyActiveSideSection) {
                    case WorkflowProcessType.TerminateConsultant:
                        switch (this._workflowDataService.workflowProgress.currentlyActiveStep) {
                            case WorkflowSteps.Sales:
                                this.completeSalesConsultantTerminationStep(true);
                                console.log('complete WF Term Cons Sales');
                                break;
                            case WorkflowSteps.Contracts:
                                this.completeContractsConsultantTerminationStep(true);
                                console.log('complete WF Term Cons Contracts');
                                break;
                            case WorkflowSteps.Sourcing:
                                this.completeSourcingConsultantTerminationStep(true);
                                console.log('complete WF Term Cons Sourcing');
                                break;
                        }
                    break;
                    case WorkflowProcessType.TerminateWorkflow:
                        switch (this._workflowDataService.workflowProgress.currentlyActiveStep) {
                            case WorkflowSteps.Sales:
                                this.completeSalesTerminationStep(true);
                                console.log('complete WF Term Sales');
                                break;
                            case WorkflowSteps.Contracts:
                                this.completeContractsTerminationStep(true);
                                console.log('complete WF Term Contracts');
                                break;
                            case WorkflowSteps.Sourcing:
                                this.completeSourcingTerminationStep(true);
                                console.log('complete WF Term Sourcing');
                                break;
                        }
                    break;
                }
                break;
            case WorkflowTopSections.Extension:
                switch (this._workflowDataService.workflowProgress.currentlyActiveStep) {
                    case WorkflowSteps.Sales:
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
        this._workflowServiceProxy.terminationStart(this.workflowId!)
        .pipe(finalize(() => {

        }))
        .subscribe(result => {
            this._workflowDataService.workflowSideSectionAdded.emit(true);
        });
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
        });

        dialogRef.componentInstance.onRejected.subscribe(() => {
            // rejected
        });
    }

}
