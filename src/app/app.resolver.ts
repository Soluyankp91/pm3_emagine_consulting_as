import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { InternalLookupService } from './shared/common/internal-lookup.service';

@Injectable({
	providedIn: 'root',
})
export class InitialDataResolver implements Resolve<any> {
	/**
	 * Constructor
	 */
	constructor(
		private readonly _internalLookupService: InternalLookupService
	) {}

	// -----------------------------------------------------------------------------------------------------
	// @ Public methods
	// -----------------------------------------------------------------------------------------------------

	/**
	 * Use this resolver to resolve initial data in the application
	 *
	 * @param route
	 * @param state
	 */
	resolve(): Observable<any> {
        return this._internalLookupService.getData()
	}
}
