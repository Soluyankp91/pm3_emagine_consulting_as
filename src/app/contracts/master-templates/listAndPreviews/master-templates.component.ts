import { ITableConfig } from '../../shared/components/grid-table/mat-grid.interfaces';
import { MasterTemplatesService } from './services/master-templates.service';
import { Component, ChangeDetectionStrategy, OnInit, Injector } from '@angular/core';
import { map, tap } from 'rxjs/operators';
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
import { ContractsService } from '../../shared/services/contracts.service';
import { cloneDeep } from 'lodash';
import { AppComponentBase } from 'src/shared/app-component-base';
import * as moment from 'moment';
@Component({
	selector: 'app-master-templates',
	templateUrl: './master-templates.component.html',
	styleUrls: ['./master-templates.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [GridHelpService],
})
export class MasterTemplatesComponent extends AppComponentBase implements OnInit {
	cells = this._gridHelpService.generateTableConfig(DISPLAYED_COLUMNS, MASTER_TEMPLATE_HEADER_CELLS, MASTER_TEMPLATE_CELLS);
	dataSource$ = this._masterTemplatesService.getContracts$();

	displayedColumns = DISPLAYED_COLUMNS;
	actions = MASTER_TEMPLATE_ACTIONS;
	table$: Observable<any>;

	constructor(
		private readonly _masterTemplatesService: MasterTemplatesService,
		private readonly _contractService: ContractsService,
		private readonly _gridHelpService: GridHelpService,
		private readonly _route: ActivatedRoute,
		private readonly _router: Router,
		private readonly _injetor: Injector
	) {
		super(_injetor);
	}

	ngOnInit(): void {
		this._initTable$();
	}

	onSortChange($event: Sort) {
        this.showMainSpinner();
		this._masterTemplatesService.updateSort($event);
	}

	onFormControlChange($event: TableFiltersEnum) {
        this.showMainSpinner();
		this._masterTemplatesService.updateTableFilters($event);
	}

	onPageChange($event: PageEvent) {
        this.showMainSpinner();
		this._masterTemplatesService.updatePage($event);
	}
	onAction($event: { row: AgreementTemplatesListItemDto; action: string }) {
		switch ($event.action) {
			case 'EDIT': {
				this._router.navigate([`${$event.row.agreementTemplateId}`, 'settings'], { relativeTo: this._route });
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
					pageSize: data.pageSize as number,
					pageIndex: (data.pageIndex as number) - 1,
					totalCount: data.totalCount as number,
					items: this._mapTableItems(data.items as AgreementTemplatesListItemDto[]),
					sortDirection: 'asc',
					sortActive: '',
				};
				return tableConfig;
			}),
            tap(() => this.hideMainSpinner())
		);
	}

	private _mapTableItems(items: AgreementTemplatesListItemDto[]) {
		let clone = cloneDeep(items);
		this._contractService.getMappedValues$().subscribe((mappedValues) => {
			clone.forEach((item: any) => {
				for (const prop in mappedValues) {
					if (Array.isArray(item[prop])) {
                        item[prop] = (item[prop] as any []).map((item) => 
                             mappedValues[prop][item]
                        )
					} else {
						if (prop === 'language') {
							item[prop] = this.getCountryCodeByLanguage(mappedValues[prop][item[prop]]);
						} else {
							item[prop] = mappedValues[prop][item[prop]];
						}
					}
				}
                item.lastUpdateDateUtc = moment(item.lastUpdateDateUtc).format('DD.MM.YYYY');
			});
		});
		return clone;
	}
}
