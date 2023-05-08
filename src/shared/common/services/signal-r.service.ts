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
import { InteractionRequiredAuthError } from '@azure/msal-browser';

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
	private _groupJoinedBeforeReconnect: string[] = [];

	constructor(
		private _zone: NgZone,
		public _authService: AuthService,
		@Optional() @Inject(API_BASE_URL) baseUrl?: string,
	) {
		this.hubUrl = baseUrl + '/hubs/contracts-notification';
	}

	public async init() {
		try {
			this.connection = new signalR.HubConnectionBuilder()
				.withUrl(this._activeUpdateURL())
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

	registerEventCallbacks(connection: HubConnection): void {
        console.log('reg');
        // connection.on(EAgreementEvents.InEditState, (data: any) => {
        //     console.log(data);
        //     this._triggerActiveReload$.next(data);
        // });
        // connection.on(EAgreementEvents.PeriodAgreementCreationPendingState, (data: EmployeeDto) => {
        //     console.log(data);
        // });
    }

    testInvoke() {
        const agreementId = 24;
        this.connection.invoke(EAgreementEvents.InEditState, agreementId)
    }

	// joinGroups(groupIds: string[]) {
	// 	this._zone.runOutsideAngular(() => {
	// 		this._groupJoinedBeforeReconnect = groupIds;
	// 		if (!this.connection) {
	// 			return;
	// 		}

	// 		this.connection?.invoke('JoinGroups', groupIds);
	// 		if (environment.isSignalRLoggingEnabled) {
	// 			console.log(`Joining group '${groupIds}'`);
	// 		}
	// 	});
	// }

	// leaveGroups(groupIds: string[]) {
	// 	this._zone.runOutsideAngular(() => {
	// 		this._groupJoinedBeforeReconnect = [];
	// 		if (!this.connection) {
	// 			return;
	// 		}

	// 		this.connection?.invoke('LeaveGroups', groupIds);
	// 		if (environment.isSignalRLoggingEnabled) {
	// 			console.log(`Leaving groups '${groupIds}'`);
	// 		}
	// 	});
	// }

	private _activeUpdateURL(): string {
		return this.hubUrl + '?enc_auth_token=' + encodeURIComponent(this._authService.encryptedAccessToken);
	}

	private _onConnection(): void {
		this.registerEventCallbacks(this.connection);
		// if (this._groupJoinedBeforeReconnect && this._groupJoinedBeforeReconnect.length > 0) {
		// 	this.joinGroups(this._groupJoinedBeforeReconnect);
		// }
	}

    private _triggerAgreementUpdateEvent() {

    }
}
