import { Overlay } from '@angular/cdk/overlay';
import { Component, Injectable, Injector, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { ActivatedRoute, ActivatedRouteSnapshot, NavigationEnd, NavigationStart, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { ScrollToConfigOptions, ScrollToService } from '@nicky-lenaers/ngx-scroll-to';
import { Observable, Subject, Subscription } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { InternalLookupService } from 'src/app/shared/common/internal-lookup.service';
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { ManagerStatus } from 'src/app/shared/components/manager-search/manager-search.model';
import { AppComponentBase } from 'src/shared/app-component-base';
import { MediumDialogConfig } from 'src/shared/dialog.configs';
import { WorkflowProcessType, WorkflowServiceProxy, StepDto, StepType, WorkflowStepStatus, ConsultantResultDto, ClientPeriodServiceProxy, ConsultantPeriodServiceProxy, EmploymentType, ClientPeriodDto, EnumEntityTypeDto } from 'src/shared/service-proxies/service-proxies';
import { WorkflowContractsComponent } from '../workflow-contracts/workflow-contracts.component';
import { WorkflowDataService } from '../workflow-data.service';
import { WorkflowFinancesComponent } from '../workflow-finances/workflow-finances.component';
import { WorkflowSalesComponent } from '../workflow-sales/workflow-sales.component';
import { WorkflowProgressStatus, WorkflowSteps, WorkflowTopSections } from '../workflow.model';
import { IConsultantAnchor, StepAnchorDto, StepWithAnchorsDto, WorkflowProcessWithAnchorsDto } from './workflow-period.model';

@Component({
    selector: 'app-workflow-period',
    templateUrl: './workflow-period.component.html',
    styleUrls: ['./workflow-period.component.scss']
})
export class WorkflowPeriodComponent extends AppComponentBase implements OnInit, OnDestroy {
    @ViewChild('workflowSales', {static: false}) workflowSales: WorkflowSalesComponent;
    @ViewChild('workflowContracts', {static: false}) workflowContracts: WorkflowContractsComponent;
    @ViewChild('workflowFinances', {static: false}) workflowFinances: WorkflowFinancesComponent;
    @ViewChild('menuDeleteTrigger', {static: false}) menuDeleteTrigger: MatMenuTrigger;

    // @Input() workflowId: string;
    workflowId: string;
    // @Input() periodId: string | undefined;
    periodId: string | undefined;
    // @Input() topToolbarVisible: boolean;
    topToolbarVisible: boolean;

    sideMenuItems: WorkflowProcessWithAnchorsDto[] = [];
    workflowProcessTypes = WorkflowProcessType;
    workflowPeriodStepTypes: { [key: string]: string };
    selectedStep: StepWithAnchorsDto;
    selectedAnchor: string;

    workflowSteps = StepType;
    selectedStepEnum: StepType;
    selectedSideSection: WorkflowProcessWithAnchorsDto;
    sectionIndex = 0;
    consultant: ConsultantResultDto;
    managerStatus = ManagerStatus;

    workflowStatuses = WorkflowStepStatus;

    isStatusUpdate = false;
    clientPeriods: ClientPeriodDto[];
    workflowClientPeriodTypes: EnumEntityTypeDto[] = [];
    selectedTabName: string;
    private _routerEventsSubscription: Subscription;
    private _unsubscribe = new Subject();
    constructor(
        injector: Injector,
        public _workflowDataService: WorkflowDataService,
        private _workflowService: WorkflowServiceProxy,
        private overlay: Overlay,
        private dialog: MatDialog,
        private _internalLookupService: InternalLookupService,
        private _clientPeriodService: ClientPeriodServiceProxy,
        private _consultantPeriodService: ConsultantPeriodServiceProxy,
        private _scrollToService: ScrollToService,
        private _activatedRoute: ActivatedRoute,
        private _router: Router
    ) {
        super(injector);
        this._activatedRoute.data.pipe(takeUntil(this._unsubscribe)).subscribe((source) => {
			let data: WorkflowPeriodDto = source['data'];
			if (data?.workflowId) {
                this.workflowId = data?.workflowId;
            }
            if (data?.periodId) {
                this.periodId = data?.periodId;
            }
		});

        this._workflowDataService.consultantsAddedToStep
            .pipe(takeUntil(this._unsubscribe))
            .subscribe((value: {stepType: number, processTypeId: number, consultantNames: IConsultantAnchor[]}) => {
                this.updateConsultantAnchorsInStep(value.stepType, value.processTypeId, value.consultantNames)
            });
    }

    ngOnInit(): void {
        this.getClientPeriodTypes();
        this.getSideMenu();
        this.updateWorkflowProgressAfterTopTabChanged();
        this._routerEventsSubscription = this._router.events.subscribe((evt) => {
            const navigation  = this._router.getCurrentNavigation();
            console.log(navigation.extras.state);
            this.selectedTabName = navigation.extras.state.selectedTabName;
            this.updateWorkflowProgressAfterTopTabChanged();
            // if (evt instanceof NavigationStart) {
            // }
            if (evt instanceof NavigationEnd) {
                //Code to reload/filter list
                this.getSideMenu();
            }
        });
        this.getPeriodStepTypes();
        this._workflowDataService.workflowSideSectionAdded
            .pipe(takeUntil(this._unsubscribe))
            .subscribe((value: boolean) => {
                this.getSideMenu(value);
            });
        this._workflowDataService.workflowSideSectionUpdated
            .pipe(takeUntil(this._unsubscribe))
                .subscribe((value: {isStatusUpdate: boolean, autoUpdate?: boolean}) => {
                    this.isStatusUpdate = value.isStatusUpdate;
                    this.getSideMenu(value.autoUpdate);
                });
    }

    updateWorkflowProgressAfterTopTabChanged() {
        let newStatus = new WorkflowProgressStatus();
        newStatus.currentlyActiveStep = WorkflowSteps.Sales;
        // if (this.selectedTabIndex > 0) {
            // if not overview - active period
            newStatus.currentlyActivePeriodId = this.periodId;
                // this.clientPeriods![this.selectedTabIndex - 1]?.id; // first period, as index = 0 - Overview tab
        // }
        if (this._workflowDataService.getWorkflowProgress.currentlyActiveSection === WorkflowTopSections.Overview) {
            newStatus.currentlyActiveSection = WorkflowTopSections.Overview;
        } else {
            newStatus.currentlyActiveSection = this.detectTopLevelMenu(
                this.selectedTabName
            );
        }
        this._workflowDataService.updateWorkflowProgressStatus(newStatus);
    }

    getClientPeriodTypes() {
        this._internalLookupService
            .getWorkflowClientPeriodTypes()
            .pipe(finalize(() => {}))
            .subscribe((result) => {
                this.workflowClientPeriodTypes = result;
            });
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

    ngOnDestroy(): void {
        this._unsubscribe.next();
        this._unsubscribe.complete();
    }

    getPeriodStepTypes() {
        this._internalLookupService.getWorkflowPeriodStepTypes()
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.workflowPeriodStepTypes = result;
            });
    }

    getSideMenu(autoUpdate?: boolean) {
        this._workflowService.clientPeriods(this.workflowId, this.periodId, true)
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.clientPeriods = result?.clientPeriods;
                this.sideMenuItems = result?.clientPeriods![0]?.workflowProcesses!.map(side => {
                    return new WorkflowProcessWithAnchorsDto({
                        typeId: side.typeId!,
                        name: side.name!,
                        consultantPeriodId: side.consultantPeriodId!,
                        consultant: side.consultant!,
                        periodStartDate: side.periodStartDate!,
                        periodEndDate: side.periodEndDate!,
                        terminationEndDate: side.terminationEndDate!,
                        steps: side?.steps?.map(step => this.mapStepIntoNewDto(step, side.typeId!))
                    });
                });

                if (autoUpdate) {
                    let sideMenuItemsLength = this.sideMenuItems.length;
                    this.changeSideSection(this.sideMenuItems[sideMenuItemsLength - 1], sideMenuItemsLength - 1);
                }
            });
    }

    updateConsultantAnchorsInStep(stepType: number, processTypeId: number, consultantNames: IConsultantAnchor[]) {
        const stepIndex = this.sideMenuItems[this.sectionIndex].steps?.findIndex(x => x.typeId === stepType)!;
        let stepToUpdate = this.sideMenuItems[this.sectionIndex].steps![stepIndex];
        this.sideMenuItems[this.sectionIndex].steps![stepIndex] = this.mapStepIntoNewDto(stepToUpdate, processTypeId, consultantNames);
    }

    mapStepIntoNewDto(step: StepDto | StepWithAnchorsDto, processTypeId: number, consultantNames?: IConsultantAnchor[]) {
        return new StepWithAnchorsDto({
            typeId: step.typeId,
            name: step.name,
            status: step.status,
            responsiblePerson: step.responsiblePerson,
            actionsPermissionsForCurrentUser: step.actionsPermissionsForCurrentUser,
            menuAnchors: this.mapAnchorsForSteps(step!, processTypeId, consultantNames)
        });
    }

    mapAnchorsForSteps(step: StepDto | StepWithAnchorsDto, processTypeId: number, consultantNames?: IConsultantAnchor[]) {
        switch (step.typeId) {
            case StepType.Sales:
                let SalesAnchors: StepAnchorDto[] = [];
                switch (processTypeId) {
                    case WorkflowProcessType.StartClientPeriod:
                    case WorkflowProcessType.ChangeClientPeriod:
                    case WorkflowProcessType.ExtendClientPeriod:
                        SalesAnchors = [
                            {
                                name: 'Main Data',
                                anchor: 'salesMainDataAnchor',
                                // subItems: new Array<SubItemDto>(...SalesMainDataSections) //FIXME: commented out till next release
                            },
                            {
                                name: 'Client Data',
                                anchor: 'salesClientDataAnchor',
                                // subItems: new Array<SubItemDto>(...SalesClientDataSections) //FIXME: commented out till next release
                            }
                        ];
                        break;
                    case WorkflowProcessType.StartConsultantPeriod:
                    case WorkflowProcessType.ChangeConsultantPeriod:
                    case WorkflowProcessType.ExtendConsultantPeriod:
                        SalesAnchors = [
                            {
                                name: 'Main Data',
                                anchor: 'salesMainDataAnchor'
                            }
                        ];
                        break;
                    case WorkflowProcessType.TerminateWorkflow:
                    case WorkflowProcessType.TerminateConsultant:
                        break;
                }

                if (consultantNames?.length) {
                    consultantNames.forEach((item, index) => {
                        SalesAnchors.push({
							name: 'Consultant Data',
							anchor: `salesConsultantDataAnchor${index}`,
							consultantName: item.name,
							// subItems:
							// 	item.employmentType === EmploymentTypes.FeeOnly ||
							// 	item.employmentType === EmploymentTypes.Recruitment
							// 		? []
							// 		: new Array<SubItemDto>(...SalesConsultantDataSections), //FIXME: commented out till next release
						});
                    })
                }
                return new Array<StepAnchorDto>(...SalesAnchors);
            case StepType.Contract:
                let ContractAnchors: StepAnchorDto[] = [];
                switch (processTypeId) {
                    case WorkflowProcessType.StartClientPeriod:
                    case WorkflowProcessType.ChangeClientPeriod:
                    case WorkflowProcessType.ExtendClientPeriod:
                        ContractAnchors = [
                            {
                                name: 'Main Data',
                                anchor: 'mainDataAnchor',
                                // subItems: new Array<SubItemDto>(...ContractMainDataSections) //FIXME: commented out till next release
                            },
                            {
                                name: 'Client Data',
                                anchor: 'clientDataAnchor',
                                // subItems: new Array<SubItemDto>(...ContractClientDataSections) //FIXME: commented out till next release
                            },
                            {
                                name: 'Sync & Legal',
                                anchor: 'syncLegalContractAnchor',
                                // subItems: new Array<SubItemDto>(...ContractSyncSections) //FIXME: commented out till next release
                            }
                        ];
                        if (consultantNames?.length) {
                            let consultantAnchors: StepAnchorDto[] = consultantNames.map((item, index) => {
                                return {
									name: 'Consultant Data',
									anchor: `consultantDataAnchor${index}`,
									consultantName: item.name,
									// subItems:
									// 	item.employmentType === EmploymentTypes.FeeOnly ||
									// 	item.employmentType === EmploymentTypes.Recruitment
									// 		? []
									// 		: new Array<SubItemDto>(...ContractConsultantDataSections), //FIXME: commented out till next release
								};
                            });
                            ContractAnchors.splice(2, 0, ...consultantAnchors);
                        }
                        break;
                    case WorkflowProcessType.StartConsultantPeriod:
                    case WorkflowProcessType.ChangeConsultantPeriod:
                    case WorkflowProcessType.ExtendConsultantPeriod:
                        ContractAnchors = [
                            {
                                name: 'Main Data',
                                anchor: 'mainDataAnchor'
                            },
                            {
                                name: 'Sync & Legal',
                                anchor: 'syncLegalContractAnchor'
                            }
                        ];
                        if (consultantNames?.length) {
                            let consultantAnchors: StepAnchorDto[] = consultantNames.map((item, index) => {
                                return {
                                    name: 'Consultant Data',
                                    anchor: `consultantDataAnchor${index}`,
                                    consultantName: item.name
                                }
                            });
                            ContractAnchors.splice(1, 0, ...consultantAnchors);
                        }
                        break;
                    case WorkflowProcessType.TerminateWorkflow:
                    case WorkflowProcessType.TerminateConsultant:
                        break;
                }
                return new Array<StepAnchorDto>(...ContractAnchors);
            case StepType.Finance:
                let FinanceAnchors: StepAnchorDto[] = [
                    {
                        name: 'Finance Data',
                        anchor: 'financeDataAnchor',
                        // subItems: new Array<SubItemDto>(...FinanceSections) //FIXME: commented out till next release
                    }
                ];
                return FinanceAnchors;
            case StepType.Sourcing:
                return [];
        }
    }


    mapIconFromMenuItem(typeId: number) {
        switch (typeId) {
            case WorkflowProcessType.StartClientPeriod:
            case WorkflowProcessType.StartConsultantPeriod:
                return 'workflowAdd'
            case WorkflowProcessType.ChangeClientPeriod:
            case WorkflowProcessType.ChangeConsultantPeriod:
                return 'workflowEdit'
            case WorkflowProcessType.ExtendClientPeriod:
            case WorkflowProcessType.ExtendConsultantPeriod:
                return 'workflowStartOrExtend'
            case WorkflowProcessType.TerminateConsultant:
            case WorkflowProcessType.TerminateWorkflow:
                return 'workflowTerminate'
        }
    }

    changeStepSelection(step: StepWithAnchorsDto) {
        this.selectedAnchor = '';
        this.selectedStepEnum = step.typeId!;
        this.selectedStep = step;
        this._workflowDataService.updateWorkflowProgressStatus({currentlyActiveStep: step.typeId, stepSpecificPermissions: step.actionsPermissionsForCurrentUser, currentStepIsCompleted: step.status === WorkflowStepStatus.Completed});
    }

    changeSideSection(item: WorkflowProcessWithAnchorsDto, index: number) {
        this.selectedAnchor = '';
        this.sectionIndex = index;
        this.selectedSideSection = item;
        this.consultant = item.consultant!;
        this._workflowDataService.updateWorkflowProgressStatus({currentlyActiveSideSection: item.typeId!});
        if (!this.isStatusUpdate) {
            const firstitemInSection = this.sideMenuItems.find(x => x.name === item.name)?.steps![0];
            this.changeStepSelection(firstitemInSection!);
        } else {
            const stepToSelect = this.sideMenuItems.find(x => x.name === item.name)?.steps!.find(x => x.name === this.selectedStep.name);
            this.changeStepSelection(stepToSelect!);
        }
        this.isStatusUpdate = false;
        this._workflowDataService.workflowSideSectionChanged.emit({consultant: item.consultant, consultantPeriodId: item.consultantPeriodId});
    }

    deleteSideSection(item: WorkflowProcessWithAnchorsDto) {
        this.menuDeleteTrigger.closeMenu();
        const scrollStrategy = this.overlay.scrollStrategies.reposition();
        MediumDialogConfig.scrollStrategy = scrollStrategy;
        MediumDialogConfig.data = {
            confirmationMessageTitle: `Delete ${this.detectNameOfSideSection(item.typeId)}`,
            confirmationMessage: `Are you sure you want to delete ${item.name}? \n
                The data, which has been filled until now - will be removed.`,
            rejectButtonText: 'Cancel',
            confirmButtonText: 'Yes',
            isNegative: true
        }
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, MediumDialogConfig);

        dialogRef.componentInstance.onConfirmed.subscribe((result) => {
            switch (item.typeId) {
                case WorkflowProcessType.ChangeClientPeriod:
                case WorkflowProcessType.ExtendClientPeriod:
                    return this.deleteClientPeriod(this.periodId!);
                case WorkflowProcessType.StartConsultantPeriod:
                case WorkflowProcessType.ChangeConsultantPeriod:
                case WorkflowProcessType.ExtendConsultantPeriod:
                    return this.deleteConsultantPeriod(item.consultantPeriodId!);
                case WorkflowProcessType.TerminateConsultant:
                    return this.deleteConsultantTermination(item?.consultant?.id!);
                case WorkflowProcessType.TerminateWorkflow:
                    return this.deleteWorkflowTermination();
            }
        });
    }

    changeAnchorSelection(anchorName: string) {
        this.selectedAnchor = anchorName;
    }

    deleteWorkflowTermination() {
        this.showMainSpinner();
        this._workflowService.terminationDelete(this.workflowId)
        .pipe(finalize(() => this.hideMainSpinner()))
        .subscribe(() => {
            this._workflowDataService.workflowSideSectionUpdated.emit({isStatusUpdate: false, autoUpdate: true});
            this._workflowDataService.workflowOverviewUpdated.emit(true);
        });
    }

    deleteConsultantTermination(consultantId: number) {
        this.showMainSpinner();
        this._workflowService.terminationConsultantDelete(this.workflowId, consultantId)
        .pipe(finalize(() => this.hideMainSpinner()))
        .subscribe(() => {
            this._workflowDataService.workflowSideSectionUpdated.emit({isStatusUpdate: false, autoUpdate: true});
            this._workflowDataService.workflowOverviewUpdated.emit(true);
        })
    }

    deleteClientPeriod(clientPeriodId: string) {
        this.showMainSpinner();
        this._clientPeriodService.clientPeriod(clientPeriodId)
            .pipe(finalize(() => this.hideMainSpinner()))
            .subscribe(() => {
                this._workflowDataService.workflowTopSectionUpdated.emit(true);
                this._workflowDataService.workflowOverviewUpdated.emit(true);
            });
    }

    deleteConsultantPeriod(consultantPeriodId: string) {
        this.showMainSpinner();
        this._consultantPeriodService.consultantPeriod(consultantPeriodId)
            .pipe(finalize(() => this.hideMainSpinner()))
            .subscribe(() => {
                this._workflowDataService.workflowSideSectionUpdated.emit({isStatusUpdate: false, autoUpdate: true});
                this._workflowDataService.workflowOverviewUpdated.emit(true);
            });
    }

    detectNameOfSideSection(type: WorkflowProcessType | undefined) {
        switch (type) {
            case WorkflowProcessType.ChangeClientPeriod:
            case WorkflowProcessType.ExtendClientPeriod:
                return 'client period';
            case WorkflowProcessType.StartConsultantPeriod:
            case WorkflowProcessType.ChangeConsultantPeriod:
            case WorkflowProcessType.ExtendConsultantPeriod:
                return 'consultant period';
            case WorkflowProcessType.TerminateConsultant:
                return 'consultant termination';
            case WorkflowProcessType.TerminateWorkflow:
                return 'workflow termination';
        }
    }

    scrollToSection(section?: string) {
        const config: ScrollToConfigOptions = {
            target: section!,
            offset: -120
        };
        this._scrollToService.scrollTo(config);
    }
}

export class WorkflowPeriodDto {
    workflowId: string;
    periodId: string;
}

@Injectable()
export class WorkflowPeriodResolver implements Resolve<WorkflowPeriodDto> {
	constructor() {}
	resolve(route: ActivatedRouteSnapshot): WorkflowPeriodDto {
		let workflowId = route.parent.params['id'];
		let periodId = route.params['periodId'];
		return {
            workflowId: workflowId,
            periodId: periodId
        }
	}
}
