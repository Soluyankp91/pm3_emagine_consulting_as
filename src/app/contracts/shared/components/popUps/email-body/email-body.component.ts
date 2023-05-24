import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AgreementServiceProxy, TemplateListItem } from 'src/shared/service-proxies/service-proxies';

@Component({
	selector: 'app-email-body',
	templateUrl: './email-body.component.html',
	styleUrls: ['./email-body.component.scss'],
})
export class EmailBodyComponent implements OnInit, OnDestroy {
	emailTemplates$: Observable<TemplateListItem[]>;

	templateControl = new FormControl(null);
	emailBodyControl = new FormControl(null);

	private _unsubscribe$ = new Subject();

	constructor(private readonly _agreementServiceProxy: AgreementServiceProxy) {}

	ngOnInit(): void {
		this.emailTemplates$ = this._agreementServiceProxy.docusignEnvelopeEmailTemplates();
		this._subscribeOnFormControl();
	}

	private _subscribeOnFormControl() {
		this.templateControl.valueChanges.pipe(takeUntil(this._unsubscribe$)).subscribe((template: TemplateListItem) => {
			this.emailBodyControl.setValue(template.emailBody);
		});
	}

	ngOnDestroy(): void {
		this._unsubscribe$.next();
		this._unsubscribe$.complete();
	}
}
