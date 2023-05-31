import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { manualErrorHandlerEnabledContextCreator } from 'src/shared/service-proxies/http-context-tokens';
import {
	FileParameter,
	SaveAgreementTemplateDto,
	SendDocuSignEnvelopeCommand,
	SendEmailEnvelopeCommand,
} from 'src/shared/service-proxies/service-proxies';
import { Observable, of, EMPTY } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { DefaultTemplateComponent } from '../components/popUps/default-template/default-template.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { OutdatedMergeFieldsComponent } from '../components/popUps/outdated-merge-fields/outdated-merge-fields.component';
import { EmptyAndUnknownMfComponent } from '../components/popUps/empty-and-unknown-mf/empty-and-unknown-mf.component';

export enum MergeFieldsErrors {
	OutDatedMergeFields = 'contracts.agreement.outdated.merge.fields',
	EmptyMergeFields = 'contracts.agreement.empty.merge.fields',
	UnknownMergeFields = 'contracts.documents.unknown.merge.fields',
}
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
								height: '450px',
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

	sendEmailEnvelope(body: SendEmailEnvelopeCommand) {
		let url_ = this.baseUrl + '/Agreement/send-email-envelope';

		let options = {
			headers: new HttpHeaders({
				'Content-Type': 'application/json',
			}),
			context: manualErrorHandlerEnabledContextCreator(true),
		};

		return this._http.post(url_, body, options).pipe(catchError(this.handleErrorAndResend(body, false)));
	}

	sendDocusignEnvelope(body: SendDocuSignEnvelopeCommand) {
		let url_ = this.baseUrl + '/Agreement/send-docusign-envelope';

		let options = {
			headers: new HttpHeaders({
				'Content-Type': 'application/json',
			}),
			context: manualErrorHandlerEnabledContextCreator(true),
		};

		return this._http.post(url_, body, options).pipe(catchError(this.handleErrorAndResend(body, true)));
	}

	private handleErrorAndResend(
		body: SendDocuSignEnvelopeCommand | SendEmailEnvelopeCommand,
		docusign: boolean
	): (err: any) => Observable<any> {
		return (errorResponse: HttpErrorResponse) => {
			console.log(errorResponse);
			let error = errorResponse.error.error;
			if (error && error.data) {
				switch (error.code) {
					case MergeFieldsErrors.EmptyMergeFields:
						return this._dialog
							.open(EmptyAndUnknownMfComponent, {
								data: {
									header: 'Empty merge fields were detected',
									description: `The values of the following merge fields have changed since last document save. Delete them or proceed anyway.`,
									listDescription: 'The list of affected merge fields:',
									confirmButtonText: 'Proceed',
									mergeFields: error.data,
								},
								width: '800',
								height: '450px',
								backdropClass: 'backdrop-modal--wrapper',
								panelClass: 'app-empty-and-unknown-mf',
							})
							.afterClosed()
							.pipe(
								switchMap((v) => {
									if (!v) {
										return EMPTY;
									}
									body.skipMergeFieldsValidation = true;
									if (docusign) {
										return this.sendDocusignEnvelope(body);
									} else {
										return this.sendEmailEnvelope(body);
									}
								})
							);
					case MergeFieldsErrors.OutDatedMergeFields:
						return this._dialog
							.open(OutdatedMergeFieldsComponent, {
								data: error.data,
								width: '800px',
								height: '450px',
								backdropClass: 'backdrop-modal--wrapper',
								panelClass: 'outdated-merge-fields',
							})
							.afterClosed()
							.pipe(
								switchMap((v) => {
									if (!v) {
										return EMPTY;
									}
									body.skipMergeFieldsValidation = true;
									if (docusign) {
										return this.sendDocusignEnvelope(body);
									} else {
										return this.sendEmailEnvelope(body);
									}
								})
							);
				}
			}
			return EMPTY;
		};
	}
}
