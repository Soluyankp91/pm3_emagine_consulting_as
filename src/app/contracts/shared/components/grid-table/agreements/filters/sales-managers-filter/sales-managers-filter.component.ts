import { Component, EventEmitter, Inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { pluck, startWith, switchMap, take } from 'rxjs/operators';
import { FILTER_LABEL_MAP } from 'src/app/contracts/shared/entities/contracts.constants';
import {
	ITemplatesService,
	TEMPLATE_SERVICE_PROVIDER,
	TEMPLATE_SERVICE_TOKEN,
} from 'src/app/contracts/shared/services/template-service-factory';
import { EmployeeDto, LookupServiceProxy } from 'src/shared/service-proxies/service-proxies';

@Component({
	selector: 'app-sales-managers-filter',
	templateUrl: './sales-managers-filter.component.html',
	providers: [TEMPLATE_SERVICE_PROVIDER],
})
export class SalesManagersFilterComponent {
	freeTextEmitter = new EventEmitter();

	filterFormControl: FormControl;
	salesManagers$: Observable<EmployeeDto[]>;

	labelMap = FILTER_LABEL_MAP;

	tableFilter = 'saleManager';
	constructor(
		private readonly lookupServiceProxy: LookupServiceProxy,
		@Inject(TEMPLATE_SERVICE_TOKEN) private _agreementService: ITemplatesService
	) {
		this._initSalesManagers();
		this._agreementService
			.getTableFilters$()
			.pipe(take(1), pluck(this.tableFilter))
			.subscribe((salesManagers) => {
				this.filterFormControl = new FormControl(salesManagers);
			});
	}

	emitText($event: { filter: string; idsToExclude: number[] }) {
		this.freeTextEmitter.emit($event);
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
