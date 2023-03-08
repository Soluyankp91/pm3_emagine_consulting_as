import { Component, OnInit, Injector, Inject, QueryList, ElementRef, ViewChildren, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { AppComponentBase } from 'src/shared/app-component-base';
import {
	AgreementLanguage,
	AgreementTemplateServiceProxy,
	AgreementTemplatesListItemDto,
	AgreementType,
} from 'src/shared/service-proxies/service-proxies';
import {
	CLIENT_TEMPLATE_ACTIONS,
	CLIENT_TEMPLATE_BOTTOM_ACTIONS,
	CLIENT_TEMPLATE_HEADER_CELLS,
	DISPLAYED_COLUMNS,
} from '../../shared/components/grid-table/client-templates/entities/client-template.constants';
import { ClientMappedTemplatesListDto, MappedTableCells, ClientFiltersEnum } from '../../shared/entities/contracts.interfaces';
import { GridHelpService } from '../../shared/services/mat-grid-service.service';
import { combineLatest, fromEvent, Observable, ReplaySubject, Subject, Subscription, forkJoin } from 'rxjs';
import { takeUntil, map, startWith, pairwise } from 'rxjs/operators';
import { ClientTemplatesService } from './service/client-templates.service';
import { ContractsService } from '../../shared/services/contracts.service';
import { ITableConfig } from '../../shared/components/grid-table/mat-grid.interfaces';
import { Sort } from '@angular/material/sort';
import { PageEvent } from '@angular/material/paginator';
import { GetCountryCodeByLanguage } from 'src/shared/helpers/tenantHelper';
import { DOCUMENT } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ClientTemplatePreviewComponent } from './preview/client-template-preview.component';
import { tapOnce } from '../../shared/operators/tapOnceOperator';
import { MatDialog } from '@angular/material/dialog';
import { NotificationDialogComponent } from '../../shared/components/popUps/notification-dialog/notification-dialog.component';

@Component({
	selector: 'app-client-specific-templates',
	styleUrls: ['./client-specific-templates.component.scss'],
	templateUrl: './client-specific-templates.component.html',
	encapsulation: ViewEncapsulation.None,
	providers: [GridHelpService],
})
export class ClientSpecificTemplatesComponent extends AppComponentBase implements OnInit {
	@ViewChildren(ClientTemplatePreviewComponent, { read: ElementRef }) preview: QueryList<ElementRef>;
	cells = this._gridHelpService.generateTableConfig(DISPLAYED_COLUMNS, CLIENT_TEMPLATE_HEADER_CELLS);

	displayedColumns = DISPLAYED_COLUMNS;
	actions = CLIENT_TEMPLATE_ACTIONS;
	selectedItemsActions = CLIENT_TEMPLATE_BOTTOM_ACTIONS;

	currentRowId$: ReplaySubject<number | null> = new ReplaySubject(1);

	outsideClicksSub: Subscription;

	private _unSubscribe$ = new Subject<void>();

	constructor(
		private readonly _route: ActivatedRoute,
		private readonly _router: Router,
		private readonly _gridHelpService: GridHelpService,
		private readonly _injector: Injector,
		private readonly _clientTemplatesService: ClientTemplatesService,
		private readonly _contractService: ContractsService,
		private readonly _snackBar: MatSnackBar,
		private readonly _agreementTemplateServiceProxy: AgreementTemplateServiceProxy,
		private readonly _dialog: MatDialog,
		@Inject(DOCUMENT) private _document: Document
	) {
		super(_injector);
	}

	table$: Observable<ITableConfig>;

	dataSource$ = this._clientTemplatesService.getContracts$();

	ngOnInit(): void {
		this._initPreselectedFilters();
		this._initTable$();
		this._subscribeOnDataLoading();
	}

	resetAllTopFilters() {
		this._clientTemplatesService.updateSearchFilter('');
		this._clientTemplatesService.updateTenantFilter([]);
	}

	navigateTo() {
		this._router.navigate(['create'], { relativeTo: this._route });
	}

	onSortChange($event: Sort) {
		this._clientTemplatesService.updateSort($event);
	}

	onFormControlChange($event: ClientFiltersEnum) {
		this._clientTemplatesService.updateTableFilters($event);
	}

	onPageChange($event: PageEvent) {
		this._clientTemplatesService.updatePage($event);
	}

	onAction($event: { row: AgreementTemplatesListItemDto; action: string }) {
		switch ($event.action) {
			case 'EDIT': {
				this._router.navigate([`${$event.row.agreementTemplateId}`, 'settings'], { relativeTo: this._route });
				break;
			}
			case 'DUPLICATE': {
				const params: Params = {
					id: $event.row.agreementTemplateId,
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

	onSelectionAction($event: { selectedRows: AgreementTemplatesListItemDto[]; action: string }) {
		switch ($event.action) {
			case 'APPROVE': {
				if ($event.selectedRows.find((row) => !(row.linkStateAccepted === false))) {
					let dialogRef = this._dialog.open(NotificationDialogComponent, {
						width: '500px',
						height: '240px',
						backdropClass: 'backdrop-modal--wrapper',
						data: {
							label: 'Approve',
							message: 'Invalid templates were selected. You can approve only templates marked as “To approve”.',
						},
					});
					dialogRef.afterClosed().subscribe();
				} else {
					this.showMainSpinner();
					const arr$: Observable<void>[] = [];
					$event.selectedRows.forEach(({ agreementTemplateId }) => {
						arr$.push(this._agreementTemplateServiceProxy.acceptLinkState(agreementTemplateId));
					});
					forkJoin(arr$).subscribe(() => {
						this._clientTemplatesService.reloadTable();
					});
				}
			}
		}
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
			}),
			tapOnce(() => {
				this._subscribeOnOuterClicks();
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
				language: maps.language[item.language as AgreementLanguage],
                countryCode: GetCountryCodeByLanguage(maps.language[item.language as AgreementLanguage]),
				legalEntityIds: item.legalEntityIds?.map((i) => maps.legalEntityIds[i]),
				contractTypeIds: item.contractTypeIds?.map((i) => maps.contractTypeIds[i]),
				salesTypeIds: item.salesTypeIds?.map((i) => maps.salesTypeIds[i]),
				deliveryTypeIds: item.deliveryTypeIds?.map((i) => maps.deliveryTypeIds[i]),
				createdBy: item.createdBy,
				createdDateUtc: item.createdDateUtc,
				lastUpdatedBy: item.lastUpdatedBy,
				lastUpdateDateUtc: item.lastUpdateDateUtc,
				linkState: item.linkState,
				linkStateAccepted: item.linkStateAccepted,
				isEnabled: item.isEnabled,
				actionList: this.actions,
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
			return this._clientTemplatesService.setIdFilter([templateId]);
		}
		this._clientTemplatesService.setIdFilter([]);
	}
}
