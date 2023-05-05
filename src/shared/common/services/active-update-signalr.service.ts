import { Inject, Injectable, NgZone, Optional } from '@angular/core';
import { HubConnection } from '@microsoft/signalr';
import {
	EActionTypes,
	EActiveReloadCallbackMethodNames,
	EActiveReloadEventNames,
	EActiveReloadMethodNames,
	SignalRArgs,
} from './active-update-signalr.model';
import { random } from 'lodash';
import { environment } from '../../../environments/environment';
import { SignalRService } from './signal-r.service';
import { AuthService } from 'src/app/login/auth.service';
import { API_BASE_URL } from 'src/shared/service-proxies/service-proxies';


const DEFAULT_DELAY_IN_MS = 2000;

@Injectable({ providedIn: 'root' })
export class ActiveUpdateSignalRApiService extends SignalRService {
	get userName(): string {
		return 'this._userService.sessionUser.name';
	}

	constructor(
		_zone: NgZone,
		_authService: AuthService,
		// private _userService: UserService,
		@Optional() @Inject(API_BASE_URL) baseUrl?: string,
	) {
		super(_zone, _authService, baseUrl);
	}

	updateCallBulkItems(requestId: number, consultantsIds: number[]) {
		if (environment.isSignalRLoggingEnabled) {
			console.log(EActiveReloadMethodNames.NotifyAgreementEditing, requestId, this.userName, consultantsIds);
		}
		this.connection?.invoke(EActiveReloadMethodNames.NotifyAgreementEditing, requestId, this.userName, consultantsIds);
	}

	registerEventCallbacks(connection: HubConnection): void {
		connection.on(EActiveReloadCallbackMethodNames.NotifyAgreementEditing, (args) => {
			const [authorName] = args || [];

			this.triggerActiveReload(
				EActiveReloadCallbackMethodNames.NotifyAgreementEditing,
				EActiveReloadEventNames.AgreementEditing,
				{ authorName },
			);
		});
	}

	private triggerActiveReload(callbackMethodName: string, eventName: EActiveReloadEventNames, args?: SignalRArgs) {
		const delayinMs = random(0, DEFAULT_DELAY_IN_MS);
		if (environment.isSignalRLoggingEnabled) {
			console.log(`Received "${callbackMethodName}", update delayed ${delayinMs} [ms] args ${JSON.stringify(args)}`);
		}
		setTimeout(() => this._triggerActiveReload$.next({ eventName, args }), delayinMs);
	}
}
