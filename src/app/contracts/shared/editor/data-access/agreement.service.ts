import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { EMPTY, Observable, of, throwError } from 'rxjs';
import { catchError, map, mapTo, switchMap } from 'rxjs/operators';

import { environment } from 'src/environments/environment';
import { manualErrorHandlerEnabledContextCreator } from 'src/shared/service-proxies/http-context-tokens';
import {
	AgreementServiceProxy,
	CompleteTemplateDocumentFileDraftDto,
	EnvelopePreviewDto,
	EnvelopeStatus,
	SendDocuSignEnvelopeCommand,
	SendEmailEnvelopeCommand,
	StringWrappedValueDto,
} from 'src/shared/service-proxies/service-proxies';
import { ConfirmPopupComponent } from '../components/confirm-popup';
import { IDocumentItem, IDocumentVersion } from '../entities';
import { AgreementAbstractService } from './agreement-abstract.service';
import { VoidEnvelopePopupComponent } from '../components/void-envelope-popup/void-envelope-popup.component';
import { SaveAsPopupComponent } from '../components/save-as-popup';
import { EmptyAndUnknownMfComponent } from '../../components/popUps/empty-and-unknown-mf/empty-and-unknown-mf.component';
import { NotificationDialogComponent } from '../../components/popUps/notification-dialog/notification-dialog.component';
import { OutdatedMergeFieldsComponent } from '../../components/popUps/outdated-merge-fields/outdated-merge-fields.component';

export enum OnSendMergeFieldsErrors {
	OutDatedMergeFields = 'contracts.agreement.outdated.merge.fields',
	EmptyMergeFields = 'contracts.agreement.empty.merge.fields',
}
export enum OnSaveMergeFieldsErrors {
	UnknownMergeFields = 'contracts.documents.unknown.merge.fields',
}
export interface OutDatedMergeFieldsErrorData {
	currentValue: string;
	key: string;
	previousValue: string;
}
export type EmptyMergeFieldsErroData = string[];
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

	private _showOutdatedMergeFieldsPopup(errorData: OutDatedMergeFieldsErrorData) {
		return this._dialog
			.open(OutdatedMergeFieldsComponent, {
				data: errorData,
				width: '800px',
				height: '450px',
				backdropClass: 'backdrop-modal--wrapper',
				panelClass: 'outdated-merge-fields',
			})
			.afterClosed();
	}

	private _showEmptyMergeFieldsPopup(errorData: EmptyMergeFieldsErroData) {
		return this._dialog
			.open(EmptyAndUnknownMfComponent, {
				data: {
					header: 'Empty merge fields were detected',
					description: `The values of the following merge fields have changed since last document save. Delete them or proceed anyway.`,
					listDescription: 'The list of affected merge fields:',
					confirmButton: true,
					confirmButtonText: 'Proceed',
					mergeFields: errorData,
				},
				width: '800',
				height: '450px',
				backdropClass: 'backdrop-modal--wrapper',
				panelClass: 'app-empty-and-unknown-mf',
			})
			.afterClosed();
	}

	private _handleMergeFieldErrors(
		errorCode: OnSendMergeFieldsErrors,
		errorData: OutDatedMergeFieldsErrorData | EmptyMergeFieldsErroData
	) {
		switch (errorCode) {
			case OnSendMergeFieldsErrors.OutDatedMergeFields:
				return this._showOutdatedMergeFieldsPopup(<OutDatedMergeFieldsErrorData>errorData);

			case OnSendMergeFieldsErrors.EmptyMergeFields:
				return this._showEmptyMergeFieldsPopup(<EmptyMergeFieldsErroData>errorData);
		}
	}

	private _showNotificationDialog(message: string) {
		return this._dialog
			.open(NotificationDialogComponent, { width: '540px', data: { message, label: 'Bad request' } })
			.afterClosed();
	}

	private _sendEnvelopeCommand(url: string, body: SendDocuSignEnvelopeCommand, templateID: number) {
		return this._httpClient
			.post<void>(url, body, {
				context: manualErrorHandlerEnabledContextCreator(true),
			})
			.pipe(
				catchError(({ error }: HttpErrorResponse) => {
					if (error?.error?.code && Object.values(OnSendMergeFieldsErrors).includes(error.error.code)) {
						return this._handleMergeFieldErrors(error?.error.code, error.error.data).pipe(
							switchMap((confirmed) => {
								if (confirmed) {
									body.skipMergeFieldsValidation = true;
									return this._sendEnvelopeCommand(url, body, templateID);
								} else {
									return throwError(error);
								}
							})
						);
					} else {
						if (error?.error?.message) {
							this._showNotificationDialog(error.error.message);
						}
						return throwError(error);
					}
				})
			);
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
							data: {
								title: 'Override',
								body: 'Are you sure you want to override the draft?',
							},
						});

						return ref.afterClosed().pipe(
							switchMap((res) => {
								if (res) {
									return this.saveDraftAsDraftTemplate(agreementId, true, fileContent);
								} else {
									return of(null);
								}
							})
						);
					}
					if (error.error.code === OnSaveMergeFieldsErrors.UnknownMergeFields) {
						return this._dialog
							.open(EmptyAndUnknownMfComponent, {
								data: {
									header: 'Unknown merge fields were detected',
									description: `The following merge fields are unknown. Delete them or proceed anyway.`,
									listDescription: 'The list of affected merge fields:',
									confirmButton: false,
									mergeFields: error.error.data,
								},
								width: '800px',
								height: '450px',
								backdropClass: 'backdrop-modal--wrapper',
								panelClass: 'app-empty-and-unknown-mf',
							})
							.afterClosed()
							.pipe(
								switchMap(() => {
									return of(null);
								})
							);
					}
					return of(error);
				})
			);
	}

	//10.05.2023 delete unused fileContent
	//TODO delete file content in other places and edit types (wrong types cause errors)
	saveDraftAsCompleteTemplate(agreementId: number, fileContent: CompleteTemplateDocumentFileDraftDto) {
		return this._agreementService
			.completeAgreement(agreementId, false, {} as CompleteTemplateDocumentFileDraftDto)
			.pipe(catchError((error) => of(null)));
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
						(version) =>
							version.envelopeStatus &&
							[EnvelopeStatus.Completed, EnvelopeStatus.Sent, EnvelopeStatus.WaitingForOthers].includes(
								version.envelopeStatus
							)
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

	getAgreementName(id: number): Observable<string> {
		return this._agreementService.preview(id).pipe(map((agreement) => agreement.name));
	}

	envelopeRecipientsPreview(
		agreementIds?: number[] | undefined,
		singleEnvelope?: boolean | undefined
	): Observable<EnvelopePreviewDto[]> {
		return this._agreementService.envelopeRecipientsPreview(agreementIds, singleEnvelope);
	}

	sendDocusignEnvelope(templateID: number, body?: SendDocuSignEnvelopeCommand | undefined): Observable<void> {
		let url = this._baseUrl + '/send-docusign-envelope';
		return this._sendEnvelopeCommand(url, body, templateID);
	}

	sendEmailEnvelope(templateID: number, body?: SendEmailEnvelopeCommand | undefined): Observable<void> {
		let url = this._baseUrl + '/send-email-envelope';
		return this._sendEnvelopeCommand(url, body, templateID);
	}
}
