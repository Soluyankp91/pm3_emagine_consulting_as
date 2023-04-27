import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { EMPTY, of, throwError } from 'rxjs';
import { catchError, filter, map, mapTo, switchMap } from 'rxjs/operators';

import { environment } from 'src/environments/environment';
import { manualErrorHandlerEnabledContextCreator } from 'src/shared/service-proxies/http-context-tokens';
import {
	AgreementTemplateServiceProxy,
	StringWrappedValueDto,
	UpdateCompletedTemplateDocumentFileDto,
} from 'src/shared/service-proxies/service-proxies';
import { ConfirmPopupComponent } from '../components/confirm-popup';
import { SaveAsPopupComponent } from '../components/save-as-popup';
import { IDocumentItem, IDocumentVersion } from '../entities';
import { AgreementAbstractService } from './agreement-abstract.service';

@Injectable()
export class AgreementTemplateService implements AgreementAbstractService {
	private readonly _baseUrl = `${environment.apiUrl}/api/AgreementTemplate`;

	constructor(
		private httpClient: HttpClient,
		private _dialog: MatDialog,
		private _agreementTemplateService: AgreementTemplateServiceProxy
	) {}

	getTemplate(templateId: number, isComplete: boolean = true) {
		const endpoint = `${this._baseUrl}/${templateId}/document-file/latest-template-version/${isComplete}`;

		return this.httpClient
			.get(endpoint, {
				responseType: 'blob',
			})
			.pipe(
				map((res) => res),
				catchError((error: HttpErrorResponse) => throwError(error.error))
			);
	}

	getTemplateByVersion(templateId: number, version: number) {
		const endpoint = `${this._baseUrl}/${templateId}/document-file/${version}`;
		return this.httpClient
			.get(endpoint, {
				responseType: 'blob',
			})
			.pipe(catchError((error: HttpErrorResponse) => throwError(error.error)));
	}

	getSimpleList() {
		return this._agreementTemplateService.simpleList2().pipe(
			map((item) => item.items as IDocumentItem[]),
			catchError((error: HttpErrorResponse) => throwError(error.error))
		);
	}

	getTemplateVersions(templateId: number) {
		return this._agreementTemplateService.templateVersions(templateId).pipe(
			map((item) => item as IDocumentVersion[]),
			catchError((error: HttpErrorResponse) => throwError(error.error))
		);
	}

	saveCurrentAsDraftTemplate(templateId: number, force: boolean, fileContent: StringWrappedValueDto) {
		return this._agreementTemplateService.documentFilePUT2(templateId, force, fileContent);
	}

	saveCurrentAsCompleteTemplate(templateId: number, body: UpdateCompletedTemplateDocumentFileDto) {
		return this._agreementTemplateService.updateCompleted(templateId, body);
	}

	saveDraftAsDraftTemplate(templateId: number, force: boolean, fileContent: StringWrappedValueDto) {
		const endpoint = `${this._baseUrl}/${templateId}/document-file/${force}`;
		return this.httpClient.put(endpoint, fileContent, { context: manualErrorHandlerEnabledContextCreator(true) }).pipe(
			catchError(({ error }: HttpErrorResponse) => {
				if (error.error.code === 'contracts.documents.draft.locked') {
					const ref = this._dialog.open(ConfirmPopupComponent, {
						width: '500px',
						data: {
							title: 'Override',
							body: 'Are you sure you want to override the draft?',
						},
					});

					return ref.afterClosed().pipe(
						filter((res) => !!res),
						switchMap(() =>
							this.saveDraftAsDraftTemplate(templateId, true, fileContent).pipe(catchError((error) => EMPTY))
						)
					);
				} else {
					return of(error);
				}
			})
		);
	}

	saveDraftAsCompleteTemplate(templateId: number, body: UpdateCompletedTemplateDocumentFileDto) {
		return this._agreementTemplateService.completeTemplate(templateId, false, body).pipe(catchError((error) => of(null)));
	}

	saveDraftAndCompleteTemplate(
		templateId: number,
		body: StringWrappedValueDto,
		doc: IDocumentItem,
		versions: IDocumentVersion[]
	) {
		return this.saveDraftAsDraftTemplate(templateId, false, body).pipe(
			switchMap(() => {
				const ref = this._dialog.open(SaveAsPopupComponent, {
					data: {
						document: doc,
						base64: body.value,
						isAgreement: false,
						versions,
					},
					width: '500px',
					disableClose: true,
					hasBackdrop: true,
					backdropClass: 'backdrop-modal--wrapper',
				});

				return ref.afterClosed().pipe(
					switchMap((res: UpdateCompletedTemplateDocumentFileDto) => {
						if (res) {
							return this.saveDraftAsCompleteTemplate(templateId, res).pipe(mapTo({}));
						} else {
							return of(null);
						}
					})
				);
			})
		);
	}

	getTemplatePDF(id: number) {
		const endpoint = `${this._baseUrl}/${id}/document-file/pdf`;
		return this.httpClient
			.get(endpoint, {
				responseType: 'blob',
			})
			.pipe(catchError((error: HttpErrorResponse) => throwError(error.error)));
	}

	getEnvelopeRelatedAgreements(id: number) {
		return of([]);
	}

	voidEnvelopeRelatedAgreement(id: number, reason: string) {
		return of(null);
	}

	unlockAgreement(id: number) {
		return of(true);
	}

	unlockAgreementByConfirmation(id: number, version: number) {
		return of(true);
	}
}
