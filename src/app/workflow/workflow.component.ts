import { Overlay } from '@angular/cdk/overlay';
import { Component, Injector, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatPaginator } from '@angular/material/paginator';
import { SortDirection } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { merge, Subject, Subscription } from 'rxjs';
import { debounceTime, finalize, takeUntil } from 'rxjs/operators';
import { AppComponentBase } from 'src/shared/app-component-base';
import { AppConsts } from 'src/shared/AppConsts';
import { ERouteTitleType } from 'src/shared/AppEnums';
import { TitleService } from 'src/shared/common/services/title.service';
import { MediumDialogConfig } from 'src/shared/dialog.configs';
import {
	EnumEntityTypeDto,
	LegalEntityDto,
	StartNewWorkflowInputDto,
	SyncStateStatus,
	WorkflowListItemDto,
	WorkflowProcessType,
	WorkflowServiceProxy,
	WorkflowStatus,
	WorkflowStatusDto,
	WorkflowStepStatus,
} from 'src/shared/service-proxies/service-proxies';
import { SelectableCountry, SelectableIdNameDto } from '../client/client.model';
import { ConfirmationDialogComponent } from '../shared/components/confirmation-dialog/confirmation-dialog.component';
import { ManagerStatus } from '../shared/components/responsible-person/responsible-person.model';
import { CreateWorkflowDialogComponent } from './create-workflow-dialog/create-workflow-dialog.component';
import { WorkflowDataService } from './workflow-data.service';
import {
	getStatusIcon,
	getWorkflowStatus,
	ISelectableIdNameDto,
	IWorkflowGridPayload,
	MapSortingValues,
	MultiSortList,
	SelectableEmployeeDto,
	StepTypes,
	SyncStatusIcon,
	WorkflowSourcingCreate,
	WorkflowStatusMenuList,
} from './workflow.model';
import { IDivisionsAndTeamsFilterState } from '../shared/components/teams-and-divisions/teams-and-divisions.entities';
import { DivisionsAndTeamsFilterComponent } from '../shared/components/teams-and-divisions/teams-and-divisions-filter.component';

const WorkflowGridOptionsKey = 'WorkflowGridFILTERS.1.0.7';
@Component({
	selector: 'app-workflow',
	templateUrl: './workflow.component.html',
	styleUrls: ['./workflow.component.scss'],
})
export class WorkflowComponent extends AppComponentBase implements OnInit, OnDestroy {
	@ViewChild('trigger', { read: MatAutocompleteTrigger }) trigger: MatAutocompleteTrigger;
	@ViewChild('menuDeleteTrigger', { static: false }) menuDeleteTrigger: MatMenuTrigger;
	@ViewChild('menuWorkflowStatusesTrigger', { static: false }) menuWorkflowStatusesTrigger: MatMenuTrigger;
	@ViewChild('clientsPaginator') paginator: MatPaginator;
    @ViewChild('treeFilter') treeFilter: DivisionsAndTeamsFilterComponent;
	isLoading: boolean;

	workflowFilter = new UntypedFormControl(null);

	pageNumber = 1;
	deafultPageSize = AppConsts.grid.defaultPageSize;
	pageSizeOptions = [5, 10, 20, 50, 100];
	totalCount: number | undefined = 0;
	sorting = '';

	sortingValues: { [key: string]: SortDirection } = {
		WorkflowId: '',
		clientName: '',
		SalesTypeId: '',
		DeliveryTypeId: '',
		StartDate: '',
		ActualEndDate: '',
		ConsultantName: '',
		WorkflowStatus: '',
		startDateOfOpenedPeriodOrLastClientPeriod: '',
		syncStateStatus: '',
	};
	sortingValuesArray: MultiSortList[] = MapSortingValues(this.sortingValues);
	isDataLoading = true;
	advancedFiltersCounter = 0;
	workflowDisplayColumns = [
		'flag',
		'WorkflowId',
		'clientName',
		'SalesTypeId',
		'DeliveryTypeId',
		'StartDate',
		'ActualEndDate',
		'ConsultantName',
		'WorkflowStatus',
		'openProcess',
		'Steps',
		'startDateOfOpenedPeriodOrLastClientPeriod',
		'syncStateStatus',
		'action',
	];

	workflowDataSource: MatTableDataSource<WorkflowListItemDto>;
	workflowProcess = WorkflowProcessType;
	workflowStatus = WorkflowStatus;
	workflowStatusMenuList = WorkflowStatusMenuList;
	legalEntities: LegalEntityDto[] = [];
	saleTypes: EnumEntityTypeDto[] = [];
	deliveryTypes: EnumEntityTypeDto[] = [];
	workflowStatuses: WorkflowStatusDto[] = [];
	workflowStepStatuses = WorkflowStepStatus;
	isAdvancedFilters = false;
	showOnlyWorkflowsWithNewSales = false;
	showOnlyWorkflowsWithExtensions = false;
	showPONumberMissing = false;
	showPendingSteps = false;
	showUpcomingSteps = false;
	includeTerminated = false;
	includeDeleted = false;
	invoicingEntityControl = new UntypedFormControl();
	paymentEntityControl = new UntypedFormControl();
	salesTypeControl = new UntypedFormControl();
	deliveryTypesControl = new UntypedFormControl();
	workflowStatusControl = new UntypedFormControl();

	managerStatus = ManagerStatus;
	selectedAccountManagers: SelectableEmployeeDto[] = [];
	filteredAccountManagers: SelectableEmployeeDto[] = [];
	accountManagerFilter = new UntypedFormControl();

	// we create an object that contains coordinates
	menuTopLeftPosition = { x: 0, y: 0 };
	// reference to the MatMenuTrigger in the DOM
	@ViewChild('rightMenuTrigger', { static: true }) matMenuTrigger: MatMenuTrigger;

	workflowListSubscription = new Subscription();

	stepTypes = StepTypes;
	upcomingStepType: number | null = null;
	pendingStepType: number | null = null;

	syncStateStatuses: ISelectableIdNameDto[] = [];
	selectedSyncStateStatuses: ISelectableIdNameDto[] = [];
    teamsAndDivisionsFilterState: IDivisionsAndTeamsFilterState = {
        tenantIds: [],
        teamsIds: [],
        divisionIds: []
    };
    selectedTeamsAndDivisionsCount = 0;
	private _unsubscribe = new Subject();
	constructor(
		injector: Injector,
		private router: Router,
		private _workflowService: WorkflowServiceProxy,
		private overlay: Overlay,
		private dialog: MatDialog,
		private _activatedRoute: ActivatedRoute,
		private _workflowDataService: WorkflowDataService,
		private _titleService: TitleService,
	) {
		super(injector);

		this._activatedRoute.data.pipe(takeUntil(this._unsubscribe)).subscribe((source) => {
			let data: WorkflowSourcingCreate = source['data'];
			if (data?.existingWorkflowId) {
				this.navigateToWorkflowDetails(data?.existingWorkflowId);
			} else if (data?.requestId && data?.requestConsultantId) {
				this.createWorkflow(+data.requestId, +data.requestConsultantId);
			}
		});

		merge(
			this.workflowFilter.valueChanges,
			this.invoicingEntityControl.valueChanges,
			this.paymentEntityControl.valueChanges,
			this.salesTypeControl.valueChanges,
			this.deliveryTypesControl.valueChanges,
			this.workflowStatusControl.valueChanges
		)
			.pipe(takeUntil(this._unsubscribe), debounceTime(700))
			.subscribe(() => {
				this.updateAdvancedFiltersCounter();
				this.getWorkflowList(true);
			});
	}

	ngOnInit(): void {
		this._titleService.setTitle(ERouteTitleType.WfList);
		this._getEnums();
		this.getWorkflowList();
	}

	managersChanged(event: SelectableEmployeeDto[]) {
		this.selectedAccountManagers = event;
		this.getWorkflowList(true);
	}

	ngOnDestroy(): void {
		this._unsubscribe.next();
		this._unsubscribe.complete();
	}

	updateAdvancedFiltersCounter() {
		this.advancedFiltersCounter = new Array(
			this.invoicingEntityControl.value,
			this.paymentEntityControl.value,
			this.salesTypeControl.value,
			this.deliveryTypesControl.value,
			this.workflowStatusControl.value,
			this.showPONumberMissing
		).filter((item) => item !== null && item !== undefined && item).length;
	}

	saveGridOptions() {
		let filters = {
			pageNumber: this.pageNumber,
			deafultPageSize: this.deafultPageSize,
			sorting: this.sorting,
			owners: this.selectedAccountManagers,
			invoicingEntity: this.invoicingEntityControl.value ? this.invoicingEntityControl.value : undefined,
			paymentEntity: this.paymentEntityControl.value ? this.paymentEntityControl.value : undefined,
			salesType: this.salesTypeControl.value ? this.salesTypeControl.value : undefined,
			deliveryTypes: this.deliveryTypesControl.value ? this.deliveryTypesControl.value : undefined,
			workflowStatus: this.workflowStatusControl.value ? this.workflowStatusControl.value : undefined,
			syncStateStatus: this.selectedSyncStateStatuses,
			showOnlyWorkflowsWithNewSales: this.showOnlyWorkflowsWithNewSales,
			showOnlyWorkflowsWithExtensions: this.showOnlyWorkflowsWithExtensions,
			showPONumberMissing: this.showPONumberMissing,
			showPendingSteps: this.showPendingSteps,
			pendingStepType: this.pendingStepType,
			showUpcomingSteps: this.showUpcomingSteps,
			upcomingStepType: this.upcomingStepType,
			includeTerminated: this.includeTerminated,
			includeDeleted: this.includeDeleted,
			searchFilter: this.workflowFilter.value ? this.workflowFilter.value : '',
            ownerTenantsIds: this.teamsAndDivisionsFilterState.tenantIds,
            ownerDivisionsIds: this.teamsAndDivisionsFilterState.divisionIds,
            ownerTeamsIds: this.teamsAndDivisionsFilterState.teamsIds,
		};

		localStorage.setItem(WorkflowGridOptionsKey, JSON.stringify(filters));
	}

	getGridOptions() {
		let filters = JSON.parse(localStorage.getItem(WorkflowGridOptionsKey)!);
		if (filters) {
			this.pageNumber = filters.pageNumber;
			this.deafultPageSize = filters.deafultPageSize;
			this.sorting = filters.sorting;
			this.selectedAccountManagers = filters.owners?.length ? filters.owners : [];
			this.workflowStatusControl.setValue(filters.workflowStatus, { emitEvent: false });
			this.deliveryTypesControl.setValue(filters.deliveryTypes, { emitEvent: false });
			this.salesTypeControl.setValue(filters.salesType, { emitEvent: false });
			this.paymentEntityControl.setValue(filters.paymentEntity, { emitEvent: false });
			this.invoicingEntityControl.setValue(filters.invoicingEntity, { emitEvent: false });
			this.showOnlyWorkflowsWithNewSales = filters.showOnlyWorkflowsWithNewSales;
			this.showOnlyWorkflowsWithExtensions = filters.showOnlyWorkflowsWithExtensions;
			this.showPONumberMissing = filters.showPONumberMissing;
			this.showPendingSteps = filters.showPendingSteps;
			this.pendingStepType = filters.pendingStepType;
			this.showUpcomingSteps = filters.showUpcomingSteps;
			this.upcomingStepType = filters.upcomingStepType;
			this.selectedSyncStateStatuses = filters.syncStateStatus?.length ? filters.syncStateStatus : [];
			if (this.selectedSyncStateStatuses.length) {
				this.syncStateStatuses.forEach((x) => {
					x.selected = this.selectedSyncStateStatuses.some((item) => item.id === x.id);
				});
			}
			this.includeTerminated = filters.includeTerminated;
			this.includeDeleted = filters.includeDeleted;
			this.workflowFilter.setValue(filters.searchFilter, { emitEvent: false });
            this.teamsAndDivisionsFilterState = {
                tenantIds: filters.ownerTenantsIds ?? [],
                divisionIds: filters.ownerDivisionsIds ?? [],
                teamsIds: filters.ownerTeamsIds ?? [],
            };
            this._teamsAndDivisionCounter(this.teamsAndDivisionsFilterState);
		}
		this.updateAdvancedFiltersCounter();
		this.getWorkflowList();
	}

	/**
	 * Method called when the user click with the right button
	 * @param event MouseEvent, it contains the coordinates
	 * @param item Our data contained in the row of the table
	 */
	onRightClick(event: MouseEvent, item: any) {
		event.preventDefault();
		this.menuTopLeftPosition.x = event.clientX;
		this.menuTopLeftPosition.y = event.clientY;
		this.matMenuTrigger.menuData = { item: item };
		this.matMenuTrigger.openMenu();
	}

	openInNewTab(workflowId: string) {
		const url = this.router.serializeUrl(this.router.createUrlTree([`/app/workflow/${workflowId}`]));
		window.open(url, '_blank');
	}

	navigateToWorkflowDetails(workflowId: string): void {
		this.router.navigate(['/app/workflow', workflowId]);
	}

	createWorkflow(requestId?: number, requestConsultantId?: number) {
		const scrollStrategy = this.overlay.scrollStrategies.reposition();
		MediumDialogConfig.scrollStrategy = scrollStrategy;
		MediumDialogConfig.data = {
			requestId: requestId,
			requestConsultantId: requestConsultantId,
		};
		const dialogRef = this.dialog.open(CreateWorkflowDialogComponent, MediumDialogConfig);

		dialogRef.componentInstance.onConfirmed.subscribe((result) => {
			if (result) {
				let input = new StartNewWorkflowInputDto();
				input.startDate = result.startDate;
				input.endDate = result.endDate;
				input.requestId = result.requestId;
				input.soldRequestConsultantId = result.requestConsultantId;
				this.showMainSpinner();
				this._workflowService
					.start(input)
					.pipe(
						finalize(() => {
							this.hideMainSpinner();
						})
					)
					.subscribe((result) => {
						this.router.navigate(['/app/workflow', result.workflowId]);
					});
			}
		});
	}

	confirmDeleteWorkflow(workflowId: string) {
		this.menuDeleteTrigger.closeMenu();
		const scrollStrategy = this.overlay.scrollStrategies.reposition();
		MediumDialogConfig.scrollStrategy = scrollStrategy;
		MediumDialogConfig.data = {
			confirmationMessageTitle: `Delete workflow`,
			confirmationMessage:
            `Are you sure you want to delete this Workflow?

            It will be hidden from lists and statistics.
            If it contains periods which were synced to Legacy PM
            - <span class="text-bold-800">it should be terminated first.</span> If not terminated
            - the Contract Lines will still appear in Legacy PM,
            on the Consultant website and inside the Client Module.`,
			rejectButtonText: 'Cancel',
			confirmButtonText: 'Delete',
			isNegative: true,
		};
		const dialogRef = this.dialog.open(ConfirmationDialogComponent, MediumDialogConfig);

		dialogRef.componentInstance.onConfirmed.subscribe(() => {
			this.deleteWorkflow(workflowId);
		});
	}

	deleteWorkflow(workflowId: string) {
		this.isDataLoading = true;
		this._workflowService
			.delete3(workflowId)
			.pipe(finalize(() => (this.isDataLoading = false)))
			.subscribe(() => this.getWorkflowList());
	}

	confirmRestoreWorkflow(workflowId: string) {
		this.menuDeleteTrigger.closeMenu();
		const scrollStrategy = this.overlay.scrollStrategies.reposition();
		MediumDialogConfig.scrollStrategy = scrollStrategy;
		MediumDialogConfig.data = {
			confirmationMessageTitle: `Restore workflow`,
			confirmationMessage: `Are you sure you want to restore this workflow?`,
			rejectButtonText: 'Cancel',
			confirmButtonText: 'Yes',
			isNegative: false,
		};
		const dialogRef = this.dialog.open(ConfirmationDialogComponent, MediumDialogConfig);

		dialogRef.componentInstance.onConfirmed.subscribe(() => {
			this.restoreWorkflow(workflowId);
		});
	}

	setWorkflowStatus(workflowId: string, workflowStatus: WorkflowStatus) {
		this.menuWorkflowStatusesTrigger.closeMenu();
		this.showMainSpinner();
		this._workflowService
			.setWorkflowStatus(workflowId, workflowStatus)
			.pipe(finalize(() => this.hideMainSpinner()))
			.subscribe(() => this.getWorkflowList());
	}

	restoreWorkflow(workflowId: string) {
		this.isDataLoading = true;
		this._workflowService
			.restore(workflowId)
			.pipe(finalize(() => (this.isDataLoading = false)))
			.subscribe(() => this.getWorkflowList());
	}

	getWorkflowList(filterChanged?: boolean) {
		if (this.workflowListSubscription) {
			this.workflowListSubscription.unsubscribe();
		}
		this.isDataLoading = true;
		if (filterChanged) {
			this.pageNumber = 1;
		}
        const payload = this._packGridPayload();
		this.workflowListSubscription = this._workflowService
			.workflow(
				payload.invoicingEntity,
                payload.paymentEntity,
                payload.salesType,
                payload.deliveryType,
                payload.workflowStatus,
                payload.responsibleEmployees,
                payload.employeesTeamsAndDivisionsNodes,
                payload.employeesTenants,
                payload.syncStateStatuses,
                payload.showNewSales,
                payload.showExtensions,
                payload.showPendingSteps,
                payload.showPendingStepType,
                payload.showUpcomingSteps,
                payload.showUpcomingStepType,
                payload.showCompleted,
                payload.showDeleted,
                payload.showWorkflowsWithProjectLinesMarkedAsPoMissing,
                payload.search,
                payload.pageNumber,
                payload.pageSize,
                payload.sort
			)
			.pipe(
				finalize(() => {
					this.isDataLoading = false;
				})
			)
			.subscribe((result) => {
				let formattedData = result?.items!.map((x) => {
					return {
						workflowId: x.workflowId,
						workflowSequenceIdCode: x.workflowSequenceIdCode,
						clientName: x.clientName,
						startDate: x.startDate,
						startDateOfOpenedPeriodOrLastClientPeriod: x.startDateOfOpenedPeriodOrLastClientPeriod,
						endDate: x.actualEndDate,
						salesType: this.findItemById(this.saleTypes, x.salesTypeId),
						deliveryType: this.findItemById(this.deliveryTypes, x.deliveryTypeId),
						statusName: x.isDeleted ? 'Deleted workflow' : getWorkflowStatus(x.workflowStatus!),
						statusIcon: x.isDeleted ? 'deleted-status' : getStatusIcon(x.workflowStatus!),
						status: x.workflowStatus,
						isDeleted: x.isDeleted,
						consultants: x.consultants,
						consultantName: x.consultantName,
						consultantNamesTooltip: x.consultantNamesTooltip,
						openProcesses: x.openProcesses,
						isActive: x.workflowStatus === WorkflowStatus.Active,
						isNewSale: x.isNewSale,
						syncStateStatusName: SyncStateStatus[x.syncStateStatus!].replace(/[A-Z]/g, ' $&').trim(),
						syncStateStatusIcon: SyncStatusIcon[x.syncStateStatus!],
					};
				});
				this.workflowDataSource = new MatTableDataSource<any>(formattedData);
				this.totalCount = result.totalCount;
				this.saveGridOptions();
			});
	}

	pageChanged(event?: any): void {
		this.pageNumber = event.pageIndex + 1;
		this.deafultPageSize = event.pageSize;
		this.getWorkflowList();
	}

	sortChanged(event?: any): void {
		this.sortingValues[event?.active!] = event?.direction!;
		let dedicatedColumn = this.sortingValuesArray.find((x) => x.column === event?.active);
		if (dedicatedColumn) {
			dedicatedColumn.direction = event?.direction!;
			let order = this.sortingValuesArray.filter((x) => x.direction !== '').length;
			if (event.direction !== '') {
				this.sortingValuesArray.forEach((x) => {
					if (x.direction !== '' && x.order !== null) {
						if (dedicatedColumn?.order !== null && x.order > 1) {
							x.order -= 1;
						}
					}
				});
			}
			dedicatedColumn.order = event.direction !== '' ? order : null;
		}
		this.sortingValuesArray = this._workflowDataService.sortMultiColumnSorting(this.sortingValuesArray);
		let sorting = this.sortingValuesArray
			.map((item) => {
				if (item.order !== null) {
					return item['column'].concat(' ', item['direction']);
				}
			})
			.filter(Boolean)
			.join(', ');
		this.sorting = sorting;
		this.getWorkflowList();
	}

	resetSorting() {
		this.sortingValues = {
			WorkflowId: '',
			clientName: '',
			SalesTypeId: '',
			DeliveryTypeId: '',
			StartDate: '',
			ActualEndDate: '',
			ConsultantName: '',
			WorkflowStatus: '',
			startDateOfOpenedPeriodOrLastClientPeriod: '',
			syncStateStatus: '',
		};
		this.sortingValuesArray = Object.keys(this.sortingValues).map((k) => {
			return { column: k, order: null, direction: '' };
		});
		this.sorting = '';
		this.getWorkflowList();
	}

	optionClicked(
		event: Event,
		item: SelectableIdNameDto | SelectableCountry | SelectableEmployeeDto,
		list: SelectableIdNameDto[] | SelectableCountry[] | SelectableEmployeeDto[]
	) {
		event.stopPropagation();
		this.toggleSelection(item, list);
	}

	toggleSelection(item: any, list: any) {
		item.selected = !item.selected;
		if (item.selected) {
			if (!list.includes(item)) {
				list.push(item);
			}
		} else {
			const i = list.findIndex((value: any) => value.name === item.name);
			list.splice(i, 1);
		}
		this.pageNumber = 1;
		this.getWorkflowList(true);
	}

	selectUpcomingStep(stepType: number | null = null) {
		this.upcomingStepType = stepType;
		this.showUpcomingSteps = stepType !== null;
		this.pageNumber = 1;
		this.getWorkflowList();
	}

	selectPendingStep(stepType: number | null = null) {
		this.pendingStepType = stepType;
		this.showPendingSteps = stepType !== null;
		this.pageNumber = 1;
		this.getWorkflowList();
	}

	filtersTrackBy(index: number, item: { id: number; name: string }) {
		return item.id;
	}

	clearAllFilters() {
		this.workflowFilter.setValue(null, { emitEvent: false });
		this.invoicingEntityControl.setValue(null, { emitEvent: false });
		this.paymentEntityControl.setValue(null, { emitEvent: false });
		this.salesTypeControl.setValue(null, { emitEvent: false });
		this.deliveryTypesControl.setValue(null, { emitEvent: false });
		this.workflowStatusControl.setValue(null, { emitEvent: false });
		this.showOnlyWorkflowsWithNewSales = false;
		this.showOnlyWorkflowsWithExtensions = false;
		this.showPONumberMissing = false;
		this.pendingStepType = null;
		this.showPendingSteps = false;
		this.upcomingStepType = null;
		this.showUpcomingSteps = false;
		this.includeTerminated = false;
		this.includeDeleted = false;
		this.selectedSyncStateStatuses = [];
		this.syncStateStatuses.forEach((x) => (x.selected = false));
        this.teamsAndDivisionsFilterState = {
            tenantIds: [],
            divisionIds: [],
            teamsIds: [],
        };
        this._teamsAndDivisionCounter(this.teamsAndDivisionsFilterState);
        this.selectedAccountManagers = [];
        this.treeFilter.reset();
        this.updateAdvancedFiltersCounter();
		localStorage.removeItem(WorkflowGridOptionsKey);
		this.getWorkflowList(true);
	}

	syncStatusFilterControl(item: ISelectableIdNameDto) {
		const index = this.selectedSyncStateStatuses.findIndex((x) => x.id === item.id);
		if (index >= 0) {
			this.selectedSyncStateStatuses.splice(index, 1);
		} else {
			this.selectedSyncStateStatuses.push(item);
		}
		item.selected = !item.selected;
		this.getWorkflowList();
	}

	syncStatusClicked(event: Event, item: ISelectableIdNameDto) {
		event.stopPropagation();
		this.syncStatusFilterControl(item);
	}


    teamsAndDivisionsChanged(teamsAndDivisionFilter: IDivisionsAndTeamsFilterState) {
        this.teamsAndDivisionsFilterState = teamsAndDivisionFilter
        this._teamsAndDivisionCounter(teamsAndDivisionFilter);
        this.getWorkflowList(true);
    }

	private _getEnums() {
		this.legalEntities = this.getStaticEnumValue('legalEntities');
		this.saleTypes = this.getStaticEnumValue('saleTypes');
		this.deliveryTypes = this.getStaticEnumValue('deliveryTypes');
		this.workflowStatuses = this.getStaticEnumValue('workflowStatuses');
		this.syncStateStatuses = this.toArray(this.getStaticEnumValue('syncStateStatuses'));
	}

    private _packGridPayload(): IWorkflowGridPayload {
        let searchFilter = this.workflowFilter.value ? this.workflowFilter.value : '';
		let invoicingEntity = this.invoicingEntityControl.value ? this.invoicingEntityControl.value : undefined;
		let paymentEntity = this.paymentEntityControl.value ? this.paymentEntityControl.value : undefined;
		let salesType = this.salesTypeControl.value ? this.salesTypeControl.value : undefined;
		let deliveryTypes = this.deliveryTypesControl.value ? this.deliveryTypesControl.value : undefined;
		let workflowStatus = this.workflowStatusControl.value ? this.workflowStatusControl.value : undefined;
		let ownerIds = this.selectedAccountManagers.map((x) => +x.id);
		let selectedPendingStepType = this.pendingStepType === 0 ? undefined : this.pendingStepType;
		let selectedUpcomingStepType = this.upcomingStepType === 0 ? undefined : this.upcomingStepType;
        return {
            invoicingEntity: invoicingEntity,
            paymentEntity: paymentEntity,
            salesType: salesType,
            deliveryType: deliveryTypes,
            workflowStatus: workflowStatus,
            responsibleEmployees: ownerIds,
            employeesTeamsAndDivisionsNodes: this.teamsAndDivisionsFilterState.divisionIds?.concat(this.teamsAndDivisionsFilterState.teamsIds),
            employeesTenants: this.teamsAndDivisionsFilterState.tenantIds,
            syncStateStatuses: this.selectedSyncStateStatuses?.map((x) => x.id),
            showNewSales: this.showOnlyWorkflowsWithNewSales,
            showExtensions: this.showOnlyWorkflowsWithExtensions,
            showPendingSteps: this.showPendingSteps,
            showPendingStepType: selectedPendingStepType !== null ? selectedPendingStepType : undefined,
            showUpcomingSteps: this.showUpcomingSteps,
            showUpcomingStepType: selectedUpcomingStepType !== null ? selectedUpcomingStepType : undefined,
            showCompleted: this.includeTerminated,
            showDeleted: this.includeDeleted,
            showWorkflowsWithProjectLinesMarkedAsPoMissing: this.showPONumberMissing,
            search: searchFilter,
            pageNumber: this.pageNumber,
            pageSize: this.deafultPageSize,
            sort: this.sorting,
        } as IWorkflowGridPayload;
    }

    private _teamsAndDivisionCounter(teamsAndDivisionFilter: IDivisionsAndTeamsFilterState) {
        const {teamsIds, tenantIds, divisionIds} = teamsAndDivisionFilter;
        this.selectedTeamsAndDivisionsCount = teamsIds.length + tenantIds.length + divisionIds.length;
    }
}
