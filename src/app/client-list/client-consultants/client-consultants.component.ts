import { Component, Input, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { AppConsts } from 'src/shared/AppConsts';

const TABLE_DATA = [
    {
        id: 1256,
        contact: 'Martin Deangelo',
        position: 'Leadership Support',
        email: 'email@email.email',
        phone: '+45 431 881 75 42',
        relation: 'Some relation',
        contactOwner: 'Martin Deangelo'
    },
    {
        id: 1256,
        contact: 'Martin Deangelo',
        position: 'Leadership Support',
        email: 'email@email.email',
        phone: '+45 431 881 75 42',
        relation: 'Some relation',
        contactOwner: 'Martin Deangelo'
    },
    {
        id: 1256,
        contact: 'Martin Deangelo',
        position: 'Leadership Support',
        email: 'email@email.email',
        phone: '+45 431 881 75 42',
        relation: 'Some relation',
        contactOwner: 'Martin Deangelo'
    },
    {
        id: 1256,
        contact: 'Martin Deangelo',
        position: 'Leadership Support',
        email: 'email@email.email',
        phone: '+45 431 881 75 42',
        relation: 'Some relation',
        contactOwner: 'Martin Deangelo'
    },
    {
        id: 1256,
        contact: 'Martin Deangelo',
        position: 'Leadership Support',
        email: 'email@email.email',
        phone: '+45 431 881 75 42',
        relation: 'Some relation',
        contactOwner: 'Martin Deangelo'
    },
    {
        id: 1256,
        contact: 'Martin Deangelo',
        position: 'Leadership Support',
        email: 'email@email.email',
        phone: '+45 431 881 75 42',
        relation: 'Some relation',
        contactOwner: 'Martin Deangelo'
    }
];
@Component({
    selector: 'app-client-consultants',
    templateUrl: './client-consultants.component.html',
    styleUrls: ['./client-consultants.component.scss']
})
export class ClientConsultantsComponent implements OnInit {
    @Input() clientInfo: any;
    consultantsDataSource: MatTableDataSource<any> = new MatTableDataSource<any>(TABLE_DATA);

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
        'contactOwner',
        'actions'
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
