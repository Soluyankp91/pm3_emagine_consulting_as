import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import {
	coreError,
	loadEmployees,
	loadEmployeesSuccess,
	loadResponsiblePersons,
	loadResponsiblePersonsSuccess,
} from 'src/app/store/actions/core.actions';
import { LookupServiceProxy } from 'src/shared/service-proxies/service-proxies';

@Injectable()
export class CoreEffects {
	constructor(private actions$: Actions, private _lookupService: LookupServiceProxy) {}

	loadEmployees$ = createEffect(() =>
		this.actions$.pipe(
			ofType(loadEmployees),
			switchMap(() => this._lookupService.employees('', true)),
			map((employees) => loadEmployeesSuccess({ employees })),
			catchError((error) => of(coreError({ error })))
		)
	);

	loadResponsiblePersons$ = createEffect(() =>
		this.actions$.pipe(
			ofType(loadResponsiblePersons),
			switchMap(() => this._lookupService.employees('', false)),
			map((responsiblePersons) => loadResponsiblePersonsSuccess({ responsiblePersons })),
			catchError((error) => of(coreError({ error })))
		)
	);

	$catchError = createEffect(() =>
		this.actions$.pipe(
			ofType(coreError),
			switchMap((action) => {
				return of({ type: 'NO_ACTION' });
			})
		)
	);
}
