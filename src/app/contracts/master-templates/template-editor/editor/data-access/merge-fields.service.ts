import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MergeFieldsServiceProxy } from 'src/shared/service-proxies/service-proxies';
import { IMergeField } from '../entities';

@Injectable()
export class MergeFieldsService {

	constructor(
		private _mergeFieldsService: MergeFieldsServiceProxy
	) {}

	getMergeFields(templateId: number): Observable<IMergeField> {
		return this._mergeFieldsService.agreementTemplate(templateId).pipe(
			map((res) => res as IMergeField)
		)
	}
}
