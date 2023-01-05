import { ITableConfig } from '../../shared/components/grid-table/mat-grid.interfaces';
import { MasterTemplatesService } from './services/master-templates.service';
import {
	Component,
	ChangeDetectionStrategy,
	OnInit,
	OnDestroy,
	Injector,
	TrackByFunction,
	ChangeDetectorRef,
	ViewChildren,
	ElementRef,
	QueryList,
} from '@angular/core';
import { map, takeUntil, withLatestFrom, tap, switchMap, startWith, take } from 'rxjs/operators';
import {
	DISPLAYED_COLUMNS,
	MASTER_TEMPLATE_ACTIONS,
	MASTER_TEMPLATE_HEADER_CELLS,
} from '../../shared/components/grid-table/master-templates/entities/master-templates.constants';
import { GetCountryCodeByLanguage } from 'src/shared/helpers/tenantHelper';
import { Sort } from '@angular/material/sort';
import { PageEvent } from '@angular/material/paginator';
import { GridHelpService } from '../../shared/services/mat-grid-service.service';
import { Observable, Subject, combineLatest, ReplaySubject, of, fromEvent, Subscription, BehaviorSubject } from 'rxjs';
import { ActivatedRoute, Params, Router } from '@angular/router';
import {
	AgreementLanguage,
	AgreementTemplateDetailsAttachmentDto,
	AgreementTemplateDetailsDto,
	AgreementTemplateMetadataLogListItemDto,
	AgreementTemplateServiceProxy,
	AgreementTemplatesListItemDto,
	AgreementType,
} from 'src/shared/service-proxies/service-proxies';
import { ContractsService } from '../../shared/services/contracts.service';
import { AppComponentBase } from 'src/shared/app-component-base';
import * as moment from 'moment';
import {
	BaseMappedAgreementTemplatesListItemDto,
	MappedTableCells,
	TableFiltersEnum,
} from '../../shared/entities/contracts.interfaces';
import { PreviewTabsComponent } from './components/preview/preview.component';
@Component({
	selector: 'app-master-templates',
	templateUrl: './master-templates.component.html',
	styleUrls: ['./master-templates.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [GridHelpService],
})
export class MasterTemplatesComponent extends AppComponentBase implements OnInit, OnDestroy {
	@ViewChildren(PreviewTabsComponent, { read: ElementRef }) preview: QueryList<ElementRef>;

	cells = this._gridHelpService.generateTableConfig(DISPLAYED_COLUMNS, MASTER_TEMPLATE_HEADER_CELLS);
	dataSource$ = this._masterTemplatesService.getContracts$();

	displayedColumns = DISPLAYED_COLUMNS;
	actions = MASTER_TEMPLATE_ACTIONS;

	table$: Observable<ITableConfig>;

	selectedRowId: number | null;
	currentRowChange$ = new ReplaySubject<BaseMappedAgreementTemplatesListItemDto | null>();
	currentRow$: Observable<{
		summary: BaseMappedAgreementTemplatesListItemDto;
		attachments: AgreementTemplateDetailsAttachmentDto[];
		logs: AgreementTemplateMetadataLogListItemDto[];
	} | null>;

	trackById: TrackByFunction<number>;

	outsideClicksSub: Subscription;

	logFilterChange$ = new BehaviorSubject(false);

	private _unSubscribe$ = new Subject<void>();

	constructor(
		private readonly _masterTemplatesService: MasterTemplatesService,
		private readonly _contractService: ContractsService,
		private readonly _gridHelpService: GridHelpService,
		private readonly _agreementTemplateServiceProxy: AgreementTemplateServiceProxy,
		private readonly _route: ActivatedRoute,
		private readonly _router: Router,
		private readonly _injetor: Injector,
		private readonly _cdr: ChangeDetectorRef
	) {
		super(_injetor);
		this.trackById = this.createTrackByFn('id');
	}

	ngOnInit(): void {
		this._initTable$();
		this._subscribeOnDataLoading();
		this._setCurrentRowChangeObservable();
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

	private _subscribeOnPreviewOutClicks() {
		this.outsideClicksSub = fromEvent(document, 'click').subscribe((e: Event) => {
			if (!this.preview.get(0)?.nativeElement.contains(e.target)) {
				this.currentRowChange$.next(null);
			}
		});
	}

	private _setCurrentRowChangeObservable() {
		this.currentRow$ = this.currentRowChange$.pipe(
			startWith(null),
			tap((row) => {
				this.selectedRowId = row?.agreementTemplateId as number | null;
			}),
			switchMap((row) => {
				if (row) {
					return combineLatest([
						this._agreementTemplateServiceProxy.agreementTemplateGET(row.agreementTemplateId),
						this.logFilterChange$.pipe(
							switchMap((newState) => {
								return this._agreementTemplateServiceProxy.metadataLog(row.agreementTemplateId, newState);
							})
						),
						this._contractService.getEnumMap$().pipe(take(1)),
					]).pipe(
						map(([row, logs, maps]) => this._mapTemplatePreview(row, logs, maps)),
						tap(() => this._subscribeOnPreviewOutClicks())
					);
				}
				return of(null).pipe(
					tap(() => {
						if (this.outsideClicksSub) {
							this.outsideClicksSub.unsubscribe();
						}
					})
				);
			})
		);
	}

	private _initTable$() {
		this.table$ = combineLatest([
			this.dataSource$,
			this._contractService.getEnumMap$(),
			this._masterTemplatesService.getSort$(),
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

	private _mapTableItems(
		items: AgreementTemplatesListItemDto[],
		maps: MappedTableCells
	): BaseMappedAgreementTemplatesListItemDto[] {
		return items.map((item: AgreementTemplatesListItemDto) => {
			return <BaseMappedAgreementTemplatesListItemDto>{
				agreementTemplateId: item.agreementTemplateId,
				name: item.name,
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

	private _mapTemplatePreview(
		row: AgreementTemplateDetailsDto,
		logs: AgreementTemplateMetadataLogListItemDto[],
		maps: MappedTableCells
	) {
		return <
			{
				summary: BaseMappedAgreementTemplatesListItemDto;
				attachments: AgreementTemplateDetailsAttachmentDto[];
				logs: AgreementTemplateMetadataLogListItemDto[];
			}
		>{
			summary: {
				name: row.name,
				definition: row.definition,
				agreementType: maps.agreementType[row.agreementType as AgreementType],
				recipientTypeId: maps.recipientTypeId[row.recipientTypeId as number],

				legalEntityIds: row.legalEntityIds?.map((i) => maps.legalEntityIds[i]),
				salesTypeIds: row.salesTypeIds?.map((i) => maps.salesTypeIds[i]),
				deliveryTypeIds: row.deliveryTypeIds?.map((i) => maps.deliveryTypeIds[i]),
				contractTypeIds: row.contractTypeIds?.map((i) => maps.contractTypeIds[i]),
				language: AgreementLanguage[row.language as AgreementLanguage],
				countryCode: GetCountryCodeByLanguage(AgreementLanguage[row.language as AgreementLanguage]),
				note: row.note,
				isEnabled: row.isEnabled,

				agreementTemplateId: row.agreementTemplateId,
				createdDateUtc: moment(row.createdDateUtc).format('DD.MM.YYYY'),
				createdBy: row.createdBy?.name,
				lastUpdateDateUtc: moment(row.lastUpdateDateUtc).format('DD.MM.YYYY'),
				lastUpdatedBy: row.lastUpdatedBy?.name,
				duplicationSourceAgreementTemplateId: row.duplicationSourceAgreementTemplateId,
			},
			attachments: row.attachments,
			logs,
		};
	}

	private _subscribeOnDataLoading() {
		this._masterTemplatesService.contractsLoading$$.pipe(takeUntil(this._unSubscribe$)).subscribe((isLoading) => {
			if (isLoading) {
				this.showMainSpinner();
				return;
			}
			this.hideMainSpinner();
			this._cdr.detectChanges();
		});
	}
}
