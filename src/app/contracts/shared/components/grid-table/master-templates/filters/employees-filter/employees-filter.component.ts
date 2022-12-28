import { ReplaySubject, Observable } from 'rxjs';
import { startWith, switchMap, tap, take, pluck } from 'rxjs/operators';

import { Component, EventEmitter, Output, Inject, Injector } from '@angular/core';
import { FormControl } from '@angular/forms';
import { EmployeeDto, LookupServiceProxy } from 'src/shared/service-proxies/service-proxies';
import { MasterTemplatesService } from 'src/app/contracts/master-templates/listAndPreviews/services/master-templates.service';
import { FILTER_LABEL_MAP } from '../../entities/master-templates.constants';
import { BASE_CONTRACT, contractsInjector } from 'src/app/contracts/contracts.module';
import { ClientTemplatesService } from 'src/app/contracts/client-specific-templates/listAndPreviews/service/client-templates.service';
import { Router } from '@angular/router';
import { BaseContract } from 'src/app/contracts/shared/base/base-contract';

@Component({
	selector: 'app-employees-filter',
	templateUrl: './employees-filter.component.html',
})
export class EmployeesFilterComponent {
	@Output() initialLoading = new ReplaySubject<boolean>(1).pipe(take(1)) as ReplaySubject<boolean>;

	textEmitter = new EventEmitter();

	filterFormControl: FormControl;
	employees$: Observable<EmployeeDto[]>;

	labelMap = FILTER_LABEL_MAP;

	tableFilter = 'lastUpdatedByLowerCaseInitials';

	constructor(private lookupServiceProxy: LookupServiceProxy, @Inject(BASE_CONTRACT) masterTemplateService: BaseContract) {
		this._initEmployees();
		masterTemplateService
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
