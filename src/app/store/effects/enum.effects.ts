import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import * as enumActions from 'src/app/store/actions/enum.actions';
import { EnumServiceProxy } from 'src/shared/service-proxies/service-proxies';

@Injectable()
export class EnumEffects {
  constructor(
    private _actions$: Actions,
    private readonly _enumService: EnumServiceProxy
  ) {}

  loadCurrencies$ = createEffect(() =>
    this._actions$.pipe(
      ofType(enumActions.loadCurrencies),
      switchMap(() => this._enumService.currencies()),
      map((currencies) => enumActions.loadCurrenciesSuccess({ currencies })),
      catchError((error) => of(enumActions.enumError({ error }))),
    ),
  );

  loadRateUnitTypes$ = createEffect(() =>
    this._actions$.pipe(
      ofType(enumActions.loadRateUnitTypes),
      switchMap(() => this._enumService.rateUnitTypes()),
      map((rateUnitTypes) => enumActions.loadRateUnitTypesSuccess({ rateUnitTypes })),
      catchError((error) => of(enumActions.enumError({ error }))),
    ),
  );

  loadSaleTypes$ = createEffect(() =>
    this._actions$.pipe(
      ofType(enumActions.loadSaleTypes),
      switchMap(() => this._enumService.salesTypes()),
      map((salesTypes) => enumActions.loadSaleTypesSuccess({ salesTypes })),
      catchError((error) => of(enumActions.enumError({ error }))),
    ),
  );

  loadDeliveryTypes$ = createEffect(() =>
    this._actions$.pipe(
      ofType(enumActions.loadDeliveryTypes),
      switchMap(() => this._enumService.deliveryTypes()),
      map((deliveryTypes) => enumActions.loadDeliveryTypesSuccess({ deliveryTypes })),
      catchError((error) => of(enumActions.enumError({ error }))),
    ),
  );

  loadDiscounts$ = createEffect(() =>
    this._actions$.pipe(
      ofType(enumActions.loadDiscounts),
      switchMap(() => this._enumService.discount()),
      map((discounts) => enumActions.loadDiscountsSuccess({ discounts })),
      catchError((error) => of(enumActions.enumError({ error }))),
    ),
  );

  loadProjectTypes$ = createEffect(() =>
    this._actions$.pipe(
      ofType(enumActions.loadProjectTypes),
      switchMap(() => this._enumService.projectTypeAll()),
      map((projectTypes) => enumActions.loadProjectTypesSuccess({ projectTypes })),
      catchError((error) => of(enumActions.enumError({ error }))),
    ),
  );

  loadMargins$ = createEffect(() =>
    this._actions$.pipe(
      ofType(enumActions.loadMargins),
      switchMap(() => this._enumService.margins()),
      map((margins) => enumActions.loadMarginsSuccess({ margins })),
      catchError((error) => of(enumActions.enumError({ error }))),
    ),
  );

  loadEmploymentTypes$ = createEffect(() =>
    this._actions$.pipe(
      ofType(enumActions.loadEmploymentTypes),
      switchMap(() => this._enumService.employmentType()),
      map((employmentTypes) => enumActions.loadEmploymentTypesSuccess({ employmentTypes })),
      catchError((error) => of(enumActions.enumError({ error }))),
    ),
  );

  loadProjectCategories$ = createEffect(() =>
    this._actions$.pipe(
      ofType(enumActions.loadProjectCategories),
      switchMap(() => this._enumService.projectCategory()),
      map((projectCategories) => enumActions.loadProjectCategoriesSuccess({ projectCategories })),
      catchError((error) => of(enumActions.enumError({ error }))),
    ),
  );

  loadInvoiceFrequencies$ = createEffect(() =>
    this._actions$.pipe(
      ofType(enumActions.loadInvoiceFrequencies),
      switchMap(() => this._enumService.invoiceFrequencies()),
      map((invoiceFrequencies) => enumActions.loadInvoiceFrequenciesSuccess({ invoiceFrequencies })),
      catchError((error) => of(enumActions.enumError({ error }))),
    ),
  );

  loadInvoicingTimes$ = createEffect(() =>
    this._actions$.pipe(
      ofType(enumActions.loadInvoicingTimes),
      switchMap(() => this._enumService.invoicingTimes()),
      map((invoicingTimes) => enumActions.loadInvoicingTimesSuccess({ invoicingTimes })),
      catchError((error) => of(enumActions.enumError({ error }))),
    ),
  );

  loadCountries$ = createEffect(() =>
    this._actions$.pipe(
      ofType(enumActions.loadCountries),
      switchMap(() => this._enumService.countries()),
      map((countries) => enumActions.loadCountriesSuccess({ countries })),
      catchError((error) => of(enumActions.enumError({ error }))),
    ),
  );

  loadLegalEntities$ = createEffect(() =>
    this._actions$.pipe(
      ofType(enumActions.loadLegalEntities),
      switchMap(() => this._enumService.legalEntities()),
      map((legalEntities) => enumActions.loadLegalEntitiesSuccess({ legalEntities })),
      catchError((error) => of(enumActions.enumError({ error }))),
    ),
  );

  loadCommissionTypes$ = createEffect(() =>
    this._actions$.pipe(
      ofType(enumActions.loadCommissionTypes),
      switchMap(() => this._enumService.commissionTypes()),
      map((commissionTypes) => enumActions.loadCommissionTypesSuccess({ commissionTypes })),
      catchError((error) => of(enumActions.enumError({ error }))),
    ),
  );

  loadCommissionRecipientTypes$ = createEffect(() =>
    this._actions$.pipe(
      ofType(enumActions.loadCommissionRecipientTypes),
      switchMap(() => this._enumService.recipientTypes()),
      map((commissionRecipientTypeList) => enumActions.loadCommissionRecipientTypesSuccess({ commissionRecipientTypeList })),
      catchError((error) => of(enumActions.enumError({ error }))),
    ),
  );

  loadCommissionFrequencies$ = createEffect(() =>
    this._actions$.pipe(
      ofType(enumActions.loadCommissionFrequencies),
      switchMap(() => this._enumService.commissionFrequency()),
      map((commissionFrequencies) => enumActions.loadCommissionFrequenciesSuccess({ commissionFrequencies })),
      catchError((error) => of(enumActions.enumError({ error }))),
    ),
  );

  loadConsultantTimeReportingCaps$ = createEffect(() =>
    this._actions$.pipe(
      ofType(enumActions.loadConsultantTimeReportingCaps),
      switchMap(() => this._enumService.consultantTimeReportingCap()),
      map((consultantTimeReportingCapList) => enumActions.loadConsultantTimeReportingCapsSuccess({ consultantTimeReportingCapList })),
      catchError((error) => of(enumActions.enumError({ error }))),
    ),
  );

  loadExpectedWorkloadUnits$ = createEffect(() =>
    this._actions$.pipe(
      ofType(enumActions.loadExpectedWorkloadUnits),
      switchMap(() => this._enumService.expectedWorkloadUnit()),
      map((expectedWorkloadUnits) => enumActions.loadExpectedWorkloadUnitsSuccess({ expectedWorkloadUnits })),
      catchError((error) => of(enumActions.enumError({ error }))),
    ),
  );

  loadEmagineOffices$ = createEffect(() =>
    this._actions$.pipe(
      ofType(enumActions.loadEmagineOffices),
      switchMap(() => this._enumService.emagineOffice()),
      map((emagineOffices) => enumActions.loadEmagineOfficesSuccess({ emagineOffices })),
      catchError((error) => of(enumActions.enumError({ error }))),
    ),
  );

  $catchError = createEffect(() =>
    this._actions$.pipe(
      ofType(enumActions.enumError),
      switchMap((action) => {
        return of({ type: 'NO_ACTION' });
      }),
    ),
  );
}
