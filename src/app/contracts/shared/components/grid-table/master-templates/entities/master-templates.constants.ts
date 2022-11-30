import {
    IHeaderCell,
    EHeaderCells,
    ICell,
    ETableCells,
} from 'src/app/contracts/shared/components/grid-table/mat-grid.interfaces';
import { DateCellComponent } from '../cells/date-cell/date-cell.component';
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
export const MASTER_TEMPLATE_CELLS: ICell[] = [
    {
        type: ETableCells.DEFAULT,
    },
    {
        type: ETableCells.CUSTOM,
        component: DateCellComponent,
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
        component: DateCellComponent,
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
        component: DateCellComponent,
    },
    {
        type: ETableCells.DEFAULT,
    },
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
        title: 'agreementTemplateId',
    },
    {
        type: EHeaderCells.SORT,
        title: 'Name',
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
];

export const PAGE_SIZE_OPTIONS: number[] = [5, 10, 20, 50, 100];
export const DEFAULT_SIZE_OPTION: number = PAGE_SIZE_OPTIONS[0];
export const INITIAL_PAGE_INDEX = 0;
