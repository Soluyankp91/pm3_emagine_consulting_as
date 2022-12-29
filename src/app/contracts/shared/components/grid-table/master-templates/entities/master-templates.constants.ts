import { EHeaderCells, IHeaderCell } from 'src/app/contracts/shared/components/grid-table/mat-grid.interfaces';
import { Actions } from 'src/app/contracts/shared/entities/contracts.interfaces';

export const DISPLAYED_COLUMNS: string[] = [
	'language',
	'agreementTemplateId',
	'name',
	'agreementType',
	'recipientTypeId',
	'legalEntityIds',
	'salesTypeIds',
	'deliveryTypeIds',
	'contractTypeIds',
	'lastUpdateDateUtc',
	'lastUpdatedByLowerCaseInitials',
	'isEnabled',
];
export const MASTER_TEMPLATE_HEADER_CELLS: IHeaderCell[] = [
	{
		type: EHeaderCells.FILTER,
		filter: {
			formControlName: 'language',
			component: () =>
				import('../../master-templates/filters/agreement-languages-filter/agreement-filter.component').then(
					(it) => it.AgreementLanguagesFilterComponent
				),
		},
	},
	{
		type: EHeaderCells.SORT,
		title: 'ID',
	},
	{
		type: EHeaderCells.SORT,
		title: 'Template Name',
	},
	{
		type: EHeaderCells.FILTER,
		filter: {
			formControlName: 'agreementType',
			component: () =>
				import('../../master-templates/filters/agreement-types-filter/agreement-types-filter.component').then(
					(it) => it.AgreementTypesFilterComponent
				),
		},
	},
	{
		type: EHeaderCells.FILTER,
		filter: {
			formControlName: 'recipientTypeId',
			component: () =>
				import(
					'../../master-templates/filters/recipient-types-filter/recipient-types-filter/recipient-types-filter.component'
				).then((it) => it.RecipientTypesFilterComponent),
		},
	},
	{
		type: EHeaderCells.FILTER,
		filter: {
			formControlName: 'legalEntityIds',
			component: () =>
				import(
					'../../master-templates/filters/legal-entities-filter/legal-entities-filter/legal-entities-filter.component'
				).then((it) => it.LegalEntitiesFilterComponent),
		},
	},
	{
		type: EHeaderCells.FILTER,
		filter: {
			formControlName: 'salesTypeIds',
			component: () =>
				import('../../master-templates/filters/sales-types-filter/sales-types-filter.component').then(
					(it) => it.SalesTypesFilterComponent
				),
		},
	},
	{
		type: EHeaderCells.FILTER,
		filter: {
			formControlName: 'deliveryTypeIds',
			component: () =>
				import(
					'../../master-templates/filters/delivery-types-filter/delivery-types-filter/delivery-types-filter.component'
				).then((it) => it.DeliveryTypesFilterComponent),
		},
	},
	{
		type: EHeaderCells.FILTER,
		filter: {
			formControlName: 'contractTypeIds',
			component: () =>
				import(
					'../../master-templates/filters/employment-types-filter/employment-types-filter/employment-types-filter.component'
				).then((it) => it.EmploymentTypesFilterComponent),
		},
	},
	{
		type: EHeaderCells.SORT,
		title: 'Last updated',
	},
	{
		type: EHeaderCells.FILTER,
		filter: {
			formControlName: 'lastUpdatedByLowerCaseInitials',
			component: () =>
				import('../../master-templates/filters/employees-filter/employees-filter.component').then(
					(it) => it.EmployeesFilterComponent
				),
		},
	},
	{
		type: EHeaderCells.FILTER,
		title: 'Status',
		filter: {
			formControlName: 'isEnabled',
			component: () =>
				import('../../master-templates/filters/enabled-filter/is-enabled/is-enabled.component').then(
					(it) => it.IsEnabledComponent
				),
		},
	},
];
export const FILTER_LABEL_MAP: { [key: string]: string } = {
	language: 'Language',
	agreementType: 'Type',
	recipientTypeId: 'Recipients',
	legalEntityIds: 'Legal entities',
	salesTypeIds: 'Sales type',
	deliveryTypeIds: 'Delivery type',
	contractTypeIds: 'Contract type',
	isEnabled: 'Status',
	lastUpdatedByLowerCaseInitials: 'By',
};

export const PAGE_SIZE_OPTIONS: number[] = [5, 20, 50, 100];
export const AUTOCOMPLETE_SEARCH_ITEMS_COUNT = 100;
export const DEFAULT_SIZE_OPTION: number = PAGE_SIZE_OPTIONS[0];
export const MASTER_TEMPLATE_ACTIONS: Actions[] = [
	{
		label: 'Edit',
		actionType: 'EDIT',
	},
	{
		label: 'Duplicate',
		actionType: 'DUPLICATE',
	},
];
export const INITIAL_PAGE_INDEX = 0;
