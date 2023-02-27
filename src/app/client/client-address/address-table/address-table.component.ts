import { Overlay } from '@angular/cdk/overlay';
import { Component, EventEmitter, Injector, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { finalize } from 'rxjs/operators';
import { AppComponentBase } from 'src/shared/app-component-base';
import { MediumDialogConfig } from 'src/shared/dialog.configs';
import { ClientAddressDto, ClientAddressesServiceProxy } from 'src/shared/service-proxies/service-proxies';
import { AddAddressDialogComponent } from '../add-address-dialog/add-address-dialog.component';

@Component({
  selector: 'address-table',
  templateUrl: './address-table.component.html',
  styleUrls: ['./address-table.component.scss']
})
export class AddressTableComponent extends AppComponentBase implements OnInit {
    @Input() clientId: number;
    @Input() isDataLoading: boolean;
    @Input() dataSource: MatTableDataSource<ClientAddressDto>;
    @Input() hiddenAddresses: boolean;
    @Output() onGetTable = new EventEmitter();
    @Output() refreshTable = new EventEmitter<ClientAddressDto[]>();
    displayColumns = [
		'isMainAddress',
        'country',
        'streetAndNumber',
        'city',
        'isWorkplace',
        'isInvoice',
        'debitorNumber',
        'action',
	];
  constructor(
    injector: Injector,
    private _overlay: Overlay,
    private _dialog: MatDialog,
    private _clientAddressesService: ClientAddressesServiceProxy
  ) {
    super(injector);
  }

  ngOnInit(): void {
  }

  public sortChanged(event?: any): void {
    // this.sorting = event.direction && event.direction.length ? event.active.concat(' ', event.direction) : '';
    // this._getClientAddresses();
}

public addOrEditAddress(address?: ClientAddressDto) {
    const scrollStrategy = this._overlay.scrollStrategies.reposition();
    MediumDialogConfig.scrollStrategy = scrollStrategy;
    MediumDialogConfig.data = {
        address: address
    };
    const dialogRef = this._dialog.open(AddAddressDialogComponent, MediumDialogConfig);

    dialogRef.componentInstance.onConfirmed.subscribe((newAddress) => {
        if (address !== null && address !== undefined) {
            this._updateClientAddress(newAddress);
        } else {
            this._addNewClientAddress(newAddress);
        }
    });
}

editAddress(row: ClientAddressDto) {

}

toggleAddressHiddenState(row: ClientAddressDto) {
    row.isHidden = !row.isHidden;
    this._updateClientAddress(row);
}

deleteAddress(row: ClientAddressDto) {
    this.showMainSpinner();
    this._clientAddressesService.clientAddressesDELETE(row.id)
        .pipe(finalize(() => this.hideMainSpinner()))
        .subscribe();
}

private _updateClientAddress(address: any) {
    let input = new ClientAddressDto(address);
    if (address.country !== null && address.country !== undefined) {
        input.countryId = address.country?.id;
        input.countryCode = address.country?.code;
        input.countryName = address.country?.name;
    }
    this._clientAddressesService.clientAddressesPUT(input)
        .pipe(finalize(() => this.hideMainSpinner()))
        .subscribe(result => {
            this.refreshTable.emit(result);
        });
}

private _addNewClientAddress(address: any) {
    let input = new ClientAddressDto(address);
    input.countryId = address.country?.id;
    input.countryCode = address.country?.code;
    input.countryName = address.country?.name;
    this._clientAddressesService.clientAddressesPOST(this.clientId, input)
        .pipe(finalize(() => this.hideMainSpinner()))
        .subscribe(result => {
            this.refreshTable.emit(result);
        });
}

// private _fillAddressTable(addresses: ClientAddressDto[]) {
//     this.clientAddressData = new MatTableDataSource<ClientAddressDto>(addresses.filter(x => !x.isHidden));
//     this.hiddenClientAddressData = new MatTableDataSource<ClientAddressDto>(addresses.filter(x => x.isHidden));
// }

}
