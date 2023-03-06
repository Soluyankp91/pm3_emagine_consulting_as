import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { EMPTY, of, throwError } from 'rxjs';
import { catchError, filter, map, mapTo, switchMap } from 'rxjs/operators';

import { environment } from 'src/environments/environment';
import { manualErrorHandlerEnabledContextCreator } from 'src/shared/service-proxies/http-context-tokens';
import { AgreementServiceProxy, CompleteTemplateDocumentFileDraftDto, StringWrappedValueDto } from 'src/shared/service-proxies/service-proxies';
import { ConfirmPopupComponent } from '../components/confirm-popup';
import { SaveAsPopupComponent } from '../components/save-as-popup';
import { IDocumentItem, IDocumentVersion } from '../entities';
import { AgreementAbstractService } from './agreement-abstract.service';

@Injectable()
export class AgreementService implements AgreementAbstractService {
	private readonly _baseUrl = `${environment.apiUrl}/api/Agreement`;

	constructor(
		private _httpClient: HttpClient,
		private _dialog: MatDialog,
		private _agreementService: AgreementServiceProxy
		) {}

	getTemplate(agreementId: number, isComplete: boolean = true) {
		const endpoint = `${this._baseUrl}/${agreementId}/document-file/latest-agreement-version/${isComplete}`;

		return this._httpClient
			.get(endpoint, {
				responseType: 'blob',
			})
			.pipe(
				map((res) => res),
				catchError((error: HttpErrorResponse) => throwError(error.error))
			);
	}

	getTemplateByVersion(agreementId: number, version: number) {
		const endpoint = `${this._baseUrl}/${agreementId}/document-file/${version}`;
		return this._httpClient
			.get(endpoint, {
				responseType: 'blob',
			})
			.pipe(catchError((error: HttpErrorResponse) => throwError(error.error)));
	}

	getSimpleList() {
		return this._agreementService.simpleList()
			.pipe(
				map(res => res.items.map(item => ({
					...item,
					name: item.agreementName,
					agreementTemplateId: item.agreementId,
				}))),
				catchError((error: HttpErrorResponse) => throwError(error.error))
			);
	}

	getTemplateVersions(templateId: number) {
		return this._agreementService.agreementVersions(templateId)
			.pipe(
				map(res => res as IDocumentVersion[]),
				catchError((error: HttpErrorResponse) => throwError(error.error))
			);
	}

	saveCurrentAsDraftTemplate(agreementId: number, force: boolean = false, fileContent: StringWrappedValueDto) {
		return this._agreementService
			.documentFilePUT(agreementId, force, fileContent)
	}

	saveCurrentAsCompleteTemplate(agreementId: number, fileContent: CompleteTemplateDocumentFileDraftDto) {
		return this._agreementService.completeAgreement(agreementId, false, fileContent);
	}
	
	saveDraftAsDraftTemplate(agreementId: number, force: boolean, fileContent: StringWrappedValueDto) {
		const endpoint = `${this._baseUrl}/${agreementId}/document-file/${force}`;
		return this._httpClient.put(endpoint, fileContent).pipe(
			catchError(({error}: HttpErrorResponse) => {
				if (error.error.code === 'contracts.documents.draft.locked') {
					const ref = this._dialog.open(ConfirmPopupComponent, {
						width: '500px',
						height: '240px',
						backdropClass: 'backdrop-modal--wrapper',
						data: {
							title: 'Override',
							body: 'Are you sure you want to override the draft?'
						}
					});

					return ref.afterClosed().pipe(
						filter(res => !!res),
						switchMap(() => this.saveDraftAsDraftTemplate(agreementId, true, fileContent).pipe(
							catchError(error => EMPTY)
						))
					)
				} else {
					return of(error);
				}
			}),
		)
	};

	saveDraftAsCompleteTemplate(agreementId: number, fileContent: CompleteTemplateDocumentFileDraftDto) {
		return this._agreementService.completeAgreement(agreementId, false, fileContent).pipe(
			catchError(error => of(null))
		);
	}

	// CUSTOM FLOW
	saveDraftAndCompleteTemplate(templateId: number, body: StringWrappedValueDto, doc: IDocumentItem) {
		return this.saveDraftAsDraftTemplate(templateId, false, body).pipe(
			switchMap(() => {
				const ref = this._dialog.open(SaveAsPopupComponent, {
					data: {
						document: doc,
						isAgreement: true,
						base64: body.value
					},
					width: '500px',
					disableClose: true,
					hasBackdrop: true,
					backdropClass: 'backdrop-modal--wrapper'
				})

				return ref.afterClosed().pipe(
					switchMap(res => {
						if (res) {
							return this.saveDraftAsCompleteTemplate(
								templateId,
								res
							).pipe(
								mapTo({})
							)
						} else {
							return of(null);
						}
					})
				);
			}),
		)
	}

	getTemplatePDF(agreementId: number) {
		const endpoint = `${this._baseUrl}/${agreementId}/document-file/pdf`;
		return this._httpClient
			.get(endpoint, {
				responseType: 'blob',
				context: manualErrorHandlerEnabledContextCreator(true),
			})
			.pipe(
				map((res) => res),
				catchError((error: HttpErrorResponse) => of(null))
			);
	}
}
