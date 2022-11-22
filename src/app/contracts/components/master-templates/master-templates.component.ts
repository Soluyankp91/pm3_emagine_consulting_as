import { FormControl, FormGroup } from '@angular/forms';
import { ContractsService } from 'src/app/contracts/contracts.service';
import { TableConfig } from '../../shared/components/grid-table/mat-grid.interfaces';
import { MasterTemplatesService } from './master-templates.service';
import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';
import {
    DISPLAYED_COLUMNS,
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
        MASTER_TEMPLATE_HEADER_CELLS
    );
    dataSource$ = this.masterTemplatesService.getContracts$();

    displayedColumns = DISPLAYED_COLUMNS;
    table$: Observable<any>;
    fg = new FormGroup({
        countries: new FormControl(),
        search: new FormControl(),
    });
    constructor(
        private readonly masterTemplatesService: MasterTemplatesService,
        private gridHelpService: GridHelpService
    ) {}
    ngOnInit(): void {
        this._initTable$();
    }
    private _initTable$() {
        this.table$ = this.dataSource$.pipe(
            map(data => {
                console.log(data);
                const tableConfig: TableConfig = {
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
    onSortChange($event: Sort) {
        console.log($event);
        this.masterTemplatesService.updateSort($event);
    }
    onFormControlChange($event: TableFiltersEnum) {
        // console.log($event);
        this.masterTemplatesService.updateTableFilters($event);
    }
    onPageChange($event: PageEvent) {
        console.log($event);
        this.masterTemplatesService.updatePage($event);
    }
    onSelectTableRow(row: { [key: string]: string }) {
        console.log(row);
    }
}
