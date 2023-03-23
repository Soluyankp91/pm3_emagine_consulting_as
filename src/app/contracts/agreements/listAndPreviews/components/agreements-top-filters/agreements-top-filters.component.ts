import { Component, OnInit, EventEmitter, ChangeDetectionStrategy, OnDestroy, Injector } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { STATUTES } from 'src/app/contracts/shared/components/grid-table/agreements/entities/agreements.constants';
import { ContractsService } from 'src/app/contracts/shared/services/contracts.service';
import { AgreementService } from '../../services/agreement.service';
import { map, debounceTime, skip, tap, startWith, switchMap, takeUntil } from 'rxjs/operators';
import { tapOnce } from 'src/app/contracts/shared/operators/tapOnceOperator';
import { BaseEnumDto } from 'src/app/contracts/shared/entities/contracts.interfaces';
import { EmployeeDto, LookupServiceProxy } from 'src/shared/service-proxies/service-proxies';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { FILTER_LABEL_MAP } from 'src/app/contracts/shared/entities/contracts.constants';
import { dirtyCheck } from 'src/app/contracts/shared/operators/dirtyCheckOperator';
import { AppComponentBase } from 'src/shared/app-component-base';

@Component({
	selector: 'app-agreements-top-filters',
	templateUrl: './agreements-top-filters.component.html',
	styleUrls: ['./agreements-top-filters.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AgreementsTopFiltersComponent extends AppComponentBase implements OnInit, OnDestroy {
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

	isOptionsLoading$ = new BehaviorSubject(false);

	private _unSubscribe$ = new Subject<void>();

	constructor(
		private readonly _router: Router,
		private readonly _route: ActivatedRoute,
		private readonly _contractsService: ContractsService,
		private readonly _agreementService: AgreementService,
		private readonly _lookupServiceProxy: LookupServiceProxy,
		private readonly _injector: Injector
	) {
		super(_injector);
	}

	ngOnInit(): void {
		this._initFilters();
		this._initSalesManagers();
		this._setIsDirty();
		this._subscribeOnFilterChanges();
		this._setTopFiltersValue();
		this._subscribeOnTenantChanges();
		this._subscribeOnSearchChanges();
		this._subscribeOnTenantsOuterChanges();
		this._subscribeSearchOuterChanges();
	}

	ngOnDestroy(): void {
		this._unSubscribe$.next();
		this._unSubscribe$.complete();
	}

	navigateTo() {
		this._router.navigate(['create'], { relativeTo: this._route });
	}

	resetFilters() {
		this.topFiltersFormGroup.reset({
			status: [],
			salesManager: [],
		});
	}

	compareWith(o1: any, o2: any) {
		return o1.id === o2.id;
	}

	private _initFilters() {
		this._agreementService
			.getTableFilters$()
			.pipe(
				takeUntil(this._unSubscribe$),
				map(({ status, salesManager }: { status: BaseEnumDto[]; salesManager: BaseEnumDto[] }) => ({
					status,
					salesManager,
				})),
				tapOnce(({ status, salesManager }) => {
					this.topFiltersFormGroup = new FormGroup({
						status: new FormControl(status),
						salesManager: new FormControl(salesManager),
					});
				}),
				skip(1),
				tap(({ status, salesManager }) => {
					this.topFiltersFormGroup.patchValue(
						{
							status: status,
							salesManager: salesManager,
						},
						{
							emitEvent: false,
						}
					);
					this.topFiltersValue$.next({
						status: status,
						salesManager: salesManager,
					});
				})
			)
			.subscribe();
	}

	private _setTopFiltersValue() {
		this.topFiltersFormGroup.valueChanges.pipe(takeUntil(this._unSubscribe$)).subscribe((val) => {
			this.topFiltersValue$.next(val);
		});
	}

	private _initSalesManagers() {
		this.salesManagers$ = this.freeTextEmitter.pipe(
			startWith({ filter: '', idsToExclude: [] }),
			tap(() => {
				this.isOptionsLoading$.next(true);
			}),
			switchMap(({ filter, idsToExclude }) => {
				return this._lookupServiceProxy.employees(filter, false, idsToExclude).pipe(
					tap(() => {
						this.isOptionsLoading$.next(false);
					})
				);
			})
		);
	}

	private _subscribeOnTenantsOuterChanges() {
		this.preselectedTenants$.pipe(takeUntil(this._unSubscribe$)).subscribe((tenantIds) => {
			this.tenantsIdsControl.patchValue(tenantIds, { emitEvent: false, emitModelToViewChange: true });
		});
	}

	private _subscribeSearchOuterChanges() {
		this._agreementService
			.getSearch$()
			.pipe(takeUntil(this._unSubscribe$))
			.subscribe((search) => {
				this.searchControl.patchValue(search, { emitEvent: false, emitModelToViewChange: true });
			});
	}

	private _subscribeOnTenantChanges() {
		this.tenantsIdsControl.valueChanges.pipe(takeUntil(this._unSubscribe$), debounceTime(300)).subscribe((tenants) => {
			this._agreementService.updateTenantFilter(tenants);
		});
	}

	private _subscribeOnSearchChanges() {
		this.searchControl.valueChanges.pipe(takeUntil(this._unSubscribe$), debounceTime(300)).subscribe((search) => {
			this._agreementService.updateSearchFilter(search);
		});
	}

	private _subscribeOnFilterChanges() {
		this.topFiltersFormGroup.valueChanges.pipe(takeUntil(this._unSubscribe$), debounceTime(500)).subscribe((filters) => {
			this._agreementService.updateTableFilters(filters);
		});
	}

	private _setIsDirty() {
		this.isDirty$ = this.topFiltersValue$.pipe(
			dirtyCheck(
				of({
					status: [],
					salesManager: [],
				})
			)
		);
	}
}
