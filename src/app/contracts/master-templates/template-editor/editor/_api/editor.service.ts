import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, concatMap, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { IDocumentItem, IDocumentVersion } from '../types';
export interface WrappedValueDto<TValue> {
	value: TValue;
}
@Injectable()
export class EditorService {
	baseUrl = `${environment.apiUrl}/api/AgreementTemplate`;

	constructor(private httpClient: HttpClient) {}

	getTemplateMock(): string {
		const documentAsBase64 = `
    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
    `;
		return documentAsBase64;
	}

	getTemplate(templateId: number): Observable<Blob> {
		const endpoint = `${this.baseUrl}/${templateId}/document-file/latest-template-version/true`;

		return this.httpClient
			.get(endpoint, {
				responseType: 'blob',
			})
			.pipe(
				map((res) => res),
				catchError((error) => throwError(error))
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
