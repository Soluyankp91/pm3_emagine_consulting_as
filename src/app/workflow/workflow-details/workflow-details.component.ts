import { CdkScrollable, Overlay, ScrollDispatcher } from '@angular/cdk/overlay';
import {
    AfterViewInit,
    Component,
    ElementRef,
    Injector,
    NgZone,
    OnDestroy,
    OnInit,
    ViewChild,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTabChangeEvent, MatTabGroup } from '@angular/material/tabs';
import { ActivatedRoute } from '@angular/router';
import { NgScrollbar } from 'ngx-scrollbar';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import {
    AvailableConsultantDto,
    ChangeClientPeriodDto,
    ClientPeriodDto,
    ClientPeriodServiceProxy,
    ConsultantNameWithRequestUrl,
    ConsultantPeriodAddDto,
    EnumEntityTypeDto,
    ExtendClientPeriodDto,
    StepType,
    WorkflowDto,
    WorkflowProcessType,
    WorkflowServiceProxy,
} from 'src/shared/service-proxies/service-proxies';
import { WorkflowDataService } from '../workflow-data.service';
import {
    WorkflowProgressStatus,
    WorkflowTopSections,
    WorkflowSteps,
    WorkflowDiallogAction,
} from '../workflow.model';
import { InternalLookupService } from 'src/app/shared/common/internal-lookup.service';
import { WorkflowActionsDialogComponent } from '../workflow-actions-dialog/workflow-actions-dialog.component';
import {
    AppComponentBase,
    NotifySeverity,
} from 'src/shared/app-component-base';
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { environment } from 'src/environments/environment';
import { FormControl, Validators } from '@angular/forms';
import { LocalHttpService } from 'src/shared/service-proxies/local-http.service';
import { AuthenticationResult } from '@azure/msal-browser';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { WorkflowPeriodComponent } from '../workflow-period/workflow-period.component';
import { MatMenuTrigger } from '@angular/material/menu';
import { RateAndFeesWarningsDialogComponent } from '../rate-and-fees-warnings-dialog/rate-and-fees-warnings-dialog.component';
import { DialogConfig } from './workflow-details.model';

@Component({
    selector: 'app-workflow-details',
    templateUrl: './workflow-details.component.html',
    styleUrls: ['./workflow-details.component.scss'],
})
export class WorkflowDetailsComponent
    extends AppComponentBase
    implements OnInit, OnDestroy, AfterViewInit
{
    @ViewChild('scroller', { static: true }) scroller: ElementRef<HTMLElement>;
    @ViewChild('scrollable', { static: true }) scrollBar: NgScrollbar;
    @ViewChild('topMenuTabs', { static: false }) topMenuTabs: MatTabGroup;
    @ViewChild('workflowPeriod', { static: false })
    workflowPeriod: WorkflowPeriodComponent;
    @ViewChild('menuActionsTrigger', { static: false })
    menuActionsTrigger: MatMenuTrigger;

    menuIndex = 0;
    workflowId: string;
    selectedIndex = 0;
    selectedStep = 'Sales';

    deliveryTypes: EnumEntityTypeDto[] = [];
    currencies: EnumEntityTypeDto[] = [];
    saleTypes: EnumEntityTypeDto[] = [];

    topToolbarVisible = false;

    workflowDiallogActions = WorkflowDiallogAction;

    // tabs navigation
    selectedTabIndex: number;
    selectedTabName = 'Overview';
    extensionIndex: number | null;

    sectionIndex: number;

    workflowResponse: WorkflowDto;
    clientPeriods: ClientPeriodDto[] | undefined = [];
    workflowClient: string | undefined;
    workflowDirectClientid: number | undefined;
    workflowConsultants: ConsultantNameWithRequestUrl[] = [];

    workflowClientPeriodTypes: EnumEntityTypeDto[] = [];
    workflowConsultantPeriodTypes: EnumEntityTypeDto[] = [];
    workflowPeriodStepTypes: { [key: string]: string };
    individualConsultantActionsAvailable: boolean;

    isNoteVisible = false;
    workflowNote = new FormControl('', Validators.maxLength(4000));
    workflowNoteOldValue: string;
    disabledOverview = true;
    notesEditable = false;
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

    get bottomToolbarVisible() {
        if (
            this.selectedTabName === 'Overview' ||
            (!this._workflowDataService.getWorkflowProgress
                .stepSpecificPermissions!['StartEdit'] &&
                !this._workflowDataService.getWorkflowProgress
                    .stepSpecificPermissions!['Edit'] &&
                !this._workflowDataService.getWorkflowProgress
                    .stepSpecificPermissions!['Completion'])
        ) {
            return false;
        } else {
            return (
                (this._workflowDataService.getWorkflowProgress
                    .stepSpecificPermissions!['Edit'] ||
                    this._workflowDataService.getWorkflowProgress
                        .stepSpecificPermissions!['Completion']) &&
                !this._workflowDataService.getWorkflowProgress
                    .currentStepIsCompleted
            );
            // return  this._workflowDataService.getWorkflowProgress.stepSpecificPermissions!["Edit"] && this._workflowDataService.getWorkflowProgress.stepSpecificPermissions!["Complete"];
        }
    }

    get isProgressTrackVisible() {
        return !environment.production;
    }

    ngOnInit(): void {
        this.activatedRoute.paramMap
            .pipe(takeUntil(this._unsubscribe))
            .subscribe((params) => {
                this.workflowId = params.get('id')!;
            });
        this.resetWorkflowProgress();
        this._internalLookupService.getData();
        this.getClientPeriodTypes();
        this.getTopLevelMenu();
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
        this.isNoteVisible = !this.isNoteVisible;
    }

    cancelNoteEdit() {
        this.notesEditable = false;
        this.workflowNote.setValue(this.workflowNoteOldValue);
    }

    getNotes() {
        this.localHttpService
            .getTokenPromise()
            .then((response: AuthenticationResult) => {
                this.httpClient
                    .get(
                        `${this.apiUrl}/api/Workflow/${this.workflowId}/notes`,
                        {
                            headers: new HttpHeaders({
                                Authorization: `Bearer ${response.accessToken}`,
                            }),
                            responseType: 'text',
                        }
                    )
                    .pipe(finalize(() => {}))
                    .subscribe((result: any) => {
                        this.workflowNoteOldValue = result;
                        this.workflowNote.setValue(result);
                    });
            });
    }

    saveNotes() {
        this.showMainSpinner();
        this._workflowServiceProxy
            .notesPUT(this.workflowId, this.workflowNote.value)
            .pipe(finalize(() => this.hideMainSpinner()))
            .subscribe(
                () => (this.workflowNoteOldValue = this.workflowNote.value)
            );
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
        newStatus.stepSpecificPermissions = {
            StartEdit: false,
            Edit: false,
            Completion: false,
        };
        this._workflowDataService.updateWorkflowProgressStatus(newStatus);
    }

    cancelForceEdit() {
        this._workflowDataService.cancelForceEdit.emit();
    }

    getClientPeriodTypes() {
        this._internalLookupService
            .getWorkflowClientPeriodTypes()
            .pipe(finalize(() => {}))
            .subscribe((result) => {
                this.workflowClientPeriodTypes = result;
            });
    }

    getConsultantPeriodTypes() {
        this._internalLookupService
            .getWorkflowConsultantPeriodTypes()
            .pipe(finalize(() => {}))
            .subscribe((result) => {
                this.workflowConsultantPeriodTypes = result;
            });
    }

    getPeriodStepTypes() {
        this._internalLookupService
            .getWorkflowPeriodStepTypes()
            .pipe(finalize(() => {}))
            .subscribe((result) => {
                this.workflowPeriodStepTypes = result;
            });
    }

    ngAfterViewInit(): void {
        this.scrollDispatcher
            .scrolled()
            .pipe(takeUntil(this._unsubscribe))
            .subscribe((cdk: CdkScrollable | any) => {
                this.zone.run(() => {
                    const scrollPosition =
                        cdk.getElementRef().nativeElement.scrollTop;
                    if (scrollPosition > 120) {
                        // 120 - header height
                        this.topToolbarVisible = true;
                    } else {
                        this.topToolbarVisible = false;
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
        this._workflowServiceProxy
            .clientPeriods(this.workflowId)
            .pipe(
                finalize(() => {
                    this.hideMainSpinner();
                })
            )
            .subscribe((result) => {
                this.clientPeriods = result.clientPeriods;
                this.workflowClient = (result as any).clientName;
                this.workflowDirectClientid = result.directClientId;
                this.workflowConsultants =
                    result.consultantNamesWithRequestUrls!;
                this.workflowId = result.workflowId!;
                if (value) {
                    this.selectedIndex = 1;
                    this.topMenuTabs.realignInkBar();
                    this.updateWorkflowProgressAfterTopTabChanged();
                }
            });
    }

    updateWorkflowProgressAfterTopTabChanged() {
        let newStatus = new WorkflowProgressStatus();
        newStatus.currentlyActiveStep = WorkflowSteps.Sales;
        if (this.selectedTabIndex > 0) {
            // if not overview - active period
            newStatus.currentlyActivePeriodId =
                this.clientPeriods![this.selectedTabIndex - 1]?.id; // first period, as index = 0 - Overview tab
        } else {
            // if overview - most recent period
            newStatus.currentlyActivePeriodId = this.clientPeriods![0]?.id;
        }
        if (this.selectedTabName === 'Overview') {
            newStatus.currentlyActiveSection = WorkflowTopSections.Overview;
        } else {
            newStatus.currentlyActiveSection = this.detectTopLevelMenu(
                this.selectedTabName
            );
        }
        this._workflowDataService.updateWorkflowProgressStatus(newStatus);
    }

    tabChanged(event: MatTabChangeEvent) {
        this.selectedIndex = event.index;
        this.selectedTabName = event.tab.textLabel;
        let newStatus = new WorkflowProgressStatus();
        newStatus.currentlyActiveStep = WorkflowSteps.Sales;
        if (event.index > 0) {
            // if not overview - active period
            newStatus.currentlyActivePeriodId =
                this.clientPeriods![event.index - 1]?.id;
        } else {
            // if overview - most recent period
            newStatus.currentlyActivePeriodId = this.clientPeriods![0]?.id;
        }
        if (this.selectedTabName === 'Overview') {
            newStatus.currentlyActiveSection = WorkflowTopSections.Overview;
        } else {
            newStatus.currentlyActiveSection = this.detectTopLevelMenu(
                this.selectedTabName
            );
        }
        this._workflowDataService.updateWorkflowProgressStatus(newStatus);
    }

    detectTopLevelMenu(clientPeriodName: string) {
        const selectedTopMenu = this.clientPeriods?.find(
            (x) => x.name === clientPeriodName
        );
        const clientPeriodType = this.workflowClientPeriodTypes.find(
            (type) => type.id === selectedTopMenu?.typeId
        );
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

    saveOrCompleteStep(isDraft: boolean, event?: KeyboardEvent) {
        switch (
            this._workflowDataService.workflowProgress
                .currentlyActiveSideSection
        ) {
            case WorkflowProcessType.StartClientPeriod:
            case WorkflowProcessType.ChangeClientPeriod:
            case WorkflowProcessType.ExtendClientPeriod:
                switch (
                    this._workflowDataService.workflowProgress
                        .currentlyActiveStep
                ) {
                    case StepType.Sales:
                        this._workflowDataService.startClientPeriodSalesSaved.emit(
                            isDraft
                        );
                        break;
                    case StepType.Contract:
                        let bypassLegalValidation =
                            event?.altKey && event?.shiftKey;
                        this._workflowDataService.startClientPeriodContractsSaved.emit(
                            {
                                isDraft: isDraft,
                                bypassLegalValidation: bypassLegalValidation,
                            }
                        );
                        break;
                    case StepType.Finance:
                        this._workflowDataService.startClientPeriodFinanceSaved.emit(
                            isDraft
                        );
                        break;
                }
                break;

            case WorkflowProcessType.TerminateWorkflow:
                switch (
                    this._workflowDataService.workflowProgress
                        .currentlyActiveStep
                ) {
                    case StepType.Sales:
                        this._workflowDataService.workflowTerminationSalesSaved.emit(
                            isDraft
                        );
                        break;
                    case StepType.Contract:
                        this._workflowDataService.workflowTerminationContractsSaved.emit(
                            isDraft
                        );
                        break;
                    case StepType.Sourcing:
                        this._workflowDataService.workflowTerminationSourcingSaved.emit(
                            isDraft
                        );
                        break;
                }
                break;

            case WorkflowProcessType.TerminateConsultant:
                switch (
                    this._workflowDataService.workflowProgress
                        .currentlyActiveStep
                ) {
                    case StepType.Sales:
                        this._workflowDataService.consultantTerminationSalesSaved.emit(
                            isDraft
                        );
                        break;
                    case StepType.Contract:
                        this._workflowDataService.workflowConsultantTerminationContractsSaved.emit(
                            isDraft
                        );
                        break;
                    case StepType.Sourcing:
                        this._workflowDataService.workflowConsultantTerminationSourcingSaved.emit(
                            isDraft
                        );
                        break;
                }
                break;

            case WorkflowProcessType.StartConsultantPeriod:
            case WorkflowProcessType.ChangeConsultantPeriod:
            case WorkflowProcessType.ExtendConsultantPeriod:
                switch (
                    this._workflowDataService.workflowProgress
                        .currentlyActiveStep
                ) {
                    case StepType.Sales:
                        this._workflowDataService.consultantStartChangeOrExtendSalesSaved.emit(
                            isDraft
                        );
                        break;
                    case StepType.Contract:
                        let bypassLegalValidation =
                            event?.altKey && event?.shiftKey;
                        this._workflowDataService.consultantStartChangeOrExtendContractsSaved.emit(
                            {
                                isDraft,
                                bypassLegalValidation: bypassLegalValidation,
                            }
                        );
                        break;
                    case StepType.Finance:
                        this._workflowDataService.consultantStartChangeOrExtendFinanceSaved.emit(
                            isDraft
                        );
                        break;
                }
                break;
        }
    }

    // add Termiantion

    addTermination() {
        this.menuActionsTrigger.closeMenu();
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
                rejectButtonText: 'Cancel',
                confirmButtonText: 'Terminate',
                isNegative: true,
            },
        });

        dialogRef.componentInstance.onConfirmed.subscribe(() => {
            this.terminateWorkflowStart();
        });
    }

    terminateWorkflowStart() {
        this.showMainSpinner();
        this._workflowServiceProxy
            .terminationStart(this.workflowId!)
            .pipe(
                finalize(() => {
                    this.hideMainSpinner();
                })
            )
            .subscribe((result) => {
                this._workflowDataService.workflowSideSectionAdded.emit(true);
                this._workflowDataService.workflowOverviewUpdated.emit(true);
            });
    }

    getAvailableConsultantForChangeOrExtend(workflowAction: number) {
        this.menuActionsTrigger.closeMenu();
        if (
            !this._workflowDataService.getWorkflowProgress
                .currentlyActivePeriodId
        ) {
            let newStatus = new WorkflowProgressStatus();
            newStatus.currentlyActivePeriodId = this.clientPeriods![0].id;
            this._workflowDataService.updateWorkflowProgressStatus(newStatus);
        }

        this.showMainSpinner();
        this._clientPeriodService
            .availableConsultants(
                this._workflowDataService.getWorkflowProgress
                    .currentlyActivePeriodId!
            )
            .pipe(finalize(() => this.hideMainSpinner()))
            .subscribe((result) => {
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
                    this.showNotify(
                        NotifySeverity.Error,
                        'There are no available consultants for this action',
                        'Ok'
                    );
                }
            });
    }

    addExtension(availableConsultants: AvailableConsultantDto[]) {
        const scrollStrategy = this.overlay.scrollStrategies.reposition();
        DialogConfig.scrollStrategy = scrollStrategy;
        DialogConfig.data = {
            dialogType: WorkflowDiallogAction.Extend,
            dialogTitle: 'Extend Workflow',
            rejectButtonText: 'Cancel',
            confirmButtonText: 'Create',
            isNegative: false,
            consultantData: availableConsultants,
        };
        const dialogRef = this.dialog.open(
            WorkflowActionsDialogComponent,
            DialogConfig
        );

        dialogRef.componentInstance.onConfirmed.subscribe(
            (result: ExtendClientPeriodDto) => {
                if (result) {
                    this.showMainSpinner();
                    this._clientPeriodService
                        .clientExtend(
                            this._workflowDataService.getWorkflowProgress
                                .currentlyActivePeriodId!,
                            result
                        )
                        .pipe(finalize(() => this.hideMainSpinner()))
                        .subscribe((result) => {
                            this._workflowDataService.workflowTopSectionUpdated.emit(
                                true
                            );
                            this._workflowDataService.workflowOverviewUpdated.emit(
                                true
                            );
                            if (
                                result?.specialFeesChangesWarnings?.length ||
                                result?.specialRatesChangesWarnings?.length
                            ) {
                                this.processRatesAfterChangeOrExtend(
                                    result.specialRatesChangesWarnings,
                                    result.specialFeesChangesWarnings
                                );
                            }
                        });
                }
            }
        );
    }

    changeWorkflow(availableConsultants: AvailableConsultantDto[]) {
        const scrollStrategy = this.overlay.scrollStrategies.reposition();
        DialogConfig.scrollStrategy = scrollStrategy;
        DialogConfig.data = {
            dialogType: WorkflowDiallogAction.Change,
            dialogTitle: 'Change Workflow data',
            rejectButtonText: 'Cancel',
            confirmButtonText: 'Create',
            isNegative: false,
            consultantData: availableConsultants,
        };
        const dialogRef = this.dialog.open(
            WorkflowActionsDialogComponent,
            DialogConfig
        );

        dialogRef.componentInstance.onConfirmed.subscribe(
            (result: ChangeClientPeriodDto) => {
                if (result) {
                    this.showMainSpinner();
                    this._clientPeriodService
                        .clientChange(
                            this._workflowDataService.getWorkflowProgress
                                .currentlyActivePeriodId!,
                            result
                        )
                        .pipe(finalize(() => this.hideMainSpinner()))
                        .subscribe((result) => {
                            if (
                                result?.specialFeesChangesWarnings?.length ||
                                result?.specialRatesChangesWarnings?.length
                            ) {
                                this.processRatesAfterChangeOrExtend(
                                    result.specialRatesChangesWarnings,
                                    result.specialFeesChangesWarnings
                                );
                            }
                            this._workflowDataService.workflowTopSectionUpdated.emit(
                                true
                            );
                            this._workflowDataService.workflowOverviewUpdated.emit(
                                true
                            );
                        });
                }
            }
        );
    }

    processRatesAfterChangeOrExtend(
        specialRatesWarnings: string[] | undefined,
        specialFeesWarnings: string[] | undefined
    ) {
        const scrollStrategy = this.overlay.scrollStrategies.reposition();
        DialogConfig.scrollStrategy = scrollStrategy;
        DialogConfig.data = {
            specialRatesWarnings: specialRatesWarnings,
            specialFeesWarnings: specialFeesWarnings,
        };
        this.dialog.open(RateAndFeesWarningsDialogComponent, DialogConfig);
    }

    addConsultant() {
        this.menuActionsTrigger.closeMenu();
        const scrollStrategy = this.overlay.scrollStrategies.reposition();
        DialogConfig.scrollStrategy = scrollStrategy;
        DialogConfig.data = {
            dialogType: WorkflowDiallogAction.AddConsultant,
            dialogTitle: 'Add consultant',
            rejectButtonText: 'Cancel',
            confirmButtonText: 'Create',
            isNegative: false,
        };
        const dialogRef = this.dialog.open(
            WorkflowActionsDialogComponent,
            DialogConfig
        );

        dialogRef.componentInstance.onConfirmed.subscribe((result) => {
            if (result) {
                this.showMainSpinner();
                let input = new ConsultantPeriodAddDto();
                input.startDate = result.startDate;
                input.endDate = result.endDate;
                input.noEndDate = result.noEndDate;
                this._clientPeriodService
                    .addConsultantPeriod(
                        this._workflowDataService.getWorkflowProgress
                            .currentlyActivePeriodId!,
                        input
                    )
                    .pipe(finalize(() => this.hideMainSpinner()))
                    .subscribe((result) => {
                        this._workflowDataService.workflowSideSectionAdded.emit(
                            true
                        );
                        this._workflowDataService.workflowOverviewUpdated.emit(
                            true
                        );
                    });
            }
        });
    }

    navigateToRequest(requestUrl: string) {
        window.open(requestUrl, '_blank');
    }
}
