import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AppConsts } from 'src/shared/AppConsts';
import { ClientDetailsDto, ClientRequestTrackItemDto, ClientsServiceProxy, EmployeeDto } from 'src/shared/service-proxies/service-proxies';

@Component({
    selector: 'app-client-request-track',
    templateUrl: './client-request-track.component.html',
    styleUrls: ['./client-request-track.component.scss']
})
export class ClientRequestTrackComponent implements OnInit, OnDestroy {
    clientId: number;

    isDataLoading = false;
    selectedCountries: string[] = [];
    pageNumber = 1;
    deafultPageSize = AppConsts.grid.defaultPageSize;
    pageSizeOptions = [5, 10, 20, 50, 100];
    totalCount: number | undefined = 0;
    sorting = '';

    clientDisplayColumns = [
        // 'countryFlag',
        'requestId',
        'headline',
        'status.value',
        'clientDeadline',
        'dateAdded',
        'projectType.value',
        'priority',
        'numberOfConsultants',
        'locations',
        'salesManager',
        'sourcer'
    ];
    clientDataSource: MatTableDataSource<any> = new MatTableDataSource<any>();

    private _unsubscribe = new Subject();
    constructor(
        private _clientService: ClientsServiceProxy,
        private activatedRoute: ActivatedRoute
    ) { }

    ngOnInit(): void {
        this.activatedRoute.parent!.paramMap.pipe(
            takeUntil(this._unsubscribe)
        ).subscribe(params => {
            this.clientId = +params.get('id')!;
            this.getRequestTrack();
        });
    }

    ngOnDestroy(): void {
        this._unsubscribe.next();
        this._unsubscribe.complete();
    }

    getRequestTrack() {
        let legacyClientIdQuery = this.clientId;
        this.isDataLoading = true;
        this._clientService.requestTrack(legacyClientIdQuery, this.pageNumber, this.deafultPageSize, this.sorting)
            .pipe(finalize(() => {
                this.isDataLoading = false;
            }))
            .subscribe(result => {
                let formattedData = result?.items!.map(x => {
                    return {
                        requestId: x.requestId,
                        headline: x.headline,
                        status: x.status,
                        clientDeadline: x.clientDeadline,
                        dateAdded: x.dateAdded,
                        projectType: x.projectType,
                        priority: x.priority,
                        numberOfConsultants: x.numberOfConsultants,
                        locations: this.mapLocationArrayByName(x.locations!),
                        requestSourcers: this.mapEmployeeArrayByName(x.requestSourcers!),
                        accountManagers: this.mapEmployeeArrayByName(x.accountManagers!)
                    }
                })
                this.clientDataSource = new MatTableDataSource<any>(formattedData);
                this.totalCount = result.totalCount;
            });
    }

    pageChanged(event?: any): void {
        this.pageNumber = event.pageIndex + 1;
        this.deafultPageSize = event.pageSize;
        this.getRequestTrack();
    }

    sortChanged(event?: any): void {
        this.sorting = event.direction && event.direction.length ? event.active.concat(' ', event.direction) : '';
        this.getRequestTrack();
    }

    mapLocationArrayByName(list: any): string {
        if (list?.length) {
            return list.map((x: any) => x.country?.name + ' ' + x?.city?.name).join(', ');
        } else {
            return '-';
        }
    }

    redirectToSourcingBoard(requestId: number) {
        window.open(`${environment.sourcingUrl}/app/request-hub/${requestId}/board`, '_blank');
    }

    mapEmployeeArrayByName(list: EmployeeDto[]): string {
        if (list?.length) {
            return list.map((x: EmployeeDto) => x.name).join(', ');
        } else {
            return '-';
        }
    }

}
