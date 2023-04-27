import { Component, Injector, OnInit } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { finalize, startWith, switchMap, takeUntil, tap } from 'rxjs/operators';
import { AppComponentBase } from 'src/shared/app-component-base';
import {
	HistoryFilterNamesDto,
	HistoryPropertiesDtoPaginatedList,
	HistoryServiceProxy,
	WorkflowHistoryDto,
	WorkflowHistoryDtoPaginatedList,
	WorkflowServiceProxy,
} from 'src/shared/service-proxies/service-proxies';

@Component({
	selector: 'app-latest-changes',
	templateUrl: './latest-changes.component.html',
	styleUrls: ['./latest-changes.component.scss'],
})
export class LatestChangesComponent extends AppComponentBase implements OnInit {
	filter = new UntypedFormControl(null);
	workflowId: string;
	workflowHistory$: Observable<HistoryPropertiesDtoPaginatedList>;
	filters$: Observable<HistoryFilterNamesDto[]>;
	displayColumns = ['changedDate', 'actionName', 'propertyName', 'oldValue', 'newValue', 'period', 'periodID', 'by'];
	isLoading = false;
    private _unsubscribe = new Subject();
	constructor(injector: Injector, private _activeRoute: ActivatedRoute, private readonly _historyService: HistoryServiceProxy) {
		super(injector);
	}

	ngOnInit(): void {
        this._activeRoute.paramMap.pipe(takeUntil(this._unsubscribe)).subscribe((params) => {
			this.workflowId = params.get('id')!;
            this._getLatestChanges();
		});
		this.workflowHistory$ = this._activeRoute.parent.params.pipe(
			switchMap((params) => {
				this.workflowId = params.id;
				this.isLoading = true;
				return this._historyService.workflow(params.id).pipe(finalize(() => this.isLoading = false));
			})
		);
		this.filters$ = this._historyService.filterNames();

	}

    private _getLatestChanges(filter?: HistoryFilterNamesDto) {
        this._historyService.workflow(this.workflowId, filter?.entityName ?? undefined, filter?.propertyName ?? undefined)
        .pipe(finalize(() => this.isLoading = false));
    }

	filterLatestChanges(value?: HistoryFilterNamesDto) {
		this.isLoading = true;
		this.workflowHistory$ = this._historyService
			.workflow(this.workflowId, value?.entityName ?? undefined, value?.propertyName ?? undefined)
			.pipe(finalize(() => this.isLoading = false));
	}
}
