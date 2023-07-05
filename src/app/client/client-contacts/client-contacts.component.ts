import { Component, Injector, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormControl } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { AppComponentBase } from 'src/shared/app-component-base';
import { AppConsts } from 'src/shared/AppConsts';
import { ClientAddressDto, ClientAddressesServiceProxy, ClientsServiceProxy, ContactDto } from 'src/shared/service-proxies/service-proxies';
import { ClientContactForm } from './client-contacts.model';
import { MatPaginator } from '@angular/material/paginator';

@Component({
    selector: 'app-client-contacts',
    templateUrl: './client-contacts.component.html',
    styleUrls: ['./client-contacts.component.scss']
})
export class ClientContactsComponent extends AppComponentBase implements OnInit, OnDestroy {
    @ViewChild('contactsPaginator', {static: false}) paginator: MatPaginator;

    clientId: number;
    isDataLoading = false;
    selectedCountries: string[] = [];
    pageNumber = 0;
    deafultPageSize = AppConsts.grid.defaultPageSize;
    pageSizeOptions = [5, 10, 20, 50, 100];
    totalCount: number | undefined = 0;
    sorting = '';

    clientDisplayColumns = [
        'id',
        'status',
        'name',
        'title',
        'email',
        'phone',
        'address',
        'lastCamLogin',
        'owner'
    ];
    clientAddresses: ClientAddressDto[];
    clientContactForm: ClientContactForm;
    clientContactsDataSource: MatTableDataSource<ContactDto> = new MatTableDataSource<ContactDto>();
    clientContacts: ContactDto[];
    private _unsubscribe = new Subject();
    constructor(
        injector: Injector,
        private _clientService: ClientsServiceProxy,
        private activatedRoute: ActivatedRoute,
        private _fb: UntypedFormBuilder,
        private _clientAddressesService: ClientAddressesServiceProxy
    ) {
        super(injector);
        this.clientContactForm = new ClientContactForm();
    }

    ngOnInit(): void {
        this.activatedRoute.parent!.paramMap.pipe(
            takeUntil(this._unsubscribe)
        ).subscribe(params => {
            this.clientId = +params.get('id')!;
            this._getClientAddresses();
            this.getClientContacts();
        });
    }

    ngOnDestroy(): void {
        this._unsubscribe.next();
        this._unsubscribe.complete();
    }

    getClientContacts() {
        this.isDataLoading = true;
        this._clientService.contacts(this.clientId, false)
            .pipe(finalize(() => {
                this.isDataLoading = false;
            }))
            .subscribe(result => {
                this.clientContacts = result;
                this.fillContactForm();
            });
    }

    pageChanged(event?: any): void {
        this.pageNumber = event.pageIndex;
        this.deafultPageSize = event.pageSize;
        this.fillContactForm();
    }

    sortChanged(event?: any): void {
        this.sorting = event.direction && event.direction.length ? event.active.concat(' ', event.direction) : '';
        this.getClientContacts();
    }

    mapArrayByName(list: any): string {
        if (list?.length) {
            return list.map((x: any) => x.country?.name + ' ' + x?.city?.name).join(', ');
        } else {
            return '-';
        }
    }

    private _getClientAddresses() {
        this._clientAddressesService.clientAddressesGET(this.clientId)
            .subscribe(result => {
                this.clientAddresses = result;
            })
    }

    fillContactForm() {
        let nextPageData: ContactDto[] = [];
        nextPageData = this.clientContacts.slice((this.paginator.pageSize * this.paginator.pageIndex),(this.paginator.pageSize * (this.paginator.pageIndex + 1)));
        this.addresses.controls = [];
        nextPageData.forEach(row => {
            this.addClientAddress(row.clientAddress);
        });
        this.clientContactsDataSource.data = nextPageData;
        this.totalCount = this.clientContacts.length;
    }

    addClientAddress(address: ClientAddressDto) {
        const form = this._fb.group({
            address: new UntypedFormControl(address?.id)
        })
        this.addresses.push(form);
    }

    selectContactAddress(event: MatSelectChange, row: ContactDto) {
        this.showMainSpinner();
        this._clientService.contactAddress(row.id, event.value)
            .pipe(finalize(() => this.hideMainSpinner()))
            .subscribe();
    }

    get addresses(): UntypedFormArray {
        return this.clientContactForm.get('addresses') as UntypedFormArray;
    }
}
