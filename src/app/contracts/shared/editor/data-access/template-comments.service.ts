import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { environment } from 'src/environments/environment';
import { CommentsAbstractService } from './abstract-comments.service';

@Injectable()
export class TemplateCommentsService implements CommentsAbstractService {
	private readonly _baseUrl = `${environment.apiUrl}/api/AgreementTemplateComment`;

	constructor(
		private httpClient: HttpClient,
		// private _commentsService: AgreementServiceProxy
		) {}

	// getComments(templateId: number, docVersion: number): Observable<any[]> {
	// 	const endpoint = `${this._baseUrl}/${templateId}/${docVersion}`;

	// 	return this.httpClient
	// 		.get(endpoint, {
	// 			responseType: 'blob',
	// 		})
	// }
}
