import { Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { AppComponentBase } from 'src/shared/app-component-base';
import { AppConsts } from 'src/shared/AppConsts';
import { ClientsServiceProxy, ContactDto } from 'src/shared/service-proxies/service-proxies';

@Component({
    selector: 'app-client-contacts',
    templateUrl: './client-contacts.component.html',
    styleUrls: ['./client-contacts.component.scss']
})
export class ClientContactsComponent extends AppComponentBase implements OnInit, OnDestroy {
    clientId: number;
    isDataLoading = false;
    selectedCountries: string[] = [];
    pageNumber = 1;
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
        'lastCamLogin',
        'owner'
    ];
    clientContactsDataSource: MatTableDataSource<ContactDto> = new MatTableDataSource<ContactDto>();

    private _unsubscribe = new Subject();
    constructor(
        injector: Injector,
        private _clientService: ClientsServiceProxy,
        private activatedRoute: ActivatedRoute
    ) {
        super(injector);
    }

    ngOnInit(): void {
        this.activatedRoute.parent!.paramMap.pipe(
            takeUntil(this._unsubscribe)
        ).subscribe(params => {
            this.clientId = +params.get('id')!;
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
                    this.clientContactsDataSource = new MatTableDataSource<ContactDto>(result);
                    this.totalCount = result.length;
                });
    }

    pageChanged(event?: any): void {
        this.pageNumber = event.pageIndex + 1;
        this.deafultPageSize = event.pageSize;
        this.getClientContacts();
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

    detectStatusColor(statusValue: number) {
        switch (statusValue) {
            case 1:
                return 'deleted-status';
            case 2:
                return 'active-status';
            case 3:
                return 'inactive-status';
            default:
                return '';
        }
    }
}
