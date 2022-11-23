import { ComponentType } from '@angular/cdk/portal';
import { FormControl } from '@angular/forms';
import { SortDirection } from '@angular/material/sort';

export interface HeaderCell {
    field: string;
    type: EHeaderCells;
    title?: string;
    component?: ComponentType<IFilter>;
}
export interface IFilter {
    filterFormControl: FormControl;
}

export interface ITableConfig {
    items: any[];
    pageSize: number;
    totalCount: number;
    pageIndex: number;
    sortDirection: SortDirection;
    sortActive: string;
}
export interface ICell {
    matColumnDef: string;
    headerCell: {
        type: EHeaderCells;
        title?: string;
        filter?: {
            formControlName: string;
            component: ComponentType<any>;
        };
    };
}

export enum EHeaderCells {
    SORT = 'sort',
    FILTER = 'filter',
}
