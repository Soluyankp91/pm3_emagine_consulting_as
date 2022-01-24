import { Component, Input, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import * as moment from 'moment';
import { finalize } from 'rxjs/operators';
import { AppConsts } from 'src/shared/AppConsts';
import { ClientRequestTrackDto, ClientsServiceProxy, EmployeeDto } from 'src/shared/service-proxies/service-proxies';


const DATA_SOURCE = [
    {
        id: 12,
        consultant: 'Frederick Rikke',
        salesType: 'Managed Service',
        deliveryType: 'Managed Service',
        dateStart: moment(),
        dateEnd: moment(),
        status: {name: 'In Progress', value: 1}
    },
    {
        id: 12,
        consultant: 'Frederick Rikke',
        salesType: 'T&M',
        deliveryType: 'Offshore',
        dateStart: moment(),
        dateEnd: moment(),
        status: {name: 'Running', value: 2}
    },
    {
        id: 12,
        consultant: 'Frederick Rikke',
        salesType: 'Fee only',
        deliveryType: 'Normal',
        dateStart: moment(),
        dateEnd: moment(),
        status: {name: 'Terminated', value: 3}
    }
]

@Component({
    selector: 'app-client-workflow-track',
    templateUrl: './client-workflow-track.component.html',
    styleUrls: ['./client-workflow-track.component.scss']
})
export class ClientWorkflowTrackComponent implements OnInit {
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
        'consultant',
        'salesType',
        'deliveryType',
        'dateStart',
        'dateEnd',
        'status',
        'action'
    ];
    workflowTrackDataSource: MatTableDataSource<any> = new MatTableDataSource<any>();

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
        let legacyClientIdQuery = this.clientInfo.id;
        let pageNumber = 1;
        let pageSize = 20;
        let sort = undefined;
        this._clientService.requestTrack(legacyClientIdQuery, pageNumber, pageSize, sort)
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.workflowTrackDataSource = new MatTableDataSource<any>(DATA_SOURCE);
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
