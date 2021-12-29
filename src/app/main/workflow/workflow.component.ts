import { Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { AppComopnentBase } from 'src/shared/app-component-base';
import { AppConsts } from 'src/shared/AppConsts';
import { ApiServiceProxy, SalesServiceProxy, WorkflowsServiceProxy } from 'src/shared/service-proxies/service-proxies';
import { WorkflowList, WorkflowSideSections } from './workflow.model';

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

    workflowDataSource: MatTableDataSource<any> = new MatTableDataSource<any>(WorkflowList);

    workflowProcess = WorkflowSideSections;

    private _unsubscribe = new Subject();
    constructor(
        injector: Injector,
        private router: Router,
        private _apiService: ApiServiceProxy,
        private _workflowService: WorkflowsServiceProxy,
        private _workflowSalesService: SalesServiceProxy
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
    }

    ngOnInit(): void {

    }

    ngOnDestroy(): void {
        this._unsubscribe.next();
        this._unsubscribe.complete();
    }

    getWorkflowList() {

    }

    pageChanged(event?: any): void {
        this.pageNumber = event.pageIndex;
        this.deafultPageSize = event.pageSize;
        this.getWorkflowList();
    }

    sortChanged(event?: any): void {
        this.sorting = event.active.concat(' ', event.direction);
        this.getWorkflowList();
    }

    navigateToWorkflowDetails(workflowId: number): void {
        this.router.navigate(['/main/workflow', workflowId]);
    }

    createWorkflow() {
        this._workflowService.start()
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.router.navigate(['/main/workflow', result.workflowId]);
            });
    }

}
