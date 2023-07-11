import { Component, EventEmitter, Inject, Injector, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BehaviorSubject, Observable } from 'rxjs';
import { pluck, startWith, switchMap, take, tap } from 'rxjs/operators';
import { FILTER_LABEL_MAP } from 'src/app/contracts/shared/entities/contracts.constants';
import {
	ITemplatesService,
	TEMPLATE_SERVICE_PROVIDER,
	TEMPLATE_SERVICE_TOKEN,
} from 'src/app/contracts/shared/services/template-service-factory';
import { AppComponentBase } from 'src/shared/app-component-base';
import { EmployeeDto, LookupServiceProxy } from 'src/shared/service-proxies/service-proxies';

@Component({
	selector: 'po-contract-manager-filter',
	templateUrl: './contract-manager-filter.component.html',
	styleUrls: ['./contract-manager-filter.component.scss'],
	providers: [TEMPLATE_SERVICE_PROVIDER],
})
export class PoContractManagerFilterComponent extends AppComponentBase {
	freeTextEmitter = new EventEmitter();

	filterFormControl = new FormControl([]);
	contractManagers$: Observable<EmployeeDto[]>;

	labelMap = FILTER_LABEL_MAP;

	tableFilter = 'contractManager';
	isOptionsLoading$ = new BehaviorSubject(false);
	constructor(
		private readonly lookupServiceProxy: LookupServiceProxy,
		private readonly _injector: Injector
	) {
		super(_injector);
		this._initContractManagers();
		// this._agreementService
		// 	.getTableFilters$()
		// 	.pipe(take(1), pluck(this.tableFilter))
		// 	.subscribe((contractManagers) => {
		// 		this.filterFormControl = new FormControl(contractManagers);
		// 	});
        // this.filterFormControl.valueChanges.pipe(

        //     ).subscribe(value => {
        //         this.filterChanged.emit(value);
        //     })
	}

	emitText($event: { filter: string; idsToExclude: number[] }) {
		this.freeTextEmitter.emit($event);
	}

	private _initContractManagers() {
		this.contractManagers$ = this.freeTextEmitter.pipe(
			startWith({ filter: '', idsToExclude: [] }),
			tap(() => {
				this.isOptionsLoading$.next(true);
			}),
			switchMap(({ filter, idsToExclude }) => {
				return this.lookupServiceProxy.employees(filter, false, idsToExclude).pipe(
					tap(() => {
						this.isOptionsLoading$.next(false);
					})
				);
			})
		);
	}
}
