import { CdkScrollable, Overlay, ScrollDispatcher } from '@angular/cdk/overlay';
import { AfterViewInit, Component, ElementRef, Injector, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ActivatedRoute } from '@angular/router';
import { NgScrollbar } from 'ngx-scrollbar';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { AvailableConsultantDto, ChangeClientPeriodDto, ClientPeriodDto, ClientPeriodServiceProxy, ConsultantPeriodAddDto, EnumEntityTypeDto, ExtendClientPeriodDto, NewContractRequiredConsultantPeriodDto, StepType, WorkflowDto, WorkflowProcessType, WorkflowServiceProxy } from 'src/shared/service-proxies/service-proxies';
import { WorkflowDataService } from '../workflow-data.service';
import { WorkflowSalesComponent } from '../workflow-sales/workflow-sales.component';
import { WorkflowProgressStatus, WorkflowTopSections, WorkflowSteps, WorkflowDiallogAction } from '../workflow.model';
import { InternalLookupService } from 'src/app/shared/common/internal-lookup.service';
import { WorkflowActionsDialogComponent } from '../workflow-actions-dialog/workflow-actions-dialog.component';
import { AppComponentBase, NotifySeverity } from 'src/shared/app-component-base';
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import * as moment from 'moment';
import { environment } from 'src/environments/environment';
import { FormControl, Validators } from '@angular/forms';
import { LocalHttpService } from 'src/shared/service-proxies/local-http.service';
import { AuthenticationResult } from '@azure/msal-browser';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-workflow-details',
  templateUrl: './workflow-details.component.html',
  styleUrls: ['./workflow-details.component.scss']
})

export class WorkflowDetailsComponent extends AppComponentBase implements OnInit, OnDestroy, AfterViewInit {
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

    workflowDiallogActions = WorkflowDiallogAction;

    // tabs navigation
    selectedTabIndex: number;
    selectedTabName = 'Overview';
    extensionIndex: number | null;

    sectionIndex: number;

    workflowResponse: WorkflowDto;
    clientPeriods: ClientPeriodDto[] | undefined = [];
    workflowClient: string | undefined;

    workflowClientPeriodTypes: EnumEntityTypeDto[] = [];
    workflowConsultantPeriodTypes: EnumEntityTypeDto[] = [];
    workflowPeriodStepTypes: { [key: string]: string };
    individualConsultantActionsAvailable: boolean;

    isNoteVisible = false;
    workflowNote = new FormControl('', Validators.maxLength(4000));
    workflowNoteOldValue: string;
    private _unsubscribe = new Subject();
    constructor(
        injector: Injector,
        public _workflowDataService: WorkflowDataService,
        private activatedRoute: ActivatedRoute,
        private overlay: Overlay,
        private dialog: MatDialog,
        private scrollDispatcher: ScrollDispatcher,
        private zone: NgZone,
        private _internalLookupService: InternalLookupService,
        private _workflowServiceProxy: WorkflowServiceProxy,
        private _clientPeriodService: ClientPeriodServiceProxy,
        private localHttpService: LocalHttpService,
        private httpClient: HttpClient
    ) {
        super(injector);
    }

    get toolbarVisible() {
        if (this.selectedTabName === 'Overview' ||
            (!this._workflowDataService.getWorkflowProgress.stepSpecificPermissions!['StartEdit'] &&
            !this._workflowDataService.getWorkflowProgress.stepSpecificPermissions!['Edit'] &&
            !this._workflowDataService.getWorkflowProgress.stepSpecificPermissions!['Completion'])
            ) {
            return false;
        } else {
            return (this._workflowDataService.getWorkflowProgress.stepSpecificPermissions!['Edit'] ||
                    this._workflowDataService.getWorkflowProgress.stepSpecificPermissions!['Completion']) &&
                    !this._workflowDataService.getWorkflowProgress.currentStepIsCompleted
            // return  this._workflowDataService.getWorkflowProgress.stepSpecificPermissions!["Edit"] && this._workflowDataService.getWorkflowProgress.stepSpecificPermissions!["Complete"];
        }
    }

    get isProgressTrackVisible() {
        return !environment.production;
    }

    ngOnInit(): void {
        this.activatedRoute.paramMap.pipe(
            takeUntil(this._unsubscribe)
        ).subscribe(params => {
            this.workflowId = params.get('id')!;
        });
        this.resetWorkflowProgress();
        this._internalLookupService.getData();
        this.getTopLevelMenu();
        this.getClientPeriodTypes();
        this.getConsultantPeriodTypes();
        this.getPeriodStepTypes();
        this.getNotes();

        this._workflowDataService.workflowTopSectionUpdated
            .pipe(takeUntil(this._unsubscribe))
            .subscribe((value: boolean) => {
                this.getTopLevelMenu(value);
            });
        this.individualConsultantActionsAvailable = environment.dev;
    }

    showOrHideNotes() {
        if (this.isNoteVisible) {
            if (this.workflowNoteOldValue !== this.workflowNote.value) {
                this.confirmCancelNote();
            } else {
                this.isNoteVisible = false;
            }
        } else {
            this.isNoteVisible = true;
        }
    }

    confirmCancelNote() {
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
                confirmationMessageTitle: `Are you sure you want to cancel?`,
                confirmationMessage: 'If you cancel edit all unsaved changes will gone.',
                rejectButtonText: 'Save and close',
                confirmButtonText: 'Yes, cancel edit',
                isNegative: true
            }
        });

        dialogRef.componentInstance.onConfirmed.subscribe(() => {
            this.isNoteVisible = false;
            this.workflowNote.setValue(this.workflowNoteOldValue);
        });

        dialogRef.componentInstance.onRejected.subscribe(() => {
            this.saveNotes();
        });
    }

    getNotes() {
        this.localHttpService.getTokenPromise().then((response: AuthenticationResult) => {
            this.httpClient.get(`${this.apiUrl}/api/Workflow/${this.workflowId}/notes`, {
                    headers: new HttpHeaders({
                        'Authorization': `Bearer ${response.accessToken}`
                    }),
                    responseType: 'text'
                })
                .pipe(finalize(() => {}))
                .subscribe((result: any) => {
                    this.workflowNoteOldValue = result;
                    this.workflowNote.setValue(result);
                })
        });
    }

    saveNotes() {
        this.showMainSpinner();
        this._workflowServiceProxy.notesPut(this.workflowId, this.workflowNote.value)
            .pipe(finalize(() => this.hideMainSpinner() ))
            .subscribe(() => this.workflowNoteOldValue = this.workflowNote.value);
    }

    resetWorkflowProgress() {
        let newStatus = new WorkflowProgressStatus();
        newStatus.started = true;
        newStatus.currentStepIsCompleted = false;
        newStatus.currentStepIsForcefullyEditing = false;
        newStatus.currentlyActivePeriodId = '';
        newStatus.currentlyActiveSection = 0;
        newStatus.currentlyActiveSideSection = 0;
        newStatus.currentlyActiveStep = 0;
        newStatus.stepSpecificPermissions = {StartEdit: false, Edit: false, Completion: false};
        this._workflowDataService.updateWorkflowProgressStatus(newStatus);
    }

    cancelForceEdit() {
        this._workflowDataService.cancelForceEdit.emit();
    }

    getClientPeriodTypes() {
        this._internalLookupService.getWorkflowClientPeriodTypes()
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.workflowClientPeriodTypes = result;
            });
    }

    getConsultantPeriodTypes() {
        this._internalLookupService.getWorkflowConsultantPeriodTypes()
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.workflowConsultantPeriodTypes = result;
            });
    }

    getPeriodStepTypes() {
        this._internalLookupService.getWorkflowPeriodStepTypes()
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

    getTopLevelMenu(value?: boolean) {
        this.showMainSpinner();
        this._workflowServiceProxy.clientPeriods(this.workflowId)
            .pipe(finalize(() => {
                this.hideMainSpinner();
            }))
            .subscribe(result => {
                this.clientPeriods = result.clientPeriods;
                this.workflowClient = result.clientName;
                if (value) {
                    this.selectedIndex = 1;
                }
            });
    }

    tabChanged(event: MatTabChangeEvent) {
        this.selectedIndex = event.index;
        this.selectedTabName = event.tab.textLabel;
        let newStatus = new WorkflowProgressStatus();
        newStatus.currentlyActiveStep = WorkflowSteps.Sales;
        if (event.index > 0) {
            // if not overview - active period
            newStatus.currentlyActivePeriodId = this.clientPeriods![event.index - 1]?.id;
        } else {
            // if overview - most recent period
            newStatus.currentlyActivePeriodId = this.clientPeriods![0]?.id;
        }
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
                return WorkflowTopSections.StartPeriod;
            case 2: // Change period
                return WorkflowTopSections.ChangePeriod;
            case 3: // Extend period
                return WorkflowTopSections.ExtendPeriod;
        }
    }

    mapSideSectionName(value: number | undefined) {
        return value ? WorkflowProcessType[value] : '';
    }

    mapSectionName(value: number | undefined) {
        return value ? WorkflowTopSections[value] : '';
    }

    mapStepName(value: number | undefined) {
        return value ? StepType[value] : '';
    }

    saveOrCompleteStep(isDraft: boolean) {
        switch (this._workflowDataService.workflowProgress.currentlyActiveSideSection) {
            case WorkflowProcessType.StartClientPeriod:
            case WorkflowProcessType.ChangeClientPeriod:
            case WorkflowProcessType.ExtendClientPeriod:
                switch (this._workflowDataService.workflowProgress.currentlyActiveStep) {
                    case StepType.Sales:
                        this._workflowDataService.startClientPeriodSalesSaved.emit(isDraft);
                        break;
                    case StepType.Contract:
                        this._workflowDataService.startClientPeriodContractsSaved.emit(isDraft);
                        break;
                    case StepType.Finance:
                        this._workflowDataService.startClientPeriodFinanceSaved.emit(isDraft);
                        break;
                }
                break;

            case WorkflowProcessType.TerminateWorkflow:
                switch (this._workflowDataService.workflowProgress.currentlyActiveStep) {
                    case StepType.Sales:
                        this._workflowDataService.workflowTerminationSalesSaved.emit(isDraft);
                        break;
                    case StepType.Contract:
                        this._workflowDataService.workflowTerminationContractsSaved.emit(isDraft);
                        break;
                    case StepType.Sourcing:
                        this._workflowDataService.workflowTerminationSourcingSaved.emit(isDraft);
                        break;
                }
                break;

            case WorkflowProcessType.TerminateConsultant:
                switch (this._workflowDataService.workflowProgress.currentlyActiveStep) {
                    case StepType.Sales:
                        this._workflowDataService.consultantTerminationSalesSaved.emit(isDraft);
                        break;
                    case StepType.Contract:
                        this._workflowDataService.workflowConsultantTerminationContractsSaved.emit(isDraft);
                        break;
                    case StepType.Sourcing:
                        this._workflowDataService.workflowConsultantTerminationSourcingSaved.emit(isDraft);
                        break;
                }
                break;

            case WorkflowProcessType.StartConsultantPeriod:
            case WorkflowProcessType.ChangeConsultantPeriod:
            case WorkflowProcessType.ExtendConsultantPeriod:
                switch (this._workflowDataService.workflowProgress.currentlyActiveStep) {
                    case StepType.Sales:
                        this._workflowDataService.consultantStartChangeOrExtendSalesSaved.emit(isDraft);
                        break;
                    case StepType.Contract:
                        this._workflowDataService.consultantStartChangeOrExtendContractsSaved.emit(isDraft);
                        break;
                    case StepType.Finance:
                        this._workflowDataService.consultantStartChangeOrExtendFinanceSaved.emit(isDraft);
                        break;
                }
                break;
        }
        // break;

        // switch (this._workflowDataService.workflowProgress.currentlyActiveSection) {
        //     case WorkflowTopSections.StartPeriod:
        //         switch (this._workflowDataService.workflowProgress.currentlyActiveSideSection) {
        //             case WorkflowProcessType.StartClientPeriod:
        //                 switch (this._workflowDataService.workflowProgress.currentlyActiveStep) {
        //                     case StepType.Sales:
        //                         this._workflowDataService.startClientPeriodSalesSaved.emit(isDraft);
        //                         break;
        //                     case StepType.Contract:
        //                         this._workflowDataService.startClientPeriodContractsSaved.emit(isDraft);
        //                         break;
        //                     case StepType.Finance:
        //                         this._workflowDataService.startClientPeriodFinanceSaved.emit(isDraft);
        //                         break;
        //                 }
        //             break;
        //             case WorkflowProcessType.TerminateWorkflow:
        //                 switch (this._workflowDataService.workflowProgress.currentlyActiveStep) {
        //                     case StepType.Sales:
        //                         this._workflowDataService.workflowTerminationSalesSaved.emit(isDraft);
        //                         break;
        //                     case StepType.Contract:
        //                         this._workflowDataService.workflowTerminationContractsSaved.emit(isDraft);
        //                         break;
        //                     case StepType.Sourcing:
        //                         this._workflowDataService.workflowTerminationSourcingSaved.emit(isDraft);
        //                         break;
        //                 }
        //             break;
        //             case WorkflowProcessType.StartConsultantPeriod:
        //             case WorkflowProcessType.ChangeConsultantPeriod:
        //             case WorkflowProcessType.ExtendConsultantPeriod:
        //                 switch (this._workflowDataService.workflowProgress.currentlyActiveStep) {
        //                     case StepType.Sales:
        //                         this._workflowDataService.consultantStartChangeOrExtendSalesSaved.emit(isDraft);
        //                         break;
        //                     case StepType.Contract:
        //                         this._workflowDataService.consultantStartChangeOrExtendContractsSaved.emit(isDraft);
        //                         break;
        //                     case StepType.Finance:
        //                         this._workflowDataService.consultantStartChangeOrExtendFinanceSaved.emit(isDraft);
        //                         break;
        //                 }
        //             break;
        //             case WorkflowProcessType.TerminateConsultant:
        //                 switch (this._workflowDataService.workflowProgress.currentlyActiveStep) {
        //                     case StepType.Sales:
        //                         this._workflowDataService.consultantTerminationSalesSaved.emit(isDraft);
        //                         console.log('save draft WF Term Cons Sales');
        //                         break;
        //                     case StepType.Contract:
        //                         this.saveContractsConsultantTerminationStep(isDraft);
        //                         console.log('save draft WF Term Cons Contracts');
        //                         break;
        //                     case StepType.Sourcing:
        //                         this.saveSourcingConsultantTerminationStep(isDraft);
        //                         console.log('save draft WF Term Cons Sourcing');
        //                         break;
        //                 }
        //             break;
        //         }
        //         break;
        //     case WorkflowTopSections.ExtendPeriod:
        //         switch (this._workflowDataService.workflowProgress.currentlyActiveSideSection) {
        //             case WorkflowProcessType.ExtendClientPeriod:
        //                 switch (this._workflowDataService.workflowProgress.currentlyActiveStep) {
        //                     case StepType.Sales:
        //                         console.log('save Extension Sales');
        //                         break;
        //                     case StepType.Contract:
        //                         console.log('save Extension Contracts');
        //                         break;
        //                     case StepType.Finance:
        //                         console.log('save Extension Finance');
        //                         break;
        //                 }
        //                 break;
        //             case WorkflowProcessType.TerminateWorkflow:
        //                 switch (this._workflowDataService.workflowProgress.currentlyActiveStep) {
        //                     case StepType.Sales:
        //                         console.log('save Extension Sales');
        //                         break;
        //                     case StepType.Contract:
        //                         console.log('save Extension Contracts');
        //                         break;
        //                     case StepType.Finance:
        //                         console.log('save Extension Finance');
        //                         break;
        //                 }
        //                 break;
        //             case WorkflowProcessType.StartConsultantPeriod:
        //             case WorkflowProcessType.ChangeConsultantPeriod:
        //             case WorkflowProcessType.ExtendConsultantPeriod:
        //                 switch (this._workflowDataService.workflowProgress.currentlyActiveStep) {
        //                     case StepType.Sales:
        //                         this._workflowDataService.consultantStartChangeOrExtendSalesSaved.emit(isDraft);
        //                         break;
        //                     case StepType.Contract:
        //                         this._workflowDataService.consultantStartChangeOrExtendContractsSaved.emit(isDraft);
        //                         break;
        //                     case StepType.Finance:
        //                         this._workflowDataService.consultantStartChangeOrExtendFinanceSaved.emit(isDraft);
        //                         break;
        //                 }
        //                 break;
        //             case WorkflowProcessType.TerminateConsultant:
        //                 switch (this._workflowDataService.workflowProgress.currentlyActiveStep) {
        //                     case StepType.Sales:
        //                         console.log('save Extension Sales');
        //                         break;
        //                     case StepType.Contract:
        //                         console.log('save Extension Contracts');
        //                         break;
        //                     case StepType.Finance:
        //                         console.log('save Extension Finance');
        //                         break;
        //                 }
        //                 break;
        //         }
        //         break;
        //     case WorkflowTopSections.ChangePeriod:
        //         switch (this._workflowDataService.workflowProgress.currentlyActiveSideSection) {
        //             case WorkflowProcessType.ChangeClientPeriod:
        //                 switch (this._workflowDataService.workflowProgress.currentlyActiveStep) {
        //                     case StepType.Sales:
        //                         console.log('save Extension Sales');
        //                         break;
        //                     case StepType.Contract:
        //                         console.log('save Extension Contracts');
        //                         break;
        //                     case StepType.Finance:
        //                         console.log('save Extension Finance');
        //                         break;
        //                 }
        //                 break;
        //             case WorkflowProcessType.TerminateWorkflow:
        //                 switch (this._workflowDataService.workflowProgress.currentlyActiveStep) {
        //                     case StepType.Sales:
        //                         console.log('save Extension Sales');
        //                         break;
        //                     case StepType.Contract:
        //                         console.log('save Extension Contracts');
        //                         break;
        //                     case StepType.Finance:
        //                         console.log('save Extension Finance');
        //                         break;
        //                 }
        //                 break;
        //             case WorkflowProcessType.StartConsultantPeriod:
        //                 switch (this._workflowDataService.workflowProgress.currentlyActiveStep) {
        //                     case StepType.Sales:
        //                         console.log('save Extension Sales');
        //                         break;
        //                     case StepType.Contract:
        //                         console.log('save Extension Contracts');
        //                         break;
        //                     case StepType.Finance:
        //                         console.log('save Extension Finance');
        //                         break;
        //                 }
        //                 break;
        //             case WorkflowProcessType.ChangeConsultantPeriod:
        //                 switch (this._workflowDataService.workflowProgress.currentlyActiveStep) {
        //                     case StepType.Sales:
        //                         console.log('save Extension Sales');
        //                         break;
        //                     case StepType.Contract:
        //                         console.log('save Extension Contracts');
        //                         break;
        //                     case StepType.Finance:
        //                         console.log('save Extension Finance');
        //                         break;
        //                 }
        //                 break;
        //             case WorkflowProcessType.ExtendConsultantPeriod:
        //                 switch (this._workflowDataService.workflowProgress.currentlyActiveStep) {
        //                     case StepType.Sales:
        //                         console.log('save Extension Sales');
        //                         break;
        //                     case StepType.Contract:
        //                         console.log('save Extension Contracts');
        //                         break;
        //                     case StepType.Finance:
        //                         console.log('save Extension Finance');
        //                         break;
        //                 }
        //                 break;
        //             case WorkflowProcessType.TerminateConsultant:
        //                 switch (this._workflowDataService.workflowProgress.currentlyActiveStep) {
        //                     case StepType.Sales:
        //                         console.log('save Extension Sales');
        //                         break;
        //                     case StepType.Contract:
        //                         console.log('save Extension Contracts');
        //                         break;
        //                     case StepType.Finance:
        //                         console.log('save Extension Finance');
        //                         break;
        //                 }
        //                 break;

        //         }
        //         break;
        // }
    }


    // add Termiantion

    addTermination() {
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
                confirmationMessageTitle: `Are you sure you want to terminate workflow?`,
                // confirmationMessage: 'When you confirm the termination, all the info contained inside this block will disappear.',
                rejectButtonText: 'Cancel',
                confirmButtonText: 'Terminate',
                isNegative: true
            }
        });

        dialogRef.componentInstance.onConfirmed.subscribe(() => {
            this.terminateWorkflowStart();
        });

        dialogRef.componentInstance.onRejected.subscribe(() => {
            // nthng
        });
    }

    terminateWorkflowStart() {
        this.showMainSpinner();
        this._workflowServiceProxy.terminationStart(this.workflowId!)
        .pipe(finalize(() => {
            this.hideMainSpinner();
        }))
        .subscribe(result => {
            this._workflowDataService.workflowSideSectionAdded.emit(true);
        });
    }

    getAvailableConsultantForChangeOrExtend(workflowAction: number) {
        if (!this._workflowDataService.getWorkflowProgress.currentlyActivePeriodId) {
            let newStatus = new WorkflowProgressStatus();
            newStatus.currentlyActivePeriodId = this.clientPeriods![0].id;
            this._workflowDataService.updateWorkflowProgressStatus(newStatus);
        }

        this.showMainSpinner();
        this._clientPeriodService.availableConsultants(this._workflowDataService.getWorkflowProgress.currentlyActivePeriodId!)
            .pipe(finalize(() => this.hideMainSpinner()))
            .subscribe(result => {
                if (result.length) {
                    switch (workflowAction) {
                        case WorkflowDiallogAction.Change:
                            this.changeWorkflow(result);
                            break;
                        case WorkflowDiallogAction.Extend:
                            this.addExtension(result);
                            break;
                    }
                } else {
                    this.showNotify(NotifySeverity.Error, 'There are no available consultants for this action', 'Ok');
                }
            });
    }

    addExtension(availableConsultants: AvailableConsultantDto[]) {
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
                isNegative: false,
                consultantData: availableConsultants
            }
        });

        dialogRef.componentInstance.onConfirmed.subscribe((result: ExtendClientPeriodDto) => {
            if (result) {
                // let input = new ExtendClientPeriodDto();
                // input.startDate = result.startDate;
                // input.endDate = result.endDate;
                // input.noEndDate = result.noEndDate;
                // input.extendConsultantIds = result.noEndDate;
                this.showMainSpinner();
                this._clientPeriodService.clientExtend(this._workflowDataService.getWorkflowProgress.currentlyActivePeriodId!, result)
                    .pipe(finalize(() => this.hideMainSpinner()))
                    .subscribe(result => {
                        this._workflowDataService.workflowTopSectionUpdated.emit(true);
                    });
            }
        });

        dialogRef.componentInstance.onRejected.subscribe(() => {
            // rejected
        });

    }

    changeWorkflow(availableConsultants: AvailableConsultantDto[]) {
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
                isNegative: false,
                consultantData: availableConsultants
            }
        });

        dialogRef.componentInstance.onConfirmed.subscribe((result: ChangeClientPeriodDto) => {
            // let input = new ChangeClientPeriodDto();
            // input.clientNewLegalContractRequired = result.clientNewLegalContractRequired;
            // input.cutoverDate = result.cutoverDate;
            // input.consultantPeriods = new Array<NewContractRequiredConsultantPeriodDto>();
            // result.consultants?.forEach((consultant: any) => {
            //     let consultantInput = new NewContractRequiredConsultantPeriodDto();
            //     consultantInput.consultantId = consultant.consutlantId,
            //     consultantInput.consultantNewLegalContractRequired = consultant.extendConsutlant;
            //     input.consultantPeriods?.push(consultantInput);
            // })
            if (result) {
                this.showMainSpinner();
                this._clientPeriodService.clientChange(this._workflowDataService.getWorkflowProgress.currentlyActivePeriodId!, result)
                    .pipe(finalize(() => this.hideMainSpinner()))
                    .subscribe(result => {
                        this._workflowDataService.workflowTopSectionUpdated.emit(true);
                    });
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
                dialogType: WorkflowDiallogAction.AddConsultant,
                dialogTitle: 'Add consultant',
                rejectButtonText: 'Cancel',
                confirmButtonText: 'Create',
                isNegative: false
            }
        });

        dialogRef.componentInstance.onConfirmed.subscribe((result) => {
            if (result) {
                this.showMainSpinner();
                let input = new ConsultantPeriodAddDto();
                input.startDate = result.startDate
                input.endDate = result.endDate;
                input.noEndDate = result.noEndDate;
                this._clientPeriodService.addConsultantPeriod(this._workflowDataService.getWorkflowProgress.currentlyActivePeriodId!, input)
                    .pipe(finalize(() => this.hideMainSpinner()))
                    .subscribe(result => {
                        this._workflowDataService.workflowSideSectionAdded.emit(true);
                    });
            }
        });

        dialogRef.componentInstance.onRejected.subscribe(() => {
            // rejected
        });
    }

}
