import { BehaviorSubject, Observable } from 'rxjs';
import { startWith, switchMap, take, pluck, tap } from 'rxjs/operators';

import { Component, EventEmitter, Injector, Inject, ChangeDetectionStrategy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { EmployeeDto, LookupServiceProxy } from 'src/shared/service-proxies/service-proxies';
import {
	ITemplatesService,
	TEMPLATE_SERVICE_PROVIDER,
	TEMPLATE_SERVICE_TOKEN,
} from 'src/app/contracts/shared/services/template-service-factory';
import { FILTER_LABEL_MAP } from 'src/app/contracts/shared/entities/contracts.constants';
import { AppComponentBase } from 'src/shared/app-component-base';

@Component({
	selector: 'app-employees-filter',
	templateUrl: './employees-filter.component.html',
	styleUrls: ['./employees-filter.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [TEMPLATE_SERVICE_PROVIDER],
})
export class EmployeesFilterComponent extends AppComponentBase {
	freeTextEmitter = new EventEmitter();

	filterFormControl: FormControl;
	employees$: Observable<EmployeeDto[]>;

	labelMap = FILTER_LABEL_MAP;

	tableFilter = 'lastUpdatedByLowerCaseInitials';

	optionsLoading$ = new BehaviorSubject(false);

	constructor(
		private lookupServiceProxy: LookupServiceProxy,
		private readonly _injector: Injector,
		@Inject(TEMPLATE_SERVICE_TOKEN) private _templatesService: ITemplatesService
	) {
		super(_injector);
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
			tap(() => {
				this.optionsLoading$.next(true);
			}),
			switchMap(({ filter, idsToExclude }) => {
				return this.lookupServiceProxy.employees(filter, false, idsToExclude).pipe(
					tap(() => {
						this.optionsLoading$.next(false);
					})
				);
			})
		);
	}
}
