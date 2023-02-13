import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { throwError } from 'rxjs';
import { catchError, concatMap, map } from 'rxjs/operators';

import { environment } from 'src/environments/environment';
import { IDocumentItem, IDocumentVersion, WrappedValueDto } from '../types';
import { MockTemplateBase64 } from '../helpers/mock-data';

@Injectable()
export class AgreementService {
	baseUrl = `${environment.apiUrl}/api/AgreementTemplate`;

	constructor(private httpClient: HttpClient) {}

	getTemplateMock(): string {
		return MockTemplateBase64;
	}

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

	saveAsDraftTemplate(templateId: number, fileContent: WrappedValueDto<string>) {
		const endpoint = `${this.baseUrl}/${templateId}/document-file/false`;
		return this.httpClient.put(endpoint, fileContent);
	}

	completeTemplate(templateId: number, fileContent: WrappedValueDto<string>) {
		const draftEndpoint = `${this.baseUrl}/${templateId}/document-file/false`;
		const completeEndpoint = `${this.baseUrl}/${templateId}/document-file/complete-template/false`;

		return this.httpClient.put(draftEndpoint, fileContent).pipe(
			concatMap((res) =>
				this.httpClient.patch(completeEndpoint, {
					versionDescription: 'test version',
					propagateChangesToDerivedTemplates: true,
					markActiveAgreementsAsOutdated: true,
				})
			)
		);
	}

	getSimpleList() {
		const endpoint = `${this.baseUrl}/simple-list`;
		return this.httpClient
			.get<{ items: IDocumentItem[] }>(endpoint)
			.pipe(catchError((error: HttpErrorResponse) => throwError(error.error)));
	}

	getTemplateVersions(templateId: number) {
		const endpoint = `${this.baseUrl}/${templateId}/document-file/template-versions`;
		return this.httpClient
			.get<Array<IDocumentVersion>>(endpoint)
			.pipe(catchError((error: HttpErrorResponse) => throwError(error.error)));
	}

	getTemplateByVersion(templateId: number, version: number) {
		const endpoint = `${this.baseUrl}/${templateId}/document-file/${version}`;
		return this.httpClient
			.get(endpoint, {
				responseType: 'blob',
			})
			.pipe(catchError((error: HttpErrorResponse) => throwError(error.error)));
	}
}
