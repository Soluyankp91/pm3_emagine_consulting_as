import { Injectable } from '@angular/core';
import { Subject, Observable, ReplaySubject } from 'rxjs';
import { LegalEntityDto } from 'src/shared/service-proxies/service-proxies';

@Injectable()
export class CreationTitleService {
	private _tenants$$ = new Subject<(LegalEntityDto & { code: string })[]>();
	private _templateName$$ = new ReplaySubject(1);
	private _receiveAgreementsFromOtherParty$$ = new Subject<boolean>();

	get templateName$() {
		return this._templateName$$.asObservable() as Observable<string>;
	}

	get tenants$() {
		return this._tenants$$.asObservable();
	}

	get alwaysReceiveFromOtherParty$() {
		return this._receiveAgreementsFromOtherParty$$.asObservable();
	}

	updateTemplateName(name: string) {
		this._templateName$$.next(name);
	}

	updateTenants(tenants: (LegalEntityDto & { code: string })[]) {
		this._tenants$$.next(tenants);
	}

	updateReceiveAgreementsFromOtherParty(alwaysReceiveFromOtherParty: boolean) {
		this._receiveAgreementsFromOtherParty$$.next(alwaysReceiveFromOtherParty);
	}
}
