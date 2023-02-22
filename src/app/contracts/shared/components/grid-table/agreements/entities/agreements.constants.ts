import { Actions } from 'src/app/contracts/shared/entities/contracts.interfaces';
import { EHeaderCells, IHeaderCell } from '../../mat-grid.interfaces';

export const DISPLAYED_COLUMNS: string[] = [
	'language',
	'agreementId',
	'agreementName',
	'actualRecipientName',
	'recipientTypeId',
	'agreementType',
	'legalEntityId',
	'clientName',
	'companyName',
	'consultantName',
	'salesTypeIds',
	'deliveryTypeIds',
	'contractTypeIds',
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
		title: 'Agreement name',
		class: 'agreement-name-column',
		sticky: true,
	},
	{
		type: EHeaderCells.SORT,
		title: 'Actual Recipient',
		class: 'actual-recipient-column',
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
		class: 'recipientId-column',
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
			formControlName: 'legalEntityId',
			component: () =>
				import('../../master-templates/filters/legal-entities-filter/legal-entities-filter.component').then(
					(it) => it.LegalEntitiesFilterComponent
				),
		},
		class: 'legalEntityId-column',
	},
	{
		type: EHeaderCells.SORT,
		title: 'Client',
		class: 'client-column',
	},
	{
		type: EHeaderCells.SORT,
		title: 'Company name',
		class: 'company-column',
	},
	{
		type: EHeaderCells.SORT,
		title: 'Consultant name',
		class: 'consultant-column',
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
		type: EHeaderCells.FILTER,
		filter: {
			formControlName: 'mode',
			component: () =>
				import('../../agreements/filters/mode-filter/mode-filter.component').then(
					(it) => it.AgreementModeFilterComponent
				),
		},
		class: 'mode-column',
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
		class: 'status-column',
	},
	{
		type: EHeaderCells.SORT,
		title: 'Strt. date',
		class: 'start-date-column',
	},
	{
		type: EHeaderCells.SORT,
		title: 'Exp. date',
		class: 'end-date-column',
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
		class: 'saleManager-column',
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
		class: 'contractManager-column',
	},
];

export const PAGE_SIZE_OPTIONS: number[] = [5, 20, 50, 100];
export const AUTOCOMPLETE_SEARCH_ITEMS_COUNT = 100;
export const DEFAULT_SIZE_OPTION: number = PAGE_SIZE_OPTIONS[0];
export const WORKFLOW_AGREEMENT_ACTIONS: Actions[] = [
	{
		label: 'Download *.pdf',
		actionType: 'DOWNLOAD_PDF',
		actionIcon: 'pdf-download-icon',
	},
	{
		label: 'Download *.doc',
		actionType: 'DOWNLOAD_DOC',
		actionIcon: 'doc-download-icon',
	},
	{
		label: 'Open workflow',
		actionType: 'WORKFLOW_LINK',
		actionIcon: 'open-workflow-icon',
	},
];
export const NON_WORKFLOW_AGREEMENT_ACTIONS: Actions[] = [
	{
		label: 'Download *.pdf',
		actionType: 'DOWNLOAD_PDF',
		actionIcon: 'pdf-download-icon',
	},
	{
		label: 'Download *.doc',
		actionType: 'DOWNLOAD_DOC',
		actionIcon: 'doc-download-icon',
	},
	{
		label: 'Edit',
		actionType: 'EDIT',
		actionIcon: 'table-edit-icon',
	},
	{
		label: 'Delete',
		actionType: 'DELETE',
		actionIcon: 'table-delete-icon',
	},
];
export const AGREEMENT_BOTTOM_ACTIONS: Actions[] = [
	{
		label: 'Send reminder',
		actionType: 'REMINDER',
		actionIcon: 'send-reminder-icon',
	},
	{
		label: 'Download',
		actionType: 'DOWNLOAD',
		actionIcon: 'download-agreement-icon',
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
		color: '#50BEE8',
	},
	{
		id: 2,
		name: 'Created in DocuSign',
		color: '#0052B4',
	},
	{
		id: 3,
		name: 'Sent',
		color: '#0052B4',
	},
	{
		id: 4,
		name: 'Viewed',
		color: '#ED2939',
	},
	{
		id: 5,
		name: 'Delivery failure',
		color: '#ED2939',
	},
	{
		id: 6,
		name: 'Voided',
		color: '#ED2939',
	},
	{
		id: 7,
		name: 'Signed',
		color: '#ED2939',
	},
	{
		id: 8,
		name: 'Declined',
		color: '#ED2939',
	},
	{
		id: 9,
		name: 'Waiting for others',
		color: '#9747FF',
	},
	{
		id: 10,
		name: 'Completed',
		color: '#17A297',
	},
	{
		id: 11,
		name: 'About to expire',
		color: '#F3AB20',
	},
	{
		id: 12,
		name: 'Expired',
		color: '#ED2939',
	},
];
