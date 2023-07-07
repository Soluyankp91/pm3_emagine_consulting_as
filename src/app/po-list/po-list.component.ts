import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit, TrackByFunction } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Sort, SortDirection } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Actions } from '@ngrx/effects';
import { AppConsts } from 'src/shared/AppConsts';
import { DISPLAYED_COLUMNS, DUMMY_DATA } from './po-list.constants';
import { TitleService } from 'src/shared/common/services/title.service';
import { ERouteTitleType } from 'src/shared/AppEnums';
import { FormControl } from '@angular/forms';
import { SelectableEmployeeDto } from '../workflow/workflow.model';
import { PurchaseOrderServiceProxy } from 'src/shared/service-proxies/service-proxies';
import { finalize } from 'rxjs/operators';
import { animate, state, style, transition, trigger } from '@angular/animations';

const POGridOptionsKey = 'PurchaseOrdersGridFILTERS.1.0.0'
@Component({
	selector: 'app-po-list',
	templateUrl: './po-list.component.html',
	styleUrls: ['./po-list.component.scss'],
    animations: [
        trigger('detailExpand', [
          state('collapsed', style({height: '0px', minHeight: '0'})),
          state('expanded', style({height: '*'})),
          transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
        ]),
      ],
})
export class PoListComponent implements OnInit {
	initialSelection = [];
	allowMultiSelect = true;
	selectedItemsActions: Actions[] = [];
	selectedRowId: number;
	selectionModel = new SelectionModel<Actions>(this.allowMultiSelect, this.initialSelection);
	displayedColumns = DISPLAYED_COLUMNS;
	dataSource = new MatTableDataSource<any>(DUMMY_DATA);
	sortActive: string;
	sotrDirection: SortDirection;
	totalCount: number;
	pageSizeOptions = [5, 10, 20];
	defaultPageSize = AppConsts.grid.defaultPageSize;
	pageNumber = 1;
    sorting = '';
    invoicingEntityControl = new FormControl();
    paymentEntityControl = new FormControl();
    searchFilter = new FormControl('');
    selectedAccountManagers: SelectableEmployeeDto[];
    includeCompleted: boolean;
    expandedElement: any;
	trackByAction: TrackByFunction<any>;
	constructor(private readonly _titleService: TitleService, private readonly _purchaseOrderService: PurchaseOrderServiceProxy) {}

	ngOnInit(): void {
        this._titleService.setTitle(ERouteTitleType.POList);
        this.getGridOptions();
    }

    saveGridOptions() {
		let filters = {
			pageNumber: this.pageNumber,
			defaultPageSize: this.defaultPageSize,
			sorting: this.sorting,
			owners: this.selectedAccountManagers,
			invoicingEntity: this.invoicingEntityControl.value ? this.invoicingEntityControl.value : undefined,
			paymentEntity: this.paymentEntityControl.value ? this.paymentEntityControl.value : undefined,

			includeCompleted: this.includeCompleted,
			searchFilter: this.searchFilter.value ? this.searchFilter.value : '',
		};

		localStorage.setItem(POGridOptionsKey, JSON.stringify(filters));
	}

	getGridOptions() {
		let filters = JSON.parse(localStorage.getItem(POGridOptionsKey)!);
		if (filters) {
			this.pageNumber = filters.pageNumber;
			this.defaultPageSize = filters.defaultPageSize;
			this.sorting = filters.sorting;
			this.selectedAccountManagers = filters.owners?.length ? filters.owners : [];
			this.invoicingEntityControl.setValue(filters.invoicingEntity, { emitEvent: false });
			this.paymentEntityControl.setValue(filters.paymentEntity, { emitEvent: false });
			this.includeCompleted = filters.includeCompleted;
			this.searchFilter.setValue(filters.searchFilter, { emitEvent: false });
		}
		this.getPurchaseOrdersList();
	}

    getPurchaseOrdersList() {
        this._purchaseOrderService.getPurchaseOrdersList([], [], [], [], [], [], true, '', 1, 20, '')
            .pipe(finalize(() => console.log('fin')))
            .subscribe(result => {
                console.log(result);
            });
    }

	resetAllFilters() {}

	isAllSelected() {
		const numSelected = this.selectionModel.selected.length;
		const numRows = this.dataSource.data.length;
		return numSelected === numRows;
	}
	toggleAllRows() {
        this.isAllSelected()
			? this.selectionModel.clear()
			: this.dataSource.data.forEach((row) => this.selectionModel.select(row));
    }

	sortChange(event: Sort) {}

	pageChange(event: PageEvent) {}

	someAction(actionRow: any) {}

	chooseSelectionAction(actionType: string) {}
}
