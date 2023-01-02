import { Injectable } from '@angular/core';
import {
    IColumn,
    IHeaderCell,
} from '../components/grid-table/mat-grid.interfaces';

@Injectable()
export class GridHelpService {
    constructor() {}

    generateTableConfig(
        displayedColumns: string[],
        headerCells: IHeaderCell[],
    ) {
        return displayedColumns.map((columnField, index) => {
            return {
                matColumnDef: columnField,
                headerCell: headerCells[index],
            } as IColumn;
        });
    }
}
