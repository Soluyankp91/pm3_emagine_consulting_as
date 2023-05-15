import { Inject, Injectable, NgZone, Optional } from '@angular/core';
import { HubConnection } from '@microsoft/signalr';
import { random } from 'lodash';
import { environment } from '../../../environments/environment';
import { SignalRService } from './signal-r.service';
import { AuthService } from 'src/app/login/auth.service';
import { API_BASE_URL } from 'src/shared/service-proxies/service-proxies';
import { EAgreementEvents } from './agreement-events.model';
import { LocalHttpService } from 'src/shared/service-proxies/local-http.service';


const DEFAULT_DELAY_IN_MS = 2000;

@Injectable({ providedIn: 'root' })
export class ActiveUpdateSignalRApiService extends SignalRService {
	get userName(): string {
		return 'this._userService.sessionUser.name';
	}

	constructor(
		_zone: NgZone,
		_authService: AuthService,
        __localHttpService: LocalHttpService,
		@Optional() @Inject(API_BASE_URL) baseUrl?: string,
	) {
		super(_zone, _authService, __localHttpService, baseUrl);
	}

	registerEventCallbacks(connection: HubConnection): void {
        connection.on(EAgreementEvents.InEditState, (agreementId) => {
            console.log(agreementId);
            this.triggerActiveReload(
                EAgreementEvents.InEditState,
                EAgreementEvents.InEditState,
                agreementId
            );
        });
        connection.on(EAgreementEvents.PeriodAgreementCreationPendingState, (periodId: string) => {
            console.log(periodId);
        });
	}

	private triggerActiveReload(callbackMethodName: string, eventName: string, args?: any) {
		const delayinMs = random(0, DEFAULT_DELAY_IN_MS);
		if (environment.isSignalRLoggingEnabled) {
			console.log(`Received "${callbackMethodName}", update delayed ${delayinMs} [ms] args ${JSON.stringify(args)}`);
		}
		setTimeout(() => this._triggerActiveReload$.next({ eventName, args }), delayinMs);
	}
}
