import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { manualErrorHandlerEnabledContextCreator } from 'src/shared/service-proxies/http-context-tokens';
import { SaveAgreementTemplateDto } from 'src/shared/service-proxies/service-proxies';
import { Observable, of, EMPTY } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { DefaultTemplateComponent } from '../components/popUps/default-template/default-template.component';

@Injectable()
export class ExtraHttpsService {
	private readonly baseUrl = `${environment.apiUrl}/api`;

	constructor(private _http: HttpClient, private _dialog: MatDialog) {}

	AgreementPost(body?: SaveAgreementTemplateDto | undefined): Observable<number> {
		let url = this.baseUrl + '/AgreementTemplate';
		return this._http
			.request('post', url, {
				body: body,
				context: manualErrorHandlerEnabledContextCreator(true),
			})
			.pipe(
				catchError((errorResponse: HttpErrorResponse) => {
					let error = errorResponse.error.error;
					if (error && error.data) {
						return this._dialog
							.open(DefaultTemplateComponent, {
								data: error.data,
								width: '500px',
								height: '240px',
								backdropClass: 'backdrop-modal--wrapper',
							})
							.afterClosed()
							.pipe(map(() => EMPTY));
					}
					return EMPTY;
				}),
				map((response: any) => {
					return response.agreementTemplateId as number;
				})
			);
	}
}
