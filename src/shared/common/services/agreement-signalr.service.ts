import { Inject, Injectable, NgZone, Optional } from '@angular/core';
import { HubConnection } from '@microsoft/signalr';
import { random } from 'lodash';
import { environment } from '../../../environments/environment';
import { SignalRService } from './signal-r.service';
import { API_BASE_URL, EmployeeDto } from 'src/shared/service-proxies/service-proxies';
import { AgreementSignalRArgs, EAgreementEvents } from './agreement-signalr.model';
import { LocalHttpService } from 'src/shared/service-proxies/local-http.service';


const DEFAULT_DELAY_IN_MS = 2000;

@Injectable({ providedIn: 'root' })
export class AgreementSignalRApiService extends SignalRService {
	constructor(
		_zone: NgZone,
        __localHttpService: LocalHttpService,
		@Optional() @Inject(API_BASE_URL) baseUrl?: string,
	) {
		super(_zone, __localHttpService, baseUrl);
	}

	registerEventCallbacks(connection: HubConnection): void {
        connection.on(EAgreementEvents.InEditState, (agreementId: number, employees: EmployeeDto[]) => {
            this.triggerAgreementChange(
                EAgreementEvents.InEditState,
                {agreementId: agreementId, employees: employees}
            );
        });
        connection.on(EAgreementEvents.PeriodAgreementCreationPendingState, (periodId: string, employees: EmployeeDto[]) => {
            this.triggerAgreementChange(
                EAgreementEvents.PeriodAgreementCreationPendingState,
                {periodId: periodId, employees: employees}
            );
        });
	}

	private triggerAgreementChange(eventName: EAgreementEvents, args?: AgreementSignalRArgs) {
		const delayinMs = random(0, DEFAULT_DELAY_IN_MS);
		if (environment.isSignalRLoggingEnabled) {
			console.log(`Received "${eventName}", update delayed ${delayinMs} [ms] args ${JSON.stringify(args)}`);
		}
		setTimeout(() => this._triggerAgreementState$.next({ eventName, args }), delayinMs);
	}
}
