import { Overlay } from '@angular/cdk/overlay';
import { Component, OnInit, Injector } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { AppComponentBase } from 'src/shared/app-component-base';
import { MediumDialogConfig } from 'src/shared/dialog.configs';
import { ClientAddressDto, ClientAddressesServiceProxy } from 'src/shared/service-proxies/service-proxies';
import { AddAddressDialogComponent } from './add-address-dialog/add-address-dialog.component';

@Component({
	selector: 'app-client-address',
	templateUrl: './client-address.component.html',
	styleUrls: ['./client-address.component.scss'],
})
export class ClientAddressComponent extends AppComponentBase implements OnInit {
	clientId: number;
	isDataLoading = false;
	showHidden = false;

	clientAddressData: MatTableDataSource<ClientAddressDto>;
	hiddenClientAddressData: MatTableDataSource<ClientAddressDto>;
	private _unsubscribe = new Subject();
	constructor(
		injector: Injector,
		private _clientAddressesService: ClientAddressesServiceProxy,
		private _activatedRoute: ActivatedRoute,
		private _overlay: Overlay,
		private _dialog: MatDialog
	) {
		super(injector);
	}

	ngOnInit(): void {
		this._activatedRoute.parent!.paramMap.pipe(takeUntil(this._unsubscribe)).subscribe((params) => {
			this.clientId = +params.get('id')!;
			this.getClientAddresses();
		});
	}

	getClientAddresses() {
		this.isDataLoading = true;
		this._clientAddressesService
			.clientAddressesGET(this.clientId)
			.pipe(finalize(() => (this.isDataLoading = false)))
			.subscribe((result) => {
				this.fillAddressTable(result);
			});
	}

	public addAddress() {
		const scrollStrategy = this._overlay.scrollStrategies.reposition();
		MediumDialogConfig.scrollStrategy = scrollStrategy;
		const dialogRef = this._dialog.open(AddAddressDialogComponent, MediumDialogConfig);

		dialogRef.componentInstance.onConfirmed.subscribe((newAddress) => {
			this._addNewClientAddress(newAddress);
		});
	}

	fillAddressTable(addresses: ClientAddressDto[]) {
		this.clientAddressData = new MatTableDataSource<ClientAddressDto>(addresses.filter((x) => !x.isHidden));
		this.hiddenClientAddressData = new MatTableDataSource<ClientAddressDto>(addresses.filter((x) => x.isHidden));
	}

	private _addNewClientAddress(address: any) {
		this.showMainSpinner();
		let input = new ClientAddressDto(address);
		input.countryId = address.country?.id;
		input.countryCode = address.country?.code;
		input.countryName = address.country?.name;
		this._clientAddressesService
			.clientAddressesPOST(this.clientId, input)
			.pipe(finalize(() => this.hideMainSpinner()))
			.subscribe((result) => {
				this.fillAddressTable(result);
			});
	}
}
