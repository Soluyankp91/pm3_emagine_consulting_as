import { createReducer, on } from '@ngrx/store';
import * as EnumActions from 'src/app/store/actions/enum.actions';
import { CountryDto, EnumEntityTypeDto, LegalEntityDto } from 'src/shared/service-proxies/service-proxies';

export interface State {
	currencies: EnumEntityTypeDto[];
	rateUnitTypes: EnumEntityTypeDto[];
	salesTypes: EnumEntityTypeDto[];
	deliveryTypes: EnumEntityTypeDto[];
	discounts: EnumEntityTypeDto[];
	projectTypes: EnumEntityTypeDto[];
	margins: EnumEntityTypeDto[];
	employmentTypes: EnumEntityTypeDto[];
	projectCategories: EnumEntityTypeDto[];
	invoiceFrequencies: EnumEntityTypeDto[];
	invoicingTimes: EnumEntityTypeDto[];
	countries: CountryDto[];
	legalEntities: LegalEntityDto[];
	commissionTypes: EnumEntityTypeDto[];
	commissionRecipientTypeList: EnumEntityTypeDto[];
	commissionFrequencies: EnumEntityTypeDto[];
	consultantTimeReportingCapList: EnumEntityTypeDto[];
	expectedWorkloadUnits: EnumEntityTypeDto[];
	emagineOffices: EnumEntityTypeDto[];
	error: any;
}

export const initialState: State = {
	currencies: [],
	rateUnitTypes: [],
	salesTypes: [],
	deliveryTypes: [],
	discounts: [],
	projectTypes: [],
	margins: [],
	employmentTypes: [],
	projectCategories: [],
	invoiceFrequencies: [],
	invoicingTimes: [],
	countries: [],
	legalEntities: [],
	commissionTypes: [],
	commissionRecipientTypeList: [],
	commissionFrequencies: [],
	consultantTimeReportingCapList: [],
	expectedWorkloadUnits: [],
	emagineOffices: [],
	error: null,
};

export const enumReducer = createReducer(
	initialState,
	on(EnumActions.loadCurrencies, (state) => ({ ...state })),
	on(EnumActions.loadCurrenciesSuccess, (state, action) => ({
		...state,
		currencies: action.currencies,
	})),
	on(EnumActions.loadRateUnitTypes, (state) => ({ ...state })),
	on(EnumActions.loadRateUnitTypesSuccess, (state, action) => ({
		...state,
		rateUnitTypes: action.rateUnitTypes,
	})),
	on(EnumActions.loadSaleTypes, (state) => ({ ...state })),
	on(EnumActions.loadSaleTypesSuccess, (state, action) => ({
		...state,
		salesTypes: action.salesTypes,
	})),
	on(EnumActions.loadDeliveryTypes, (state) => ({ ...state })),
	on(EnumActions.loadDeliveryTypesSuccess, (state, action) => ({
		...state,
		deliveryTypes: action.deliveryTypes,
	})),
	on(EnumActions.loadDiscounts, (state) => ({ ...state })),
	on(EnumActions.loadDiscountsSuccess, (state, action) => ({
		...state,
		discounts: action.discounts,
	})),
	on(EnumActions.loadProjectTypes, (state) => ({ ...state })),
	on(EnumActions.loadProjectTypesSuccess, (state, action) => ({
		...state,
		projectTypes: action.projectTypes,
	})),
	on(EnumActions.loadMargins, (state) => ({ ...state })),
	on(EnumActions.loadMarginsSuccess, (state, action) => ({
		...state,
		margins: action.margins,
	})),
	on(EnumActions.loadEmploymentTypes, (state) => ({ ...state })),
	on(EnumActions.loadEmploymentTypesSuccess, (state, action) => ({
		...state,
		employmentTypes: action.employmentTypes,
	})),
	on(EnumActions.loadProjectCategories, (state) => ({ ...state })),
	on(EnumActions.loadProjectCategoriesSuccess, (state, action) => ({
		...state,
		projectCategories: action.projectCategories,
	})),
	on(EnumActions.loadInvoiceFrequencies, (state) => ({ ...state })),
	on(EnumActions.loadInvoiceFrequenciesSuccess, (state, action) => ({
		...state,
		invoiceFrequencies: action.invoiceFrequencies,
	})),
	on(EnumActions.loadInvoicingTimes, (state) => ({ ...state })),
	on(EnumActions.loadInvoicingTimesSuccess, (state, action) => ({
		...state,
		invoicingTimes: action.invoicingTimes,
	})),
	on(EnumActions.loadCountries, (state) => ({ ...state })),
	on(EnumActions.loadCountriesSuccess, (state, action) => ({
		...state,
		countries: action.countries,
	})),
	on(EnumActions.loadLegalEntities, (state) => ({ ...state })),
	on(EnumActions.loadLegalEntitiesSuccess, (state, action) => ({
		...state,
		legalEntities: action.legalEntities,
	})),
	on(EnumActions.loadCommissionTypes, (state) => ({ ...state })),
	on(EnumActions.loadCommissionTypesSuccess, (state, action) => ({
		...state,
		commissionTypes: action.commissionTypes,
	})),
	on(EnumActions.loadCommissionRecipientTypes, (state) => ({ ...state })),
	on(EnumActions.loadCommissionRecipientTypesSuccess, (state, action) => ({
		...state,
		commissionRecipientTypeList: action.commissionRecipientTypeList,
	})),
	on(EnumActions.loadCommissionFrequencies, (state) => ({ ...state })),
	on(EnumActions.loadCommissionFrequenciesSuccess, (state, action) => ({
		...state,
		commissionFrequencies: action.commissionFrequencies,
	})),
	on(EnumActions.loadConsultantTimeReportingCaps, (state) => ({ ...state })),
	on(EnumActions.loadConsultantTimeReportingCapsSuccess, (state, action) => ({
		...state,
		consultantTimeReportingCapList: action.consultantTimeReportingCapList,
	})),
	on(EnumActions.loadExpectedWorkloadUnits, (state) => ({ ...state })),
	on(EnumActions.loadExpectedWorkloadUnitsSuccess, (state, action) => ({
		...state,
		expectedWorkloadUnits: action.expectedWorkloadUnits,
	})),
	on(EnumActions.loadEmagineOffices, (state) => ({ ...state })),
	on(EnumActions.loadEmagineOfficesSuccess, (state, action) => ({
		...state,
		emagineOffices: action.emagineOffices,
	})),
	on(EnumActions.enumError, (state, action) => ({
		...state,
		error: action.error,
	}))
);

export const getCurrencies = (state: State) => state.currencies;
export const getRateUnitTypes = (state: State) => state.rateUnitTypes;
export const getDeliveryTypes = (state: State) => state.deliveryTypes;
export const getDiscounts = (state: State) => state.discounts;
export const getProjectTypes = (state: State) => state.projectTypes;
export const getMargins = (state: State) => state.margins;
export const getEmploymentTypes = (state: State) => state.employmentTypes;
export const getProjectCategories = (state: State) => state.projectCategories;
export const getInvoiceFrequencies = (state: State) => state.invoiceFrequencies;
export const getInvoicingTimes = (state: State) => state.invoicingTimes;
export const getCountries = (state: State) => state.countries;
export const getLegalEntities = (state: State) => state.legalEntities;
export const getCommissionTypes = (state: State) => state.commissionTypes;
export const getCommissionRecipientTypeList = (state: State) => state.commissionRecipientTypeList;
export const getCommissionFrequencies = (state: State) => state.commissionFrequencies;
export const getConsultantTimeReportingCapList = (state: State) => state.consultantTimeReportingCapList;
export const getExpectedWorkloadUnits = (state: State) => state.expectedWorkloadUnits;
export const getEmagineOffices = (state: State) => state.emagineOffices;
