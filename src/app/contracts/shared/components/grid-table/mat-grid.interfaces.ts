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
		component: () => Promise<ComponentType<any>>;
	};
	class?: string;
	sticky?: boolean;
	sort?: boolean;
}

export interface IColumn {
	matColumnDef: string;
	headerCell: IHeaderCell;
	class?: string;
	sticky?: boolean;
}

export interface ITableConfig {
	items: any[];
	pageSize: number;
	totalCount: number;
	pageIndex: number;
	direction: SortDirection;
	active: string;
}

export enum EHeaderCells {
	DEFAULT = 'default',
	FILTER = 'filter',
}
export enum ETableCells {
	DEFAULT = 'default',
	CUSTOM = 'custom',
}
