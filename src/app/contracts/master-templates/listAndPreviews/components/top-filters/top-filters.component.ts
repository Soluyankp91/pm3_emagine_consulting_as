import { take, takeUntil, debounceTime } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ContractsService } from 'src/app/contracts/shared/services/contracts.service';
import {
	ITemplatesService,
	TEMPLATE_SERVICE_PROVIDER,
	TEMPLATE_SERVICE_TOKEN,
} from 'src/app/contracts/shared/services/template-service-factory';
import { MasterTemplatesService } from '../../services/master-templates.service';

@Component({
	selector: 'app-template-filter-header',
	templateUrl: './top-filters.component.html',
	styleUrls: ['./top-filters.component.scss'],
	providers: [TEMPLATE_SERVICE_PROVIDER],
})
export class MasterTemplateFilterHeaderComponent implements OnInit, OnDestroy {
	tenantFilter$ = this._contractsService.getTenants$();
	preselectedTenants$ = this._templatesService.getTenants$();
	topFiltersFormGroup: FormGroup;

	pageHeader: string;

	private _unSubscribe$ = new Subject<void>();

	constructor(
		@Inject(TEMPLATE_SERVICE_TOKEN) private _templatesService: ITemplatesService,
		private readonly _contractsService: ContractsService,
		private readonly _router: Router,
		private readonly _route: ActivatedRoute
	) {}

	ngOnInit() {
		this.initFilters();
		this._subscribeOnTenantChanged();
		this._subscribeOnTextChanged();
		this._subscribeOnTenantsOuterChanges();
        this._subscribeSearchOuterChanges();
        this._setPageHeader();
	}

	ngOnDestroy(): void {
		this._unSubscribe$.next();
		this._unSubscribe$.complete();
	}

	navigateTo() {
		this._router.navigate(['create'], { relativeTo: this._route });
	}

	private _setPageHeader() {
		this.pageHeader =
			this._templatesService instanceof MasterTemplatesService ? 'Master Templates' : 'Client Specific Templates';
	}

	private _subscribeOnTenantsOuterChanges() {
		this.preselectedTenants$.pipe(takeUntil(this._unSubscribe$)).subscribe((tenantIds) => {
			this.topFiltersFormGroup.controls['tenantIds'].patchValue(tenantIds, {
				emitEvent: false,
				emitModelToViewChange: true,
			});
		});
	}

	private _subscribeSearchOuterChanges() {
		this._templatesService
			.getSearch$()
			.pipe(takeUntil(this._unSubscribe$))
			.subscribe((search) => {
				this.topFiltersFormGroup.controls['search'].patchValue(search, { emitEvent: false, emitModelToViewChange: true });
			});
	}

	private _subscribeOnTenantChanged() {
		this.topFiltersFormGroup.controls['tenantIds'].valueChanges.pipe(takeUntil(this._unSubscribe$)).subscribe((tenants) => {
			this._templatesService.updateTenantFilter(tenants);
		});
	}

	private _subscribeOnTextChanged() {
		this.topFiltersFormGroup.controls['search'].valueChanges
			.pipe(takeUntil(this._unSubscribe$), debounceTime(600))
			.subscribe((search) => {
				this._templatesService.updateSearchFilter(search);
			});
	}

	private initFilters() {
		this.preselectedTenants$.pipe(take(1)).subscribe((tenants) => {
			this.topFiltersFormGroup = new FormGroup({
				tenantIds: new FormControl(tenants),
				search: new FormControl(),
			});
		});
	}
}
