import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { ConfigurationServiceProxy } from '../../shared/service-proxies/service-proxies';
import { catchError } from 'rxjs/operators';

@Injectable({
	providedIn: 'root',
})
export class ContractsProductionGuard implements CanActivate {
	constructor(private _configurationService: ConfigurationServiceProxy) {}
	canActivate(
		route: ActivatedRouteSnapshot,
		state: RouterStateSnapshot
	): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
		return true; // this._configurationService.contractsEnabled().pipe(catchError(() => of(false)));
	}
}
