import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable, forkJoin, merge } from 'rxjs';
import { InternalLookupService } from './shared/common/internal-lookup.service';

@Injectable({
	providedIn: 'root',
})
export class InitialDataResolver implements Resolve<any> {
	constructor(private readonly _internalLookupService: InternalLookupService) {}

	resolve(): Observable<any> {
		return merge(this._internalLookupService.getData(), this._internalLookupService.getEmployees());
	}
}
