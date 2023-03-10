import { Component, ElementRef, OnInit, QueryList, ViewChildren, ViewEncapsulation, Injector, OnDestroy } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, combineLatest, ReplaySubject, Subject, fromEvent, Subscription } from 'rxjs';
import { takeUntil, startWith, pairwise } from 'rxjs/operators';
import { map, tap } from 'rxjs/operators';
import { AppComponentBase } from 'src/shared/app-component-base';
import { GetCountryCodeByLanguage } from 'src/shared/helpers/tenantHelper';
import {
	AgreementLanguage,
	AgreementListItemDto,
	AgreementListItemDtoPaginatedList,
	AgreementServiceProxy,
	AgreementType,
	AgreementDetailsPreviewDto,
	EnvelopeStatus,
} from 'src/shared/service-proxies/service-proxies';
import {
	AGREEMENT_BOTTOM_ACTIONS,
	AGREEMENT_HEADER_CELLS,
	DISPLAYED_COLUMNS,
	NON_WORKFLOW_AGREEMENT_ACTIONS,
	WORKFLOW_AGREEMENT_ACTIONS,
} from '../../shared/components/grid-table/agreements/entities/agreements.constants';
import { ITableConfig } from '../../shared/components/grid-table/mat-grid.interfaces';
import { AgreementFiltersEnum, MappedAgreementTableItem, MappedTableCells } from '../../shared/entities/contracts.interfaces';
import { ContractsService } from '../../shared/services/contracts.service';
import { DownloadFilesService } from '../../shared/services/download-files.service';
import { GridHelpService } from '../../shared/services/mat-grid-service.service';
import { DownloadFile } from '../../shared/utils/download-file';
import { AgreementPreviewComponent } from './components/agreement-preview/agreement-preview.component';
import { AgreementService } from './services/agreement.service';

@Component({
	selector: 'app-agreements',
	templateUrl: './agreements.component.html',
	styleUrls: ['./agreements.component.scss'],
	providers: [GridHelpService],
	encapsulation: ViewEncapsulation.None,
})
export class AgreementsComponent extends AppComponentBase implements OnInit, OnDestroy {
	@ViewChildren(AgreementPreviewComponent, { read: ElementRef }) preview: QueryList<ElementRef>;
	cells = this._gridHelpService.generateTableConfig(DISPLAYED_COLUMNS, AGREEMENT_HEADER_CELLS);
	displayedColumns = DISPLAYED_COLUMNS;
	table$: Observable<ITableConfig>;

	workflowActions = WORKFLOW_AGREEMENT_ACTIONS;
	nonWorkflowAction = NON_WORKFLOW_AGREEMENT_ACTIONS;
	selectedItemsActions = AGREEMENT_BOTTOM_ACTIONS;

	dataSource$: Observable<AgreementListItemDtoPaginatedList> = this._agreementService.getContracts$();
	currentRowInfo$: ReplaySubject<{ name: string; id: number } | null> = new ReplaySubject(1);

	private _outsideClicksSub: Subscription;

	private _unSubscribe$ = new Subject<void>();

	constructor(
		private readonly _router: Router,
		private readonly _route: ActivatedRoute,
		private readonly _gridHelpService: GridHelpService,
		private readonly _agreementService: AgreementService,
		private readonly _agreementServiceProxy: AgreementServiceProxy,
		private readonly _contractService: ContractsService,
		private readonly _downloadFilesService: DownloadFilesService,
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
	ngOnDestroy(): void {
		this._unSubscribe$.next();
		this._unSubscribe$.complete();
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

	onAction($event: { row: AgreementListItemDto; action: string }) {
		switch ($event.action) {
			case 'DOWNLOAD_PDF':
				this._downloadFilesService.pdf($event.row.agreementId).subscribe((d) => {
					DownloadFile(d as any, `${$event.row.agreementId}.pdf`);
				});
				break;
			case 'DOWNLOAD_DOC':
				this._downloadFilesService.latestAgreementVersion($event.row.agreementId, true).subscribe((d) => {
					DownloadFile(d as any, `${$event.row.agreementId}.doc`);
				});
				break;
			case 'WORKFLOW_LINK':
				break;
			case 'EDIT':
				this._router.navigate([`${$event.row.agreementId}`, 'settings'], { relativeTo: this._route });
				break;
			case 'DELETE':
				this.showMainSpinner();
				this._agreementServiceProxy.agreementDELETE($event.row.agreementId).subscribe(() => {
					//back end list not updated right after deletion. It takes some time
					setTimeout(() => {
						this._agreementService.reloadTable();
					}, 1000);
				});
				break;
		}
	}

	onSelectionAction($event: { selectedRows: AgreementDetailsPreviewDto[]; action: string }) {
		switch ($event.action) {
			case 'REMINDER':
				break;

			case 'DOWNLOAD':
				// w8 for backend to add field that needs for validation
				const isValid = $event.selectedRows.find(
					(row) => row.receiveAgreementsFromOtherParty && row.agreementStatus === EnvelopeStatus.WaitingForOthers
				);
				if (isValid) {
					break;
					this._agreementServiceProxy
						.signedDocuments($event.selectedRows.map((selectedRow) => selectedRow.agreementId))
						.subscribe((d) => DownloadFile(d as any, 'signed-documents.pdf'));
				} else {
					break;
				}
		}
	}

	onSelectRowId(selectionRowID: number, rows: AgreementListItemDto[]) {
		if (selectionRowID) {
			let rowData = rows.find((r) => r.agreementId === selectionRowID);
			this.currentRowInfo$.next({ id: rowData.agreementId, name: rowData.agreementName });
		} else {
			this.currentRowInfo$.next(null);
		}
	}

	resetAllTopFilters() {
		this._agreementService.updateSearchFilter('');
		this._agreementService.updateTenantFilter([]);
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
			this.currentRowInfo$.next({ id: parseInt(templateId), name: 'unknown' });
			return this._agreementService.setIdFilter([templateId]);
		}
		this._agreementService.setIdFilter([]);
	}

	private _mapTableItems(items: AgreementListItemDto[], maps: MappedTableCells): MappedAgreementTableItem[] {
		return items.map((item: AgreementListItemDto) => {
			return <MappedAgreementTableItem>{
				language: maps.language[item.languageId as AgreementLanguage],
                countryCode: GetCountryCodeByLanguage(maps.language[item.languageId as AgreementLanguage]),
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
				mode: item.validity,
				status: item.status,
				startDate: item.startDate,
				endDate: item.endDate,
				saleManager: item.salesManager ? item.salesManager : null,
				contractManager: item.contractManager ? item.contractManager : null,
				isWorkflowRelated: item.isWorkflowRelated,
				actionList: item.isWorkflowRelated ? this.workflowActions : this.nonWorkflowAction,
			};
		});
	}

	private _subscribeOnOuterClicks() {
		this.currentRowInfo$
			.pipe(
				takeUntil(this._unSubscribe$),
				startWith(null),
				pairwise(),
				map(([previous, current]) => {
					if (!previous && current) {
						this._outsideClicksSub = fromEvent(document, 'click').subscribe((e: Event) => {
							if (!this.preview.get(0)?.nativeElement.contains(e.target)) {
								this.currentRowInfo$.next(null);
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
		this._agreementService.contractsLoading$$.pipe(takeUntil(this._unSubscribe$)).subscribe((isLoading) => {
			if (isLoading) {
				this.showMainSpinner();
			} else {
				this.hideMainSpinner();
			}
		});
	}
}
