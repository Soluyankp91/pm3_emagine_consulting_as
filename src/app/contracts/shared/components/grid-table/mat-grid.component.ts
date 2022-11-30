import { startWith, pairwise, takeUntil, debounceTime } from 'rxjs/operators';
import { Subject } from 'rxjs';
import {
    Component,
    OnInit,
    Input,
    Output,
    EventEmitter,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    ViewContainerRef,
    ComponentFactoryResolver,
    AfterViewInit,
    ViewChildren,
    QueryList,
    ComponentRef,
    OnDestroy,
    OnChanges,
    SimpleChanges,
} from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { FormGroup } from '@angular/forms';
import {
    EHeaderCells,
    ETableCells,
    IColumn,
    IFilter,
    ITableConfig,
} from './mat-grid.interfaces';
import { PAGE_SIZE_OPTIONS } from './master-templates/entities/master-templates.constants';
import { ComponentType } from '@angular/cdk/portal';
import { SelectionModel } from '@angular/cdk/collections';

@Component({
    selector: 'emg-mat-grid',
    templateUrl: './mat-grid.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatGridComponent
    implements OnInit, OnChanges, OnDestroy, AfterViewInit
{
    @Input() displayedColumns: string[];
    @Input() tableConfig: ITableConfig;
    @Input() cells: IColumn[];
    @Input() selection: boolean = true;
    @Input() actions: boolean = true;

    @Output() sortChange = new EventEmitter<Sort>();
    @Output() pageChange = new EventEmitter<PageEvent>();
    @Output() formControlChange = new EventEmitter();
    @Output() tableRow = new EventEmitter<{ [key: string]: any }>();
    @Output() selectionChange = new EventEmitter();

    @ViewChildren('filterContainer', { read: ViewContainerRef })
    children: QueryList<ViewContainerRef>;
    @ViewChildren('cellContainer', { read: ViewContainerRef })
    cellContainer: QueryList<ViewContainerRef>;

    formGroup: FormGroup;

    matChips: string[] = [];
    pageSizeOptions: number[] = PAGE_SIZE_OPTIONS;

    headerCellEnum = EHeaderCells;
    tableCellEnum = ETableCells;

    initialSelection = [];
    allowMultiSelect = true;

    selection_ = new SelectionModel<any>(
        this.allowMultiSelect,
        this.initialSelection
    );

    private unSubscribe$ = new Subject<void>();

    constructor(
        private componentFactoryResolver: ComponentFactoryResolver,
        private readonly cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this.formGroup = new FormGroup({});
    }

    ngOnChanges(changes: SimpleChanges): void {
        const displayedColumns = changes['displayedColumns'];
        if (displayedColumns && this.selection) {
            displayedColumns.currentValue.unshift('select');
        }
        if (displayedColumns && this.actions) {
            displayedColumns.currentValue.push('actions');
        }
    }

    ngAfterViewInit(): void {
        this.loadFilters();
        this._subscribeOnSelectionChange();
        this._subscribeOnFormControlChanges();
        this._subscribeOnEachFormControl();
        this.cdr.detectChanges();
    }

    ngOnDestroy(): void {
        this.unSubscribe$.next();
        this.unSubscribe$.complete();
    }

    isAllSelected() {
        const numSelected = this.selection_.selected.length;
        const numRows = this.tableConfig.items.length;
        return numSelected === numRows;
    }

    toggleAllRows() {
        this.isAllSelected()
            ? this.selection_.clear()
            : this.tableConfig.items.forEach((row) =>
                  this.selection_.select(row)
              );
    }

    trackByCellColumnDef(index: number, item: IColumn) {
        return item.matColumnDef;
    }

    loadFilters() {
        this.cells
            .filter((cell) => cell.headerCell.type !== 'sort')
            .forEach((cell, index) => {
                if (cell.headerCell.filter) {
                    const factory =
                        this.componentFactoryResolver.resolveComponentFactory<IFilter>(
                            cell.headerCell.filter.component
                        );
                    const component = this.children
                        .get(index)
                        ?.createComponent(factory);
                    this.formGroup.addControl(
                        cell.headerCell.filter.formControlName,
                        (component as ComponentRef<IFilter>).instance
                            .filterFormControl
                    );
                }
            });
        let j = 0;
        this.cells.forEach((column, index) => {
            if (column.cell.type === this.tableCellEnum.CUSTOM) {
                for (
                    let i = j * this.tableConfig.pageSize;
                    i < (j + 1) * this.tableConfig.pageSize;
                    i++
                ) {
                    console.log(i);
                    const factory =
                        this.componentFactoryResolver.resolveComponentFactory(
                            column.cell.component as ComponentType<any>
                        );
                    const component = this.cellContainer
                        .get(i)
                        ?.createComponent(factory);
                }
                j++;
            }
        });
    }

    closeFilter(chip: string) {
        this.formGroup.controls[chip].setValue([]);
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
        this.tableRow.emit(row);
    }

    private _subscribeOnSelectionChange() {
        this.selection_.changed
            .pipe(takeUntil(this.unSubscribe$), debounceTime(300))
            .subscribe((changeModel) => {
                console.log(changeModel.source.selected);
                this.selectionChange.emit(changeModel.source.selected);
            });
    }

    private _subscribeOnFormControlChanges() {
        this.formGroup.valueChanges
            .pipe(takeUntil(this.unSubscribe$))
            .subscribe((value) => {
                this.formControlChange.emit(value);
            });
    }

    private _subscribeOnEachFormControl() {
        Object.keys(this.formGroup.controls).forEach((controlName) => {
            this.formGroup.controls[controlName].valueChanges
                .pipe(
                    takeUntil(this.unSubscribe$),
                    startWith(this.formGroup.controls[controlName].value),
                    pairwise()
                )
                .subscribe(([previousValue, currentValue]: [[], []]) => {
                    if (previousValue.length === 0 && currentValue.length > 0) {
                        this.matChips.push(controlName);
                    } else if (
                        previousValue.length > 0 &&
                        currentValue.length === 0
                    ) {
                        this.matChips = this.matChips.filter(
                            (matChip) => matChip !== controlName
                        );
                    }
                });
        });
    }
}
