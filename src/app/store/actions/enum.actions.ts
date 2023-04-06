import { createAction, props } from '@ngrx/store';
import { EnumEntityTypeDto } from 'src/shared/service-proxies/service-proxies';

export const loadCurrencies = createAction('[Enums] Load Currencies');

export const loadCurrenciesSuccess = createAction(
	'[Enums] Load Currencies Success',
	props<{ currencies: EnumEntityTypeDto[] }>()
);

export const loadRateUnitTypes = createAction('[Enums] Load Rate Unit Types');

export const loadRateUnitTypesSuccess = createAction(
	'[Enums] Load Rate Unit Types Success',
	props<{ rateUnitTypes: EnumEntityTypeDto[] }>()
);
// TODO: add actions for next enums
// saleTypes
// deliveryTypes
// discounts
// projectTypes
// margins
// employmentTypes
// projectCategories
// invoiceFrequencies
// invoicingTimes
// countries
// legalEntities
// commissionTypes
// commissionRecipientTypeList
// commissionFrequencies
// consultantTimeReportingCapList
// expectedWorkloadUnits
// emagineOffices

export const enumError = createAction('[Enums] Enum Error', props<{ error: any }>());
