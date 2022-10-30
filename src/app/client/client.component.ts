import { Component, Injector, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Observable, Subject, Subscription } from 'rxjs';
import { takeUntil, debounceTime, switchMap, finalize, map } from 'rxjs/operators';
import { AppConsts } from 'src/shared/AppConsts';
import { ClientListItemDto, ClientsServiceProxy, EmployeeDto, EmployeeServiceProxy, EnumServiceProxy, LookupServiceProxy } from 'src/shared/service-proxies/service-proxies';
import { SelectableCountry, SelectableEmployeeDto, SelectableIdNameDto, StatusList } from './client.model';
import { AppComponentBase } from 'src/shared/app-component-base';
import { LocalHttpService } from 'src/shared/service-proxies/local-http.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthenticationResult } from '@azure/msal-browser';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatAutocomplete, MatAutocompleteTrigger } from '@angular/material/autocomplete';

const ClientGridOptionsKey = 'ClientGridFILTERS.1.0.0.';
@Component({
    selector: 'app-client',
    templateUrl: './client.component.html',
    styleUrls: ['./client.component.scss']
})

export class ClientComponent extends AppComponentBase implements OnInit, OnDestroy {
    @ViewChild('rightMenuTrigger', {static: true}) matMenuTrigger: MatMenuTrigger;
    @ViewChild('managersTrigger', { read: MatAutocompleteTrigger }) managersTrigger: MatAutocompleteTrigger;
    @ViewChild('countriesTrigger', { read: MatAutocompleteTrigger }) countriesTrigger: MatAutocompleteTrigger;
    @ViewChild('countryAutocomplete') countryAutocomplete: MatAutocomplete;

    isManagersLoading: boolean;
    isCountriesLoading: boolean;

    menuTopLeftPosition =  {x: 0, y: 0}


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


    clientDisplayColumns = [
        'id',
        'name',
        'clientAddress_Country_Name',
        'clientAddress_City',
        'clientAddress_Address',
        'isActive',
        'owner_Name',
        'action'
    ];

    selectedAccountManagers: SelectableEmployeeDto[] = [];
    filteredAccountManagers: SelectableEmployeeDto[] = [];

    countryFilter = new FormControl(null);
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
    clientListSubscription: Subscription;

    private _unsubscribe = new Subject();
    constructor(
        injector: Injector,
        private router: Router,
        private _enumService: EnumServiceProxy,
        private _lookupService: LookupServiceProxy,
        private _clientService: ClientsServiceProxy,
        private httpClient: HttpClient,
        private localHttpService: LocalHttpService,
        private _employeeService: EmployeeServiceProxy
    ) {
        super(injector);
        this.clientFilter.valueChanges.pipe(
            takeUntil(this._unsubscribe),
            debounceTime(700)
        ).subscribe(() => {
            this.getClientsGrid(true);
        });


        this.accountManagerFilter.valueChanges.pipe(
            takeUntil(this._unsubscribe),
            debounceTime(500),
            switchMap((value: any) => {
                let toSend = {
                    name: value,
                    maxRecordsCount: 1000,
                    showAll: true,
                    excludeIds: this.selectedAccountManagers.map(x => +x.id)
                };
                if (value?.id) {
                    toSend.name = value.id
                        ? value.name
                        : value;
                }
                this.isManagersLoading = true;
                return this._lookupService.employees(toSend.name, toSend.showAll, toSend.excludeIds);
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
            this.isManagersLoading = false;
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
        this.getCurrentUser();
    }

    getCurrentUser() {
        this.isDataLoading = true;
        this.selectedAccountManagers = [];
        this._employeeService.current()
            .pipe(finalize(()=> {
                this.isDataLoading = false;
                this.getGridOptions();
            }))
            .subscribe(result => {
                this.selectedAccountManagers.push(
                    new SelectableEmployeeDto({
                        id: result.id!,
                        name: result.name!,
                        externalId: result.externalId!,
                        selected: true
                    })
                );
            });
    }

    private _filterCountries(value: string): SelectableCountry[] {
        const filterValue = value.toLowerCase();
        const noResults = new SelectableCountry({
            id: 'no-data',
            name: 'No countries found',
            code: '',
            flag: '',
            selected: false
        });
        const result = this.countryList.filter(option => option.name.toLowerCase().includes(filterValue)).filter(x => !this.selectedCountries.map(y => y.id).includes(x.id));
        this.countriesTrigger.updatePosition();
        if (value === '') {
            return this.countryList.filter(x => !this.selectedCountries.map(y => y.id).includes(x.id));
        } else {
            return result.length ? result : [noResults];
        }
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
        this.getClientsGrid(true);
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
        this.isCountriesLoading = true;

        this._enumService.countries()
            .pipe(finalize(() => {
                this.isCountriesLoading = false;
            }))
            .subscribe(result => {
                this.countryList = result.map(x => {
                    return new SelectableCountry({
                        id: x.id!,
                        name: x.name!,
                        code: x.code!,
                        selected: false,
                        flag: x.name!
                    });
                });
                this.countryList.unshift(
                    new SelectableCountry({
                        id: 0,
                        name: 'Unknown country',
                        selected: false,
                        code: '',
                        flag: ''
                    })
                );
            });
    }

    getClientsGrid(filterChanged?: boolean) {
        let searchFilter = this.clientFilter.value ? this.clientFilter.value : '';
        this.isDataLoading = true;
        let ownerIds = this.selectedAccountManagers?.map(x => +x.id);
        let selectedCountryIds = this.selectedCountries?.map(x => +x.id);
        let isActiveFlag;
        if ((this.isActiveClients && this.nonActiveClient) || (!this.isActiveClients && !this.nonActiveClient)) {
            isActiveFlag = undefined;
        } else {
            isActiveFlag = this.isActiveClients;
        }
        if (this.clientListSubscription) {
            this.clientListSubscription.unsubscribe();
        }
        if (filterChanged) {
            this.pageNumber = 1;
        }
        this.clientListSubscription = this._clientService.list(searchFilter, selectedCountryIds, ownerIds, isActiveFlag, !this.includeDeleted, this.onlyWrongfullyDeletedInHubspot, this.pageNumber, this.deafultPageSize, this.sorting)
            .pipe(finalize(() => {
                this.isDataLoading = false;
            }))
            .subscribe(result => {
                this.clientDataSource = new MatTableDataSource<ClientListItemDto>(result.items);
                this.totalCount = result.totalCount;
                this.saveGridOptions();
            });
    }

    pageChanged(event?: any): void {
        this.pageNumber = event.pageIndex + 1;
        this.deafultPageSize = event.pageSize;
        this.getClientsGrid();
    }

    sortChanged(event?: any): void {
        this.sorting = event.direction && event.direction.length ? event.active.concat(' ', event.direction) : '';
        this.getClientsGrid();
    }

    saveGridOptions() {
        let filters = {
            pageNumber: this.pageNumber,
            deafultPageSize: this.deafultPageSize,
            isActiveClients: this.isActiveClients,
            nonActiveClient: this.nonActiveClient,
            includeDeleted: this.includeDeleted,
            onlyWrongfullyDeletedInHubspot: this.onlyWrongfullyDeletedInHubspot,
            owners: this.selectedAccountManagers,
            selectedCountries: this.selectedCountries,
            searchFilter: this.clientFilter.value ? this.clientFilter.value : ''
        };

        localStorage.setItem(ClientGridOptionsKey, JSON.stringify(filters));
    }

    getGridOptions() {
        let filters = JSON.parse(localStorage.getItem(ClientGridOptionsKey)!);
        if (filters) {
            this.pageNumber = filters.pageNumber;
            this.deafultPageSize = filters.deafultPageSize;
            this.isActiveClients = filters.isActiveClients;
            this.nonActiveClient = filters.nonActiveClient;
            this.includeDeleted = filters.includeDeleted;
            this.onlyWrongfullyDeletedInHubspot = filters.onlyWrongfullyDeletedInHubspot;
            this.selectedAccountManagers = filters.owners?.length ? filters.owners : [];
            this.selectedCountries = filters.selectedCountries?.length ? filters.selectedCountries : [];
            this.clientFilter.setValue(filters.searchFilter, {emitEvent: false});
        }
        this.getClientsGrid();
    }

        /**
    * Method called when the user click with the right button
    * @param event MouseEvent, it contains the coordinates
    * @param item Our data contained in the row of the table
    */
    onRightClick(event: MouseEvent, item: any) {
        event.preventDefault();
        this.menuTopLeftPosition.x = event.clientX;
        this.menuTopLeftPosition.y = event.clientY;
        this.matMenuTrigger.menuData = { item: item }
        this.matMenuTrigger.openMenu();

    }
    openInNewTab(clientId: number) {
        const url = this.router.serializeUrl(
            this.router.createUrlTree([`/app/clients/${clientId}`])
        );
        window.open(url, '_blank');
    }


    navigateToClientDetails(clientId: number): void {
        this.router.navigate(['/app/clients', clientId]);
    }

    restoreWrongfullyDeleted(item: ClientListItemDto) {

    }

    openInHubspot(item: ClientListItemDto) {
        this.localHttpService.getTokenPromise().then((response: AuthenticationResult) => {
            this.httpClient.get(`${this.apiUrl}/api/Clients/${item.id!}/HubspotClientUrlAsync`, {
                    headers: new HttpHeaders({
                        'Authorization': `Bearer ${response.accessToken}`
                    }),
                    responseType: 'text'
                }).subscribe((result: any) => {
                    window.open(result, '_blank');
            })
        });
    }

    openInCAM(item: ClientListItemDto) {
        this.localHttpService.getTokenPromise().then((response: AuthenticationResult) => {
            this.httpClient.get(`${this.apiUrl}/api/Clients/${item.id!}/CamImpersonationUrl`, {
                    headers: new HttpHeaders({
                        'Authorization': `Bearer ${response.accessToken}`
                    }),
                    responseType: 'text'
                }).subscribe((result: any) => {
                    window.open(result, '_blank');
            })
        });
    }

    clearAllFilters() {
        this.clientFilter.setValue(null, {emitEvent: false});
        this.nonActiveClient = false;
        this.isActiveClients = false;
        this.includeDeleted = false;
        this.selectedCountries = [];
        this.countryList.map(x => x.selected = false);
        localStorage.removeItem(ClientGridOptionsKey);
        this.getCurrentUser();
    }

    openManagersMenu(event: any) {
        event.stopPropagation();
        this.managersTrigger.openPanel();
    }

    onManagersMenuOpened() {
        this.accountManagerFilter.setValue('');
        this.accountManagerFilter.markAsTouched();

    }

    openCountriesMenu(event: any) {
        event.stopPropagation();
        // this.countriesTrigger.openPanel();
    }

    onCountriesMenuOpened() {
        // workaround as panel position is wrongly calculated
        setTimeout(() => {
            this.countryFilter.setValue('');
            this.countryFilter.markAsTouched();
        }, 0);
    }

    displayNameFn(option: any) {
        return option?.name;
    }
}
