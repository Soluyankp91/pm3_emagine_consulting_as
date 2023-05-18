import { Component, Injector, OnInit } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { ClientsServiceProxy, ConsultantShownOnClientInvoiceAs } from 'src/shared/service-proxies/service-proxies';
import { AppComponentBase, NotifySeverity } from 'src/shared/app-component-base';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';

@Component({
	selector: 'app-client-invoicing',
	templateUrl: './client-invoicing.component.html',
})
export class ClientInvoicingComponent extends AppComponentBase implements OnInit {
	invoicingDataShown = new UntypedFormControl();
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
		this._activatedRoute
			.parent!.paramMap.pipe(
				takeUntil(this._unsubscribe),
				switchMap((params) => {
					this.clientId = +params.get('id');
					return this._clientService.clients(this.clientId);
				})
			)
			.subscribe((value) => {
				this.invoicingDataShown.setValue(value.consultantShownOnClientInvoiceAs, { emitEvent: false });
			});
	}

	onControlChange(value: ConsultantShownOnClientInvoiceAs) {
		this._clientService
			.invoicingSettings(this.clientId, value)
			.subscribe(() => this.showNotify(NotifySeverity.Success, 'Consultant data shown on invoice updated.'));
	}
}
