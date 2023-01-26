import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export type IMergeField = {[key: string]: string};

@Injectable()
export class MergeFieldsService {
  baseUrl = environment.apiUrl;

  constructor(private httpClient: HttpClient) { }

  getMergeFields(templateId: number): Observable<IMergeField>  {
    const endpoint = `${this.baseUrl}/api/MergeFields/agreementTemplate/${templateId}`;

    return this.httpClient.get(endpoint).pipe(
      map(res => res as IMergeField),
      catchError(error => throwError(error))
    )
  }
}
