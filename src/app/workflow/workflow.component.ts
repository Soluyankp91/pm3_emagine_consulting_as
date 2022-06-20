import { Overlay } from '@angular/cdk/overlay';
import { Component, Injectable, Injector, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { Observable, Subject } from 'rxjs';
import { debounceTime, finalize, map, switchMap, takeUntil } from 'rxjs/operators';
import { AppComponentBase } from 'src/shared/app-component-base';
import { AppConsts } from 'src/shared/AppConsts';
import { ApiServiceProxy, EmployeeDto, EmployeeServiceProxy, EnumEntityTypeDto, LookupServiceProxy, StartNewWorkflowInputDto, WorkflowAlreadyExistsDto, WorkflowListItemDto, WorkflowProcessType, WorkflowServiceProxy, WorkflowStepStatus } from 'src/shared/service-proxies/service-proxies';
import { SelectableCountry, SelectableIdNameDto } from '../client/client.model';
import { InternalLookupService } from '../shared/common/internal-lookup.service';
import { ManagerStatus } from '../shared/components/manager-search/manager-search.model';
import { CreateWorkflowDialogComponent } from './create-workflow-dialog/create-workflow-dialog.component';
import { SelectableEmployeeDto, WorkflowFlag, WorkflowList } from './workflow.model';

@Component({
    selector: 'app-workflow',
    templateUrl: './workflow.component.html',
    styleUrls: ['./workflow.component.scss']
})

export class WorkflowComponent extends AppComponentBase implements OnInit, OnDestroy {
    workflowFilter = new FormControl(null);

    pageNumber = 1;
    deafultPageSize = AppConsts.grid.defaultPageSize;
    pageSizeOptions = [5, 10, 20, 50, 100];
    totalCount: number | undefined = 0;
    sorting = '';
    isDataLoading = false;

    workflowDisplayColumns = [
        'flag',
        'id',
        'Client',
        'Consultants',
        'SalesType',
        'DeliveryType',
        'startDate',
        'endDate',
        'openProcess',
        'Steps',
        'Status',
        'action'
    ];

    workflowDataSource: MatTableDataSource<WorkflowListItemDto>;
    workflowProcess = WorkflowProcessType;

    // selectedTypes = [
    //     {
    //         flag: WorkflowFlag.NewSales,
    //         name: 'New Sales'
    //     },
    //     {
    //         flag: WorkflowFlag.Extension,
    //         name: 'Extension'
    //     }
    // ];

    tenants: EnumEntityTypeDto[] = [];
    saleTypes: EnumEntityTypeDto[] = [];
    deliveryTypes: EnumEntityTypeDto[] = [];
    workflowStatuses: { [key: string]: string; };
    workflowStepStatuses = WorkflowStepStatus;
    isAdvancedFilters = false;
    showOnlyWorkflowsWithNewSales = false;
    showOnlyWorkflowsWithExtensions = false;
    showOnlyWorkflowsWithPendingStepsForSelectedEmployees = false;
    showOnlyWorkflowsWithUpcomingStepsForSelectedEmployees = false;
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
        // this.workflowFilter.valueChanges.pipe(
        //     takeUntil(this._unsubscribe),
        //     debounceTime(300),
        //     switchMap((value: any) => {
        //         let input = value ? value : '';
        //         this.isDataLoading = true;
        //         // get workflow list
        //         return this._apiService.workflows('test');
        //     }),
        // ).subscribe((list: any) => {
        //     if (list.length) {
        //         // list load
        //     } else {
        //         // empty list
        //     }
        //     this.isDataLoading = false;
        // });

        this.workflowFilter.valueChanges.pipe(
            takeUntil(this._unsubscribe),
            debounceTime(500)
        ).subscribe(() => {
            this.getWorkflowList();
        });

        this.invoicingEntityControl.valueChanges.pipe(
            takeUntil(this._unsubscribe),
            debounceTime(500)
        ).subscribe(() => {
            this.getWorkflowList();
        });

        this.paymentEntityControl.valueChanges.pipe(
            takeUntil(this._unsubscribe),
            debounceTime(500)
        ).subscribe(() => {
            this.getWorkflowList();
        });

        this.salesTypeControl.valueChanges.pipe(
            takeUntil(this._unsubscribe),
            debounceTime(500)
        ).subscribe(() => {
            this.getWorkflowList();
        });

        this.deliveryTypesControl.valueChanges.pipe(
            takeUntil(this._unsubscribe),
            debounceTime(500)
        ).subscribe(() => {
            this.getWorkflowList();
        });

        this.workflowStatusControl.valueChanges.pipe(
            takeUntil(this._unsubscribe),
            debounceTime(500)
        ).subscribe(() => {
            this.getWorkflowList();
        });

        this.accountManagerFilter.valueChanges.pipe(
            takeUntil(this._unsubscribe),
            debounceTime(300),
            switchMap((value: any) => {
                let toSend = {
                    name: value,
                    maxRecordsCount: 1000,
                };
                if (value?.id) {
                    toSend.name = value.id
                        ? value.name
                        : value;
                }
                return this._lookupService.employees(value);
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
        });
    }

    ngOnInit(): void {

        this.getCurrentUser();
        // this.getWorkflowList();
        this.getTenants();
        this.getSalesType();
        this.getDeliveryTypes();
        this.getWorkflowStatuses();
    }

    ngOnDestroy(): void {
        this._unsubscribe.next();
        this._unsubscribe.complete();
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

        dialogRef.componentInstance.onRejected.subscribe(() => {
            // nthng
        });
    }

    getFlagColor(flag: number): string {
        switch (flag) {
            case WorkflowFlag.NewSales:
                return 'workflow-flag--sales'
            case WorkflowFlag.Extension:
                return 'workflow-flag--extension'
            default:
                return '';
        }
    }

    mapFlagTooltip(flag: number): string {
        switch (flag) {
            case WorkflowFlag.NewSales:
                return 'New Sales'
            case WorkflowFlag.Extension:
                return 'Has Extension'
            default:
                return '';
        }
    }

    getTenants() {
        this._internalLookupService.getTenants()
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.tenants = result;
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

    getWorkflowList() {
        let searchFilter = this.workflowFilter.value ? this.workflowFilter.value : '';
        this.isDataLoading = true;
        let invoicingEntity = this.invoicingEntityControl.value ? this.invoicingEntityControl.value : undefined;
        let paymentEntity = this.paymentEntityControl.value ? this.paymentEntityControl.value : undefined;
        let salesType = this.salesTypeControl.value ? this.salesTypeControl.value : undefined;
        let deliveryTypes = this.deliveryTypesControl.value ? this.deliveryTypesControl.value : undefined;
        let workflowStatus = this.workflowStatusControl.value ? this.workflowStatusControl.value : undefined;
        let ownerIds = this.selectedAccountManagers.map(x => +x.id);

        this._apiService.workflow(
            invoicingEntity,
            paymentEntity,
            salesType,
            deliveryTypes,
            workflowStatus,
            ownerIds,
            this.showOnlyWorkflowsWithNewSales,
            this.showOnlyWorkflowsWithExtensions,
            this.showOnlyWorkflowsWithPendingStepsForSelectedEmployees,
            this.showOnlyWorkflowsWithUpcomingStepsForSelectedEmployees,
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
                        endDate: x.endDate,
                        salesType: this.findItemById(this.saleTypes, x.salesTypeId),
                        deliveryType: this.findItemById(this.deliveryTypes, x.deliveryTypeId),
                        workflowStatusWithEmployee: x.workflowStatusWithEmployee,
                        isDeleted: x.isDeleted,
                        consultants: x.consultants,
                        openProcesses: x.openProcesses,
                        accountManager: x.accountManager
                    }
                })
                this.workflowDataSource = new MatTableDataSource<any>(formattedData);
                this.totalCount = result.totalCount;
            });
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

    selectedManager(event: any) {
        console.log(event);
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
        this.getWorkflowList();
    }

    getCurrentUser() {
        this.selectedAccountManagers = [];

        this._employeeService.current()
            .pipe(finalize(()=> {
                this.getWorkflowList();
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
        this.showOnlyWorkflowsWithPendingStepsForSelectedEmployees = false;
        this.showOnlyWorkflowsWithUpcomingStepsForSelectedEmployees = false;
        this.includeTerminated = false;
        this.includeDeleted = false;
        this.getCurrentUser();
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
                    existingWorkflowId: value.existingWorkflowId
                }
            }))
    }
}