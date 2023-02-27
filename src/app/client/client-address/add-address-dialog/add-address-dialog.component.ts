import { Component, EventEmitter, Inject, Injector, OnInit, Output } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AppComponentBase } from 'src/shared/app-component-base';
import { ClientAddressDto, CountryDto, EnumServiceProxy } from 'src/shared/service-proxies/service-proxies';
import { ClientAddressForm } from './add-address-dialog.model';

@Component({
	selector: 'app-add-address-dialog',
	templateUrl: './add-address-dialog.component.html',
	styleUrls: ['./add-address-dialog.component.scss'],
})
export class AddAddressDialogComponent extends AppComponentBase implements OnInit {
	@Output() onConfirmed: EventEmitter<any> = new EventEmitter<any>();
	@Output() onRejected: EventEmitter<any> = new EventEmitter<any>();
	clientAddressForm: ClientAddressForm;
	countries: CountryDto[];
	wasMainAddress: boolean;
	constructor(
		injector: Injector,
		@Inject(MAT_DIALOG_DATA)
		public data: {
			address: ClientAddressDto;
		},
		private _enumService: EnumServiceProxy,
		private _dialogRef: MatDialogRef<AddAddressDialogComponent>
	) {
		super(injector);
		if (data?.address) {
			this.wasMainAddress = data.address.isMainAddress;
		}
		this.clientAddressForm = new ClientAddressForm(data?.address);
	}

	ngOnInit(): void {
		this._getCountries();
	}

	public close() {
		this._closeInternal();
	}

	public reject() {
		this._closeInternal();
	}

	public confirm() {
		this.onConfirmed.emit(this.clientAddressForm.value);
		this._closeInternal();
	}

	private _getCountries() {
		this._enumService.countries().subscribe((result) => (this.countries = result));
	}

	private _closeInternal(): void {
		this._dialogRef.close();
	}
}
