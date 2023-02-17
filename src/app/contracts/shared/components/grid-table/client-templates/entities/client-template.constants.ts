import { Actions } from 'src/app/contracts/shared/entities/contracts.interfaces';
import { EHeaderCells, IHeaderCell } from '../../mat-grid.interfaces';

export const DISPLAYED_COLUMNS: string[] = [
	'language',
	'agreementTemplateId',
	'clientName',
	'name',
	'agreementType',
	'recipientTypeId',
	'legalEntityIds',
	'salesTypeIds',
	'deliveryTypeIds',
	'contractTypeIds',
	'lastUpdateDateUtc',
	'lastUpdatedByLowerCaseInitials',
	'linkState',
	'linkStateAccepted',
	'isEnabled',
];
export const CLIENT_TEMPLATE_HEADER_CELLS: IHeaderCell[] = [
	{
		type: EHeaderCells.FILTER,
		filter: {
			formControlName: 'language',
			component: () =>
				import('../../master-templates/filters/agreement-languages-filter/agreement-filter.component').then(
					(it) => it.AgreementLanguagesFilterComponent
				),
		},
		class: 'language-column',
		sticky: true,
	},
	{
		type: EHeaderCells.SORT,
		title: 'ID',
		class: 'id-column',
		sticky: true,
	},
	{
		type: EHeaderCells.SORT,
		title: 'Template Name',
		class: 'template-name-column',
		sticky: true,
	},
	{
		type: EHeaderCells.SORT,
		title: 'Client',
		class: 'client-column',
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
		class: 'agreementType-column',
	},
	{
		type: EHeaderCells.FILTER,
		filter: {
			formControlName: 'recipientTypeId',
			component: () =>
				import('../../master-templates/filters/recipient-types-filter/recipient-types-filter.component').then(
					(it) => it.RecipientTypesFilterComponent
				),
		},
		class: 'recipientTypeId-column',
	},
	{
		type: EHeaderCells.FILTER,
		filter: {
			formControlName: 'legalEntityIds',
			component: () =>
				import('../../master-templates/filters/legal-entities-filter/legal-entities-filter.component').then(
					(it) => it.LegalEntitiesFilterComponent
				),
		},
		class: 'legalEntityId-column',
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
		class: 'salesType-column',
	},
	{
		type: EHeaderCells.FILTER,
		filter: {
			formControlName: 'deliveryTypeIds',
			component: () =>
				import('../../master-templates/filters/delivery-types-filter/delivery-types-filter.component').then(
					(it) => it.DeliveryTypesFilterComponent
				),
		},
		class: 'deliveryType-column',
	},
	{
		type: EHeaderCells.FILTER,
		filter: {
			formControlName: 'contractTypeIds',
			component: () =>
				import('../../master-templates/filters/employment-types-filter/employment-types-filter.component').then(
					(it) => it.EmploymentTypesFilterComponent
				),
		},
		class: 'contractType-column',
	},
	{
		type: EHeaderCells.SORT,
		title: 'Last updated',
		class: 'last-updated-column',
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
		class: 'last-updated-by-employee-column',
	},
	{
		type: EHeaderCells.FILTER,
		filter: {
			formControlName: 'linkState',
			component: () =>
				import('../../client-templates/entities/filters/mode-filter/mode-filter.component').then(
					(it) => it.ClientModeFilterComponent
				),
		},
		class: 'link-state-column',
	},
	{
		type: EHeaderCells.FILTER,
		filter: {
			formControlName: 'linkStateAccepted',
			component: () =>
				import('../../client-templates/entities/filters/approval-filter/approval-filter.component').then(
					(it) => it.ApprovalFilterComponent
				),
		},
		class: 'linkStateAccepted-column',
	},
	{
		type: EHeaderCells.FILTER,
		title: 'Status',
		filter: {
			formControlName: 'isEnabled',
			component: () =>
				import('../../master-templates/filters/enabled-filter/is-enabled.component').then((it) => it.IsEnabledComponent),
		},
		class: 'status-column',
	},
];

export const PAGE_SIZE_OPTIONS: number[] = [5, 20, 50, 100];
export const AUTOCOMPLETE_SEARCH_ITEMS_COUNT = 100;
export const DEFAULT_SIZE_OPTION: number = PAGE_SIZE_OPTIONS[0];
export const CLIENT_TEMPLATE_ACTIONS: Actions[] = [
	{
		label: 'Edit',
		actionType: 'EDIT',
		actionIcon: 'table-edit-icon',
	},
	{
		label: 'Duplicate',
		actionType: 'DUPLICATE',
		actionIcon: 'duplicate-icon',
	},
	{
		label: 'Copy Link',
		actionType: 'COPY',
		actionIcon: 'copy-icon',
	},
];
export const CLIENT_TEMPLATE_BOTTOM_ACTIONS: Actions[] = [
	{
		label: 'Approve',
		actionType: 'APPROVE',
		actionIcon: 'approved-icon',
	},
];
export const INITIAL_PAGE_INDEX = 0;
export const MODE_FILTER_OPTIONS = [
	{
		id: 7,
		name: 'Fully linked',
	},
	{
		id: 5,
		name: 'Summary unlinked',
	},
	{
		id: 3,
		name: 'Document unlinked',
	},
	{
		id: 1,
		name: 'Fully unlinked',
	},
	{
		id: 0,
		name: 'Not applicable',
	},
];
export const APPROVAL_FILTER_OPTIONS = [
	{
		id: true,
		name: 'Approved',
	},
	{
		id: false,
		name: 'To approve',
	},
	{
		id: null,
		name: 'Not applicable',
	},
];
