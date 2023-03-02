import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { of, throwError } from 'rxjs';
import { IComment } from '../entities';
import { environment } from 'src/environments/environment';
@Injectable()
export class TemplateCommentService {
	baseUrl = `${environment.apiUrl}/api/AgreementTemplateComment`;

	constructor(private _httpClient: HttpClient) {}

	getByTemplateID(templateID: number, version: number) {
		const endpoint = `${this.baseUrl}/${templateID}/${version}`;
		return this._httpClient
			.get<Array<IComment>>(endpoint)
			.pipe(catchError((error: HttpErrorResponse) => throwError(error.error)));
	}

	createComment(templateID: number, version: number, message: string, parentID?: number) {
		const endpoint = `${this.baseUrl}/${templateID}/${version}`;
		const body = { value: message };
		let params = new HttpParams();
		if (parentID) {
			params = params.set('parentCommentId', parentID);
		}

		return this._httpClient
			.put<number>(endpoint, body, { params })
			.pipe(catchError((error: HttpErrorResponse) => throwError(error.error)));
	}

	deleteComment(commentID: number) {
		const endpoint = `${this.baseUrl}/${commentID}`;
		return this._httpClient.delete(endpoint).pipe(catchError((error: HttpErrorResponse) => throwError(error.error)));
	}

	editComment(commentID: number, text: string) {
		// TODO: implement http request for update template comment.
		return of(commentID);
	}
}
