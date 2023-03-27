import { Component, ElementRef, OnInit, QueryList, ViewChildren } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, combineLatest, ReplaySubject, Subject, fromEvent, Subscription } from 'rxjs';
import { takeUntil, startWith, pairwise } from 'rxjs/operators';
import { map } from 'rxjs/operators';
import { ERouteTitleType } from 'src/shared/AppEnums';
import { TitleService } from 'src/shared/common/services/title.service';
import { AgreementListItemDtoPaginatedList } from 'src/shared/service-proxies/service-proxies';
import {
	AGREEMENT_HEADER_CELLS,
	DISPLAYED_COLUMNS,
} from '../../shared/components/grid-table/agreements/entities/agreements.constants';
import { ITableConfig } from '../../shared/components/grid-table/mat-grid.interfaces';
import { AgreementFiltersEnum } from '../../shared/entities/contracts.interfaces';
import { ContractsService } from '../../shared/services/contracts.service';
import { GridHelpService } from '../../shared/services/mat-grid-service.service';
import { AgreementPreviewComponent } from './components/agreement-preview/agreement-preview.component';
import { AgreementService } from './services/agreement.service';

@Component({
	selector: 'app-agreements',
	templateUrl: './agreements.component.html',
	styleUrls: ['./agreements.component.scss'],
	providers: [GridHelpService],
})
export class AgreementsComponent implements OnInit {
	@ViewChildren(AgreementPreviewComponent, { read: ElementRef }) preview: QueryList<ElementRef>;
	cells = this._gridHelpService.generateTableConfig(DISPLAYED_COLUMNS, AGREEMENT_HEADER_CELLS);
	displayedColumns = DISPLAYED_COLUMNS;
	table$: Observable<ITableConfig>;

	dataSource$: Observable<AgreementListItemDtoPaginatedList> = this._agreementService.getContracts$();

	currentRowId$: ReplaySubject<number | null> = new ReplaySubject(1);

	private _outsideClicksSub: Subscription;

	private _unSubscribe$ = new Subject<void>();

	constructor(
		private readonly _router: Router,
		private readonly _route: ActivatedRoute,
		private readonly _gridHelpService: GridHelpService,
		private readonly _agreementService: AgreementService,
		private readonly _contractService: ContractsService,
		private readonly _titleService: TitleService
	) {}

	ngOnInit(): void {
		this._titleService.setTitle(ERouteTitleType.ContractAgreement);
		this._initTable$();
		this._initPreselectedFilters();
		this._subscribeOnOuterClicks();
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

	navigateToCreate() {
		this._router.navigate(['create'], { relativeTo: this._route });
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
					items: data.items,
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
}
