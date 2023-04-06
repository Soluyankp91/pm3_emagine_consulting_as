import { createAction, props } from '@ngrx/store';
import { CountryDto, EnumEntityTypeDto, LegalEntityDto } from 'src/shared/service-proxies/service-proxies';

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

export const loadSaleTypes = createAction('[Enums] Load Sale Types');
export const loadSaleTypesSuccess = createAction('[Enums] Load Sale Types Success', props<{ salesTypes: EnumEntityTypeDto[] }>());

export const loadDeliveryTypes = createAction('[Enums] Load Delivery Types');
export const loadDeliveryTypesSuccess = createAction(
	'[Enums] Load Delivery Types Success',
	props<{ deliveryTypes: EnumEntityTypeDto[] }>()
);

export const loadDiscounts = createAction('[Enums] Load Discounts');
export const loadDiscountsSuccess = createAction('[Enums] Load Discounts Success', props<{ discounts: EnumEntityTypeDto[] }>());

export const loadProjectTypes = createAction('[Enums] Load Project Types');
export const loadProjectTypesSuccess = createAction(
	'[Enums] Load Project Types Success',
	props<{ projectTypes: EnumEntityTypeDto[] }>()
);

export const loadMargins = createAction('[Enums] Load Margins');
export const loadMarginsSuccess = createAction('[Enums] Load Margins Success', props<{ margins: EnumEntityTypeDto[] }>());

export const loadEmploymentTypes = createAction('[Enums] Load Employment Types');
export const loadEmploymentTypesSuccess = createAction(
	'[Enums] Load Employment Types Success',
	props<{ employmentTypes: EnumEntityTypeDto[] }>()
);

export const loadProjectCategories = createAction('[Enums] Load Project Categories');
export const loadProjectCategoriesSuccess = createAction(
	'[Enums] Load Project Categories Success',
	props<{ projectCategories: EnumEntityTypeDto[] }>()
);

export const loadInvoiceFrequencies = createAction('[Enums] Load Invoice Frequencies');
export const loadInvoiceFrequenciesSuccess = createAction(
	'[Enums] Load Invoice Frequencies Success',
	props<{ invoiceFrequencies: EnumEntityTypeDto[] }>()
);

export const loadInvoicingTimes = createAction('[Enums] Load Invoicing Times');
export const loadInvoicingTimesSuccess = createAction(
	'[Enums] Load Invoicing Times Success',
	props<{ invoicingTimes: EnumEntityTypeDto[] }>()
);

export const loadCountries = createAction('[Enums] Load Countries');
export const loadCountriesSuccess = createAction('[Enums] Load Countries Success', props<{ countries: CountryDto[] }>());

export const loadLegalEntities = createAction('[Enums] Load Legal Entities');
export const loadLegalEntitiesSuccess = createAction(
	'[Enums] Load Legal Entities Success',
	props<{ legalEntities: LegalEntityDto[] }>()
);

export const loadCommissionTypes = createAction('[Enums] Load Commission Types');
export const loadCommissionTypesSuccess = createAction(
	'[Enums] Load Commission Types Success',
	props<{ commissionTypes: EnumEntityTypeDto[] }>()
);

export const loadCommissionRecipientTypes = createAction('[Enums] Load Commission Recipient Types');
export const loadCommissionRecipientTypesSuccess = createAction(
	'[Enums] Load Commission Recipient Types Success',
	props<{ commissionRecipientTypeList: EnumEntityTypeDto[] }>()
);

export const loadCommissionFrequencies = createAction('[Enums] Load Commission Frequencies');
export const loadCommissionFrequenciesSuccess = createAction(
	'[Enums] Load Commission Frequencies Success',
	props<{ commissionFrequencies: EnumEntityTypeDto[] }>()
);

export const loadConsultantTimeReportingCaps = createAction('[Enums] Load Consultant Time Reporting Caps');
export const loadConsultantTimeReportingCapsSuccess = createAction(
	'[Enums] Load Consultant Time Reporting Caps Success',
	props<{ consultantTimeReportingCapList: EnumEntityTypeDto[] }>()
);

export const loadExpectedWorkloadUnits = createAction('[Enums] Load Expected Workload Units');
export const loadExpectedWorkloadUnitsSuccess = createAction(
	'[Enums] Load Expected Workload Units Success',
	props<{ expectedWorkloadUnits: EnumEntityTypeDto[] }>()
);

export const loadEmagineOffices = createAction('[Enums] Load Emagine Offices');
export const loadEmagineOfficesSuccess = createAction(
	'[Enums] Load Emagine Offices Success',
	props<{ emagineOffices: EnumEntityTypeDto[] }>()
);

export const enumError = createAction('[Enums] Enum Error', props<{ error: any }>());
