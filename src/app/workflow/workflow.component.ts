import { Overlay } from '@angular/cdk/overlay';
import { Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, finalize, takeUntil } from 'rxjs/operators';
import { AppComopnentBase } from 'src/shared/app-component-base';
import { AppConsts } from 'src/shared/AppConsts';
import { ApiServiceProxy, EnumEntityTypeDto, StartNewWorkflowInputDto, WorkflowListItemDto, WorkflowProcessType, WorkflowServiceProxy } from 'src/shared/service-proxies/service-proxies';
import { InternalLookupService } from '../shared/common/internal-lookup.service';
import { ManagerStatus } from '../shared/components/manager-search/manager-search.model';
import { CreateWorkflowDialogComponent } from './create-workflow-dialog/create-workflow-dialog.component';
import { WorkflowFlag, WorkflowList } from './workflow.model';

@Component({
    selector: 'app-workflow',
    templateUrl: './workflow.component.html',
    styleUrls: ['./workflow.component.scss']
})

export class WorkflowComponent extends AppComopnentBase implements OnInit, OnDestroy {
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
    projectTypes: EnumEntityTypeDto[] = [];
    workflowStatuses: { [key: string]: string; };
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
    projectTypeControl = new FormControl();
    workflowStatusControl = new FormControl();

    managerStatus = ManagerStatus;


    private _unsubscribe = new Subject();
    constructor(
        injector: Injector,
        private router: Router,
        private _apiService: ApiServiceProxy,
        private _workflowService: WorkflowServiceProxy,
        private overlay: Overlay,
        private dialog: MatDialog,
        private _internalLookupService: InternalLookupService
    ) {
        super(injector);
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

        this.projectTypeControl.valueChanges.pipe(
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
    }

    ngOnInit(): void {
        this.getWorkflowList();
        this.getTenants();
        this.getSalesType();
        this.getProjectType();
        this.getWorkflowStatuses();
    }

    ngOnDestroy(): void {
        this._unsubscribe.next();
        this._unsubscribe.complete();
    }



    navigateToWorkflowDetails(workflowId: string): void {
        this.router.navigate(['/app/workflow', workflowId]);
    }

    createWorkflow() {
        const scrollStrategy = this.overlay.scrollStrategies.reposition();
        const dialogRef = this.dialog.open(CreateWorkflowDialogComponent, {
            minWidth: '450px',
            minHeight: '180px',
            height: 'auto',
            width: 'auto',
            scrollStrategy,
            backdropClass: 'backdrop-modal--wrapper',
            autoFocus: false
        });

        dialogRef.componentInstance.onConfirmed.subscribe((result) => {
            if (result) {
                let input = new StartNewWorkflowInputDto();
                input.startDate = result.startDate;
                input.endDate = result.endDate;
                this.showMainSpinner();
                this._workflowService.start(input)
                    .pipe(finalize(() => {
                        this.hideMainSpinner();
                    }))
                    .subscribe(result => {
                        this.router.navigate(['/main/workflow', result.workflowId]);
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

    getProjectType() {
        this._internalLookupService.getProjectTypes()
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.projectTypes = result;
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
        // let searchFilter = this.workflowFilter.value ? this.workflowFilter.value : '';
        this.isDataLoading = true;
        let invoicingEntity = this.invoicingEntityControl.value ? this.invoicingEntityControl.value : undefined;
        let paymentEntity = this.paymentEntityControl.value ? this.paymentEntityControl.value : undefined;
        let salesType = this.salesTypeControl.value ? this.salesTypeControl.value : undefined;
        let projectType = this.projectTypeControl.value ? this.projectTypeControl.value : undefined;
        let workflowStatus = this.workflowStatusControl.value ? this.workflowStatusControl.value : undefined;

        this._apiService.workflow(
            // searchFilter,
            invoicingEntity,
            paymentEntity,
            salesType,
            projectType,
            workflowStatus,
            this.showOnlyWorkflowsWithNewSales,
            this.showOnlyWorkflowsWithExtensions,
            this.showOnlyWorkflowsWithPendingStepsForSelectedEmployees,
            this.showOnlyWorkflowsWithUpcomingStepsForSelectedEmployees,
            this.includeTerminated,
            this.includeDeleted,
            this.pageNumber,
            this.deafultPageSize,
            this.sorting)
            .pipe(finalize(() => {
                this.isDataLoading = false;
            }))
            .subscribe(result => {
                this.workflowDataSource = new MatTableDataSource<WorkflowListItemDto>(result.items);
                this.totalCount = result.totalCount;
            });
    }

    pageChanged(event?: any): void {
        this.pageNumber = event.pageIndex === 0 ? 1 : event.pageIndex;
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

}
