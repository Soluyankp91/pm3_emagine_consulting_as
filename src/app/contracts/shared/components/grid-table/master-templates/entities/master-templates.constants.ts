import {
    HeaderCell,
    HeaderCells,
} from 'src/app/contracts/shared/components/grid-table/mat-grid.interfaces';
import { AgreementLanguagesFilterComponent } from '../filters/agreement-languages-filter/agreement-filter.component';
import { AgreementTypesFilterComponent } from '../filters/agreement-types-filter/agreement-types-filter.component';
import { DeliveryTypesFilterComponent } from '../filters/delivery-types-filter/delivery-types-filter/delivery-types-filter.component';
import { EmployeesFilterComponent } from '../filters/employees-filter/employees-filter.component';
import { EmploymentTypesFilterComponent } from '../filters/employment-types-filter/employment-types-filter/employment-types-filter.component';
import { LegalEntitiesFilterComponent } from '../filters/legal-entities-filter/legal-entities-filter/legal-entities-filter.component';
import { RecipientTypesFilterComponent } from '../filters/recipient-types-filter/recipient-types-filter/recipient-types-filter.component';
import { SalesTypesFilterComponent } from '../filters/sales-types-filter/sales-types-filter.component';

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
];

export const MASTER_TEMPLATE_HEADER_CELLS: HeaderCell[] = [
    {
        field: 'agreementTemplateId',
        type: HeaderCells.SORT,
        title: 'agreementTemplateId',
    },
    {
        field: 'name',
        type: HeaderCells.SORT,
        title: 'Name',
    },
    {
        field: 'language',
        type: HeaderCells.FILTER,
        component: AgreementLanguagesFilterComponent,
    },
    {
        field: 'agreementType',
        type: HeaderCells.FILTER,
        component: AgreementTypesFilterComponent,
    },
    {
        field: 'recipientTypeId',
        type: HeaderCells.FILTER,
        component: RecipientTypesFilterComponent,
    },
    {
        field: 'legalEntityIds',
        type: HeaderCells.FILTER,
        component: LegalEntitiesFilterComponent,
    },
    {
        field: 'salesTypeIds',
        type: HeaderCells.FILTER,
        component: SalesTypesFilterComponent,
    },
    {
        field: 'deliveryTypeIds',
        type: HeaderCells.FILTER,
        component: DeliveryTypesFilterComponent,
    },
    {
        field: 'contractTypeIds',
        type: HeaderCells.FILTER,
        component: EmploymentTypesFilterComponent,
    },
    {
        field: 'lastUpdateDateUtc',
        type: HeaderCells.SORT,
        title: 'Last updated',
    },
    {
        field: 'lastUpdatedByLowerCaseInitials',
        type: HeaderCells.FILTER,
        component: EmployeesFilterComponent,
    },
];

export const PAGE_SIZE_OPTIONS: number[] = [5, 10, 20, 50, 100];
export const DEFAULT_SIZE_OPTION: number = PAGE_SIZE_OPTIONS[0];
export const INITIAL_PAGE_INDEX = 0;
