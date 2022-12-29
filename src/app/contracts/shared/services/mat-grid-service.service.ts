import { Injectable } from '@angular/core';
import {
    IColumn,
    IHeaderCell,
    ICell,
} from '../components/grid-table/mat-grid.interfaces';

@Injectable()
export class GridHelpService {
    constructor() {}

    generateTableConfig(
        displayedColumns: string[],
        headerCells: IHeaderCell[],
        cells: ICell[]
    ) {
        return displayedColumns.map((columnField, index) => {
            return {
                matColumnDef: columnField,
                headerCell: headerCells[index],
                cell: cells[index],
            } as IColumn;
        });
    }
}
