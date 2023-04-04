import { Overlay } from '@angular/cdk/overlay';
import { Component, Injector, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { ActivatedRoute, NavigationEnd, NavigationStart, Router } from '@angular/router';
import { ScrollToConfigOptions, ScrollToService } from '@nicky-lenaers/ngx-scroll-to';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { InternalLookupService } from 'src/app/shared/common/internal-lookup.service';
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { ManagerStatus } from 'src/app/shared/components/manager-search/manager-search.model';
import { AppComponentBase } from 'src/shared/app-component-base';
import { MediumDialogConfig } from 'src/shared/dialog.configs';
import {
	WorkflowProcessType,
	WorkflowServiceProxy,
	StepDto,
	StepType,
	WorkflowStepStatus,
	ConsultantResultDto,
	ClientPeriodServiceProxy,
	ConsultantPeriodServiceProxy,
	ClientPeriodDto,
} from 'src/shared/service-proxies/service-proxies';
import { WorkflowContractsComponent } from '../workflow-contracts/workflow-contracts.component';
import { WorkflowDataService } from '../workflow-data.service';
import { WorkflowFinancesComponent } from '../workflow-finances/workflow-finances.component';
import { WorkflowSalesComponent } from '../workflow-sales/workflow-sales.component';
import { WorkflowProgressStatus, WorkflowSteps, WorkflowTopSections } from '../workflow.model';
import { EmploymentTypes } from '../workflow.model';
import {
	ContractClientDataSections,
	ContractConsultantDataSections,
	ContractMainDataSections,
	ContractPlaceholderConsultantAnchors,
	ContractSyncSections,
	ContractTerminationSections,
	EProcessIcon,
	FinanceSections,
	IConsultantAnchor,
	SalesClientDataSections,
	SalesConsultantDataSections,
	SalesMainDataSections,
	SalesPlaceholderConsultantAnchors,
	SalesTerminationSections,
	StepAnchorDto,
	StepWithAnchorsDto,
	SubItemDto,
	WorkflowPeriodResolverDto,
	WorkflowProcessWithAnchorsDto,
} from './workflow-period.model';

@Component({
	selector: 'app-workflow-period',
	templateUrl: './workflow-period.component.html',
	styleUrls: ['./workflow-period.component.scss'],
})
export class WorkflowPeriodComponent extends AppComponentBase implements OnInit, OnDestroy {
	@ViewChild('workflowSales', { static: false }) workflowSales: WorkflowSalesComponent;
	@ViewChild('workflowContracts', { static: false }) workflowContracts: WorkflowContractsComponent;
	@ViewChild('workflowFinances', { static: false }) workflowFinances: WorkflowFinancesComponent;
	@ViewChild('menuDeleteTrigger', { static: false }) menuDeleteTrigger: MatMenuTrigger;

	workflowId: string;
	periodId: string | undefined;
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
	processIcon = EProcessIcon;
	workflowStatuses = WorkflowStepStatus;
	isStatusUpdate = false;
	clientPeriods: ClientPeriodDto[];
	typeId: number;
	topNavChanged = false;
	private _unsubscribe = new Subject();
	constructor(
		injector: Injector,
		public _workflowDataService: WorkflowDataService,
		private _workflowService: WorkflowServiceProxy,
		private _overlay: Overlay,
		private _dialog: MatDialog,
		private _internalLookupService: InternalLookupService,
		private _clientPeriodService: ClientPeriodServiceProxy,
		private _consultantPeriodService: ConsultantPeriodServiceProxy,
		private _scrollToService: ScrollToService,
		private _activatedRoute: ActivatedRoute,
		private _router: Router
	) {
		super(injector);
		this._initDataFromRoute();
		this._workflowDataService.consultantsAddedToStep
			.pipe(takeUntil(this._unsubscribe))
			.subscribe((value: { stepType: number; processTypeId: number; consultantNames: IConsultantAnchor[] }) => {
				this._updateConsultantAnchorsInStep(value.stepType, value.processTypeId, value.consultantNames);
			});
	}

	ngOnInit(): void {
		this._getSideMenu(false, true);
		this._updateWorkflowProgressAfterTopTabChanged();
		this._router.events
            .pipe(takeUntil(this._unsubscribe))
            .subscribe((evt) => {
                if (evt instanceof NavigationStart) {
                    this.showMainSpinner();
                    this.topNavChanged = true;
                }
                if (evt instanceof NavigationEnd) {
                    const navigation = this._router.getCurrentNavigation();
                    this.typeId = navigation.extras.state?.typeId;
                    this._updateWorkflowProgressAfterTopTabChanged();
                    this._getSideMenu(false, true);
                }
            });
		this._getPeriodStepTypes();
		this._workflowDataService.workflowSideSectionAdded.pipe(takeUntil(this._unsubscribe)).subscribe((value: boolean) => {
			this._getSideMenu(value);
		});
		this._workflowDataService.workflowSideSectionUpdated
			.pipe(takeUntil(this._unsubscribe))
			.subscribe((value: { isStatusUpdate: boolean; autoUpdate?: boolean }) => {
				this.isStatusUpdate = value.isStatusUpdate;
				this._getSideMenu(value.autoUpdate);
			});
	}

	ngOnDestroy(): void {
		this._unsubscribe.next();
		this._unsubscribe.complete();
		this.hideMainSpinner();
	}

	public changeStepSelection(step: StepWithAnchorsDto) {
		this._scrollToService.scrollTo({ target: 'topOfTheWorkflow' });
		this.selectedStepEnum = step.typeId!;
		this.selectedStep = step;
		if (this.topNavChanged) {
			this._workflowDataService.resetStepState.emit({
				isCompleted: this.selectedStep.status === WorkflowStepStatus.Completed,
				editEnabledForcefuly: false,
				fetchData: false,
			});
		}
		this.changeAnchorSelection(step.menuAnchors[0]);
		this._workflowDataService.updateWorkflowProgressStatus({
			currentlyActiveStep: step.typeId,
			stepSpecificPermissions: step.actionsPermissionsForCurrentUser,
			currentStepIsCompleted: step.status === WorkflowStepStatus.Completed,
		});
	}

	public changeSideSection(item: WorkflowProcessWithAnchorsDto, index: number) {
		this.selectedAnchor = '';
		this.sectionIndex = index;
		this.selectedSideSection = item;
		this.consultant = item.consultant!;
		this._workflowDataService.updateWorkflowProgressStatus({ currentlyActiveSideSection: item.typeId! });
		if (!this.isStatusUpdate) {
			const firstitemInSection = this.sideMenuItems.find((x) => x.name === item.name)?.steps![0];
			this.changeStepSelection(firstitemInSection!);
		} else {
			const stepToSelect = this.sideMenuItems
				.find((x) => x.name === item.name)
				?.steps!.find((x) => x.name === this.selectedStep.name);
			this.changeStepSelection(stepToSelect!);
		}
		this.isStatusUpdate = false;
		this._workflowDataService.workflowSideSectionChanged.emit({
			consultant: item.consultant,
			consultantPeriodId: item.consultantPeriodId,
		});
	}

	deleteSideSection(item: WorkflowProcessWithAnchorsDto) {
		this.menuDeleteTrigger.closeMenu();
		const scrollStrategy = this._overlay.scrollStrategies.reposition();
		MediumDialogConfig.scrollStrategy = scrollStrategy;
		MediumDialogConfig.data = {
			confirmationMessageTitle: `Delete ${this.detectNameOfSideSection(item.typeId)}`,
			confirmationMessage: `Are you sure you want to delete ${item.name}? \n
                The data, which has been filled until now - will be removed.`,
			rejectButtonText: 'Cancel',
			confirmButtonText: 'Yes',
			isNegative: true,
		};
		const dialogRef = this._dialog.open(ConfirmationDialogComponent, MediumDialogConfig);

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

	changeAnchorSelection(item: StepAnchorDto) {
		this.selectedAnchor = item?.anchor;
	}

	deleteWorkflowTermination() {
		this.showMainSpinner();
		this._workflowService
			.terminationDelete(this.workflowId)
			.pipe(finalize(() => this.hideMainSpinner()))
			.subscribe(() => {
				this._workflowDataService.workflowSideSectionUpdated.emit({ isStatusUpdate: false, autoUpdate: true });
				this._workflowDataService.workflowOverviewUpdated.emit(true);
			});
	}

	deleteConsultantTermination(consultantId: number) {
		this.showMainSpinner();
		this._workflowService
			.terminationConsultantDelete(this.workflowId, consultantId)
			.pipe(finalize(() => this.hideMainSpinner()))
			.subscribe(() => {
				this._workflowDataService.workflowSideSectionUpdated.emit({ isStatusUpdate: false, autoUpdate: true });
				this._workflowDataService.workflowOverviewUpdated.emit(true);
			});
	}

	deleteClientPeriod(clientPeriodId: string) {
		this.showMainSpinner();
		this._clientPeriodService
			.clientPeriod(clientPeriodId)
			.pipe(finalize(() => this.hideMainSpinner()))
			.subscribe(() => {
				this._workflowDataService.workflowTopSectionUpdated.emit(true);
				this._workflowDataService.workflowOverviewUpdated.emit(true);
			});
	}

	deleteConsultantPeriod(consultantPeriodId: string) {
		this.showMainSpinner();
		this._consultantPeriodService
			.consultantPeriod(consultantPeriodId)
			.pipe(finalize(() => this.hideMainSpinner()))
			.subscribe(() => {
				this._workflowDataService.workflowSideSectionUpdated.emit({ isStatusUpdate: false, autoUpdate: true });
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
			offset: -120,
		};
		this._scrollToService.scrollTo(config);
	}

    private _initDataFromRoute() {
        this._activatedRoute.data.pipe(takeUntil(this._unsubscribe)).subscribe((source) => {
			let data: WorkflowPeriodResolverDto = source['data'];
			if (data?.workflowId) {
				this.workflowId = data?.workflowId;
			}
			if (data?.periodId) {
				this.periodId = data?.periodId;
			}
		});
    }

    private _updateWorkflowProgressAfterTopTabChanged() {
		let newStatus = new WorkflowProgressStatus();
		newStatus.currentlyActiveStep = WorkflowSteps.Sales;
		newStatus.currentlyActivePeriodId = this.periodId;
		if (this._workflowDataService.getWorkflowProgress.currentlyActiveSection === WorkflowTopSections.Overview) {
			newStatus.currentlyActiveSection = WorkflowTopSections.Overview;
		} else {
			newStatus.currentlyActiveSection = WorkflowTopSections[WorkflowTopSections[this.typeId]];
		}
		this._workflowDataService.updateWorkflowProgressStatus(newStatus);
	}

	private _getPeriodStepTypes() {
		this._internalLookupService
			.getWorkflowPeriodStepTypes()
			.subscribe((result) => {
				this.workflowPeriodStepTypes = result;
			});
	}

	private _getSideMenu(autoUpdate?: boolean, initial?: boolean) {
		this._workflowService
			.clientPeriods(this.workflowId, this.periodId, true)
			.subscribe((result) => {
				this.clientPeriods = result?.clientPeriods;
				this.sideMenuItems = result?.clientPeriods![0]?.workflowProcesses!.map((side) => {
                    return new WorkflowProcessWithAnchorsDto({
                        typeId: side.typeId!,
						name: side.name!,
						consultantPeriodId: side.consultantPeriodId!,
						consultant: side.consultant!,
						periodStartDate: side.periodStartDate!,
						periodEndDate: side.periodEndDate!,
						terminationEndDate: side.terminationEndDate!,
						steps: side?.steps?.map((step) => this._mapStepIntoNewDto(step, side.typeId!)),
					});
				});
                if (initial) {
                    this.typeId = this.clientPeriods.find(item => item.id === this.periodId)?.typeId;
                    this._updateWorkflowProgressAfterTopTabChanged();
                }

				if (autoUpdate) {
					let sideMenuItemsLength = this.sideMenuItems.length;
					this.changeSideSection(this.sideMenuItems[sideMenuItemsLength - 1], sideMenuItemsLength - 1);
				}
			});
	}

	private _updateConsultantAnchorsInStep(stepType: number, processTypeId: number, consultantNames: IConsultantAnchor[]) {
		const stepIndex = this.sideMenuItems[this.sectionIndex].steps?.findIndex((x) => x.typeId === stepType)!;
		let stepToUpdate = this.sideMenuItems[this.sectionIndex].steps![stepIndex];
		this.sideMenuItems[this.sectionIndex].steps![stepIndex] = this._mapStepIntoNewDto(
			stepToUpdate,
			processTypeId,
			consultantNames
		);
	}

	private _mapStepIntoNewDto(step: StepDto | StepWithAnchorsDto, processTypeId: number, consultantNames?: IConsultantAnchor[]) {
		return new StepWithAnchorsDto({
			typeId: step.typeId,
			name: step.name,
			status: step.status,
			responsiblePerson: step.responsiblePerson,
			actionsPermissionsForCurrentUser: step.actionsPermissionsForCurrentUser,
			menuAnchors: this._mapAnchorsForSteps(step!, processTypeId, consultantNames),
		});
	}

	private _mapAnchorsForSteps(
		step: StepDto | StepWithAnchorsDto,
		processTypeId: number,
		consultantNames?: IConsultantAnchor[]
	) {
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
								subItems: new Array<SubItemDto>(...SalesMainDataSections),
							},
							{
								name: 'Client Data',
								anchor: 'salesClientDataAnchor',
								subItems: new Array<SubItemDto>(...SalesClientDataSections),
							},
						];
						break;
					case WorkflowProcessType.StartConsultantPeriod:
					case WorkflowProcessType.ChangeConsultantPeriod:
					case WorkflowProcessType.ExtendConsultantPeriod:
						SalesAnchors = [
							{
								name: 'Main Data',
								anchor: 'salesMainDataAnchor',
							},
						];
						break;
					case WorkflowProcessType.TerminateWorkflow:
					case WorkflowProcessType.TerminateConsultant:
						SalesAnchors = [
							{
								name: 'Termination Data',
								anchor: 'salesTerminationData',
								subItems: new Array<SubItemDto>(...SalesTerminationSections),
							},
						];
						break;
				}

				if (consultantNames?.length) {
					consultantNames.forEach((item, index) => {
						SalesAnchors.push({
							name: 'Consultant Data',
							anchor: `salesConsultantDataAnchor${index}`,
							consultantName: item.name,
							subItems:
								item.employmentType === EmploymentTypes.FeeOnly ||
								item.employmentType === EmploymentTypes.Recruitment
									? new Array<SubItemDto>(...SalesPlaceholderConsultantAnchors)
									: new Array<SubItemDto>(...SalesConsultantDataSections),
							anchorsOpened: false,
						});
					});
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
								subItems: new Array<SubItemDto>(...ContractMainDataSections),
								anchorsOpened: false,
							},
							{
								name: 'Client Data',
								anchor: 'clientDataAnchor',
								subItems: new Array<SubItemDto>(...ContractClientDataSections),
								anchorsOpened: false,
							},
							{
								name: 'Sync & Legal',
								anchor: 'syncLegalContractAnchor',
								subItems: new Array<SubItemDto>(...ContractSyncSections),
								anchorsOpened: false,
							},
						];
						if (consultantNames?.length) {
							let consultantAnchors: StepAnchorDto[] = consultantNames.map((item, index) => {
								return {
									name: 'Consultant Data',
									anchor: `consultantDataAnchor${index}`,
									consultantName: item.name,
									subItems:
										item.employmentType === EmploymentTypes.FeeOnly ||
										item.employmentType === EmploymentTypes.Recruitment
											? new Array<SubItemDto>(...ContractPlaceholderConsultantAnchors)
											: new Array<SubItemDto>(...ContractConsultantDataSections),
									anchorsOpened: false,
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
								anchor: 'mainDataAnchor',
							},
							{
								name: 'Sync & Legal',
								anchor: 'syncLegalContractAnchor',
							},
						];
						if (consultantNames?.length) {
							let consultantAnchors: StepAnchorDto[] = consultantNames.map((item, index) => {
								return {
									name: 'Consultant Data',
									anchor: `consultantDataAnchor${index}`,
									consultantName: item.name,
									anchorsOpened: false,
								};
							});
							ContractAnchors.splice(1, 0, ...consultantAnchors);
						}
						break;
					case WorkflowProcessType.TerminateWorkflow:
					case WorkflowProcessType.TerminateConsultant:
						ContractAnchors = [
							{
								name: 'Termination Data',
								anchor: 'contractTerminationData',
								subItems: new Array<SubItemDto>(...ContractTerminationSections),
							},
						];
						break;
				}
				return new Array<StepAnchorDto>(...ContractAnchors);
			case StepType.Finance:
				let FinanceAnchors: StepAnchorDto[] = [
					{
						name: 'Finance Data',
						anchor: 'financeDataAnchor',
						subItems: new Array<SubItemDto>(...FinanceSections),
						anchorsOpened: false,
					},
				];
				return FinanceAnchors;
			case StepType.Sourcing:
				return [];
		}
	}

}

