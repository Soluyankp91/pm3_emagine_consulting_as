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

@Component({
	selector: 'app-po-list',
	templateUrl: './po-list.component.html',
	styleUrls: ['./po-list.component.scss'],
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
	pageSize = AppConsts.grid.defaultPageSize;
	pageIndex = 1;
	trackByAction: TrackByFunction<any>;
	constructor(private readonly _titleService: TitleService,) {}

	ngOnInit(): void {
        this._titleService.setTitle(ERouteTitleType.POList);
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
