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
    ContentChildren,
    TemplateRef,
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
import { SelectionModel } from '@angular/cdk/collections';
import { Actions } from './master-templates/entities/master-templates.interfaces';

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
    @Input() actionsList: Actions[] = [];

    @Output() sortChange = new EventEmitter<Sort>();
    @Output() pageChange = new EventEmitter<PageEvent>();
    @Output() formControlChange = new EventEmitter();
    @Output() tableRow = new EventEmitter<{ [key: string]: any }>();
    @Output() selectionChange = new EventEmitter();
    @Output() onAction = new EventEmitter();

    @ContentChildren('customCells')
    customCells: QueryList<TemplateRef<ViewContainerRef>>;

    @ViewChildren('filterContainer', { read: ViewContainerRef })
    children: QueryList<ViewContainerRef>;

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
        const tableConfig = changes['tableConfig'];
        const cells = changes['cells'];
        const displayedColumnsCopy = [...this.displayedColumns];
        if (displayedColumns && this.selection) {
            displayedColumnsCopy.unshift('select');
        }
        if (displayedColumns && this.actions) {
            displayedColumnsCopy.push('actions');
        }
        if (cells) {
        }
        this.displayedColumns = displayedColumnsCopy;
        if (tableConfig.currentValue && !tableConfig.firstChange) {
        }
    }

    ngAfterViewInit(): void {
        this.loadFilters();
        this._subscribeOnSelectionChange();
        this._subscribeOnFormControlChanges();
        this._subscribeOnEachFormControl();
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

    chooseAction(actionType: string, row: any) {
        this.onAction.emit({ action: actionType, row });
    }

    private _subscribeOnSelectionChange() {
        this.selection_.changed
            .pipe(takeUntil(this.unSubscribe$), debounceTime(100))
            .subscribe((changeModel) => {
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
