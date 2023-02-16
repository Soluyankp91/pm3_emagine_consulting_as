import { Actions } from 'src/app/contracts/shared/entities/contracts.interfaces';
import { EHeaderCells, IHeaderCell } from '../../mat-grid.interfaces';

export const DISPLAYED_COLUMNS: string[] = [
	'language',
	'agreementId',
	'agreementName',
	'agreementType',
	'recipientTypeId',
	'mode',
	'status',
	'startDate',
	'endDate',
	'saleManager',
	'contractManager',
];
export const AGREEMENT_HEADER_CELLS: IHeaderCell[] = [
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
		title: 'Agreement name',
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
			formControlName: 'mode',
			component: () =>
				import('../../agreements/filters/mode-filter/mode-filter.component').then(
					(it) => it.AgreementModeFilterComponent
				),
		},
	},
	{
		type: EHeaderCells.FILTER,
		filter: {
			formControlName: 'status',
			component: () =>
				import('../../agreements/filters/statuses-filter/statuses-filter.component').then(
					(it) => it.StatusesFilterComponent
				),
		},
	},
	{
		type: EHeaderCells.SORT,
		title: 'Start date',
	},
	{
		type: EHeaderCells.SORT,
		title: 'End date',
	},
	{
		type: EHeaderCells.FILTER,
		filter: {
			formControlName: 'saleManager',
			component: () =>
				import('../../agreements/filters/sales-managers-filter/sales-managers-filter.component').then(
					(it) => it.SalesManagersFilterComponent
				),
		},
	},
	{
		type: EHeaderCells.FILTER,
		filter: {
			formControlName: 'contractManager',
			component: () =>
				import('../filters/contact-manager-filter/contract-manager-filter.component').then(
					(it) => it.ContractManagerFilterComponent
				),
		},
	},
];

export const PAGE_SIZE_OPTIONS: number[] = [5, 20, 50, 100];
export const AUTOCOMPLETE_SEARCH_ITEMS_COUNT = 100;
export const DEFAULT_SIZE_OPTION: number = PAGE_SIZE_OPTIONS[0];
export const AGREEMENT_ACTIONS: Actions[] = [
	{
		label: 'Edit',
		actionType: 'EDIT',
	},
	{
		label: 'Duplicate',
		actionType: 'DUPLICATE',
	},
	{
		label: 'Copy link',
		actionType: 'COPY',
	},
];
export const INITIAL_PAGE_INDEX = 0;

export const MODE_FILTER_OPTIONS = [
	{
		id: 0,
		name: 'Active',
	},
	{
		id: 1,
		name: 'New version available',
	},
	{
		id: 2,
		name: 'Ended',
	},
];
export const STATUTES = [
	{
		id: 1,
		name: 'Created',
	},
	{
		id: 2,
		name: 'Created in DocuSign',
	},
	{
		id: 3,
		name: 'Sent',
	},
	{
		id: 4,
		name: 'Viewed',
	},
	{
		id: 5,
		name: 'Delivery failure',
	},
	{
		id: 6,
		name: 'Voided',
	},
	{
		id: 7,
		name: 'Signed',
	},
	{
		id: 8,
		name: 'Declined',
	},
	{
		id: 9,
		name: 'Waiting for others',
	},
	{
		id: 10,
		name: 'Completed',
	},
	{
		id: 11,
		name: 'About to expire',
	},
	{
		id: 12,
		name: 'Expired',
	},
];
