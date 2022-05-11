import { Component, Injector, Input, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { InternalLookupService } from 'src/app/shared/common/internal-lookup.service';
import { AppComopnentBase } from 'src/shared/app-component-base';
import { AppConsts } from 'src/shared/AppConsts';
import { ClientWorkflowTrackItemDto, ClientsServiceProxy, EmployeeDto, EnumEntityTypeDto } from 'src/shared/service-proxies/service-proxies';

@Component({
    selector: 'app-client-workflow-track',
    templateUrl: './client-workflow-track.component.html',
    styleUrls: ['./client-workflow-track.component.scss']
})
export class ClientWorkflowTrackComponent extends AppComopnentBase implements OnInit {
    @Input() clientInfo: any;
    clientId: number;

    isDataLoading = false;
    selectedCountries: string[] = [];
    pageNumber = 1;
    deafultPageSize = AppConsts.grid.defaultPageSize;
    pageSizeOptions = [5, 10, 20, 50, 100];
    totalCount: number | undefined = 0;
    sorting = '';

    clientDisplayColumns = [
        'id',
        'consultant',
        'salesType',
        'deliveryType',
        'dateStart',
        'dateEnd',
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
        private _internalLookupService: InternalLookupService
    ) {
        super(injector);
    }

    ngOnInit(): void {
        this.activatedRoute.paramMap.pipe(
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
        let pageNumber = 1;
        let pageSize = 20;
        let sort = undefined;
        this._clientService.workflowTrack(legacyClientIdQuery, pageNumber, pageSize, sort)
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.workflowTrackDataSource = new MatTableDataSource<ClientWorkflowTrackItemDto>(result.items);
            });
    }

    pageChanged(event?: any): void {
        this.pageNumber = event.pageIndex;
        this.deafultPageSize = event.pageSize;
    }

    sortChanged(event?: any): void {
        this.sorting = event.active.concat(' ', event.direction);
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
            case 1:
                return 'progress-status';
            case 2:
                return 'running-status';
            case 3:
                return 'termianted-status';
            default:
                return '';
        }
    }
}
