import { Injectable } from '@angular/core';
import {
    Cell,
    HeaderCell,
    HeaderCells,
} from '../components/grid-table/mat-grid.interfaces';

@Injectable()
export class GridHelpService {
    constructor() {}

    generateTableConfig(headerCells: HeaderCell[]) {
        return headerCells.reduce((acc, current) => {
            switch (current.type) {
                case HeaderCells.SORT:
                    return [
                        ...acc,
                        {
                            matColumnDef: current.field,
                            headerCell: {
                                type: HeaderCells.SORT,
                                title: current.title,
                            },
                        } as Cell,
                    ];

                case HeaderCells.FILTER:
                    return [
                        ...acc,
                        {
                            matColumnDef: current.field,
                            headerCell: {
                                type: HeaderCells.FILTER,
                                filter: {
                                    formControlName: current.field,
                                    component: current.component,
                                },
                            },
                        } as Cell,
                    ];
                default:
                    return acc;
            }
        }, [] as Cell[]);
    }
}
