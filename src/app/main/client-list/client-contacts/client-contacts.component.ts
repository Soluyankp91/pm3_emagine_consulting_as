import { Component, Input, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { finalize } from 'rxjs/operators';
import { AppConsts } from 'src/shared/AppConsts';
import { ClientsServiceProxy } from 'src/shared/service-proxies/service-proxies';

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
export class ClientContactsComponent implements OnInit {
    @Input() clientInfo: any;

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
        'owner',
        'action'
    ];
    clientContractsDataSource: MatTableDataSource<any> = new MatTableDataSource<any>();

    constructor(
        private _clientService: ClientsServiceProxy
    ) { }

    ngOnInit(): void {
        if (!this.clientInfo?.id) {
            let interval = setInterval(() => {
                if (this.clientInfo?.id) {
                    this.getRequestTrack();
                    clearInterval(interval);
                }
            }, 100);
        } else {
            this.getRequestTrack();
        }
    }

    getRequestTrack() {
        this.clientContractsDataSource = new MatTableDataSource<any>(DATA_SOURCE);
        // let legacyClientIdQuery = this.clientInfo.id;
        // let pageNumber = 1;
        // let pageSize = 20;
        // let sort = undefined;
        // this._clientService.requestTrack(legacyClientIdQuery, pageNumber, pageSize, sort)
        //     .pipe(finalize(() => {

        //     }))
        //     .subscribe(result => {
        //         this.clientContractsDataSource = new MatTableDataSource<any>(DATA_SOURCE);
        //     });
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
