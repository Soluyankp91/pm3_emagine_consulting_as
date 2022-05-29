import { Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { takeUntil, debounceTime, switchMap, finalize, map } from 'rxjs/operators';
import { AppConsts } from 'src/shared/AppConsts';
import { ClientListItemDto, ClientsServiceProxy, EmployeeDto, EnumServiceProxy, LookupServiceProxy } from 'src/shared/service-proxies/service-proxies';
import { SelectableCountry, SelectableEmployeeDto, SelectableIdNameDto, StatusList } from './client.model';
import { AppComponentBase } from 'src/shared/app-component-base';

@Component({
    selector: 'app-client',
    templateUrl: './client.component.html',
    styleUrls: ['./client.component.scss']
})

export class ClientComponent extends AppComponentBase implements OnInit, OnDestroy {
    clientFilter = new FormControl();
    accountManagerFilter = new FormControl();
    clientsList: any[] = [];
    isDataLoading = false;
    countryList: SelectableCountry[] = [];
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

    nonActiveClient = false;
    isActiveClients = false;
    includeDeleted = false;
    // hardccoded as BE developers asked
    onlyWrongfullyDeletedInHubspot = false;

    clientDataSource: MatTableDataSource<ClientListItemDto> = new MatTableDataSource<ClientListItemDto>();
    private _unsubscribe = new Subject();
    constructor(
        injector: Injector,
        private router: Router,
        private _enumService: EnumServiceProxy,
        private _lookupService: LookupServiceProxy,
        private _clientService: ClientsServiceProxy
    ) {
        super(injector);
        this.clientFilter.valueChanges.pipe(
            takeUntil(this._unsubscribe),
            debounceTime(500)
        ).subscribe(() => {
            this.getClientsGrid();
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
        this.getClientsGrid();
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
        this.getClientsGrid();
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
        this._enumService.countries()
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
                this.countryList.unshift(
                    new SelectableCountry({
                        id: 0,
                        name: 'Unknown country',
                        selected: false,
                        flag: ''
                    })
                );
            });
    }

    getClientsGrid() {
        let searchFilter = this.clientFilter.value ? this.clientFilter.value : '';
        this.isDataLoading = true;
        let ownerIds = this.selectedAccountManagers.map(x => +x.id);
        let selectedCountryIds = this.selectedCountries.map(x => +x.id);
        this._clientService.list(searchFilter, selectedCountryIds, ownerIds, this.isActiveClients, !this.includeDeleted, this.onlyWrongfullyDeletedInHubspot, this.pageNumber, this.deafultPageSize, this.sorting)
            .pipe(finalize(() => {
                this.isDataLoading = false;
            }))
            .subscribe(result => {
                this.clientDataSource = new MatTableDataSource<ClientListItemDto>(result.items);
                this.totalCount = result.totalCount;
            });
    }

    pageChanged(event?: any): void {
        this.pageNumber = event.pageIndex === 0 ? 1 : event.pageIndex;
        this.deafultPageSize = event.pageSize;
        this.getClientsGrid();
    }

    sortChanged(event?: any): void {
        this.sorting = event.active.concat(' ', event.direction);
        this.getClientsGrid();
    }

    navigateToClientDetails(clientId: number): void {
        this.router.navigate(['/app/clients', clientId]);
    }

    restoreWrongfullyDeleted(item: ClientListItemDto) {

    }

    openInHubspot(item: ClientListItemDto) {

    }

    openInCAM(item: ClientListItemDto) {

    }


}
