import { HttpClient, HttpHeaders, HttpParams, HttpResponseBase } from '@angular/common/http';
import { Injectable, Inject } from '@angular/core';
import { API_BASE_URL } from 'src/shared/service-proxies/service-proxies';
import { Observable, of, throwError } from 'rxjs';
import { catchError, pluck, filter } from 'rxjs/operators';

@Injectable()
export class DownloadFilesService {
	private _http: HttpClient;
	private _baseUrl: string;
	constructor(@Inject(HttpClient) _http: HttpClient, @Inject(API_BASE_URL) baseUrl?: string) {
		this._http = _http;
		this._baseUrl = baseUrl;
	}

	agreementTemplateAttachment(agreementTemplateAttachmentId: number) {
		let url = this._baseUrl + `/api/AgreementTemplateAttachment/${agreementTemplateAttachmentId}`;
		let options: any = {
			observe: 'response',
			responseType: 'blob',
			headers: new HttpHeaders({}),
		};
		return this._http.request('get', url, options).pipe(
			catchError((response) => {
				if (response instanceof HttpResponseBase) {
					try {
						return of(response);
					} catch (e) {
						return throwError(e);
					}
				} else {
					return throwError(response);
				}
			}),
			filter((val) => !!val),
			pluck('body')
		);
	}

	agreementAttachment(agreementAttachmentId: number): Observable<Blob> {
		let url = this._baseUrl + `/api/AgreementAttachment/${agreementAttachmentId}`;
		let options: any = {
			observe: 'response',
			responseType: 'blob',
			headers: new HttpHeaders({}),
		};
		return this._http.request('get', url, options).pipe(
			catchError((response) => {
				if (response instanceof HttpResponseBase) {
					try {
						return of(response);
					} catch (e) {
						return throwError(e);
					}
				} else {
					return throwError(response);
				}
			}),
			filter((val) => !!val),
			pluck('body')
		);
	}

	pdf(agreementId: number): Observable<Blob> {
		let url = this._baseUrl + `/api/Agreement/${agreementId}/document-file/pdf`;
		let options: any = {
			observe: 'response',
			responseType: 'blob',
			headers: new HttpHeaders({}),
		};
		return this._http.request('get', url, options).pipe(
			catchError((response) => {
				if (response instanceof HttpResponseBase) {
					try {
						return of(response);
					} catch (e) {
						return throwError(e);
					}
				} else {
					return throwError(response);
				}
			}),
			filter((val) => !!val),
			pluck('body')
		);
	}

	latestAgreementVersion(agreementId: number, getDraftIfAvailable: boolean): Observable<Blob> {
		let url = this._baseUrl + `/api/Agreement/${agreementId}/document-file/latest-agreement-version/${getDraftIfAvailable}`;
		let options: any = {
			observe: 'response',
			responseType: 'blob',
			headers: new HttpHeaders({}),
		};
		return this._http.request('get', url, options).pipe(
			catchError((response) => {
				if (response instanceof HttpResponseBase) {
					try {
						return of(response);
					} catch (e) {
						return throwError(e);
					}
				} else {
					return throwError(response);
				}
			}),
			filter((val) => !!val),
			pluck('body')
		);
	}

	agreementFiles(agreementIds: number[]): Observable<Blob> {
		let url = this._baseUrl + '/api/Agreement/files';
		let options: any = {
			observe: 'response',
			responseType: 'blob',
			headers: new HttpHeaders({}),
		};
		let params = new HttpParams();

		agreementIds.forEach((agreementId) => {
			params = params.append('agreementIds', agreementId);
		});
		options.params = params;
		return this._http.get(url, options).pipe(
			catchError((response) => {
				if (response instanceof HttpResponseBase) {
					try {
						return of(response);
					} catch (e) {
						return throwError(e);
					}
				} else {
					return throwError(response);
				}
			}),
			filter((val) => !!val),
			pluck('body')
		);
	}
}
