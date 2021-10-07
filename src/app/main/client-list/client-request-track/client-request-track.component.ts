import { Component, Input, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { finalize } from 'rxjs/operators';
import { AppConsts } from 'src/shared/AppConsts';
import { ClientRequestTrackDto, ClientsServiceProxy } from 'src/shared/service-proxies/service-proxies';

@Component({
    selector: 'app-client-request-track',
    templateUrl: './client-request-track.component.html',
    styleUrls: ['./client-request-track.component.scss']
})
export class ClientRequestTrackComponent implements OnInit {
    @Input() clientInfo: any;

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
