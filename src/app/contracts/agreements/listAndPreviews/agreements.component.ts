import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, combineLatest, ReplaySubject } from 'rxjs';
import { map } from 'rxjs/operators';
import {
	AGREEMENT_HEADER_CELLS,
	DISPLAYED_COLUMNS,
} from '../../shared/components/grid-table/agreements/entities/agreements.constants';
import { ITableConfig } from '../../shared/components/grid-table/mat-grid.interfaces';
import { AgreementFiltersEnum } from '../../shared/entities/contracts.interfaces';
import { ContractsService } from '../../shared/services/contracts.service';
import { GridHelpService } from '../../shared/services/mat-grid-service.service';
import { AgreementService } from './services/agreement.service';

@Component({
	selector: 'app-agreements',
	templateUrl: './agreements.component.html',
	providers: [GridHelpService],
})
export class AgreementsComponent implements OnInit {
	cells = this._gridHelpService.generateTableConfig(DISPLAYED_COLUMNS, AGREEMENT_HEADER_CELLS);
	displayedColumns = DISPLAYED_COLUMNS;
	table$: Observable<ITableConfig>;

	dataSource$ = this._agreementService.getContracts$();

	currentRowId$: ReplaySubject<number | null> = new ReplaySubject(1);

	constructor(
		private readonly _router: Router,
		private readonly _route: ActivatedRoute,
		private readonly _gridHelpService: GridHelpService,
		private readonly _agreementService: AgreementService,
		private readonly _contractService: ContractsService
	) {}

	ngOnInit(): void {
		this._initTable$();
		this._initPreselectedFilters();
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
}
