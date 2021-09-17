import { Component, Input, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { AppConsts } from 'src/shared/AppConsts';

@Component({
    selector: 'app-client-consultant-track',
    templateUrl: './client-consultant-track.component.html',
    styleUrls: ['./client-consultant-track.component.scss']
})
export class ClientConsultantTrackComponent implements OnInit {
    @Input() clientInfo: any;
    consultantTrackDataSource: MatTableDataSource<any> = new MatTableDataSource<any>();

    isDataLoading = false;
    selectedCountries: string[] = [];
    pageNumber = 1;
    deafultPageSize = AppConsts.grid.defaultPageSize;
    pageSizeOptions = [5, 10, 20, 50, 100];
    totalCount: number | undefined = 0;
    sorting = '';

    clientDisplayColumns = [
        'id',
        'contact',
        'position',
        'email',
        'phone',
        'relation',
        'contactOwner'
    ];
    constructor() { }

    ngOnInit(): void {
    }

    pageChanged(event?: any): void {
        this.pageNumber = event.pageIndex;
        this.deafultPageSize = event.pageSize;
    }

    sortChanged(event?: any): void {
        this.sorting = event.active.concat(' ', event.direction);
    }

}
