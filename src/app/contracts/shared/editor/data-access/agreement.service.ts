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
import { SaveAsPopupComponent } from '../components/save-as-popup';

@Injectable()
export class AgreementService implements AgreementAbstractService {
	private readonly _baseUrl = `${environment.apiUrl}/api/Agreement`;

	constructor(private _httpClient: HttpClient, private _dialog: MatDialog, private _agreementService: AgreementServiceProxy) {}

	private _showSaveDraftAsDraftPopup(body: StringWrappedValueDto, doc: IDocumentItem, versions: IDocumentVersion[]) {
		return this._dialog
			.open(SaveAsPopupComponent, {
				data: {
					document: doc,
					isAgreement: true,
					base64: body.value,
					versions,
				},
				width: '540px',
				disableClose: true,
				hasBackdrop: true,
				backdropClass: 'backdrop-modal--wrapper',
			})
			.afterClosed();
	}

	private _showTemplateVoidingPopup(templateId: number) {
		return this.getEnvelopeRelatedAgreements(templateId).pipe(
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
							return res ? this.voidEnvelopeRelatedAgreement(templateId, res.reason) : of(null);
						})
					)
			)
		);
	}

	private _showTemplateVersionChangeConfirmationPopup(version: number) {
		return this._dialog
			.open(ConfirmPopupComponent, {
				width: '540px',
				backdropClass: 'backdrop-modal--wrapper',
				data: {
					title: 'Agreement number change',
					body: `Promoting sent agreement to draft will result in the current agreement number ${version} change to ${
						version + 1
					}. Are you sure you want to proceed?`,
					cancelBtnText: 'Cancel',
					confirmBtnText: 'Proceed',
				},
			})
			.afterClosed()
			.pipe(map((res) => !!res));
	}

	private _getAgreement(agreementId: number) {
		return this._agreementService.agreementGET(agreementId);
	}

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
				mapTo(true),
				catchError(({ error }: HttpErrorResponse) => {
					if (error.error.code === 'contracts.documents.draft.locked') {
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
							switchMap((res) => {
								if (res) {
									return this.saveDraftAsDraftTemplate(agreementId, true, fileContent).pipe(catchError((error) => EMPTY))
								} else {
									return of(null)
								}
							})
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
		return this.saveDraftAsDraftTemplate(templateId, false, body)
			.pipe(
				switchMap(() => {
					let agreementHasSentVersions = versions.some(
						(version) => version.envelopeStatus && version.envelopeStatus === 3
					);
					return agreementHasSentVersions
						? this._showTemplateVoidingPopup(templateId)
						: this._showSaveDraftAsDraftPopup(body, doc, versions);
				})
			)
			.pipe(
				switchMap((confirmed) => {
					return confirmed ? this.saveDraftAsCompleteTemplate(templateId, body).pipe(mapTo({})) : of(null);
				})
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
		return this._agreementService.voidEnvelope(agreementId, reason).pipe(
			mapTo(true),
			catchError((error: HttpErrorResponse) => of(null))
		);
	}

	unlockAgreement(id: number) {
		return this._agreementService.openEdit(id).pipe(mapTo(true));
	}

	unlockAgreementByConfirmation(id: number, version: number) {
		return this._getAgreement(id).pipe(
			switchMap(({ isLocked }) => {
				return isLocked
					? this._showTemplateVersionChangeConfirmationPopup(version).pipe(
							switchMap((confirmed) => (confirmed ? this.unlockAgreement(id) : of(false)))
					  )
					: of(true);
			})
		);
	}
}
