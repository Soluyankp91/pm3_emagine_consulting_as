import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MergeFieldsServiceProxy } from 'src/shared/service-proxies/service-proxies';
import { IMergeField } from '../entities';
import { MergeFieldsAbstractService } from './merge-fields-abstract';

@Injectable()
export class MergeFieldsService implements MergeFieldsAbstractService {

	constructor(
		private _mergeFieldsService: MergeFieldsServiceProxy
	) {}

	getMergeFields(templateId: number): Observable<IMergeField> {
		return this._mergeFieldsService.agreementTemplate(templateId).pipe(
			map((res) => res as IMergeField)
		)
	}
}
