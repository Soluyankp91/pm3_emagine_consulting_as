import { ITableConfig } from '../../shared/components/grid-table/mat-grid.interfaces';
import { MasterTemplatesService } from './services/master-templates.service';
import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, Injector, ViewEncapsulation } from '@angular/core';
import { map, tap, takeUntil, withLatestFrom } from 'rxjs/operators';
import {
	DISPLAYED_COLUMNS,
	MASTER_TEMPLATE_ACTIONS,
	MASTER_TEMPLATE_HEADER_CELLS,
} from '../../shared/components/grid-table/master-templates/entities/master-templates.constants';
import { Sort } from '@angular/material/sort';
import { PageEvent } from '@angular/material/paginator';
import { TableFiltersEnum } from '../../shared/components/grid-table/master-templates/entities/master-templates.interfaces';
import { GridHelpService } from '../../shared/services/mat-grid-service.service';
import { Observable, Subject } from 'rxjs';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { AgreementLanguage, AgreementTemplatesListItemDto, AgreementType } from 'src/shared/service-proxies/service-proxies';
import { ContractsService } from '../../shared/services/contracts.service';
import { AppComponentBase } from 'src/shared/app-component-base';
import * as moment from 'moment';
import { MappedAgreementTemplatesListItemDto, MappedTableCells } from '../../shared/entities/contracts.interfaces';
@Component({
	selector: 'app-master-templates',
	templateUrl: './master-templates.component.html',
	styleUrls: ['./master-templates.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [GridHelpService],
})
export class MasterTemplatesComponent extends AppComponentBase implements OnInit, OnDestroy {
	cells = this._gridHelpService.generateTableConfig(DISPLAYED_COLUMNS, MASTER_TEMPLATE_HEADER_CELLS);
	dataSource$ = this._masterTemplatesService.getContracts$();

	displayedColumns = DISPLAYED_COLUMNS;
	actions = MASTER_TEMPLATE_ACTIONS;
	table$: Observable<any>;

	private _unSubscribe$ = new Subject<void>();

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
		this._subscribeOnDataLoading();
	}

	ngOnDestroy() {
		this._unSubscribe$.next();
		this._unSubscribe$.complete();
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
			takeUntil(this._unSubscribe$),
			withLatestFrom(this._contractService.getEnumMap$()),
			map(([data, maps]) => {
				const tableConfig: ITableConfig = {
					pageSize: data.pageSize as number,
					pageIndex: (data.pageIndex as number) - 1,
					totalCount: data.totalCount as number,
					items: this._mapTableItems(data.items as AgreementTemplatesListItemDto[], maps),
					sortDirection: 'asc',
					sortActive: '',
				};
				return tableConfig;
			}),
			tap(() => this.hideMainSpinner())
		);
	}

	private _mapTableItems(
		items: AgreementTemplatesListItemDto[],
		maps: MappedTableCells
	): MappedAgreementTemplatesListItemDto[] {
		return items.map((item: AgreementTemplatesListItemDto) => {
			return <MappedAgreementTemplatesListItemDto> {
                agreementTemplateId: item.agreementTemplateId,
                name: item.name,
                agreementType: maps.agreementType[item.agreementType as AgreementType],
                recipientTypeId: maps.recipientTypeId[item.recipientTypeId as number],
                language: this.getCountryCodeByLanguage(maps.language[item.language as AgreementLanguage]),
                legalEntityIds: item.legalEntityIds?.map((i) => maps.legalEntityIds[i]),
                contractTypeIds: item.contractTypeIds?.map((i) => maps.contractTypeIds[i]),
                salesTypeIds: item.salesTypeIds?.map((i) => maps.salesTypeIds[i]),
                deliveryTypeIds: item.deliveryTypeIds?.map((i) => maps.deliveryTypeIds[i]),
                createdByLowerCaseInitials: item.createdByLowerCaseInitials,
                createdDateUtc: moment(item.createdDateUtc).format('DD.MM.YYYY'),
                lastUpdatedByLowerCaseInitials: item.lastUpdatedByLowerCaseInitials,
                lastUpdateDateUtc: moment(item.lastUpdateDateUtc).format('DD.MM.YYYY'),
                isEnabled: item.isEnabled,
            } 
		});
	}

	private _subscribeOnDataLoading() {
		this._masterTemplatesService.contractsLoading$.subscribe((isLoading) => {
			if (isLoading) {
				this.showMainSpinner();
				return;
			}
			this.hideMainSpinner();
		});
	}
}
