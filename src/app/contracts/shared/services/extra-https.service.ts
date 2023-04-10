import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { manualErrorHandlerEnabledContextCreator } from 'src/shared/service-proxies/http-context-tokens';
import { FileParameter, SaveAgreementTemplateDto } from 'src/shared/service-proxies/service-proxies';
import { Observable, of, EMPTY } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { DefaultTemplateComponent } from '../components/popUps/default-template/default-template.component';
import { NgxSpinnerService } from 'ngx-spinner';

@Injectable()
export class ExtraHttpsService {
	private readonly baseUrl = `${environment.apiUrl}/api`;

	constructor(private _http: HttpClient, private _dialog: MatDialog, private readonly _spinner: NgxSpinnerService) {}

	agreementPost(body?: SaveAgreementTemplateDto | undefined): Observable<number> {
		let url = this.baseUrl + '/AgreementTemplate';
		return this._http
			.request('post', url, {
				body: body,
				context: manualErrorHandlerEnabledContextCreator(true),
			})
			.pipe(
				catchError((errorResponse: HttpErrorResponse) => {
					this._spinner.hide();
					let error = errorResponse.error.error;
					if (error && error.data) {
						return this._dialog
							.open(DefaultTemplateComponent, {
								data: error.data,
								width: '800px',
								height: '490px',
								backdropClass: 'backdrop-modal--wrapper',
								panelClass: 'app-default-template',
							})
							.afterClosed()
							.pipe(switchMap(() => EMPTY));
					}
					return EMPTY;
				}),
				map((response: any) => {
					return response.agreementTemplateId as number;
				})
			);
	}

	agreementPatch(agreementTemplateId: number, body?: SaveAgreementTemplateDto | undefined): Observable<number> {
		let url = this.baseUrl + `/AgreementTemplate/${agreementTemplateId}`;
		return this._http
			.request('patch', url, {
				body: body,
				context: manualErrorHandlerEnabledContextCreator(true),
			})
			.pipe(
				catchError((errorResponse: HttpErrorResponse) => {
					this._spinner.hide();
					let error = errorResponse.error.error;
					if (error && error.data) {
						return this._dialog
							.open(DefaultTemplateComponent, {
								data: error.data,
								width: '800px',
								height: '490px',
								backdropClass: 'backdrop-modal--wrapper',
								panelClass: 'app-default-template',
							})
							.afterClosed()
							.pipe(switchMap(() => EMPTY));
					}
					return EMPTY;
				}),
				map((response: any) => {
					return response.agreementTemplateId as number;
				})
			);
	}

	uploadSigned(agreementId: number, forceUpdate: boolean, file: FileParameter): Observable<void> {
		let url = this.baseUrl + `/Agreement/${agreementId}/upload-signed/${forceUpdate}`;

		const content = new FormData();

		content.append('file', file.data, file.fileName ? file.fileName : 'file');

		return this._http.post<void>(url, content, {
			context: manualErrorHandlerEnabledContextCreator(true),
		});
	}
}
