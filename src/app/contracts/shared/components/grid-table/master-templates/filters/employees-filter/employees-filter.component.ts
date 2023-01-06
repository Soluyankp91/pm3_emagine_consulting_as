import { ReplaySubject, Observable } from 'rxjs';
import { startWith, switchMap, tap, take, pluck } from 'rxjs/operators';

import { Component, EventEmitter, Output, Inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { EmployeeDto, LookupServiceProxy } from 'src/shared/service-proxies/service-proxies';
import { FILTER_LABEL_MAP } from '../../entities/master-templates.constants';
import {
	ITemplatesService,
	TEMPLATE_SERVICE_PROVIDER,
	TEMPLATE_SERVICE_TOKEN,
} from 'src/app/contracts/shared/services/template-service-factory';

@Component({
	selector: 'app-employees-filter',
	templateUrl: './employees-filter.component.html',
	providers: [TEMPLATE_SERVICE_PROVIDER],
})
export class EmployeesFilterComponent {
	@Output() initialLoading = new ReplaySubject<boolean>(1).pipe(take(1)) as ReplaySubject<boolean>;

	textEmitter = new EventEmitter();

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

	emitText($event: { nameFilter: string; idsToExclude: number[] }) {
		this.textEmitter.emit($event);
	}

	private _initEmployees() {
		this.employees$ = this.textEmitter.pipe(
			startWith({ nameFilter: '', idsToExclude: [] }),
			switchMap(({ nameFilter, idsToExclude }) => {
				return this.lookupServiceProxy.employees(nameFilter, false, idsToExclude);
			}),
			tap(() => this.initialLoading.next(true))
		);
	}
}
