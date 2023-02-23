import { Overlay } from '@angular/cdk/overlay';
import { Component, OnInit, Injector } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { AppComponentBase } from 'src/shared/app-component-base';
import { AppConsts } from 'src/shared/AppConsts';
import { MediumDialogConfig } from 'src/shared/dialog.configs';
import { ClientsServiceProxy, ContactDto } from 'src/shared/service-proxies/service-proxies';
import { AddAddressDialogComponent } from './add-address-dialog/add-address-dialog.component';
import { IClientAddress } from './client-address.model';

@Component({
	selector: 'app-client-address',
	templateUrl: './client-address.component.html',
	styleUrls: ['./client-address.component.scss'],
})
export class ClientAddressComponent extends AppComponentBase implements OnInit {
	clientId: number;
	isDataLoading = false;
	pageNumber = 1;
	deafultPageSize = AppConsts.grid.defaultPageSize;
	pageSizeOptions = [5, 10, 20, 50, 100];
	totalCount: number = 0;
	sorting = '';

	clientDisplayColumns = [
		'isMainAddress',
        'country',
        'streetAndNumber',
        'city',
        'isWorkplace',
        'isInvoice',
        'debitorNumber',
        'action',
	];
	clientAddressData: MatTableDataSource<IClientAddress>;
	private _unsubscribe = new Subject();
	constructor(
		injector: Injector,
		private _clientService: ClientsServiceProxy,
		private _activatedRoute: ActivatedRoute,
		private _overlay: Overlay,
		private _dialog: MatDialog
	) {
		super(injector);
	}

	ngOnInit(): void {
		this._activatedRoute.parent!.paramMap.pipe(takeUntil(this._unsubscribe)).subscribe((params) => {
			this.clientId = +params.get('id')!;
			this._getClientAddresses();
		});
	}

	private _getClientAddresses() {
		this.isDataLoading = true;
		this._clientService
			.contacts(this.clientId)
			.pipe(finalize(() => (this.isDataLoading = false)))
			.subscribe((result) => {
				let mappedData: IClientAddress[] = result.map((x: any) => {
					return {
                        isMainAddress: x.isMainAddress,
						address: x.address,
                        address2: x.address2,
                        postCode: x.postCode,
						country: x.country,
						city: x.city,
                        region: x.region,
						isWorkplaceAddress: x.isWorkplaceAddress,
						isInvoiceAddress: x.isInvoiceAddress,
						debtorNumberForInvoiceAddress: x.debtorNumberForInvoiceAddress,
						isHidden: x.isHidden,
					};
				});
				this.clientAddressData = new MatTableDataSource<IClientAddress>(mappedData);
			});
	}

	public pageChanged(event?: any): void {
		this.pageNumber = event.pageIndex + 1;
		this.deafultPageSize = event.pageSize;
		this._getClientAddresses();
	}

	public sortChanged(event?: any): void {
		this.sorting = event.direction && event.direction.length ? event.active.concat(' ', event.direction) : '';
		this._getClientAddresses();
	}

	public addAddress() {
		const scrollStrategy = this._overlay.scrollStrategies.reposition();
		MediumDialogConfig.scrollStrategy = scrollStrategy;
		// MediumDialogConfig.data = {

		// };
		const dialogRef = this._dialog.open(AddAddressDialogComponent, MediumDialogConfig);

		dialogRef.componentInstance.onConfirmed.subscribe((projectLine) => {
			// confirmed
		});
	}

    editAddress(row: any) {

    }

    toggleAddressHiddenState(row: any) {

    }

    deleteAddress(row: any) {

    }
}
