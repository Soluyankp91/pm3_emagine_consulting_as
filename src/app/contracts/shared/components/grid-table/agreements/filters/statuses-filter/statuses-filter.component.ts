import { Component, Inject, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { pluck, distinctUntilChanged, takeUntil, tap } from 'rxjs/operators';
import { AgreementService } from 'src/app/contracts/agreements/listAndPreviews/services/agreement.service';
import { FILTER_LABEL_MAP } from 'src/app/contracts/shared/entities/contracts.constants';
import { tapOnce } from 'src/app/contracts/shared/operators/tapOnceOperator';
import { TEMPLATE_SERVICE_PROVIDER, TEMPLATE_SERVICE_TOKEN } from 'src/app/contracts/shared/services/template-service-factory';
import { STATUTES } from '../../entities/agreements.constants';

@Component({
	selector: 'app-agreement-statuses-filter',
	templateUrl: './statuses-filter.component.html',
	styleUrls: ['./statuses-filter.component.scss'],
	providers: [TEMPLATE_SERVICE_PROVIDER],
})
export class StatusesFilterComponent implements OnDestroy {
	filterFormControl: FormControl;
	tableFilter = 'status';

	labelMap = FILTER_LABEL_MAP;
	options = STATUTES;

	private _unSubscribe$ = new Subject();

	constructor(@Inject(TEMPLATE_SERVICE_TOKEN) private readonly _agreementService: AgreementService) {
		this._agreementService
			.getTableFilters$()
			.pipe(
				takeUntil(this._unSubscribe$),
				pluck(this.tableFilter),
				distinctUntilChanged(),
				tapOnce((statuses) => {
					this.filterFormControl = new FormControl(statuses);
				}),
				tap((statuses) => {
					this.filterFormControl.patchValue(statuses);
				})
			)
			.subscribe();
	}

	ngOnDestroy(): void {
		this._unSubscribe$.next();
		this._unSubscribe$.complete();
	}
}
