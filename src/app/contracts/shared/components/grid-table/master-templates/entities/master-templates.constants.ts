import { IHeaderCell, EHeaderCells } from 'src/app/contracts/shared/components/grid-table/mat-grid.interfaces';
import { AgreementLanguagesFilterComponent } from '../filters/agreement-languages-filter/agreement-filter.component';
import { AgreementTypesFilterComponent } from '../filters/agreement-types-filter/agreement-types-filter.component';
import { DeliveryTypesFilterComponent } from '../filters/delivery-types-filter/delivery-types-filter/delivery-types-filter.component';
import { EmployeesFilterComponent } from '../filters/employees-filter/employees-filter.component';
import { EmploymentTypesFilterComponent } from '../filters/employment-types-filter/employment-types-filter/employment-types-filter.component';
import { IsEnabledComponent } from '../filters/enabled-filter/is-enabled/is-enabled.component';
import { LegalEntitiesFilterComponent } from '../filters/legal-entities-filter/legal-entities-filter/legal-entities-filter.component';
import { RecipientTypesFilterComponent } from '../filters/recipient-types-filter/recipient-types-filter/recipient-types-filter.component';
import { SalesTypesFilterComponent } from '../filters/sales-types-filter/sales-types-filter.component';
import { Actions } from './master-templates.interfaces';

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
			component: AgreementLanguagesFilterComponent,
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
			component: AgreementTypesFilterComponent,
		},
	},
	{
		type: EHeaderCells.FILTER,
		filter: {
			formControlName: 'recipientTypeId',
			component: RecipientTypesFilterComponent,
		},
	},
	{
		type: EHeaderCells.FILTER,
		filter: {
			formControlName: 'legalEntityIds',
			component: LegalEntitiesFilterComponent,
		},
	},
	{
		type: EHeaderCells.FILTER,
		filter: {
			formControlName: 'salesTypeIds',
			component: SalesTypesFilterComponent,
		},
	},
	{
		type: EHeaderCells.FILTER,
		filter: {
			formControlName: 'deliveryTypeIds',
			component: DeliveryTypesFilterComponent,
		},
	},
	{
		type: EHeaderCells.FILTER,
		filter: {
			formControlName: 'contractTypeIds',
			component: EmploymentTypesFilterComponent,
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
			component: EmployeesFilterComponent,
		},
	},
	{
		type: EHeaderCells.FILTER,
		title: 'Status',
		filter: {
			formControlName: 'isEnabled',
			component: IsEnabledComponent,
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
