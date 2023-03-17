import { Component, EventEmitter, Inject, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { pluck, startWith, switchMap, takeUntil, distinctUntilChanged, tap } from 'rxjs/operators';
import { FILTER_LABEL_MAP } from 'src/app/contracts/shared/entities/contracts.constants';
import { tapOnce } from 'src/app/contracts/shared/operators/tapOnceOperator';
import {
	ITemplatesService,
	TEMPLATE_SERVICE_PROVIDER,
	TEMPLATE_SERVICE_TOKEN,
} from 'src/app/contracts/shared/services/template-service-factory';
import { EmployeeDto, LookupServiceProxy } from 'src/shared/service-proxies/service-proxies';

@Component({
	selector: 'app-sales-managers-filter',
	templateUrl: './sales-managers-filter.component.html',
	styleUrls: ['./sales-managers-filter.component.scss'],
	providers: [TEMPLATE_SERVICE_PROVIDER],
})
export class SalesManagersFilterComponent implements OnDestroy {
	freeTextEmitter = new EventEmitter();

	filterFormControl: FormControl;
	salesManagers$: Observable<EmployeeDto[]>;

	labelMap = FILTER_LABEL_MAP;

	tableFilter = 'salesManager';

	private _unSubscribe$ = new Subject();
	constructor(
		private readonly lookupServiceProxy: LookupServiceProxy,
		@Inject(TEMPLATE_SERVICE_TOKEN) private _agreementService: ITemplatesService
	) {
		this._initSalesManagers();
		this._agreementService
			.getTableFilters$()
			.pipe(
				takeUntil(this._unSubscribe$),
				pluck(this.tableFilter),
				distinctUntilChanged(),
				tapOnce((salesManagers) => {
					this.filterFormControl = new FormControl(salesManagers);
				}),
				tap((salesManagers) => {
					this.filterFormControl.patchValue(salesManagers);
				})
			)
			.subscribe();
	}

	ngOnDestroy(): void {
		this._unSubscribe$.next();
		this._unSubscribe$.complete();
	}

	private _initSalesManagers() {
		this.salesManagers$ = this.freeTextEmitter.pipe(
			startWith({ filter: '', idsToExclude: [] }),
			switchMap(({ filter, idsToExclude }) => {
				return this.lookupServiceProxy.employees(filter, false, idsToExclude);
			})
		);
	}
}
