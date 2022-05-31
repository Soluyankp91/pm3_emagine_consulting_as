import { Injectable } from '@angular/core';
import { HttpClient, HttpResponseBase, HttpResponse } from '@angular/common/http';
import { mergeMap as _observableMergeMap, catchError as _observableCatch } from 'rxjs/operators';
import { Observable, throwError as _observableThrow, of as _observableOf } from 'rxjs';
import { ApiException, FileParameter } from './service-proxies';
import { AppConsts } from '../AppConsts';

@Injectable()
export class FileUploadService {

    private API_BASE_URL = AppConsts.remoteServiceBaseUrl;
    private jsonParseReviver: ((key: string, value: any) => any) | undefined = undefined;

    constructor(private _httpClient: HttpClient) {
    }

    public AddClienttGeneralFile(clientId: number, attachmentFileTypeId: number, file: FileParameter) : Observable<void> {
        if (clientId === null || clientId === undefined) {
            throw new Error("The parameter 'clientId' cannot be null.");
        }
        if (clientId === null || clientId === undefined) {
            throw new Error("The parameter 'clientId' cannot be null.");
        }

        let url = this.API_BASE_URL + `/api/ClientDocuments/${clientId}/GeneralFile/${attachmentFileTypeId}`;
        // url = this.addParameter(url, 'consultantId', consultantId);

        return this.uploadFile<void>(url, file.data);
    }

    //#region Private

    private addParameter(url: string, parameterName: string, parameterValue: any) : string {
        return url + parameterName + '=' + encodeURIComponent("" + parameterValue) + "&";
    }

    private normalizeUrl(url: string) : string {
        return url.replace(/[?&]$/, "");
    }

    private uploadFile<T>(url: string, file: File, fromJS?: (value: any) => T): Observable<T> {
        return this.uploadFiles<T>(url, [file] , fromJS);
    }

    private uploadFiles<T>(url: string, files: File[], fromJS?: (value: any) => T): Observable<T> {
        url = this.normalizeUrl(url);

        let formData = new FormData();

        files.forEach(file => {
            formData.append('file', file, file.name);
        })

        let options: any = {
            observe: 'response',
            responseType: 'blob'
        };

        return this._httpClient.post(url, formData, options).pipe(_observableMergeMap((response_: any) => {
            return this.processUploadFiles<T>(response_, fromJS);
        })).pipe(_observableCatch((response_: any) => {
            if (response_ instanceof HttpResponseBase) {
                try {
                    return this.processUploadFiles<T>(<any>response_, fromJS);
                } catch (e) {
                    return <Observable<T>><any>_observableThrow(e);
                }
            } else
                return <Observable<T>><any>_observableThrow(response_);
        }));
    }

    private processUploadFiles<T>(response: HttpResponseBase, fromJS?: (value: any) => T): Observable<T> {
        const status = response.status;
        const responseBlob =
            response instanceof HttpResponse ? response.body :
                (<any>response).error instanceof Blob ? (<any>response).error : undefined;

        let _headers: any = {}; if (response.headers) { for (let key of response.headers.keys()) { _headers[key] = response.headers.get(key); } }
        if (status === 200) {
            return this.blobToText(responseBlob).pipe(_observableMergeMap(_responseText => {
                if(!fromJS){
                    return _observableOf<T>(<any>null);
                }
                let result200: any = null;
                let resultData200 = _responseText === "" ? null : JSON.parse(_responseText, this.jsonParseReviver);
                result200 = fromJS(resultData200);
                return _observableOf(result200);
            }));
        } else if (status !== 200 && status !== 204) {
            return this.blobToText(responseBlob).pipe(_observableMergeMap(_responseText => {
                return this.throwException("An unexpected server error occurred.", status, _responseText, _headers);
            }));
        }
        return _observableOf<T>(<any>null);
    }

    private blobToText(blob: any): Observable<string> {
        return new Observable<string>((observer: any) => {
            if (!blob) {
                observer.next('');
                observer.complete();
            } else {
                let reader = new FileReader();
                reader.onload = event => {
                    observer.next((<any>event.target).result);
                    observer.complete();
                };
                reader.readAsText(blob);
            }
        });
    }

    private throwException(message: string, status: number, response: string, headers: { [key: string]: any; }, result?: any): Observable<any> {
        if (result !== null && result !== undefined) {
            return _observableThrow(result);
        } else {
            return _observableThrow(new ApiException(message, status, response, headers, null));
        }
    }

    getFile(url: string): Observable<Blob> {
        this.normalizeUrl(url)

        let options_ : any = {
            observe: "response",
            responseType: "blob"
        };

        return this._httpClient.request("get", url, options_).pipe(_observableMergeMap((response_ : any) => {
            return this.processGetFile(response_);
        })).pipe(_observableCatch((response_: any) => {
            if (response_ instanceof HttpResponseBase) {
                try {
                    return this.processGetFile(<any>response_);
                } catch (e) {
                    return <Observable<any>><any>_observableThrow(e);
                }
            } else
                return <Observable<any>><any>_observableThrow(response_);
        }));
    }

    protected processGetFile(response: HttpResponseBase): Observable<Blob> {
        const status = response.status;
        const responseBlob =
            response instanceof HttpResponse ? response.body :
            (<any>response).error instanceof Blob ? (<any>response).error : undefined;

        let _headers: any = {}; if (response.headers) { for (let key of response.headers.keys()) { _headers[key] = response.headers.get(key); }}
        if (status === 200) {
            return this.blobToText(responseBlob).pipe(_observableMergeMap(_responseText => {
            return _observableOf<Blob>(responseBlob);
            }));
        } else if (status !== 200 && status !== 204) {
            return this.blobToText(responseBlob).pipe(_observableMergeMap(_responseText => {
            return this.throwException("An unexpected server error occurred.", status, _responseText, _headers);
            }));
        }
        return _observableOf<Blob>(<any>null);
    }

    //#endregion
}
