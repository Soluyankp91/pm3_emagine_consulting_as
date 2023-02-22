import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { throwError } from 'rxjs';
import { catchError, concatMap, map } from 'rxjs/operators';

import { environment } from 'src/environments/environment';
import { AgreementServiceProxy, CompleteTemplateDocumentFileDraftDto, StringWrappedValueDto } from 'src/shared/service-proxies/service-proxies';
import { IDocumentVersion } from '../entities';
import { AgreementAbstractService } from './agreement-abstract.service';

@Injectable()
export class AgreementService implements AgreementAbstractService {
	private readonly _baseUrl = `${environment.apiUrl}/api/Agreement`;

	constructor(
		private httpClient: HttpClient,
		private _agreementService: AgreementServiceProxy
		) {

		}

	getTemplate(agreementId: number) {
		const endpoint = `${this._baseUrl}/${agreementId}/document-file/latest-agreement-version/true`;

		return this.httpClient
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
		return this.httpClient
			.get(endpoint, {
				responseType: 'blob',
			})
			.pipe(catchError((error: HttpErrorResponse) => throwError(error.error)));
	}

	saveAsDraftTemplate(agreementId: number, fileContent: StringWrappedValueDto) {
		return this._agreementService
			.documentFilePUT(agreementId, false, fileContent)
	}

	completeTemplate(agreementId: number, fileContent: StringWrappedValueDto) {
		return this._agreementService
			.documentFilePUT(agreementId, false, fileContent).pipe(
				concatMap(() => 
					this._agreementService.completeAgreement(agreementId, false, CompleteTemplateDocumentFileDraftDto.fromJS({
						versionDescription: 'test version',
						propagateChangesToDerivedTemplates: true,
						markActiveAgreementsAsOutdated: true,
					}))
				)
			)
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

	
}
