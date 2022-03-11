import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { AppConsts } from 'src/shared/AppConsts';
import { ClientsServiceProxy, ContactDto } from 'src/shared/service-proxies/service-proxies';

const DATA_SOURCE = [
    {
        id: 12,
        status: {name: 'Wrongfully deleted in HubSpot', value: 1},
        name: 'Frederick Rikke',
        title: 'Leadership support',
        email: 'rd@mail.com',
        phone: '+54 431 881 75 42',
        owner: ''
    },
    {
        id: 12,
        status: {name: 'Active', value: 2},
        name: 'Frederick Rikke',
        title: 'Leadership support',
        email: 'rd@mail.com',
        phone: '+54 431 881 75 42',
        owner: ''
    },
    {
        id: 12,
        status: {name: 'Inactive', value: 3},
        name: 'Frederick Rikke',
        title: 'Leadership support',
        email: 'rd@mail.com',
        phone: '+54 431 881 75 42',
        owner: ''
    }
]

@Component({
    selector: 'app-client-contacts',
    templateUrl: './client-contacts.component.html',
    styleUrls: ['./client-contacts.component.scss']
})
export class ClientContactsComponent implements OnInit, OnDestroy {
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
        'status',
        'name',
        'title',
        'email',
        'phone',
        'lastCamLogin',
        'owner',
        'action'
    ];
    clientContactsDataSource: MatTableDataSource<ContactDto> = new MatTableDataSource<ContactDto>();

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
            this.getClientContacts();
        });
    }

    ngOnDestroy(): void {
        this._unsubscribe.next();
        this._unsubscribe.complete();
    }

    getClientContacts() {
        // this.clientContractsDataSource = new MatTableDataSource<any>(DATA_SOURCE);
        this.isDataLoading = true;
        this._clientService.contacts(this.clientId, false)
                .pipe(finalize(() => {
                    this.isDataLoading = false;
                }))
                .subscribe(result => {
                    this.clientContactsDataSource = new MatTableDataSource<ContactDto>(result);
                    this.totalCount = result.length;
                });
        // let legacyClientIdQuery = this.clientId;
        // let pageNumber = 1;
        // let pageSize = 20;
        // let sort = undefined;
        // this._clientService.requestTrack(legacyClientIdQuery, pageNumber, pageSize, sort)
    }

    pageChanged(event?: any): void {
        this.pageNumber = event.pageIndex === 0 ? 1 : event.pageIndex;
        this.deafultPageSize = event.pageSize;
        this.getClientContacts();
    }

    sortChanged(event?: any): void {
        this.sorting = event.active.concat(' ', event.direction);
        this.getClientContacts();
    }

    mapArrayByName(list: any): string {
        if (list?.length) {
            return list.map((x: any) => x.country?.name + ' ' + x?.city?.name).join(', ');
        } else {
            return '-';
        }
    }

    detectStatusColor(statusValue: number) {
        switch (statusValue) {
            case 1:
                return 'deleted-status';
            case 2:
                return 'active-status';
            case 3:
                return 'inactive-status';
            default:
                return '';
        }
    }
}
