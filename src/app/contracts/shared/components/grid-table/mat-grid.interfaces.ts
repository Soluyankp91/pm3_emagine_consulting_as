import { ComponentType } from '@angular/cdk/portal';
import { FormControl } from '@angular/forms';
import { SortDirection } from '@angular/material/sort';

export interface HeaderCell {
    field: string;
    type: HeaderCells;
    title?: string;
    component?: ComponentType<IFilter>;
}
export interface IFilter {
    fc: FormControl;
}

export interface TableConfig {
    items: any[];
    pageSize: number;
    totalCount: number;
    pageIndex: number;
    sortDirection: SortDirection;
    sortActive: string;
}
export interface Cell {
    matColumnDef: string;
    headerCell: {
        type: HeaderCells;
        title?: string;
        filter?: {
            formControlName: string;
            component: ComponentType<any>;
        };
    };
}

export enum HeaderCells {
    SORT = 'sort',
    FILTER = 'filter',
}
