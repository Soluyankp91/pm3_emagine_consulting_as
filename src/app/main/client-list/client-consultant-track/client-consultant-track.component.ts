import { Component, Input, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { AppConsts } from 'src/shared/AppConsts';

const TABLE_DATA = [
    {
        consultant: 'Martin Deangelo',
        workflowsStart: '24.12.2020',
        workflowsEnd: '24.12.2020',
        consultantPrice: '250$',
        clientPrice: '300%',
        margin: '15%'
    },
    {
        consultant: 'Martin Deangelo',
        workflowsStart: '24.12.2020',
        workflowsEnd: '24.12.2020',
        consultantPrice: '250$',
        clientPrice: '300%',
        margin: '15%'
    },
    {
        consultant: 'Martin Deangelo',
        workflowsStart: '24.12.2020',
        workflowsEnd: '24.12.2020',
        consultantPrice: '250$',
        clientPrice: '300%',
        margin: '15%'
    },
    {
        consultant: 'Martin Deangelo',
        workflowsStart: '24.12.2020',
        workflowsEnd: '24.12.2020',
        consultantPrice: '250$',
        clientPrice: '300%',
        margin: '15%'
    }
];
@Component({
    selector: 'app-client-consultant-track',
    templateUrl: './client-consultant-track.component.html',
    styleUrls: ['./client-consultant-track.component.scss']
})
export class ClientConsultantTrackComponent implements OnInit {
    @Input() clientInfo: any;
    consultantTrackDataSource: MatTableDataSource<any> = new MatTableDataSource<any>(TABLE_DATA);

    isDataLoading = false;
    selectedCountries: string[] = [];
    pageNumber = 1;
    deafultPageSize = AppConsts.grid.defaultPageSize;
    pageSizeOptions = [5, 10, 20, 50, 100];
    totalCount: number | undefined = 0;
    sorting = '';

    clientDisplayColumns = [
        'consultant',
        'workflowsStart',
        'workflowsEnd',
        'consultantPrice',
        'clientPrice',
        'margin'
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
