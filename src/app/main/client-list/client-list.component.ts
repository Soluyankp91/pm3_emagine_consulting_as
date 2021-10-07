import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, switchMap, finalize } from 'rxjs/operators';
import { AppConsts } from 'src/shared/AppConsts';
import { ApiServiceProxy, ClientListItemDto, ClientsServiceProxy, IClientListItemDto } from 'src/shared/service-proxies/service-proxies';
import { CountryList } from './client-list.model';

@Component({
    selector: 'app-client-list',
    templateUrl: './client-list.component.html',
    styleUrls: ['./client-list.component.scss']
})

export class ClientListComponent implements OnInit, OnDestroy {
    clientFilter = new FormControl();
    acoountManagerFilter = new FormControl();
    clientsList: any[] = [];
    isDataLoading = false;
    countryList = CountryList;
    selectedCountries: string[] = [];
    pageNumber = 1;
    deafultPageSize = AppConsts.grid.defaultPageSize;
    pageSizeOptions = [5, 10, 20, 50, 100];
    totalCount: number | undefined = 0;
    sorting = '';

    clientDisplayColumns = [
        'countryFlag',
        'id',
        'name',
        'clientAddress_Address',
        'clientAddress_Address2',
        'clientAddress_PostCode',
        'clientAddress_City',
        'clientAddress_Country_Name',
        'phone',
        'owner_Name'
    ];

    clientDataSource: MatTableDataSource<ClientListItemDto> = new MatTableDataSource<ClientListItemDto>();
    private _unsubscribe = new Subject();
    constructor(
        private _clientService: ClientsServiceProxy,
        private _apiService: ApiServiceProxy,
        private router: Router,
        private http: HttpClient
    ) {
        this.clientFilter.valueChanges.pipe(
            takeUntil(this._unsubscribe),
            debounceTime(300),
            switchMap((value: any) => {
                let input = value ? value : '';
                this.isDataLoading = true;
                return this._apiService.clients(input, this.selectedCountries, this.pageNumber, this.deafultPageSize, this.sorting);
            }),
        ).subscribe((list: any) => {
            if (list.length) {
                this.clientsList = list;
            } else {
                this.clientsList = [];
            }
            this.isDataLoading = false;
        });
        this.acoountManagerFilter.valueChanges.pipe(
            takeUntil(this._unsubscribe),
            debounceTime(300),
            switchMap((value: any) => {
                this.isDataLoading = true;
                let input = value ? value : '';
                return this._apiService.clients(input, this.selectedCountries, this.pageNumber, this.deafultPageSize, this.sorting);
            }),
        ).subscribe((list: any) => {
            if (list.length) {
                this.clientsList = list;
            } else {
                this.clientsList = [];
            }
            this.isDataLoading = false;
        });
    }

    ngOnInit(): void {
        this.getClientsGrid(this.clientFilter.value, this.selectedCountries, this.pageNumber, this.deafultPageSize, this.sorting);
    }

    ngOnDestroy(): void {
        this._unsubscribe.next();
        this._unsubscribe.complete();
    }

    getClientsGrid(filter: string, selectedCountires: string[], pageNumber: number, pageSize: number, sort: string) {
        let searchFilter = filter ? filter : '';
        this.isDataLoading = true;
        this._apiService.clients(searchFilter, selectedCountires, pageNumber, pageSize, sort)
            .pipe(finalize(() => {
                this.isDataLoading = false;
            }))
            .subscribe(result => {
                this.clientDataSource = new MatTableDataSource<ClientListItemDto>(result.items);
                this.totalCount = result.totalCount;
            });
    }

    selectLookupCountry(country: any) {
        country.selected = !country.selected;
        if (country.selected) {
            this.selectedCountries.push(country.flag);
        } else {
            const index = this.selectedCountries.indexOf(country.flag);
            if (index > -1) {
                this.selectedCountries.splice(index, 1);
            }
        }
        this.getClientsGrid(this.clientFilter.value, this.selectedCountries, this.pageNumber, this.deafultPageSize, this.sorting);
    }

    pageChanged(event?: any): void {
        this.pageNumber = event.pageIndex;
        this.deafultPageSize = event.pageSize;
        this.getClientsGrid(this.clientFilter.value, this.selectedCountries, this.pageNumber, this.deafultPageSize, this.sorting);
    }

    sortChanged(event?: any): void {
        this.sorting = event.active.concat(' ', event.direction);
        this.getClientsGrid(this.clientFilter.value, this.selectedCountries, this.pageNumber, this.deafultPageSize, this.sorting);
    }

    navigateToClientDetails(clientId: number): void {
        this.router.navigate(['/main/clients', clientId]);
    }

}
