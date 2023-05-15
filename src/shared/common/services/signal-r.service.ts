import { Inject, Injectable, NgZone, Optional } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';
import { HubConnection } from '@microsoft/signalr';

import { IUpdateData } from './active-update-signalr.model';
import { environment } from '../../../environments/environment';
import { filter } from 'rxjs/operators';
import { AuthService } from 'src/app/login/auth.service';
import { API_BASE_URL, EmployeeDto } from 'src/shared/service-proxies/service-proxies';
import { EAgreementEvents, IAgreementEventData } from './agreement-events.model';
import { LocalHttpService } from 'src/shared/service-proxies/local-http.service';
import { MsalService } from '@azure/msal-angular';
import { InteractionRequiredAuthError, PublicClientApplication } from '@azure/msal-browser';

@Injectable({
	providedIn: 'root',
})
export class SignalRService {
	readonly hubUrl: string;
	connection: HubConnection;
	_triggerActiveReload$ = new BehaviorSubject<any>(null);
	_triggerAgreementUpdate$ = new BehaviorSubject<any>(null);

	get triggerActiveReload$() {
		return this._triggerActiveReload$.asObservable().pipe(filter(Boolean));
	}

	constructor(
		private _zone: NgZone,
		public _authService: AuthService,
        private __localHttpService: LocalHttpService,
		@Optional() @Inject(API_BASE_URL) baseUrl?: string,
	) {
		this.hubUrl = baseUrl + '/hubs/contracts-notification';
	}

	public async init() {
		try {
			this.connection = new signalR.HubConnectionBuilder()
				.withUrl(await this._activeUpdateURL())
				.withAutomaticReconnect(new Array(10).map((value, index) => index * 1000))
				.configureLogging(environment.isSignalRLoggingEnabled ? signalR.LogLevel.Information : signalR.LogLevel.None)
				.build();

			await this.connection.start();
			this._onConnection();

			this.connection.onreconnected((connectionId) => {
				if (environment.isSignalRLoggingEnabled) {
					console.log(`SignalR on reconnection success! connectionId: ${connectionId}`);
				}

				this._onConnection();
			});
			if (environment.isSignalRLoggingEnabled) {
				console.log(`SignalR connection success! connectionId: ${this.connection.connectionId}`);
			}
		} catch (error) {
			if (environment.isSignalRLoggingEnabled) {
				console.log(`SignalR connection error: ${error}`);
			}
		}
	}

	registerEventCallbacks(connection: HubConnection): void { }

	private async _activeUpdateURL() {
        let accessToken = (await this.__localHttpService.getTokenSilent().toPromise()).accessToken;
		return this.hubUrl + '?enc_auth_token=' + encodeURIComponent(accessToken);
	}

	private _onConnection(): void {
		this.registerEventCallbacks(this.connection);
	}
}
