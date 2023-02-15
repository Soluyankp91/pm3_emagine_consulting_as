import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { IMergeField } from '../entities';

@Injectable()
export class MergeFieldsService {
	baseUrl = `${environment.apiUrl}/api/MergeFields`;

	constructor(private httpClient: HttpClient) {}

	getMergeFields(templateId: number): Observable<IMergeField> {
		const endpoint = `${this.baseUrl}/agreementTemplate/${templateId}`;

		return this.httpClient.get(endpoint).pipe(
			map((res) => res as IMergeField),
			catchError((err: HttpErrorResponse) => throwError(err.error))
		);
	}
}
