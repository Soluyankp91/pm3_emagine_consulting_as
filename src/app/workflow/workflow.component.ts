import { Overlay } from '@angular/cdk/overlay';
import { Component, Injectable, Injector, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { merge, Observable, Subject, Subscription } from 'rxjs';
import { debounceTime, finalize, map, switchMap, takeUntil } from 'rxjs/operators';
import { AppComponentBase } from 'src/shared/app-component-base';
import { AppConsts } from 'src/shared/AppConsts';
import { ApiServiceProxy, EmployeeDto, EmployeeServiceProxy, EnumEntityTypeDto, LegalEntityDto, LookupServiceProxy, StartNewWorkflowInputDto, StepType, WorkflowAlreadyExistsDto, WorkflowListItemDto, WorkflowProcessType, WorkflowServiceProxy, WorkflowStatus, WorkflowStepStatus } from 'src/shared/service-proxies/service-proxies';
import { SelectableCountry, SelectableIdNameDto } from '../client/client.model';
import { InternalLookupService } from '../shared/common/internal-lookup.service';
import { ConfirmationDialogComponent } from '../shared/components/confirmation-dialog/confirmation-dialog.component';
import { ManagerStatus } from '../shared/components/manager-search/manager-search.model';
import { CreateWorkflowDialogComponent } from './create-workflow-dialog/create-workflow-dialog.component';
import { WorkflowDataService } from './workflow-data.service';
import { SelectableEmployeeDto, StepTypes } from './workflow.model';

const WorkflowGridOptionsKey = 'WorkflowGridFILTERS.1.0.3.';
@Component({
    selector: 'app-workflow',
    templateUrl: './workflow.component.html',
    styleUrls: ['./workflow.component.scss']
})

export class WorkflowComponent extends AppComponentBase implements OnInit, OnDestroy {
    @ViewChild('trigger', { read: MatAutocompleteTrigger }) trigger: MatAutocompleteTrigger;
    @ViewChild('menuDeleteTrigger', {static: false}) menuDeleteTrigger: MatMenuTrigger;
    @ViewChild('clientsPaginator') paginator: MatPaginator;
    isLoading: boolean;

    workflowFilter = new FormControl(null);

    pageNumber = 1;
    deafultPageSize = AppConsts.grid.defaultPageSize;
    pageSizeOptions = [5, 10, 20, 50, 100];
    totalCount: number | undefined = 0;
    sorting = 'EndDate desc';
    isDataLoading = true;

    workflowDisplayColumns = [
        'flag',
        'WorkflowId',
        'clientName',
        'SalesTypeId',
        'DeliveryTypeId',
        'StartDate',
        'EndDate',
        'ConsultantName',
        'WorkflowStatus',
        'openProcess',
        'Steps',
        'startDateOfOpenedPeriodOrLastClientPeriod',
        'action'
    ];

    workflowDataSource: MatTableDataSource<WorkflowListItemDto>;
    workflowProcess = WorkflowProcessType;

    legalEntities: LegalEntityDto[] = [];
    saleTypes: EnumEntityTypeDto[] = [];
    deliveryTypes: EnumEntityTypeDto[] = [];
    workflowStatuses: { [key: string]: string; };
    workflowStepStatuses = WorkflowStepStatus;
    isAdvancedFilters = false;
    showOnlyWorkflowsWithNewSales = false;
    showOnlyWorkflowsWithExtensions = false;
    showPendingSteps = false;
    showUpcomingSteps = false;
    includeTerminated = false;
    includeDeleted = false;
    invoicingEntityControl = new FormControl();
    paymentEntityControl = new FormControl();
    salesTypeControl = new FormControl();
    deliveryTypesControl = new FormControl();
    workflowStatusControl = new FormControl();

    managerStatus = ManagerStatus;
    selectedAccountManagers: SelectableEmployeeDto[] = [];
    filteredAccountManagers: SelectableEmployeeDto[] = [];
    accountManagerFilter = new FormControl();

    // we create an object that contains coordinates
    menuTopLeftPosition =  {x: 0, y: 0}
    // reference to the MatMenuTrigger in the DOM
    @ViewChild('rightMenuTrigger', {static: true}) matMenuTrigger: MatMenuTrigger;

    workflowListSubscription = new Subscription();

    stepTypes = StepTypes;
    upcomingStepType: number | null = null;
    pendingStepType: number | null = null;

    private _unsubscribe = new Subject();
    constructor(
        injector: Injector,
        private router: Router,
        private _apiService: ApiServiceProxy,
        private _workflowService: WorkflowServiceProxy,
        private overlay: Overlay,
        private dialog: MatDialog,
        private _internalLookupService: InternalLookupService,
        private _lookupService: LookupServiceProxy,
        private _auth: MsalService,
        private _employeeService: EmployeeServiceProxy,
        private _activatedRoute: ActivatedRoute
    ) {
        super(injector);

        this._activatedRoute.data
            .pipe(takeUntil(this._unsubscribe))
            .subscribe(source => {
                let data = source['data'];
                if (data?.existingWorkflowId) {
                    this.navigateToWorkflowDetails(data?.existingWorkflowId);
                } else if (data?.requestId && data?.requestConsultantId) {
                    this.createWorkflow(+data.requestId, +data.requestConsultantId);
                }
        });

        merge(this.workflowFilter.valueChanges,
            this.invoicingEntityControl.valueChanges,
            this.paymentEntityControl.valueChanges,
            this.salesTypeControl.valueChanges,
            this.deliveryTypesControl.valueChanges,
            this.workflowStatusControl.valueChanges).pipe(
            takeUntil(this._unsubscribe),
            debounceTime(700)
        ).subscribe(() => {
            this.getWorkflowList(true);
        });

        this.accountManagerFilter.valueChanges.pipe(
            takeUntil(this._unsubscribe),
            debounceTime(500),
            switchMap((value: any) => {
                let toSend = {
                    name: value,
                    maxRecordsCount: 1000,
                    showAll: true,
                    excludeIds: this.selectedAccountManagers.map(x => +x.id)
                };
                if (value?.id) {
                    toSend.name = value.id
                        ? value.name
                        : value;
                }
                this.isLoading = true;
                return this._lookupService.employees(toSend.name, toSend.showAll, toSend.excludeIds);
            }),
        ).subscribe((list: EmployeeDto[]) => {
            if (list.length) {
                this.filteredAccountManagers = list.map(x => {
                    return new SelectableEmployeeDto({
                        id: x.id!,
                        name: x.name!,
                        externalId: x.externalId!,
                        selected: false
                    })
                });
            } else {
                this.filteredAccountManagers = [{ name: 'No managers found', externalId: '', id: 'no-data', selected: false }];
            }
            this.isLoading = false;
        });
    }

    ngOnInit(): void {
        this.getCurrentUser();
        this.getLegalEntities();
        this.getSalesType();
        this.getDeliveryTypes();
        this.getWorkflowStatuses();
    }

    ngOnDestroy(): void {
        this._unsubscribe.next();
        this._unsubscribe.complete();
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
            showOnlyWorkflowsWithNewSales: this.showOnlyWorkflowsWithNewSales,
            showOnlyWorkflowsWithExtensions: this.showOnlyWorkflowsWithExtensions,
            showPendingSteps: this.showPendingSteps,
            pendingStepType: this.pendingStepType,
            showUpcomingSteps: this.showUpcomingSteps,
            upcomingStepType: this.upcomingStepType,
            includeTerminated: this.includeTerminated,
            includeDeleted: this.includeDeleted,
            searchFilter: this.workflowFilter.value ? this.workflowFilter.value : ''
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
            this.workflowStatusControl.setValue(filters.workflowStatus, {emitEvent: false});
            this.deliveryTypesControl.setValue(filters.deliveryTypes, {emitEvent: false});
            this.salesTypeControl.setValue(filters.salesType, {emitEvent: false});
            this.paymentEntityControl.setValue(filters.paymentEntity, {emitEvent: false});
            this.invoicingEntityControl.setValue(filters.invoicingEntity, {emitEvent: false});
            this.showOnlyWorkflowsWithNewSales = filters.showOnlyWorkflowsWithNewSales;
            this.showOnlyWorkflowsWithExtensions = filters.showOnlyWorkflowsWithExtensions;
            this.showPendingSteps = filters.showPendingSteps;
            this.pendingStepType = filters.pendingStepType;
            this.showUpcomingSteps = filters.showUpcomingSteps;
            this.upcomingStepType = filters.upcomingStepType;
            this.includeTerminated = filters.includeTerminated;
            this.includeDeleted = filters.includeDeleted;
            this.workflowFilter.setValue(filters.searchFilter, {emitEvent: false});
        }
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
        this.matMenuTrigger.menuData = { item: item }
        this.matMenuTrigger.openMenu();

    }
    openInNewTab(workflowId: string) {
        const url = this.router.serializeUrl(
            this.router.createUrlTree([`/app/workflow/${workflowId}`])
        );
        window.open(url, '_blank');
    }

    navigateToWorkflowDetails(workflowId: string): void {
        this.router.navigate(['/app/workflow', workflowId]);
    }

    createWorkflow(requestId?: number, requestConsultantId?: number) {
        const scrollStrategy = this.overlay.scrollStrategies.reposition();
        const dialogRef = this.dialog.open(CreateWorkflowDialogComponent, {
            minWidth: '450px',
            minHeight: '180px',
            height: 'auto',
            width: 'auto',
            scrollStrategy,
            backdropClass: 'backdrop-modal--wrapper',
            autoFocus: false,
            data: {
                requestId: requestId,
                requestConsultantId: requestConsultantId
            }
        });

        dialogRef.componentInstance.onConfirmed.subscribe((result) => {
            if (result) {
                let input = new StartNewWorkflowInputDto();
                input.startDate = result.startDate;
                input.endDate = result.endDate;
                input.requestId = result.requestId
                input.soldRequestConsultantId = result.requestConsultantId;
                this.showMainSpinner();
                this._workflowService.start(input)
                    .pipe(finalize(() => {
                        this.hideMainSpinner();
                    }))
                    .subscribe(result => {
                        this.router.navigate(['/app/workflow', result.workflowId]);
                    });
            }
        });
    }

    confirmDeleteWorkflow(workflowId: string) {
        this.menuDeleteTrigger.closeMenu();
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
                confirmationMessageTitle: `Are you sure you want to delete workflow?`,
                confirmationMessage: 'If you confirm the deletion, all the info contained inside this workflow will be removed.',
                rejectButtonText: 'Cancel',
                confirmButtonText: 'Delete',
                isNegative: true
            }
        });

        dialogRef.componentInstance.onConfirmed.subscribe(() => {
            this.deleteWorkflow(workflowId);
        });
    }

    deleteWorkflow(workflowId: string) {
        this.isDataLoading = true;
        this._workflowService.delete(workflowId)
            .pipe(finalize(() => this.isDataLoading = false ))
            .subscribe(result => {
                this.getWorkflowList();
            });
    }

    getFlagColor(flag: number): string {
        switch (flag) {
            case WorkflowProcessType.StartClientPeriod:
            case WorkflowProcessType.StartConsultantPeriod:
                return 'workflow-flag--sales'
            case WorkflowProcessType.ExtendClientPeriod:
            case WorkflowProcessType.ExtendConsultantPeriod:
                return 'workflow-flag--extension'
            default:
                return '';
        }
    }

    mapFlagTooltip(flag: number): string {
        switch (flag) {
            case WorkflowProcessType.StartClientPeriod:
            case WorkflowProcessType.StartConsultantPeriod:
                return 'New Sales'
            case WorkflowProcessType.ExtendClientPeriod:
            case WorkflowProcessType.ExtendConsultantPeriod:
                return 'Has Extension'
            default:
                return '';
        }
    }

    getLegalEntities() {
        this._internalLookupService.getLegalEntities().subscribe(result => {
            this.legalEntities = result;
        });
    }

    getSalesType() {
        this._internalLookupService.getSaleTypes()
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.saleTypes = result;
            });
    }

    getDeliveryTypes() {
        this._internalLookupService.getDeliveryTypes()
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.deliveryTypes = result;
            });
    }

    getWorkflowStatuses() {
        this._internalLookupService.getWorkflowStatuses()
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.workflowStatuses = result;
            });
    }

    getWorkflowList(filterChanged?: boolean) {
        let searchFilter = this.workflowFilter.value ? this.workflowFilter.value : '';
        let invoicingEntity = this.invoicingEntityControl.value ? this.invoicingEntityControl.value : undefined;
        let paymentEntity = this.paymentEntityControl.value ? this.paymentEntityControl.value : undefined;
        let salesType = this.salesTypeControl.value ? this.salesTypeControl.value : undefined;
        let deliveryTypes = this.deliveryTypesControl.value ? this.deliveryTypesControl.value : undefined;
        let workflowStatus = this.workflowStatusControl.value ? this.workflowStatusControl.value : undefined;
        let ownerIds = this.selectedAccountManagers.map(x => +x.id);
        let selectedPendingStepType = this.pendingStepType === 0 ? undefined : this.pendingStepType;
        let selectedUpcomingStepType = this.upcomingStepType === 0 ? undefined : this.upcomingStepType;

        if (this.workflowListSubscription) {
            this.workflowListSubscription.unsubscribe();
        }
        this.isDataLoading = true;
        if (filterChanged) {
            this.pageNumber = 1;
        }

        this.workflowListSubscription = this._apiService.workflow(
            invoicingEntity,
            paymentEntity,
            salesType,
            deliveryTypes,
            workflowStatus,
            ownerIds,
            this.showOnlyWorkflowsWithNewSales,
            this.showOnlyWorkflowsWithExtensions,
            this.showPendingSteps,
            selectedPendingStepType !== null ? selectedPendingStepType : undefined,
            this.showUpcomingSteps,
            selectedUpcomingStepType !== null ? selectedUpcomingStepType : undefined,
            this.includeTerminated,
            this.includeDeleted,
            searchFilter,
            this.pageNumber,
            this.deafultPageSize,
            this.sorting)
            .pipe(finalize(() => {
                this.isDataLoading = false;
            }))
            .subscribe(result => {
                let formattedData = result?.items!.map(x => {
                    return {
                        workflowId: x.workflowId,
                        clientName: x.clientName,
                        startDate: x.startDate,
                        startDateOfOpenedPeriodOrLastClientPeriod: x.startDateOfOpenedPeriodOrLastClientPeriod,
                        endDate: x.endDate,
                        salesType: this.findItemById(this.saleTypes, x.salesTypeId),
                        deliveryType: this.findItemById(this.deliveryTypes, x.deliveryTypeId),
                        statusName: WorkflowStatus[x.workflowStatus!],
                        statusIcon: this.getStatusIcon(x.workflowStatus!),
                        isDeleted: x.isDeleted,
                        consultants: x.consultants,
                        consultantName: x.consultantName,
                        consultantNamesTooltip: x.consultantNamesTooltip,
                        openProcesses: x.openProcesses,
                        isActive: x.workflowStatus === WorkflowStatus.Active,
                        isNewSale: x.isNewSale
                    }
                })
                this.workflowDataSource = new MatTableDataSource<any>(formattedData);
                this.totalCount = result.totalCount;
                this.saveGridOptions();
            });
    }

    getStatusIcon(status: number) {
        switch (status) {
            case WorkflowStatus.Active:
                return 'active-status';
            case WorkflowStatus.Pending:
                return 'pending-status';
            case WorkflowStatus.Finished:
                return 'finished-status';
            default:
                return '';
        }
    }

    pageChanged(event?: any): void {
        this.pageNumber = event.pageIndex + 1;
        this.deafultPageSize = event.pageSize;
        this.getWorkflowList();
    }

    sortChanged(event?: any): void {
        this.sorting = event.active.concat(' ', event.direction);
        this.getWorkflowList();
    }

    optionClicked(event: Event, item: SelectableIdNameDto | SelectableCountry | SelectableEmployeeDto, list: SelectableIdNameDto[] | SelectableCountry[] | SelectableEmployeeDto[]) {
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

    selectUpcomingStep(stepType: number | null) {
        this.upcomingStepType = stepType;
        this.showUpcomingSteps = stepType !== null;
        this.pageNumber = 1;
        this.getWorkflowList();
    }

    selectPendingStep(stepType: number | null) {
        this.pendingStepType = stepType;
        this.showPendingSteps = stepType !== null;
        this.pageNumber = 1;
        this.getWorkflowList();
    }

    getCurrentUser() {
        this.selectedAccountManagers = [];

        this._employeeService.current()
            .pipe(finalize(()=> {
                this.getGridOptions();
            }))
            .subscribe(result => {
                this.selectedAccountManagers.push(
                    new SelectableEmployeeDto({
                        id: result.id!,
                        name: result.name!,
                        externalId: result.externalId!,
                        selected: true
                    })
                );
            });
    }

    clearAllFilters() {
        this.workflowFilter.setValue(null, {emitEvent: false});
        this.invoicingEntityControl.setValue(null, {emitEvent: false});
        this.paymentEntityControl.setValue(null, {emitEvent: false});
        this.salesTypeControl.setValue(null, {emitEvent: false});
        this.deliveryTypesControl.setValue(null, {emitEvent: false});
        this.workflowStatusControl.setValue(null, {emitEvent: false});
        this.showOnlyWorkflowsWithNewSales = false;
        this.showOnlyWorkflowsWithExtensions = false;
        this.pendingStepType = null
        this.showPendingSteps = false;
        this.upcomingStepType = null
        this.showUpcomingSteps = false;
        this.includeTerminated = false;
        this.includeDeleted = false;
        localStorage.removeItem(WorkflowGridOptionsKey);
        this.getCurrentUser();
    }

    openMenu(event: any) {
        event.stopPropagation();
        this.trigger.openPanel();
    }

    onOpenedMenu() {
        this.accountManagerFilter.setValue('');
        this.accountManagerFilter.markAsTouched();
    }

    displayNameFn(option: any) {
        return option?.name;
    }
}

export class WorkflowSourcingCreate {
    public requestId: number;
    public requestConsultantId: number;
    public existingWorkflowId: string | undefined;

    constructor(requestId: number, requestConsultantId: number, existingWorkflowId: string | undefined) {
        this.requestId = requestId;
        this.requestConsultantId = requestConsultantId;
        this.existingWorkflowId = existingWorkflowId;
    }
}

@Injectable()
export class WorkflowCreateResolver implements Resolve<WorkflowSourcingCreate> {
    constructor(private _workflowService: WorkflowServiceProxy) { }

    resolve(route: ActivatedRouteSnapshot): Observable<WorkflowSourcingCreate> {
        let requestId = route.queryParams['requestId']
        let requestConsultantId = route.queryParams['requestConsultantId'];
        return this._workflowService.workflowExists(requestConsultantId)
            .pipe(
                map((value:WorkflowAlreadyExistsDto)  => {
                return {
                    requestId: requestId,
                    requestConsultantId: requestConsultantId,
                    existingWorkflowId: value?.existingWorkflowId
                }
            }))
    }
}
