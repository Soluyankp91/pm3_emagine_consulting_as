import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { interval, Observable, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

import { environment } from 'src/environments/environment';
import { manualErrorHandlerEnabledContextCreator } from 'src/shared/service-proxies/http-context-tokens';

@Injectable()
export class EditorObserverService {
	private readonly baseUrl = `${environment.apiUrl}/api`;
	private readonly intervalSeconds = 15 * 1000;

	constructor(private _httpClient: HttpClient, private _snackBar: MatSnackBar) {}

	runAgreementEditModeNotifier(agreementId: number) {
		const endpoint = `${this.baseUrl}/Agreement/${agreementId}/notify-in-edit`;
		return this._makeRequestWithInterval(this.intervalSeconds, endpoint);
	}

	runAgreementCreateModeNotifier(clientPeriodId: string) {
		const endpoint = `${this.baseUrl}/ClientPeriod/${clientPeriodId}/client-agreements/notify-creation`;
		return this._makeRequestWithInterval(this.intervalSeconds, endpoint);
	}

	private _makeRequestWithInterval(ms: number, url: string) {
		return interval(ms).pipe(switchMap(() => this._makePatchRequest(url)));
	}

	private _makePatchRequest(url: string): Observable<any> {
		return this._httpClient.get(url, { context: manualErrorHandlerEnabledContextCreator(true) }).pipe(
			catchError((error: HttpErrorResponse) => {
				this._draftLockedNotification(error.error);
				return of(null);
			})
		);
	}

	private _draftLockedNotification(error: any) {
		if (error.code && error.code.includes('draft.locked')) {
			this._snackBar.open('This document has been edited by the other user!');
		}
	}
}
