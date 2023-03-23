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
	Inject,
} from '@angular/core';
import { Observable, Subject, combineLatest, Subscription, BehaviorSubject, ReplaySubject, fromEvent } from 'rxjs';
import { map, takeUntil, pairwise, startWith } from 'rxjs/operators';
import {
	DISPLAYED_COLUMNS,
	MASTER_TEMPLATE_ACTIONS,
	MASTER_TEMPLATE_HEADER_CELLS,
} from '../../shared/components/grid-table/master-templates/entities/master-templates.constants';
import { GetCountryCodeByLanguage } from 'src/shared/helpers/tenantHelper';
import { Sort } from '@angular/material/sort';
import { PageEvent } from '@angular/material/paginator';
import { GridHelpService } from '../../shared/services/mat-grid-service.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { AgreementLanguage, AgreementTemplatesListItemDto, AgreementType } from 'src/shared/service-proxies/service-proxies';
import { ContractsService } from '../../shared/services/contracts.service';
import { AppComponentBase } from 'src/shared/app-component-base';
import {
	BaseMappedAgreementTemplatesListItemDto,
	MappedTableCells,
	MasterFiltersEnum,
} from '../../shared/entities/contracts.interfaces';
import { PreviewTabsComponent } from './components/preview/preview.component';
import { tapOnce } from '../../shared/operators/tapOnceOperator';
import { DOCUMENT } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TitleService } from 'src/shared/common/services/title.service';
import { ERouteTitleType } from 'src/shared/AppEnums';
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

	currentRowId$: ReplaySubject<number | null> = new ReplaySubject(1);
	currentRowId: number | null;

	trackById: TrackByFunction<number>;

	outsideClicksSub: Subscription;

	logFilterChange$ = new BehaviorSubject(false);

	private _unSubscribe$ = new Subject<void>();

	constructor(
		private readonly _masterTemplatesService: MasterTemplatesService,
		private readonly _contractService: ContractsService,
		private readonly _gridHelpService: GridHelpService,
		private readonly _route: ActivatedRoute,
		private readonly _router: Router,
		private readonly _injetor: Injector,
		private readonly _cdr: ChangeDetectorRef,
		private readonly _snackBar: MatSnackBar,
		@Inject(DOCUMENT) private _document: Document,
		private _titleService: TitleService
	) {
		super(_injetor);
		this.trackById = this.createTrackByFn('id');
	}

	ngOnInit(): void {
		this._titleService.setTitle(ERouteTitleType.ContractMasterTemplates);
		this._initPreselectedFilters();
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

	onFormControlChange($event: MasterFiltersEnum) {
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
			case 'COPY': {
				navigator.clipboard.writeText(
					this._document.location.protocol +
						'//' +
						this._document.location.host +
						this._document.location.pathname +
						`?templateId=${$event.row.agreementTemplateId}`
				);
				this._snackBar.open('Copied to clipboard', undefined, {
					duration: 3000,
				});
			}
		}
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
			}),
			tapOnce(() => {
				this._subscribeOnOuterClicks();
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
				createdDateUtc: item.createdDateUtc,
				lastUpdatedByLowerCaseInitials: item.lastUpdatedByLowerCaseInitials,
				lastUpdateDateUtc: item.lastUpdateDateUtc,
				isEnabled: item.isEnabled,
			};
		});
	}

	private _subscribeOnDataLoading() {
		this._masterTemplatesService.contractsLoading$$.pipe(takeUntil(this._unSubscribe$)).subscribe((isLoading) => {
			if (isLoading) {
				this.showMainSpinner();
				this._cdr.detectChanges();
				return;
			}
			this.hideMainSpinner();
			this._cdr.detectChanges();
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
						this.outsideClicksSub = fromEvent(document, 'click').subscribe((e: Event) => {
							if (!this.preview.get(0)?.nativeElement.contains(e.target)) {
								this.currentRowId$.next(null);
							}
						});
					} else if (previous && !current) {
						this.outsideClicksSub.unsubscribe();
					}
				})
			)
			.subscribe();
	}

	private _initPreselectedFilters() {
		const templateId = this._route.snapshot.queryParams['templateId'];
		if (templateId) {
			this.currentRowId$.next(parseInt(templateId));
			return this._masterTemplatesService.setIdFilter([templateId]);
		}
		this._masterTemplatesService.setIdFilter([]);
	}
}
