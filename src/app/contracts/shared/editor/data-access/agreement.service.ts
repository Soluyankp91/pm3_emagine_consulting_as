import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { EMPTY, of, throwError } from 'rxjs';
import { catchError, filter, map, mapTo, switchMap } from 'rxjs/operators';

import { environment } from 'src/environments/environment';
import { manualErrorHandlerEnabledContextCreator } from 'src/shared/service-proxies/http-context-tokens';
import {
	AgreementServiceProxy,
	CompleteTemplateDocumentFileDraftDto,
	StringWrappedValueDto,
} from 'src/shared/service-proxies/service-proxies';
import { ConfirmPopupComponent } from '../components/confirm-popup';
import { IDocumentItem, IDocumentVersion } from '../entities';
import { AgreementAbstractService } from './agreement-abstract.service';
import { VoidEnvelopePopupComponent } from '../components/void-envelope-popup/void-envelope-popup.component';

@Injectable()
export class AgreementService implements AgreementAbstractService {
	private readonly _baseUrl = `${environment.apiUrl}/api/Agreement`;

	constructor(private _httpClient: HttpClient, private _dialog: MatDialog, private _agreementService: AgreementServiceProxy) {}

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
		return this._agreementService.simpleList().pipe(
			map((res) =>
				res.items.map((item) => ({
					...item,
					name: item.agreementName,
					agreementTemplateId: item.agreementId,
				}))
			),
			catchError((error: HttpErrorResponse) => throwError(error.error))
		);
	}

	getTemplateVersions(templateId: number) {
		return this._agreementService.agreementVersions(templateId).pipe(
			map((res) => res as IDocumentVersion[]),
			catchError((error: HttpErrorResponse) => throwError(error.error))
		);
	}

	saveCurrentAsDraftTemplate(agreementId: number, force: boolean = false, fileContent: StringWrappedValueDto) {
		return this._agreementService.documentFilePUT(agreementId, force, fileContent);
	}

	saveCurrentAsCompleteTemplate(agreementId: number, fileContent: CompleteTemplateDocumentFileDraftDto) {
		return this._agreementService.completeAgreement(agreementId, false, fileContent);
	}

	saveDraftAsDraftTemplate(agreementId: number, force: boolean, fileContent: StringWrappedValueDto) {
		const endpoint = `${this._baseUrl}/${agreementId}/document-file/${force}`;
		return this._httpClient
			.put(endpoint, fileContent, {
				context: manualErrorHandlerEnabledContextCreator(true),
			})
			.pipe(
				catchError(({ error }: HttpErrorResponse) => {
					if (['contracts.agreement.locked', 'contracts.documents.draft.locked'].includes(error.error.code)) {
						const ref = this._dialog.open(ConfirmPopupComponent, {
							width: '540px',
							height: '240px',
							backdropClass: 'backdrop-modal--wrapper',
							data: {
								title: 'Override',
								body: 'Are you sure you want to override the draft?',
							},
						});

						return ref.afterClosed().pipe(
							filter((res) => !!res),
							switchMap(() =>
								this.saveDraftAsDraftTemplate(agreementId, true, fileContent).pipe(catchError((error) => EMPTY))
							)
						);
					} else {
						return of(error);
					}
				})
			);
	}

	saveDraftAsCompleteTemplate(agreementId: number, fileContent: CompleteTemplateDocumentFileDraftDto) {
		return this._agreementService.completeAgreement(agreementId, false, fileContent).pipe(catchError((error) => of(null)));
	}

	// CUSTOM FLOW
	saveDraftAndCompleteTemplate(
		templateId: number,
		body: StringWrappedValueDto,
		doc: IDocumentItem,
		versions: IDocumentVersion[]
	) {
		return this.saveDraftAsDraftTemplate(templateId, false, body).pipe(
			switchMap(() =>
				this.getEnvelopeRelatedAgreements(templateId).pipe(
					switchMap((agreements) =>
						this._dialog
							.open(VoidEnvelopePopupComponent, {
								data: { agreements },
								width: '540px',
								disableClose: true,
								hasBackdrop: true,
								backdropClass: 'backdrop-modal--wrapper',
							})
							.afterClosed()
							.pipe(
								switchMap((res) => {
									return res
										? this.voidEnvelopeRelatedAgreement(templateId, res.reason).pipe(
												switchMap(() =>
													this.saveDraftAsCompleteTemplate(templateId, body).pipe(mapTo({}))
												)
										  )
										: null;
								})
							)
					)
				)
			)
		);
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

	getEnvelopeRelatedAgreements(agreementId: number) {
		return this._agreementService
			.envelopeRelatedAgreements(agreementId)
			.pipe(catchError((error: HttpErrorResponse) => of([])));
	}

	voidEnvelopeRelatedAgreement(agreementId: number, reason: string) {
		return this._agreementService.voidEnvelope(agreementId, reason).pipe(catchError((error: HttpErrorResponse) => of(null)));
	}
}
