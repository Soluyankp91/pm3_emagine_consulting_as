import { Component, OnInit } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { DataShowOnInvoceOptions, EDataShownOnInvoce } from './client-invoicing.model';
import { ClientsServiceProxy } from 'src/shared/service-proxies/service-proxies';

@Component({
	selector: 'app-client-invoicing',
	templateUrl: './client-invoicing.component.html',
})
export class ClientInvoicingComponent implements OnInit {
	invoicingDataShown = new UntypedFormControl(EDataShownOnInvoce.ConsultantName);
    dataShowOnInvoceOptions = DataShowOnInvoceOptions;
	constructor(
        private readonly _clientService: ClientsServiceProxy
    ) {}

    ngOnInit(): void {
        // this._clientService.dataShownOnInvoicingGET()
        //     .subscribe(result => {
        //         this.invoicingDataShown.setValue(EDataShownOnInvoce[result]);
        //     })
    }

	onControlChange(value: EDataShownOnInvoce) {
        // this._clientService.dataShownOnInvoicingPUT(value)
        //     .subscribe();
    }
}
