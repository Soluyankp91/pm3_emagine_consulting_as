import { Component, Injector, OnInit } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { DataShowOnInvoceOptions, EDataShownOnInvoce } from './client-invoicing.model';
import { ClientsServiceProxy, ConsultantShownOnClientInvoiceAs } from 'src/shared/service-proxies/service-proxies';
import { AppComponentBase } from 'src/shared/app-component-base';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
	selector: 'app-client-invoicing',
	templateUrl: './client-invoicing.component.html',
})
export class ClientInvoicingComponent extends AppComponentBase implements OnInit {
	invoicingDataShown = new UntypedFormControl(EDataShownOnInvoce.ConsultantName);
    dataShowOnInvoceOptions = DataShowOnInvoceOptions;
    consultantShownOnClientInvoiceAs: { [key: string]: string };
    clientId: number;
    private _unsubscribe = new Subject();
	constructor(
        injector: Injector,
        private readonly _clientService: ClientsServiceProxy,
        private _activatedRoute: ActivatedRoute
    ) {
        super(injector);
    }

    ngOnInit(): void {
        this.consultantShownOnClientInvoiceAs = this.getStaticEnumValue('consultantShownOnClientInvoiceAs');
        this._activatedRoute.parent!.paramMap.pipe(
            takeUntil(this._unsubscribe)
        ).subscribe(params => {
            this.clientId = +params.get('id')!;
            // this.get
        });
        console.log(this.consultantShownOnClientInvoiceAs);
        // this._clientService.invoicingSettings(this.clientId)
        //     .subscribe(result => {
        //         this.invoicingDataShown.setValue(EDataShownOnInvoce[result]);
        //     })
    }

	onControlChange(value: ConsultantShownOnClientInvoiceAs) {
        this._clientService.invoicingSettings(this.clientId, value)
            .subscribe();
    }
}
