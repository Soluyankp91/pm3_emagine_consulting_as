import { HttpClient } from '@angular/common/http';
import { Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormControl } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { takeUntil, debounceTime, switchMap, finalize, map } from 'rxjs/operators';
import { AppConsts } from 'src/shared/AppConsts';
import { ApiServiceProxy, ClientListItemDto, EmployeeDto, EnumServiceProxy, IdNameDto, LookupServiceProxy } from 'src/shared/service-proxies/service-proxies';
import { SelectableCountry, SelectableEmployeeDto, SelectableIdNameDto, StatusList } from './client-list.model';
import { AppComopnentBase } from 'src/shared/app-component-base';

@Component({
    selector: 'app-client-list',
    templateUrl: './client-list.component.html',
    styleUrls: ['./client-list.component.scss']
})

export class ClientListComponent extends AppComopnentBase implements OnInit, OnDestroy {
    clientFilter = new FormControl();
    accountManagerFilter = new FormControl();
    clientsList: any[] = [];
    isDataLoading = false;
    countryList: SelectableCountry[] = [];
    selectedCountryIds: number[] = [];
    pageNumber = 1;
    deafultPageSize = AppConsts.grid.defaultPageSize;
    pageSizeOptions = [5, 10, 20, 50, 100];
    totalCount: number | undefined = 0;
    sorting = '';

    // clientDisplayColumns = [
    //     'countryFlag',
    //     'id',
    //     'name',
    //     'clientAddress_Address',
    //     'clientAddress_Address2',
    //     'clientAddress_PostCode',
    //     'clientAddress_City',
    //     'clientAddress_Country_Name',
    //     'phone',
    //     'owner_Name'
    // ];

    clientDisplayColumns = [
        // 'countryFlag',
        'id',
        'name',
        'clientAddress_Country_Name',
        // 'clientCountry',
        'clientAddress_City',
        'clientAddress_Address',
        'status',
        'owner_Name',
        'action'
    ];

    selectedAccountManagers: SelectableEmployeeDto[] = [];
    filteredAccountManagers: SelectableEmployeeDto[] = [];

    countryFilter = new FormControl('');
    selectedCountries: SelectableCountry[] = [];
    filteredCountries: Observable<SelectableCountry[] | undefined>;

    statusList = StatusList;
    selecedStatuses: SelectableIdNameDto[] = [];

    clientDataSource: MatTableDataSource<ClientListItemDto> = new MatTableDataSource<ClientListItemDto>();
    private _unsubscribe = new Subject();
    constructor(
        injector: Injector,
        private _apiService: ApiServiceProxy,
        private router: Router,
        private _enumService: EnumServiceProxy,
        private _lookupService: LookupServiceProxy
    ) {
        super(injector);
        this.clientFilter.valueChanges.pipe(
            takeUntil(this._unsubscribe),
            debounceTime(300),
            switchMap((value: any) => {
                let input = value ? value : '';
                this.isDataLoading = true;
                let isActive = this.selecedStatuses.findIndex(x => x.name === 'Active') > -1;
                let excludeDeleted = this.selecedStatuses.findIndex(x => x.name === 'Deleted') < 0;
                let onlyWrongfullyDeletedInHubspot = this.selecedStatuses.findIndex(x => x.name === 'Wrongfully deleted') > -1;
                let ownerIds = this.selectedAccountManagers.map(x => +x.id);
                return this._apiService.clients(input, this.selectedCountryIds, ownerIds, isActive, excludeDeleted, onlyWrongfullyDeletedInHubspot, this.pageNumber, this.deafultPageSize, this.sorting);
            }),
        ).subscribe((list: any) => {
            if (list.length) {
                this.clientsList = list;
            } else {
                this.clientsList = [];
            }
            this.isDataLoading = false;
        });

        this.accountManagerFilter.valueChanges.pipe(
            takeUntil(this._unsubscribe),
            debounceTime(300),
            switchMap((value: any) => {
                let toSend = {
                    name: value,
                    maxRecordsCount: 1000,
                };
                if (value?.id) {
                    toSend.name = value.id
                        ? value.name
                        : value;
                }

                return this._lookupService.employees(value);
            }),
        ).subscribe((list: EmployeeDto[]) => {
            if (list.length) {
                this.filteredAccountManagers = list.map(x => {
                    return new SelectableEmployeeDto({
                        id: x.id!,
                        name: x.name!,
                        externalId: x.externalId!,
                        selected: false
                    })
                });
            } else {
                this.filteredAccountManagers = [{ name: 'No managers found', externalId: '', id: 'no-data', selected: false }];
            }
        });

    }

    ngOnInit(): void {
        this.getCountries();
        this.filteredCountries = this.countryFilter.valueChanges
            .pipe(
            map(value => {
                if (typeof value === 'string') {
                    return this._filterCountries(value);
                }
            })
        );
        this.getClientsGrid(this.clientFilter.value, this.selectedCountryIds, this.pageNumber, this.deafultPageSize, this.sorting);
    }

    private _filterCountries(value: string): SelectableCountry[] {
        const filterValue = value.toLowerCase();

        const result = this.countryList.filter(option => option.name.toLowerCase().includes(filterValue));
        return result.length ? result : this.countryList;
    }

    ngOnDestroy(): void {
        this._unsubscribe.next();
        this._unsubscribe.complete();
    }

    optionClicked(event: Event, item: SelectableIdNameDto | SelectableCountry | SelectableEmployeeDto, list: SelectableIdNameDto[] | SelectableCountry[] | SelectableEmployeeDto[]) {
        event.stopPropagation();
        this.toggleSelection(item, list);
      }

    toggleSelection(item: any, list: any) {
        item.selected = !item.selected;
        if (item.selected) {
            if (!list.includes(item)) {
                list.push(item);
            }

        } else {
            const i = list.findIndex((value: any) => value.name === item.name);
            list.splice(i, 1);
        }

    }

    toggleStatusSelection(event: Event, status: SelectableIdNameDto) {
        event.stopPropagation();
        status.selected = !status.selected;
    }

    displaySelectedStatus(): string {
        if (this.selecedStatuses.length) {
            if (this.selecedStatuses.length > 1) {
                return this.selecedStatuses[0].name + ` +${this.selecedStatuses.length - 1}`;
            } else { // if only one status
                return this.selecedStatuses[0].name;
            }
        } else {
            return '';
        }
    }

    getCountries() {
        this._enumService.tenants()
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.countryList = result.map(x => {
                    return new SelectableCountry({
                        id: x.id!,
                        name: x.name!,
                        selected: false,
                        flag: x.name!
                    });
                });
                console.log(this.countryList);
            });
    }

    getClientsGrid(filter: string, selectedCountires: number[], pageNumber: number, pageSize: number, sort: string) {
        let searchFilter = filter ? filter : '';
        this.isDataLoading = true;
        let isActive = this.selecedStatuses.findIndex(x => x.name === 'Active') > -1;
        let excludeDeleted = this.selecedStatuses.findIndex(x => x.name === 'Deleted') < 0;
        let onlyWrongfullyDeletedInHubspot = this.selecedStatuses.findIndex(x => x.name === 'Wrongfully deleted') > -1;
        let ownerIds = this.selectedAccountManagers.map(x => +x.id);
        this._apiService.clients(searchFilter, selectedCountires, ownerIds, isActive, excludeDeleted, onlyWrongfullyDeletedInHubspot, pageNumber, pageSize, sort)
            .pipe(finalize(() => {
                this.isDataLoading = false;
            }))
            .subscribe(result => {
                this.clientDataSource = new MatTableDataSource<ClientListItemDto>(result.items);
                this.totalCount = result.totalCount;
            });
    }

    selectLookupCountry(country: SelectableCountry) {
        country.selected = !country.selected;
        if (country.selected) {
            this.selectedCountryIds.push(+country.id);
        } else {
            const index = this.selectedCountryIds.indexOf(+country.id);
            if (index > -1) {
                this.selectedCountryIds.splice(index, 1);
            }
        }
        this.getClientsGrid(this.clientFilter.value, this.selectedCountryIds, this.pageNumber, this.deafultPageSize, this.sorting);
    }

    pageChanged(event?: any): void {
        this.pageNumber = event.pageIndex;
        this.deafultPageSize = event.pageSize;
        this.getClientsGrid(this.clientFilter.value, this.selectedCountryIds, this.pageNumber, this.deafultPageSize, this.sorting);
    }

    sortChanged(event?: any): void {
        this.sorting = event.active.concat(' ', event.direction);
        this.getClientsGrid(this.clientFilter.value, this.selectedCountryIds, this.pageNumber, this.deafultPageSize, this.sorting);
    }

    navigateToClientDetails(clientId: number): void {
        this.router.navigate(['/main/clients', clientId]);
    }

    restoreWrongfullyDeleted(item: ClientListItemDto) {

    }

    openInHubspot(item: ClientListItemDto) {

    }

    openInCAM(item: ClientListItemDto) {

    }


}
