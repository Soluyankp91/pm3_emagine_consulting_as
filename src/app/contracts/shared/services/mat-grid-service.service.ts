import { Injectable } from '@angular/core';
import {
    ICell,
    IHeaderCell,
    EHeaderCells,
} from '../components/grid-table/mat-grid.interfaces';

// getSortCellConfig(cell:HeaderCell.SORT): Cell
// getFilterCellConfig(cell:HeaderCell.FIILTER): Cell
@Injectable()
export class GridHelpService {
    constructor() {}

    generateTableConfig(headerCells: IHeaderCell[]) {
        return headerCells.reduce((acc, current) => {
            switch (current.type) {
                case EHeaderCells.SORT:
                    return [
                        ...acc,
                        {
                            matColumnDef: current.field,
                            headerCell: {
                                type: EHeaderCells.SORT,
                                title: current.title,
                            },
                        } as ICell,
                    ];

                case EHeaderCells.FILTER:
                    return [
                        ...acc,
                        {
                            matColumnDef: current.field,
                            headerCell: {
                                type: EHeaderCells.FILTER,
                                filter: {
                                    formControlName: current.field,
                                    component: current.component,
                                },
                            },
                        } as ICell,
                    ];
                default:
                    return acc;
            }
        }, [] as ICell[]);
    }
}
