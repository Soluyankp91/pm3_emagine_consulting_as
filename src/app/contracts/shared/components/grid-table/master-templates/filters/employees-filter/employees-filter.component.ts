import { ReplaySubject, Observable } from 'rxjs';
import { startWith, switchMap, tap, take, pluck } from 'rxjs/operators';

import { Component, EventEmitter, Output, Inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { EmployeeDto, LookupServiceProxy } from 'src/shared/service-proxies/service-proxies';
import {
	ITemplatesService,
	TEMPLATE_SERVICE_PROVIDER,
	TEMPLATE_SERVICE_TOKEN,
} from 'src/app/contracts/shared/services/template-service-factory';
import { FILTER_LABEL_MAP } from 'src/app/contracts/shared/entities/contracts.constants';

@Component({
	selector: 'app-employees-filter',
	templateUrl: './employees-filter.component.html',
	providers: [TEMPLATE_SERVICE_PROVIDER],
})
export class EmployeesFilterComponent {
	freeTextEmitter = new EventEmitter();

	filterFormControl: FormControl;
	employees$: Observable<EmployeeDto[]>;

	labelMap = FILTER_LABEL_MAP;

	tableFilter = 'lastUpdatedByLowerCaseInitials';

	constructor(
		private lookupServiceProxy: LookupServiceProxy,
		@Inject(TEMPLATE_SERVICE_TOKEN) private _templatesService: ITemplatesService
	) {
		this._initEmployees();
		this._templatesService
			.getTableFilters$()
			.pipe(take(1), pluck(this.tableFilter))
			.subscribe((employees) => {
				this.filterFormControl = new FormControl(employees);
			});
	}

	emitText($event: { filter: string; idsToExclude: number[] }) {
		this.freeTextEmitter.emit($event);
	}

	private _initEmployees() {
		this.employees$ = this.freeTextEmitter.pipe(
			startWith({ filter: '', idsToExclude: [] }),
			switchMap(({ filter, idsToExclude }) => {
				return this.lookupServiceProxy.employees(filter, false, idsToExclude);
			})
		);
	}
}
