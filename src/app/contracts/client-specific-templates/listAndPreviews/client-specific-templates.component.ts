import { Component, OnInit, Injector } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { AppComponentBase } from 'src/shared/app-component-base';
import {
	AgreementLanguage,
	AgreementTemplatesListItemDto,
	AgreementTemplatesListItemDtoPaginatedList,
	AgreementType,
} from 'src/shared/service-proxies/service-proxies';
import {
	CLIENT_TEMPLATE_HEADER_CELLS,
	DISPLAYED_COLUMNS,
} from '../../shared/components/grid-table/client-templates/entities/client-template.constants';
import { ClientMappedTemplatesListDto, MappedTableCells, TableFiltersEnum } from '../../shared/entities/contracts.interfaces';
import { GridHelpService } from '../../shared/services/mat-grid-service.service';
import { combineLatest, Observable, Subject } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';
import { ClientTemplatesService } from './service/client-templates.service';
import { ContractsService } from '../../shared/services/contracts.service';
import { ITableConfig } from '../../shared/components/grid-table/mat-grid.interfaces';
import { MASTER_TEMPLATE_ACTIONS } from '../../shared/components/grid-table/master-templates/entities/master-templates.constants';
import { Sort } from '@angular/material/sort';
import { PageEvent } from '@angular/material/paginator';
import { GetCountryCodeByLanguage } from 'src/shared/helpers/tenantHelper';

@Component({
	selector: 'app-client-specific-templates',
	styleUrls: ['./client-specific-templates.component.scss'],
	templateUrl: './client-specific-templates.component.html',
	providers: [GridHelpService],
})
export class ClientSpecificTemplatesComponent extends AppComponentBase implements OnInit {
	cells = this._gridHelpService.generateTableConfig(DISPLAYED_COLUMNS, CLIENT_TEMPLATE_HEADER_CELLS);

	displayedColumns = DISPLAYED_COLUMNS;
	actions = MASTER_TEMPLATE_ACTIONS;

	private _unSubscribe$ = new Subject<void>();

	constructor(
		private readonly route: ActivatedRoute,
		private readonly router: Router,
		private readonly _gridHelpService: GridHelpService,
		private readonly _injector: Injector,
		private readonly _clientTemplatesService: ClientTemplatesService,
		private readonly _contractService: ContractsService
	) {
		super(_injector);
	}

	table$: Observable<ITableConfig>;

	dataSource$ = this._clientTemplatesService.getContracts$();

	ngOnInit(): void {
		this._initTable$();
		this._subscribeOnDataLoading();
	}

	navigateTo() {
		this.router.navigate(['create'], { relativeTo: this.route });
	}

	onSortChange($event: Sort) {
		this._clientTemplatesService.updateSort($event);
	}

	onFormControlChange($event: TableFiltersEnum) {
		this._clientTemplatesService.updateTableFilters($event);
	}

	onPageChange($event: PageEvent) {
		this._clientTemplatesService.updatePage($event);
	}

	private _initTable$() {
		this.table$ = combineLatest([
			this.dataSource$,
			this._contractService.getEnumMap$(),
			this._clientTemplatesService.getSort$(),
		]).pipe(
			takeUntil(this._unSubscribe$),
			map(([data, maps, sort]) => {
				const tableConfig: ITableConfig = {
					pageSize: data.pageSize as number,
					pageIndex: (data.pageIndex as number) - 1,
					totalCount: data.totalCount as number,
					items: this._mapTableItems(data.items as AgreementTemplatesListItemDto[], maps),
					direction: sort.direction,
					active: sort.active,
				};
				return tableConfig;
			})
		);
	}

	private _mapTableItems(items: AgreementTemplatesListItemDto[], maps: MappedTableCells): ClientMappedTemplatesListDto[] {
		return items.map((item: AgreementTemplatesListItemDto) => {
			return <ClientMappedTemplatesListDto>{
				agreementTemplateId: item.agreementTemplateId,
				name: item.name,
				clientName: item.clientName,
				agreementType: maps.agreementType[item.agreementType as AgreementType],
				recipientTypeId: maps.recipientTypeId[item.recipientTypeId as number],
				language: GetCountryCodeByLanguage(maps.language[item.language as AgreementLanguage]),
				legalEntityIds: item.legalEntityIds?.map((i) => maps.legalEntityIds[i]),
				contractTypeIds: item.contractTypeIds?.map((i) => maps.contractTypeIds[i]),
				salesTypeIds: item.salesTypeIds?.map((i) => maps.salesTypeIds[i]),
				deliveryTypeIds: item.deliveryTypeIds?.map((i) => maps.deliveryTypeIds[i]),
				createdByLowerCaseInitials: item.createdByLowerCaseInitials,
				createdDateUtc: moment(item.createdDateUtc).format('DD.MM.YYYY'),
				lastUpdatedByLowerCaseInitials: item.lastUpdatedByLowerCaseInitials,
				lastUpdateDateUtc: moment(item.lastUpdateDateUtc).format('DD.MM.YYYY'),
				isEnabled: item.isEnabled,
			};
		});
	}

	private _subscribeOnDataLoading() {
		this._clientTemplatesService.contractsLoading$$.pipe(takeUntil(this._unSubscribe$)).subscribe((isLoading) => {
			if (isLoading) {
				this.showMainSpinner();
				return;
			}
			this.hideMainSpinner();
		});
	}
}
