import { HttpClient, HttpBackend, HttpHeaders, HttpResponse, HttpResponseBase } from '@angular/common/http';
import { mergeMap as _observableMergeMap, catchError as _observableCatch, map, switchMap } from 'rxjs/operators';
import { Observable, throwError as _observableThrow, of as _observableOf } from 'rxjs';
import { Injectable } from '@angular/core';
import { ApiException } from 'src/shared/service-proxies/service-proxies';
import { AppConsts } from 'src/shared/AppConsts';
import { LocalHttpService } from 'src/shared/service-proxies/local-http.service';

@Injectable({
	providedIn: 'root',
})
export class LegalContractService {
	private _httpClient: HttpClient;
    private _baseUrl = AppConsts.remoteServiceBaseUrl;
	constructor(handler: HttpBackend, private _localHttpService: LocalHttpService) {
		this._httpClient = new HttpClient(handler);
	}

    getTokenBeforeCheck(agreementIds?: number[] | undefined): Observable<any> {
        return this._localHttpService.getTokenSilent().pipe(switchMap((response) => this.singleEnvelopeCheck(agreementIds, response.accessToken)));
    }

    singleEnvelopeCheck(agreementIds?: number[] | undefined, token?: string): Observable<void> {
        let url_ = this._baseUrl + "/api/Agreement/single-envelope-check?";
        // let url_ = 'https://httpstat.us/400';
        if (agreementIds === null)
            throw new Error("The parameter 'agreementIds' cannot be null.");
        else if (agreementIds !== undefined)
            agreementIds && agreementIds.forEach(item => { url_ += "agreementIds=" + encodeURIComponent("" + item) + "&"; });
        url_ = url_.replace(/[?&]$/, "");

        let options_ : any = {
            observe: "response",
            responseType: "blob",
            headers: new HttpHeaders({
                'Authorization': `Bearer ${token}`
            })
        };

        return this._httpClient.request("get", url_, options_).pipe(_observableMergeMap((response_ : any) => {
            return this.processSingleEnvelopeCheck(response_);
        })).pipe(_observableCatch((response_: any) => {
            if (response_ instanceof HttpResponseBase) {
                try {
                    return this.processSingleEnvelopeCheck(response_ as any);
                } catch (e) {
                    return _observableThrow(e) as any as Observable<void>;
                }
            } else
                return _observableThrow(response_) as any as Observable<void>;
        }));
    }

    protected processSingleEnvelopeCheck(response: HttpResponseBase): Observable<void> {
        const status = response.status;
        const responseBlob =
            response instanceof HttpResponse ? response.body :
            (response as any).error instanceof Blob ? (response as any).error : undefined;

        let _headers: any = {}; if (response.headers) { for (let key of response.headers.keys()) { _headers[key] = response.headers.get(key); }}
        if (status === 200) {
            return blobToText(responseBlob).pipe(_observableMergeMap(_responseText => {
            return _observableOf<void>(null as any);
            }));
        } else if (status !== 200 && status !== 204) {
            return blobToText(responseBlob).pipe(_observableMergeMap(_responseText => {
            return throwException("An unexpected server error occurred.", status, _responseText, _headers);
            }));
        }
        return _observableOf<void>(null as any);
    }

}

function throwException(message: string, status: number, response: string, headers: { [key: string]: any; }, result?: any): Observable<any> {
    if (result !== null && result !== undefined)
        return _observableThrow(result);
    else
        return _observableThrow(new ApiException(message, status, response, headers, null));
}

function blobToText(blob: any): Observable<string> {
    return new Observable<string>((observer: any) => {
        if (!blob) {
            observer.next("");
            observer.complete();
        } else {
            let reader = new FileReader();
            reader.onload = event => {
                observer.next((event.target as any).result);
                observer.complete();
            };
            reader.readAsText(blob);
        }
    });
}
