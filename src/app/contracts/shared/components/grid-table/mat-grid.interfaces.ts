import { ComponentType } from '@angular/cdk/portal';
import { UntypedFormControl } from '@angular/forms';
import { SortDirection } from '@angular/material/sort';

export interface IFilter {
    filterFormControl: UntypedFormControl;
}

export interface IHeaderCell {
    type: EHeaderCells;
    title?: string;
    filter?: {
        formControlName: string;
        component: ComponentType<any>;
    };
}

export interface ICell {
    type: ETableCells;
    index?: number,
    component?: ComponentType<any>;
}

export interface IColumn {
    matColumnDef: string;
    headerCell: IHeaderCell;
    cell: ICell;
}

export interface ITableConfig {
    items: any[];
    pageSize: number;
    totalCount: number;
    pageIndex: number;
    sortDirection: SortDirection;
    sortActive: string;
}

export enum EHeaderCells {
    SORT = 'sort',
    FILTER = 'filter',
}
export enum ETableCells {
    DEFAULT = 'default',
    CUSTOM = 'custom',
}
