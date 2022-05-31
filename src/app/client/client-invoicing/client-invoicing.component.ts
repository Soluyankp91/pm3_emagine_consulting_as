import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { AppConsts } from 'src/shared/AppConsts';
import { NewConsultantCreateForm } from './client-invoicing.model';

const TABLE_DATA = [
    {
        id: '7647678',
        profile: 'Opsalming pr ressource',
        subId: '7647678',
        subProfile: 'Opsalming pr ressource',
        contactPerson: 'Martin Deangelo',
        contract: '24.12.2020'
    },
    {
        id: '7647678',
        profile: 'Opsalming pr ressource',
        subId: '7647678',
        subProfile: 'Opsalming pr ressource',
        contactPerson: 'Martin Deangelo',
        contract: '24.12.2020'
    },
    {
        id: '7647678',
        profile: 'Opsalming pr ressource',
        subId: '7647678',
        subProfile: 'Opsalming pr ressource',
        contactPerson: 'Martin Deangelo',
        contract: '24.12.2020'
    },
    {
        id: '7647678',
        profile: 'Opsalming pr ressource',
        subId: '7647678',
        subProfile: 'Opsalming pr ressource',
        contactPerson: 'Martin Deangelo',
        contract: '24.12.2020'
    }
];
@Component({
    selector: 'app-client-invoicing',
    templateUrl: './client-invoicing.component.html',
    styleUrls: ['./client-invoicing.component.scss']
})
export class ClientInvoicingComponent implements OnInit {
    invoicingForm: NewConsultantCreateForm;

    isDataLoading = false;
    pageNumber = 1;
    deafultPageSize = AppConsts.grid.defaultPageSize;
    pageSizeOptions = [5, 10, 20, 50, 100];
    totalCount: number | undefined = 0;
    sorting = '';

    clientDisplayColumns = [
        'id',
        'profile',
        'subId',
        'subProfile',
        'contactPerson',
        'contract'
    ];
    invoiceDataSource: MatTableDataSource<any> = new MatTableDataSource<any>(TABLE_DATA);
    constructor() {
        this.invoicingForm = new NewConsultantCreateForm();
    }

    ngOnInit(): void {
    }

    pageChanged(event?: any): void {
        this.pageNumber = event.pageIndex + 1;
        this.deafultPageSize = event.pageSize;
    }

    sortChanged(event?: any): void {
        this.sorting = event.active.concat(' ', event.direction);
    }

}
