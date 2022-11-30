import { ITableConfig } from '../../shared/components/grid-table/mat-grid.interfaces';
import { MasterTemplatesService } from './services/master-templates.service';
import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';
import {
    DISPLAYED_COLUMNS,
    MASTER_TEMPLATE_ACTIONS,
    MASTER_TEMPLATE_CELLS,
    MASTER_TEMPLATE_HEADER_CELLS,
} from '../../shared/components/grid-table/master-templates/entities/master-templates.constants';
import { Sort } from '@angular/material/sort';
import { PageEvent } from '@angular/material/paginator';
import { TableFiltersEnum } from '../../shared/components/grid-table/master-templates/entities/master-templates.interfaces';
import { GridHelpService } from '../../shared/services/mat-grid-service.service';
import { Observable } from 'rxjs';
@Component({
    selector: 'app-master-templates',
    templateUrl: './master-templates.component.html',
    styleUrls: ['./master-templates.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [GridHelpService],
})
export class MasterTemplatesComponent implements OnInit {
    cells = this.gridHelpService.generateTableConfig(
        DISPLAYED_COLUMNS,
        MASTER_TEMPLATE_HEADER_CELLS,
        MASTER_TEMPLATE_CELLS
    );
    dataSource$ = this.masterTemplatesService.getContracts$();

    displayedColumns = DISPLAYED_COLUMNS;
    actions = MASTER_TEMPLATE_ACTIONS;
    table$: Observable<any>;

    constructor(
        private readonly masterTemplatesService: MasterTemplatesService,
        private gridHelpService: GridHelpService
    ) {}

    ngOnInit(): void {
        this._initTable$();
    }

    onSortChange($event: Sort) {
        this.masterTemplatesService.updateSort($event);
    }

    onFormControlChange($event: TableFiltersEnum) {
        this.masterTemplatesService.updateTableFilters($event);
    }

    onPageChange($event: PageEvent) {
        this.masterTemplatesService.updatePage($event);
    }

    onSelectTableRow(row: { [key: string]: string }) {}

    private _initTable$() {
        this.table$ = this.dataSource$.pipe(
            map((data) => {
                const tableConfig: ITableConfig = {
                    pageSize: data.pageSize,
                    pageIndex: data.pageIndex - 1,
                    totalCount: data.totalCount,
                    items: data.items,
                    sortDirection: 'asc',
                    sortActive: '',
                };
                return tableConfig;
            })
        );
    }
}
