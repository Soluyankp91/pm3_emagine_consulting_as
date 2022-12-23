import {
    IHeaderCell,
    EHeaderCells,
    ICell,
    ETableCells,
} from 'src/app/contracts/shared/components/grid-table/mat-grid.interfaces';
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
    'isEnabled'
];
export const MASTER_TEMPLATE_CELLS: ICell[] = [
    {
        type: ETableCells.CUSTOM,
        index: 1,
    },
    {
        type: ETableCells.CUSTOM,
        index: 2,
    },
    {
        type: ETableCells.DEFAULT,
    },
    {
        type: ETableCells.DEFAULT,
    },
    {
        type: ETableCells.DEFAULT,
    },
    {
        type: ETableCells.CUSTOM,
        index: 3,
    },
    {
        type: ETableCells.CUSTOM,
        index: 4,
    },
    {
        type: ETableCells.CUSTOM,
        index: 5,
    },
    {
        type: ETableCells.CUSTOM,
        index:6,
    },
    {
        type: ETableCells.CUSTOM,
        index: 7,
    },
    {
        type: ETableCells.DEFAULT,
    },
    {
        type: ETableCells.CUSTOM,
        index: 8,
    },
];
export const MASTER_TEMPLATE_HEADER_CELLS: IHeaderCell[] = [
    {
        type: EHeaderCells.FILTER,
        filter: {
            formControlName: 'language',
            component: AgreementLanguagesFilterComponent,
        },
        width: 120,
    },
    {
        type: EHeaderCells.SORT,
        title: 'ID',
        width: 120,
    },
    {
        type: EHeaderCells.SORT,
        title: 'Template Name',
        width: 320,
    },
    {
        type: EHeaderCells.FILTER,
        filter: {
            formControlName: 'agreementType',
            component: AgreementTypesFilterComponent,
        },
        width: 120,
    },
    {
        type: EHeaderCells.FILTER,
        filter: {
            formControlName: 'recipientTypeId',
            component: RecipientTypesFilterComponent,
        },
        width: 120,
    },
    {
        type: EHeaderCells.FILTER,
        filter: {
            formControlName: 'legalEntityIds',
            component: LegalEntitiesFilterComponent,
        },
        width: 120,
    },
    {
        type: EHeaderCells.FILTER,
        filter: {
            formControlName: 'salesTypeIds',
            component: SalesTypesFilterComponent,
        },
        width: 120,
    },
    {
        type: EHeaderCells.FILTER,
        filter: {
            formControlName: 'deliveryTypeIds',
            component: DeliveryTypesFilterComponent,
        },
        width: 120,
    },
    {
        type: EHeaderCells.FILTER,
        filter: {
            formControlName: 'contractTypeIds',
            component: EmploymentTypesFilterComponent,
        },
        width: 120,
    },
    {
        type: EHeaderCells.SORT,
        title: 'Last updated',
        width: 120,
    },
    {
        type: EHeaderCells.FILTER,
        filter: {
            formControlName: 'lastUpdatedByLowerCaseInitials',
            component: EmployeesFilterComponent,
        },
        width: 120,
    },
    {
        type: EHeaderCells.FILTER,
        title: 'Status',
        filter: {
            formControlName: 'isEnabled',
            component: IsEnabledComponent
        },
        width: 120,
    }
];

export const PAGE_SIZE_OPTIONS: number[] = [5, 10, 20, 50, 1000];
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
