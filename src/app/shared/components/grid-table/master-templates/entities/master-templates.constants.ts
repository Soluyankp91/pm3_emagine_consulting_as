import { Actions } from 'src/app/contracts/shared/entities/contracts.interfaces';
import { EHeaderCells, IHeaderCell } from '../../mat-grid.interfaces';

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
		class: 'language-column',
		sort: true,
	},
	{
		type: EHeaderCells.DEFAULT,
		title: 'ID',
		class: 'id-column',
		sort: true,
	},
	{
		type: EHeaderCells.DEFAULT,
		title: 'Template Name',
		class: 'template-name-column',
		sort: true,
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
		sort: true,
	},
	{
		type: EHeaderCells.FILTER,
		filter: {
			formControlName: 'recipientTypeId',
			component: () =>
				import('../filters/recipient-types-filter/recipient-types-filter.component').then(
					(it) => it.RecipientTypesFilterComponent
				),
		},
		class: 'recipientTypeId-column',
		sort: true,
	},
	{
		type: EHeaderCells.FILTER,
		filter: {
			formControlName: 'legalEntityIds',
			component: () =>
				import('../filters/legal-entities-filter/legal-entities-filter.component').then(
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
				import('../filters/delivery-types-filter/delivery-types-filter.component').then(
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
				import('../filters/employment-types-filter/employment-types-filter.component').then(
					(it) => it.EmploymentTypesFilterComponent
				),
		},
		class: 'contractType-column',
	},
	{
		type: EHeaderCells.DEFAULT,
		title: 'Last updated',
		sort: true,
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
		type: EHeaderCells.DEFAULT,
		title: 'Status',
		class: 'status-column',
	},
];
export const PREVIEW_LABEL_MAP: { [key: string]: string } = {
	name: 'Name',
	agreementName: 'Agreement name',
	client: 'Client',
	definition: 'Definition',
	agreementType: 'Document type',
	recipientTypeId: 'Recipient type',
	actualRecipient: 'Actual recipient',
	consultantName: 'Consultant',
	companyName: 'Company',
	legalEntityId: 'Legal entity',
	salesManager: 'Sales manager',
	contractManager: 'Contract manager',
	legalEntityIds: 'Legal entities',
	salesTypeIds: 'Sales types',
	deliveryTypeIds: 'Delivery types',
	contractTypeIds: 'Contract types',
	language: 'Language',
	note: 'Notes',
	isEnabled: 'Status',
	agreementStatus: 'Status',
	agreementTemplateId: 'ID',
	agreementId: 'ID',
	createdDateUtc: 'Created',
	createdBy: 'by',
	lastUpdateDateUtc: 'Last updated',
	lastUpdatedBy: 'by',
	startDate: 'Starting date',
	endDate: 'Expiration date',
	duplicationSourceAgreementTemplateId: 'Duplicated from',
	parentAgreementTemplateId: 'Parent template',
	duplicationSourceAgreementName: 'Duplicated from',
};

export const PAGE_SIZE_OPTIONS: number[] = [20, 50, 100];
export const AUTOCOMPLETE_SEARCH_ITEMS_COUNT = 100;
export const DEFAULT_SIZE_OPTION: number = PAGE_SIZE_OPTIONS[0];
export const MASTER_TEMPLATE_ACTIONS: Actions[] = [
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
		label: 'Copy link',
		actionType: 'COPY',
		actionIcon: 'copy-icon',
	},
];
export const INITIAL_PAGE_INDEX = 0;
