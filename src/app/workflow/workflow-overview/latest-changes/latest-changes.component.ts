import { Component, Injector, OnInit } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { debounceTime, finalize, map, pairwise, startWith, takeUntil } from 'rxjs/operators';
import { AppConsts } from 'src/shared/AppConsts';
import { AppComponentBase } from 'src/shared/app-component-base';
import {
	HistoryFilterNamesDto,
	HistoryPropertiesDtoPaginatedList,
	HistoryServiceProxy,
} from 'src/shared/service-proxies/service-proxies';
import { ILatesChangesPayload, ITableData } from './latest-changes.model';
import { PageEvent } from '@angular/material/paginator';

@Component({
	selector: 'latest-changes',
	templateUrl: './latest-changes.component.html',
	styleUrls: ['./latest-changes.component.scss'],
})
export class LatestChangesComponent extends AppComponentBase implements OnInit {
	filter = new UntypedFormControl(null);
	workflowId: string;
	filters$: Observable<HistoryFilterNamesDto[]>;
	filteredEvents$: Observable<HistoryFilterNamesDto[]>;
	displayColumns = ['changedDate', 'actionName', 'changedObject', 'changedField', 'oldValue', 'newValue', 'periodID', 'by'];
	isLoading = false;
	pageIndex = 1;
	pageSize = AppConsts.grid.defaultPageSize;
	pageSizeOptions = [5, 10, 20, 50, 100];
	totalCount: number | undefined = 0;
	sorting = '';
	tableData: ITableData;
	private _unsubscribe = new Subject();
	constructor(injector: Injector, private _activeRoute: ActivatedRoute, private readonly _historyService: HistoryServiceProxy) {
		super(injector);
	}

	ngOnInit(): void {
		this._activeRoute.parent.paramMap.pipe(takeUntil(this._unsubscribe)).subscribe((params) => {
			this.workflowId = params.get('id');
			this.getLatestChanges();
		});
		this.filters$ = this._historyService.filterNames();
		this.filter.valueChanges
			.pipe(
				takeUntil(this._unsubscribe),
				debounceTime(500),
				startWith(''),
				pairwise(),
				map(([previous, current]) => {
					if (previous?.displayName && !current) {
						this.getLatestChanges();
					}
					let toSend = current?.displayName?.length ? current?.displayName : current;
					return this._filterEvents(toSend ?? '');
				})
			)
			.subscribe((result) => {
				this.filteredEvents$ = result;
			});
	}

	getLatestChanges() {
		const payload = this._packPayload();
		this.isLoading = true;
		this._historyService
			.workflow(
				payload.workflowId,
				payload.entityName,
				payload.propertyName,
				payload.pageNumber,
				payload.pageSize,
				payload.sort
			)
			.pipe(
				finalize(() => (this.isLoading = false)),
				map((value: HistoryPropertiesDtoPaginatedList) => {
					const tableData: ITableData = {
						items: value.items,
						pageIndex: value.pageIndex,
						totalCount: value.totalCount,
						pageSize: value.pageSize,
					};
					return tableData;
				})
			)
			.subscribe((result) => {
				this.tableData = result;
			});
	}

	pageChanged(event: PageEvent) {
		this.pageIndex = event.pageIndex + 1;
		this.pageSize = event.pageSize;
		this.getLatestChanges();
	}

	displayEventFn(option: HistoryFilterNamesDto) {
		return option?.displayName ?? '';
	}

	private _packPayload(): ILatesChangesPayload {
		const filterValue = this.filter.value as HistoryFilterNamesDto;
		return {
			workflowId: this.workflowId,
			entityName: filterValue?.entityName ?? undefined,
			propertyName: filterValue?.propertyName ?? undefined,
			pageNumber: this.pageIndex,
			pageSize: this.pageSize,
			sort: this.sorting,
		} as ILatesChangesPayload;
	}

	private _filterEvents(value: string): Observable<HistoryFilterNamesDto[]> {
		const filterValue = value?.toLowerCase();
		const result = this.filters$.pipe(
			map((response) => response.filter((option) => option.displayName.toLowerCase().includes(filterValue)))
		);
		if (value === '') {
			return this.filters$;
		} else {
			return result;
		}
	}
}
