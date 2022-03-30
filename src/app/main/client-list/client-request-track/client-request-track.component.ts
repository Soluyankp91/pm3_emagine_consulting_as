import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { AppConsts } from 'src/shared/AppConsts';
import { ClientRequestTrackDto, ClientsServiceProxy, EmployeeDto } from 'src/shared/service-proxies/service-proxies';

const DATA_SOURCE: ClientRequestTrackDto[] = [
    new ClientRequestTrackDto(
        {
            requestId: 12,
            headline: 'Test',
            status: undefined,
            clientDeadline: moment(),
            dateAdded: moment(),
            projectType: undefined,
            priority: 1,
            numberOfConsultants: 2,
            locations: [],
            requestSourcers: [new EmployeeDto({id: 1, name: 'Ron Weasley', externalId: ''})],
            accountManagers: [new EmployeeDto({id: 1, name: 'Ron Weasley', externalId: ''})],
        }
    ),
    new ClientRequestTrackDto(
        {
            requestId: 1222,
            headline: 'Test2',
            status: undefined,
            clientDeadline: moment(),
            dateAdded: moment(),
            projectType: undefined,
            priority: 1,
            numberOfConsultants: 2,
            locations: [],
            requestSourcers: [new EmployeeDto({id: 1, name: 'Ron Weasley', externalId: ''})],
            accountManagers: [new EmployeeDto({id: 1, name: 'Ron Weasley', externalId: ''})],
        }
    ),
    new ClientRequestTrackDto(
        {
            requestId: 123,
            headline: 'Test3',
            status: undefined,
            clientDeadline: moment(),
            dateAdded: moment(),
            projectType: undefined,
            priority: 1,
            numberOfConsultants: 2,
            locations: [],
            requestSourcers: [new EmployeeDto({id: 1, name: 'Ron Weasley', externalId: ''})],
            accountManagers: [new EmployeeDto({id: 1, name: 'Ron Weasley', externalId: ''})],
        }
    )
]
@Component({
    selector: 'app-client-request-track',
    templateUrl: './client-request-track.component.html',
    styleUrls: ['./client-request-track.component.scss']
})
export class ClientRequestTrackComponent implements OnInit, OnDestroy {
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
        'countryFlag',
        'id',
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
    clientDataSource: MatTableDataSource<ClientRequestTrackDto> = new MatTableDataSource<ClientRequestTrackDto>();

    private _unsubscribe = new Subject();
    constructor(
        private _clientService: ClientsServiceProxy,
        private activatedRoute: ActivatedRoute
    ) { }

    ngOnInit(): void {
        this.activatedRoute.paramMap.pipe(
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
        let pageNumber = 1;
        let pageSize = 20;
        let sort = undefined;
        this._clientService.requestTrack(legacyClientIdQuery, pageNumber, pageSize, sort)
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.clientDataSource = new MatTableDataSource<ClientRequestTrackDto>(result.items);
            });
    }

    pageChanged(event?: any): void {
        this.pageNumber = event.pageIndex;
        this.deafultPageSize = event.pageSize;
    }

    sortChanged(event?: any): void {
        this.sorting = event.active.concat(' ', event.direction);
    }

    mapArrayByName(list: any): string {
        if (list?.length) {
            return list.map((x: any) => x.country?.name + ' ' + x?.city?.name).join(', ');
        } else {
            return '-';
        }
    }

}
