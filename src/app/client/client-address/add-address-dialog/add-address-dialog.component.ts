import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { CountryDto, EnumServiceProxy } from 'src/shared/service-proxies/service-proxies';
import { ClientAddressForm } from './add-address-dialog.model';

@Component({
	selector: 'app-add-address-dialog',
	templateUrl: './add-address-dialog.component.html',
	styleUrls: ['./add-address-dialog.component.scss'],
})
export class AddAddressDialogComponent implements OnInit {
	@Output() onConfirmed: EventEmitter<any> = new EventEmitter<any>();
	@Output() onRejected: EventEmitter<any> = new EventEmitter<any>();
	clientAddressForm: ClientAddressForm;
	countries: CountryDto[];
	constructor(private _enumService: EnumServiceProxy, private _dialogRef: MatDialogRef<AddAddressDialogComponent>) {
		this.clientAddressForm = new ClientAddressForm();
	}

	ngOnInit(): void {
		this._getCountries();
	}

	public close() {
		this._closeInternal();
	}

	private _getCountries() {
		this._enumService.countries().subscribe((result) => (this.countries = result));
	}

	private _closeInternal(): void {
		this._dialogRef.close();
	}

	public reject() {}
	public confirm() {}
}
