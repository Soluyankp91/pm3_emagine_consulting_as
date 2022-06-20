import { Component, Injector, Input, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { InternalLookupService } from 'src/app/shared/common/internal-lookup.service';
import { AppComponentBase } from 'src/shared/app-component-base';
import { AppConsts } from 'src/shared/AppConsts';
import { ClientWorkflowTrackItemDto, ClientsServiceProxy, EmployeeDto, EnumEntityTypeDto, WorkflowStatus } from 'src/shared/service-proxies/service-proxies';

@Component({
    selector: 'app-client-workflow-track',
    templateUrl: './client-workflow-track.component.html',
    styleUrls: ['./client-workflow-track.component.scss']
})
export class ClientWorkflowTrackComponent extends AppComponentBase implements OnInit {
    clientId: number;

    isDataLoading = false;
    selectedCountries: string[] = [];
    pageNumber = 1;
    deafultPageSize = AppConsts.grid.defaultPageSize;
    pageSizeOptions = [5, 10, 20, 50, 100];
    totalCount: number | undefined = 0;
    sorting = '';

    clientDisplayColumns = [
        'consultant',
        'salesType',
        'deliveryType',
        'dateStart',
        'dateEnd',
        'invoicing',
        'manager',
        'status',
        'action'
    ];
    workflowTrackDataSource: MatTableDataSource<any> = new MatTableDataSource<any>();

    deliveryTypes: EnumEntityTypeDto[];
    saleTypes: EnumEntityTypeDto[];
    private _unsubscribe = new Subject();
    constructor(
        injector: Injector,
        private _clientService: ClientsServiceProxy,
        private activatedRoute: ActivatedRoute,
        private _internalLookupService: InternalLookupService,
        private router: Router
    ) {
        super(injector);
    }

    ngOnInit(): void {
        this.activatedRoute.parent!.paramMap.pipe(
            takeUntil(this._unsubscribe)
        ).subscribe(params => {
            this.clientId = +params.get('id')!;
            this.getWorkflowTrack();
        });
        this.getDeliveryTypes();
        this.getSaleTypes();
    }

    getDeliveryTypes() {
        this._internalLookupService.getDeliveryTypes()
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.deliveryTypes = result;
            });
    }

    getSaleTypes() {
        this._internalLookupService.getSaleTypes()
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.saleTypes = result;
            });
    }

    ngOnDestroy(): void {
        this._unsubscribe.next();
        this._unsubscribe.complete();
    }

    getWorkflowTrack() {
        let legacyClientIdQuery = this.clientId;
        this.isDataLoading = true;
        this._clientService.workflowTrack(legacyClientIdQuery, this.pageNumber, this.deafultPageSize, this.sorting)
            .pipe(finalize(() => {
                this.isDataLoading = false;
            }))
            .subscribe(result => {
                let mappedData = result.items?.map(item => {
                    return {
                        workflowId: item.workflowId,
                        startDate: item.startDate,
                        endDate: item.endDate,
                        salesTypeId: this.findItemById(this.saleTypes, item.salesTypeId),
                        deliveryTypeId: this.findItemById(this.deliveryTypes, item.deliveryTypeId),
                        workflowStatus: this.detectStatusColor(item.workflowStatusWithEmployee?.status!),
                        workflowStatusName: this.parseStatusName(item.workflowStatusWithEmployee?.status!),
                        workflowEmployee: item.workflowStatusWithEmployee?.responsibleEmployee,
                        consultants: item.consultants,
                        invoicingReferencePerson: item.invoicingReferencePerson,
                    }
                });
                this.workflowTrackDataSource = new MatTableDataSource<any>(mappedData);
                this.totalCount = result.totalCount;
            });
    }

    pageChanged(event?: any): void {
        this.pageNumber = event.pageIndex + 1;
        this.deafultPageSize = event.pageSize;
        this.getWorkflowTrack();
    }

    sortChanged(event?: any): void {
        this.sorting = event.active.concat(' ', event.direction);
        this.getWorkflowTrack();
    }

    openWorkflow(workflowId: string) {
        this.router.navigate(['/app/workflow', workflowId]);
    }

    mapLocationArrayByName(list: any): string {
        if (list?.length) {
            return list.map((x: any) => x.country?.name + ' ' + x?.city?.name).join(', ');
        } else {
            return '-';
        }
    }

    detectStatusColor(statusValue: number) {
        switch (statusValue) {
            case WorkflowStatus.Pending:
                return 'pending-status';
            case WorkflowStatus.Active:
                return 'active-status';
            case WorkflowStatus.Finished:
                return 'finished-status';
            default:
                return '';
        }
    }

    parseStatusName(statusValue: number) {
        switch (statusValue) {
            case WorkflowStatus.Pending:
                return 'Pending';
            case WorkflowStatus.Active:
                return 'Active';
            case WorkflowStatus.Finished:
                return 'Finished';
            default:
                return '';
        }
    }
}
