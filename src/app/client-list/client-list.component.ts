import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, switchMap } from 'rxjs/operators';
import { ApiServiceProxy, ClientListItemDto, ClientsServiceProxy, IClientListItemDto } from 'src/shared/service-proxies/service-proxies';

const ClientDataSource: IClientListItemDto[] = [
    {
        name: 'Test 1',
        clientAddress_Address: 'Address 1',
        clientAddress_Address2: 'Address 2',
        clientAddress_PostCode: 'DK-5953',
        clientAddress_City: 'Lviv',
        clientAddress_Country_Name: 'Ukraine',
        clientAddress_Country_Code: 'UA',
        phone: '+54 431 881 75 42',
        owner_Name: 'Martha Marikel',
        id: 1,
        crmClientId: 11,
        legacyClientId: 111,
        tenant_TenantId_Value: 1111
    },
    {
        name: 'Test 2',
        clientAddress_Address: 'Address 12',
        clientAddress_Address2: 'Address 22',
        clientAddress_PostCode: 'DK-5953',
        clientAddress_City: 'Lviv',
        clientAddress_Country_Name: 'Ukraine',
        clientAddress_Country_Code: 'UA',
        phone: '+54 431 881 75 42',
        owner_Name: 'Martha Marikel',
        id: 2,
        crmClientId: 2,
        legacyClientId: 222,
        tenant_TenantId_Value: 2222
    }
];
@Component({
    selector: 'app-client-list',
    templateUrl: './client-list.component.html',
    styleUrls: ['./client-list.component.scss']
})

export class ClientListComponent implements OnInit, OnDestroy {
    clientFilter = new FormControl();
    acoountManagerFilter = new FormControl();
    clientsList: any[] = [];

    clientDisplayColumns = [
        'name',
        'clientAddress_Address',
        'clientAddress_Address2',
        'clientAddress_PostCode',
        'clientAddress_City',
        'clientAddress_Country_Name',
        'phone',
        'owner_Name'
    ];

    // clientDataSource: MatTableDataSource<ClientListItemDto> = new MatTableDataSource<ClientListItemDto>();
    clientDataSource: MatTableDataSource<IClientListItemDto> = new MatTableDataSource<IClientListItemDto>(ClientDataSource);
    private _unsubscribe = new Subject();
    constructor(
      private _clientService: ClientsServiceProxy,
      private _apiService: ApiServiceProxy
    ) {
      this.clientFilter.valueChanges.pipe(
        takeUntil(this._unsubscribe),
        debounceTime(300),
        switchMap((value: any) => {
          let input = value ? value : '';
          return this._apiService.clients(input, ['dk'], 0, 10, 'name asc');
        }),
      ).subscribe((list: any) => {
        if (list.length) {
          this.clientsList = list;
        } else {
          this.clientsList = [];
        }
      });
      this.acoountManagerFilter.valueChanges.pipe(
        takeUntil(this._unsubscribe),
        debounceTime(300),
        switchMap((value: any) => {
          let input = value ? value : '';
          return this._apiService.clients(input, ['dk'], 0, 10, 'name asc');
        }),
      ).subscribe((list: any) => {
        if (list.length) {
          this.clientsList = list;
        } else {
          this.clientsList = [];
        }
      });
    }

    ngOnInit(): void {
    }

    ngOnDestroy(): void {
      this._unsubscribe.next();
      this._unsubscribe.complete();
    }

}
