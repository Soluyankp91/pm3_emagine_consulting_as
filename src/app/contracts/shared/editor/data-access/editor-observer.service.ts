import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, interval, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';

import { mergeMap, switchMap, takeUntil, takeWhile, tap } from 'rxjs/operators';

@Injectable()
export class EditorObserverService {
	baseUrl = `${environment.apiUrl}/api`;
    state$ = new Subject();
    intervalSeconds = 15 * 1000;

	constructor(private _httpClient: HttpClient) {}

    startObserve(agreementId?: number, clientPeriodId?: number,) {
        let endpoint = `${this.baseUrl}`;

        if (agreementId) {
            endpoint = `${this.baseUrl}/Agreement/${agreementId}/notify-in-edit`
        } else {
            endpoint = `${this.baseUrl}/ClientPeriod/${clientPeriodId}/client-agreements/notify-creation`
        }

        this.state$.next(true);

        interval(this.intervalSeconds).pipe(
            takeUntil(this.state$),
            // switchMap(() => this._httpClient.put(endpoint, null))
        ).subscribe()

        
    }

    stopObserve() {
        this.state$.next(false);
        this.state$.complete();
    }
}
