import { HttpClient, HttpBackend, HttpHeaders, HttpResponse, HttpResponseBase } from '@angular/common/http';
import { mergeMap as _observableMergeMap, catchError as _observableCatch, switchMap } from 'rxjs/operators';
import { Observable, throwError as _observableThrow, of as _observableOf, from } from 'rxjs';
import { Injectable } from '@angular/core';
import { ApiException } from 'src/shared/service-proxies/service-proxies';
import { AppConsts } from 'src/shared/AppConsts';
import { LocalHttpService } from 'src/shared/service-proxies/local-http.service';
import { AuthenticationResult } from '@azure/msal-browser';

@Injectable({
	providedIn: 'root',
})
export class LegalContractService {
	private _httpClientBypass: HttpClient;
	private _baseUrl = AppConsts.remoteServiceBaseUrl;
	constructor(handler: HttpBackend, private _localHttpService: LocalHttpService, private _httpClient: HttpClient) {
		this._httpClientBypass = new HttpClient(handler);
	}

	getTokenAndSignleEnvelopeCheck(agreementIds?: number[] | undefined): Observable<any> {
		return this._localHttpService
			.getTokenSilent()
			.pipe(switchMap((response) => this.singleEnvelopeCheck(agreementIds, response.accessToken)));
	}

	singleEnvelopeCheck(agreementIds?: number[] | undefined, token?: string): Observable<void> {
		let url_ = this._baseUrl + '/api/Agreement/single-envelope-check?';
		if (agreementIds === null) throw new Error("The parameter 'agreementIds' cannot be null.");
		else if (agreementIds !== undefined)
			agreementIds &&
				agreementIds.forEach((item) => {
					url_ += 'agreementIds=' + encodeURIComponent('' + item) + '&';
				});
		url_ = url_.replace(/[?&]$/, '');

		let options_: any = {
			observe: 'response',
			responseType: 'blob',
			headers: new HttpHeaders({
				Authorization: `Bearer ${token}`,
			}),
		};

		return this._httpClientBypass
			.request('get', url_, options_)
			.pipe(
				_observableMergeMap((response_: any) => {
					return this.processSingleEnvelopeCheck(response_);
				})
			)
			.pipe(
				_observableCatch((response_: any) => {
					if (response_ instanceof HttpResponseBase) {
						try {
							return this.processSingleEnvelopeCheck(response_ as any);
						} catch (e) {
							return _observableThrow(e) as any as Observable<void>;
						}
					} else return _observableThrow(response_) as any as Observable<void>;
				})
			);
	}

	protected processSingleEnvelopeCheck(response: HttpResponseBase): Observable<void> {
		const status = response.status;
		const responseBlob =
			response instanceof HttpResponse
				? response.body
				: (response as any).error instanceof Blob
				? (response as any).error
				: undefined;

		let _headers: any = {};
		if (response.headers) {
			for (let key of response.headers.keys()) {
				_headers[key] = response.headers.get(key);
			}
		}
		if (status === 200) {
			return blobToText(responseBlob).pipe(
				_observableMergeMap((_responseText) => {
					return _observableOf<void>(null as any);
				})
			);
		} else if (status !== 200 && status !== 204) {
			return blobToText(responseBlob).pipe(
				_observableMergeMap((_responseText) => {
					return throwException('An unexpected server error occurred.', status, _responseText, _headers);
				})
			);
		}
		return _observableOf<void>(null as any);
	}

	getTokenAndDownloadDocument(fileUrl: string) {
		return this._localHttpService
			.getTokenSilent()
			.pipe(switchMap((response) => this._downloadDocument(response.accessToken, fileUrl)));
	}

	private _downloadDocument(token: string, fileUrl: string) {
		return this._httpClient.get(fileUrl, {
			headers: new HttpHeaders({
				Authorization: `Bearer ${token}`,
			}),
			responseType: 'blob',
			observe: 'response',
		});
	}

	processResponseAfterDownload(data: HttpResponse<Blob>) {
		const blob = new Blob([data.body!], { type: data.body!.type });
		const contentDispositionHeader = data.headers.get('Content-Disposition');
		if (contentDispositionHeader !== null) {
			const contentDispositionHeaderResult = contentDispositionHeader.split(';')[1].trim().split('=')[1];
			const contentDispositionFileName = contentDispositionHeaderResult.replace(/"/g, '');
			const downloadlink = document.createElement('a');
			downloadlink.href = window.URL.createObjectURL(blob);
			downloadlink.download = contentDispositionFileName;
			const nav = window.navigator as any;

			if (nav.msSaveOrOpenBlob) {
				nav.msSaveBlob(blob, contentDispositionFileName);
			} else {
				downloadlink.click();
			}
		}
	}
}

function throwException(
	message: string,
	status: number,
	response: string,
	headers: { [key: string]: any },
	result?: any
): Observable<any> {
	if (result !== null && result !== undefined) return _observableThrow(result);
	else return _observableThrow(new ApiException(message, status, response, headers, null));
}

function blobToText(blob: any): Observable<string> {
	return new Observable<string>((observer: any) => {
		if (!blob) {
			observer.next('');
			observer.complete();
		} else {
			let reader = new FileReader();
			reader.onload = (event) => {
				observer.next((event.target as any).result);
				observer.complete();
			};
			reader.readAsText(blob);
		}
	});
}
