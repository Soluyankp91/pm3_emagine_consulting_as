import { Component, ElementRef, OnInit, QueryList, ViewChildren, ViewEncapsulation, Injector } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { Observable, combineLatest, ReplaySubject, Subject, fromEvent, Subscription } from 'rxjs';
import { takeUntil, startWith, pairwise } from 'rxjs/operators';
import { map } from 'rxjs/operators';
import { AppComponentBase } from 'src/shared/app-component-base';
import { GetCountryCodeByLanguage } from 'src/shared/helpers/tenantHelper';
import { AgreementLanguage, AgreementListItemDto, AgreementType } from 'src/shared/service-proxies/service-proxies';
import {
	AGREEMENT_HEADER_CELLS,
	DISPLAYED_COLUMNS,
} from '../../shared/components/grid-table/agreements/entities/agreements.constants';
import { ITableConfig } from '../../shared/components/grid-table/mat-grid.interfaces';
import { AgreementFiltersEnum, MappedAgreementTableItem, MappedTableCells } from '../../shared/entities/contracts.interfaces';
import { ContractsService } from '../../shared/services/contracts.service';
import { GridHelpService } from '../../shared/services/mat-grid-service.service';
import { AgreementPreviewComponent } from './components/agreement-preview/agreement-preview.component';
import { AgreementService } from './services/agreement.service';

@Component({
	selector: 'app-agreements',
	templateUrl: './agreements.component.html',
	styleUrls: ['./agreements.component.scss'],
	providers: [GridHelpService],
	encapsulation: ViewEncapsulation.None,
})
export class AgreementsComponent extends AppComponentBase implements OnInit {
	@ViewChildren(AgreementPreviewComponent, { read: ElementRef }) preview: QueryList<ElementRef>;
	cells = this._gridHelpService.generateTableConfig(DISPLAYED_COLUMNS, AGREEMENT_HEADER_CELLS);
	displayedColumns = DISPLAYED_COLUMNS;
	table$: Observable<ITableConfig>;

	dataSource$ = this._agreementService.getContracts$();

	currentRowId$: ReplaySubject<number | null> = new ReplaySubject(1);

	private _outsideClicksSub: Subscription;

	private _unSubscribe$ = new Subject<void>();

	constructor(
		private readonly _router: Router,
		private readonly _route: ActivatedRoute,
		private readonly _gridHelpService: GridHelpService,
		private readonly _agreementService: AgreementService,
		private readonly _contractService: ContractsService,
		private readonly _injector: Injector
	) {
		super(_injector);
	}

	ngOnInit(): void {
		this._initTable$();
		this._initPreselectedFilters();
		this._subscribeOnOuterClicks();
		this._subscribeOnLoading();
	}

	onSortChange($event: Sort) {
		this._agreementService.updateSort($event);
	}

	onFormControlChange($event: AgreementFiltersEnum) {
		this._agreementService.updateTableFilters($event);
	}

	onPageChange($event: PageEvent) {
		this._agreementService.updatePage($event);
	}

	private _initTable$() {
		this.table$ = combineLatest([
			this.dataSource$,
			this._contractService.getEnumMap$(),
			this._agreementService.getSort$(),
		]).pipe(
			map(([data, maps, sort]) => {
				const tableConfig: ITableConfig = {
					pageSize: data.pageSize as number,
					pageIndex: (data.pageIndex as number) - 1,
					totalCount: data.totalCount as number,
					items: this._mapTableItems(data.items, maps),
					direction: sort.direction,
					active: sort.active,
				};
				return tableConfig;
			})
		);
	}

	private _initPreselectedFilters() {
		const templateId = this._route.snapshot.queryParams['agreementId'];
		if (templateId) {
			this.currentRowId$.next(parseInt(templateId));
			return this._agreementService.setIdFilter([templateId]);
		}
		this._agreementService.setIdFilter([]);
	}

	private _mapTableItems(items: AgreementListItemDto[], maps: MappedTableCells): MappedAgreementTableItem[] {
		return items.map((item: AgreementListItemDto) => {
			return <MappedAgreementTableItem>{
				language: GetCountryCodeByLanguage(maps.language[item.languageId as AgreementLanguage]),
				agreementId: item.agreementId,
				agreementName: item.agreementName,
				actualRecipientName: item.actualRecipientName,
				recipientTypeId: maps.recipientTypeId[item.recipientTypeId as number],
				agreementType: maps.agreementType[item.agreementType as AgreementType],
				legalEntityId: maps.legalEntityIds[item.legalEntityId],
				clientName: item.clientName,
				companyName: item.companyName,
				consultantName: item.consultantName,
				salesTypeIds: item.salesTypeIds?.map((i) => maps.salesTypeIds[i]),
				deliveryTypeIds: item.deliveryTypeIds?.map((i) => maps.deliveryTypeIds[i]),
				contractTypeIds: item.contractTypeIds?.map((i) => maps.contractTypeIds[i]),
				mode: item.mode,
				status: item.status,
				startDate: moment(item.startDate).format('DD.MM.YYYY'),
				endDate: moment(item.endDate).format('DD.MM.YYYY'),
				saleManager: item.saleManager ? item.saleManager : null,
				contractManager: item.contractManager ? item.contractManager : null,
			};
		});
	}

	private _subscribeOnOuterClicks() {
		this.currentRowId$
			.pipe(
				takeUntil(this._unSubscribe$),
				startWith(null),
				pairwise(),
				map(([previous, current]) => {
					if (!previous && current) {
						this._outsideClicksSub = fromEvent(document, 'click').subscribe((e: Event) => {
							if (!this.preview.get(0)?.nativeElement.contains(e.target)) {
								this.currentRowId$.next(null);
							}
						});
					} else if (previous && !current) {
						this._outsideClicksSub.unsubscribe();
					}
				})
			)
			.subscribe();
	}

	private _subscribeOnLoading() {
		this._agreementService.contractsLoading$$.subscribe((isLoading) => {
			if (isLoading) {
				this.showMainSpinner();
			} else {
				this.hideMainSpinner();
			}
		});
	}
}
