import { Component, OnInit, EventEmitter } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { STATUTES } from 'src/app/contracts/shared/components/grid-table/agreements/entities/agreements.constants';
import { ContractsService } from 'src/app/contracts/shared/services/contracts.service';
import { AgreementService } from '../../services/agreement.service';
import { map, debounceTime, skip, tap, startWith, switchMap } from 'rxjs/operators';
import { tapOnce } from 'src/app/contracts/shared/operators/tapOnceOperator';
import { BaseEnumDto } from 'src/app/contracts/shared/entities/contracts.interfaces';
import { EmployeeDto, LookupServiceProxy } from 'src/shared/service-proxies/service-proxies';
import { Observable, of, Subject } from 'rxjs';
import { FILTER_LABEL_MAP } from 'src/app/contracts/shared/entities/contracts.constants';
import { dirtyCheck } from 'src/app/contracts/shared/operators/dirtyCheckOperator';

@Component({
	selector: 'app-agreements-top-filters',
	templateUrl: './agreements-top-filters.component.html',
	styleUrls: ['./agreements-top-filters.component.scss'],
})
export class AgreementsTopFiltersComponent implements OnInit {
	tenantFilter$ = this._contractsService.getTenants$();
	preselectedTenants$ = this._agreementService.getTenants$();
	salesManagers$: Observable<EmployeeDto[]>;
	isDirty$: Observable<boolean>;

	freeTextEmitter = new EventEmitter();
	statusesOptions = STATUTES;
	labelMap = FILTER_LABEL_MAP;

	topFiltersFormGroup: FormGroup;
	topFiltersValue$ = new Subject();

	tenantsIdsControl = new FormControl([]);
	searchControl = new FormControl('');

	constructor(
		private readonly _router: Router,
		private readonly _route: ActivatedRoute,
		private readonly _contractsService: ContractsService,
		private readonly _agreementService: AgreementService,
		private readonly _lookupServiceProxy: LookupServiceProxy
	) {}

	ngOnInit(): void {
		this._initFilters();
		this._initSalesManagers();
		this._setIsDirty();
		this._subscribeOnFilterChanges();
		this._setTopFiltersValue();
		this._subscribeOnTenantChanges();
		this._subscribeOnSearchChanges();
	}

	navigateTo() {
		this._router.navigate(['create'], { relativeTo: this._route });
	}

	resetFilters() {
		this.topFiltersFormGroup.reset({
			status: [],
			saleManager: [],
		});
	}

	compareWith(o1: any, o2: any) {
		return o1.id === o2.id;
	}

	private _initFilters() {
		this._agreementService
			.getTableFilters$()
			.pipe(
				map(({ status, saleManager }: { status: BaseEnumDto[]; saleManager: BaseEnumDto[] }) => ({
					status,
					saleManager,
				})),
				tapOnce(({ status, saleManager }) => {
					this.topFiltersFormGroup = new FormGroup({
						status: new FormControl(status),
						saleManager: new FormControl(saleManager),
					});
				}),
				skip(1),
				tap(({ status, saleManager }) => {
					this.topFiltersFormGroup.patchValue(
						{
							status: status,
							saleManager: saleManager,
						},
						{
							emitEvent: false,
						}
					);
					this.topFiltersValue$.next({
						status: status,
						saleManager: saleManager,
					});
				})
			)
			.subscribe();
	}

	private _setTopFiltersValue() {
		this.topFiltersFormGroup.valueChanges.subscribe((val) => {
			this.topFiltersValue$.next(val);
		});
	}

	private _initSalesManagers() {
		this.salesManagers$ = this.freeTextEmitter.pipe(
			startWith({ filter: '', idsToExclude: [] }),
			switchMap(({ filter, idsToExclude }) => {
				return this._lookupServiceProxy.employees(filter, false, idsToExclude);
			})
		);
	}

	private _subscribeOnTenantChanges() {
		this.tenantsIdsControl.valueChanges.subscribe((tenants) => {
			this._agreementService.updateTenantFilter(tenants);
		});
	}

	private _subscribeOnSearchChanges() {
		this.searchControl.valueChanges.pipe(debounceTime(300)).subscribe((search) => {
			this._agreementService.updateSearchFilter(search);
		});
	}

	private _subscribeOnFilterChanges() {
		this.topFiltersFormGroup.valueChanges.pipe(debounceTime(500)).subscribe((filters) => {
			this._agreementService.updateTableFilters(filters);
		});
	}

	private _setIsDirty() {
		this.isDirty$ = this.topFiltersValue$.pipe(
			dirtyCheck(
				of({
					status: [],
					saleManager: [],
				})
			)
		);
	}
}
