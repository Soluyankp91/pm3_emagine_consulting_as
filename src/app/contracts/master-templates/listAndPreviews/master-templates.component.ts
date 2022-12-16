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
import { ActivatedRoute, Params, Router } from '@angular/router';
import { AgreementTemplatesListItemDto } from 'src/shared/service-proxies/service-proxies';
@Component({
    selector: 'app-master-templates',
    templateUrl: './master-templates.component.html',
    styleUrls: ['./master-templates.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [GridHelpService],
})
export class MasterTemplatesComponent implements OnInit {
    cells = this._gridHelpService.generateTableConfig(
        DISPLAYED_COLUMNS,
        MASTER_TEMPLATE_HEADER_CELLS,
        MASTER_TEMPLATE_CELLS
    );
    dataSource$ = this._masterTemplatesService.getContracts$();

    displayedColumns = DISPLAYED_COLUMNS;
    actions = MASTER_TEMPLATE_ACTIONS;
    table$: Observable<any>;

    constructor(
        private readonly _masterTemplatesService: MasterTemplatesService,
        private readonly _gridHelpService: GridHelpService,
        private readonly _route: ActivatedRoute,
        private readonly _router: Router
    ) {}

    ngOnInit(): void {
        this._initTable$();
    }

    onSortChange($event: Sort) {
        this._masterTemplatesService.updateSort($event);
    }

    onFormControlChange($event: TableFiltersEnum) {
        this._masterTemplatesService.updateTableFilters($event);
    }

    onPageChange($event: PageEvent) {
        this._masterTemplatesService.updatePage($event);
    }
    onAction($event: { row: AgreementTemplatesListItemDto; action: string }) {
        switch ($event.action) {
            case 'EDIT': {
                this._router.navigate(
                    [`${$event.row.agreementTemplateId}`, 'settings'],
                    { relativeTo: this._route }
                );
                break;
            }
            case 'DUPLICATE': {
                const params: Params = {
                    parentTemplateId: $event.row.agreementTemplateId,
                };
                this._router.navigate(['create'], {
                    relativeTo: this._route,
                    queryParams: params,
                });
                break;
            }
        }
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
