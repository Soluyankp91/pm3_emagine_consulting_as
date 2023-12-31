import { Injectable } from '@angular/core';
import { IColumn, IHeaderCell } from 'src/app/shared/components/grid-table/mat-grid.interfaces';
@Injectable()
export class GridHelpService {
	constructor() {}

	generateTableConfig(displayedColumns: string[], headerCells: IHeaderCell[]) {
		return displayedColumns.map((columnField, index) => {
			return {
				matColumnDef: columnField,
				headerCell: headerCells[index],
				sticky: headerCells[index].sticky,
				class: headerCells[index].class,
			} as IColumn;
		});
	}
}
