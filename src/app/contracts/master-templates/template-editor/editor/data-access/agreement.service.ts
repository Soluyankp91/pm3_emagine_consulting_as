import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { throwError } from 'rxjs';
import { catchError, concatMap, map } from 'rxjs/operators';

import { environment } from 'src/environments/environment';
import { AgreementTemplateServiceProxy, CompleteTemplateDocumentFileDraftDto, StringWrappedValueDto } from 'src/shared/service-proxies/service-proxies';

@Injectable()
export class AgreementService {
	baseUrl = `${environment.apiUrl}/api/AgreementTemplate`;

	constructor(
		private httpClient: HttpClient,
		private _agreementTemplateService: AgreementTemplateServiceProxy
		) {}

	getTemplate(templateId: number) {
		const endpoint = `${this.baseUrl}/${templateId}/document-file/latest-template-version/true`;

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
		const endpoint = `${this.baseUrl}/${templateId}/document-file/${version}`;
		return this.httpClient
			.get(endpoint, {
				responseType: 'blob',
			})
			.pipe(catchError((error: HttpErrorResponse) => throwError(error.error)));
	}

	saveAsDraftTemplate(templateId: number, fileContent: StringWrappedValueDto) {
		return this._agreementTemplateService
			.documentFilePUT2(templateId, false, fileContent)
	}

	completeTemplate(templateId: number, fileContent: StringWrappedValueDto) {
		return this._agreementTemplateService
			.documentFilePUT2(templateId, false, fileContent).pipe(
				concatMap(() => 
					this._agreementTemplateService.completeTemplate(templateId, false, CompleteTemplateDocumentFileDraftDto.fromJS({
						versionDescription: 'test version',
						propagateChangesToDerivedTemplates: true,
						markActiveAgreementsAsOutdated: true,
					}))
				)
			)
	}

	getSimpleList() {
		return this._agreementTemplateService.simpleList2()
			.pipe(
				catchError((error: HttpErrorResponse) => throwError(error.error))
			);
	}

	getTemplateVersions(templateId: number) {
		return this._agreementTemplateService.templateVersions(templateId)
			.pipe(catchError((error: HttpErrorResponse) => throwError(error.error)));
	}

	
}
