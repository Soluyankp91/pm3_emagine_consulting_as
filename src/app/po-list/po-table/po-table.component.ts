import { startWith, pairwise, takeUntil } from 'rxjs/operators';
import { Subject, merge, of } from 'rxjs';
import {
	Component,
	OnInit,
	Input,
	Output,
	EventEmitter,
	ChangeDetectionStrategy,
	ViewContainerRef,
	ComponentFactoryResolver,
	AfterViewInit,
	ViewChildren,
	QueryList,
	ComponentRef,
	OnDestroy,
	OnChanges,
	SimpleChanges,
	ContentChildren,
	TemplateRef,
	Injector,
	TrackByFunction,
} from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { FormControl, FormGroup } from '@angular/forms';
import { EHeaderCells, ETableCells, IColumn, IFilter, ITableConfig } from './po-table.interfaces';
import { SelectionModel } from '@angular/cdk/collections';
import { AppComponentBase } from 'src/shared/app-component-base';
import { MatTableDataSource } from '@angular/material/table';
import { AppConsts } from 'src/shared/AppConsts';
import { Actions } from '../po-list.model';

@Component({
	selector: 'po-table',
	styleUrls: ['./po-table.component.scss'],
	templateUrl: './po-table.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PoTableComponent extends AppComponentBase implements OnInit, OnChanges, OnDestroy, AfterViewInit {
	@Input() displayedColumns: string[];
	@Input() tableConfig: ITableConfig;
	@Input() cells: IColumn[];
	@Input() selection: boolean = true;
	@Input() actions: boolean = true;
	@Input() selectedItemsActions: Actions[] = [];
	@Input() selectedRowId: number | null;
	@Input() rowIdProperty: string = 'id';
	@Input() sticky: boolean;

	@Output() sortChange = new EventEmitter<Sort>();
	@Output() pageChange = new EventEmitter<PageEvent>();
	@Output() formControlChange = new EventEmitter();
	@Output() selectedRowIdChange = new EventEmitter();
	@Output() onAction = new EventEmitter();
	@Output() onSelectionAction = new EventEmitter();
	@Output() resetAllFilters = new EventEmitter();

	@ContentChildren('customCells', {
		descendants: false,
		emitDistinctChangesOnly: true,
	})
	customCells: QueryList<TemplateRef<ViewContainerRef>>;

	@ViewChildren('filterContainer', { read: ViewContainerRef })
	children: QueryList<ViewContainerRef>;

	cellArr: TemplateRef<ViewContainerRef>[];

	dataSource = new MatTableDataSource<any>();

	formGroup: FormGroup;

	matChips: { label: string; formControl: string }[] = [];
	pageSizeOptions: number[] = AppConsts.grid.pageSizeOptions;

	headerCellEnum = EHeaderCells;
	tableCellEnum = ETableCells;

	initialSelection = [];
	allowMultiSelect = true;

	selectionModel = new SelectionModel<any>(this.allowMultiSelect, this.initialSelection);

	trackByAction: TrackByFunction<Actions>;
	trackByFormControlName: TrackByFunction<string>;

	private _unSubscribe$ = new Subject<void>();

	constructor(private readonly _injector: Injector, private _componentFactoryResolver: ComponentFactoryResolver) {
		super(_injector);
		this.trackByAction = this.createTrackByFn('actionType');
		this.trackByFormControlName = this.createTrackByFn('formControl');
	}

	ngOnInit(): void {
		this.formGroup = new FormGroup({});
	}

	ngOnChanges(changes: SimpleChanges): void {
		const displayedColumns = changes['displayedColumns'];
		const displayedColumnsCopy = [...this.displayedColumns];
		const tableConfig = changes['tableConfig'];
		if (tableConfig) {
			this.selectionModel.clear();
		}
		if (displayedColumns && this.selection) {
			displayedColumnsCopy.unshift('select');
		}
		if (displayedColumns && this.actions) {
			displayedColumnsCopy.push('actions');
		}
		this.displayedColumns = displayedColumnsCopy;
	}

	async ngAfterViewInit() {
		this.cellArr = this.customCells.toArray();
		await this.loadFilters();

		//await for filters to be inited then subscribe to formControls:
		this._subscribeOnFormControlChanges();
		this._subscribeOnEachFormControl();
	}

	ngOnDestroy(): void {
		this._unSubscribe$.next();
		this._unSubscribe$.complete();
	}

	isAllSelected() {
		const numSelected = this.selectionModel.selected.length;
		const numRows = this.tableConfig.items.length;
		return numSelected === numRows;
	}

	toggleAllRows() {
		this.isAllSelected()
			? this.selectionModel.clear()
			: this.tableConfig.items.forEach((row) => this.selectionModel.select(row));
	}

	trackByCellColumnDef(index: number, item: IColumn) {
		return item.matColumnDef;
	}

	async loadFilters() {
		await Promise.all(
			this.cells
				.filter((cell) => cell.headerCell.type !== 'default')
				.map(async (cell, index) => {
					if (cell.headerCell.filter) {
						const componentInstance = await cell.headerCell.filter.component();
						const factory = this._componentFactoryResolver.resolveComponentFactory<IFilter>(componentInstance);
						const component = this.children.get(index)?.createComponent(factory, 0);
						this.formGroup.addControl(
							cell.headerCell.filter.formControlName,
							(component as ComponentRef<IFilter>).instance.filterFormControl,
							{ emitEvent: false }
						);
					}
				})
		).then(() => {
			const initialValue = this.selectedRowId ? [this.selectedRowId] : [];
			this.formGroup.addControl('id', new FormControl(initialValue), { emitEvent: false });
		});
	}

	closeFilter(chip: string) {
		this.formGroup.controls[chip].patchValue([]);
	}

	closeAllFilters() {
		this.formGroup.patchValue(
			Object.keys(this.formGroup.controls).reduce((acc, key) => {
				acc[key] = [];
				return acc;
			}, {} as any)
		);
	}

	getTableRow(row: { [key: string]: any }) {
		this.selectedRowIdChange.emit(row[this.rowIdProperty]);
	}

	chooseAction(actionType: string, row: any) {
		this.onAction.emit({ action: actionType, row });
	}

	chooseSelectionAction(actionType: string) {
		this.onSelectionAction.emit({ action: actionType, selectedRows: this.selectionModel.selected });
	}

	private _subscribeOnFormControlChanges() {
		this.formGroup.valueChanges.pipe(takeUntil(this._unSubscribe$)).subscribe((value) => {
			this.formControlChange.emit(value);
		});
	}

	private _subscribeOnEachFormControl() {
		Object.keys(this.formGroup.controls).forEach((controlName) => {
			merge(
				of([]),
				this.formGroup.controls[controlName].valueChanges.pipe(
					takeUntil(this._unSubscribe$),
					startWith(this.formGroup.controls[controlName].value)
				)
			)
				.pipe(pairwise())
                .subscribe();
				// .subscribe(([previousValue, currentValue]: [[], []]) => {
				// 	if (!previousValue.length && currentValue.length) {
				// 		this.matChips.push({ formControl: controlName, label: FILTER_LABEL_MAP[controlName] });
				// 	} else if (previousValue.length && !currentValue.length) {
				// 		this.matChips = this.matChips.filter((matChip) => matChip.formControl !== controlName);
				// 	}
				// });
		});
	}
}
