import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, switchMap, takeUntil } from 'rxjs/operators';
import { AppConsts } from 'src/shared/AppConsts';
import { ApiServiceProxy, SalesServiceProxy, WorkflowsServiceProxy } from 'src/shared/service-proxies/service-proxies';
import { WorkflowList } from './workflow.model';

@Component({
    selector: 'app-workflow',
    templateUrl: './workflow.component.html',
    styleUrls: ['./workflow.component.scss']
})

export class WorkflowComponent implements OnInit, OnDestroy {
    workflowFilter = new FormControl(null);

    pageNumber = 1;
    deafultPageSize = AppConsts.grid.defaultPageSize;
    pageSizeOptions = [5, 10, 20, 50, 100];
    totalCount: number | undefined = 0;
    sorting = '';
    isDataLoading = false;

    workflowDisplayColumns = [
        'Client',
        'Supplier',
        'Step',
        'Status',
        'Type',
        'Managers',
        'action'
    ];

    workflowDataSource: MatTableDataSource<any> = new MatTableDataSource<any>(WorkflowList);

    private _unsubscribe = new Subject();
    constructor(
        private router: Router,
        private _apiService: ApiServiceProxy,
        private _workflowService: WorkflowsServiceProxy,
        private _workflowSalesService: SalesServiceProxy
    ) {
        this.workflowFilter.valueChanges.pipe(
            takeUntil(this._unsubscribe),
            debounceTime(300),
            switchMap((value: any) => {
                let input = value ? value : '';
                this.isDataLoading = true;
                // get workflow list
                return this._apiService.workflows('test');
            }),
        ).subscribe((list: any) => {
            if (list.length) {
                // list load
            } else {
                // empty list
            }
            this.isDataLoading = false;
        });
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

    navigateToWorkflowDetails(workflowId: string): void {
        this.router.navigate(['/main/workflow', workflowId]);
    }

}
