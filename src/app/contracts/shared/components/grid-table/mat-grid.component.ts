import { startWith, pairwise, takeUntil } from 'rxjs/operators';
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

@Component({
    selector: 'emg-mat-grid',
    templateUrl: './mat-grid.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatGridComponent implements OnInit, OnDestroy, AfterViewInit {
    @Input() displayedColumns: string[];
    @Input() tableConfig: ITableConfig;
    @Input() cells: IColumn[];

    @Output() sortChange = new EventEmitter<Sort>();
    @Output() pageChange = new EventEmitter<PageEvent>();
    @Output() formControlChange = new EventEmitter();
    @Output() tableRow = new EventEmitter<{ [key: string]: any }>();

    @ViewChildren('filterContainer', { read: ViewContainerRef })
    children: QueryList<ViewContainerRef>;
    @ViewChildren('cellContainer', { read: ViewContainerRef })
    cellContainer: QueryList<ViewContainerRef>;

    formGroup: FormGroup;

    matChips: string[] = [];
    pageSizeOptions: number[] = PAGE_SIZE_OPTIONS;

    headerCellEnum = EHeaderCells;
    tableCellEnum = ETableCells;

    private unSubscribe$ = new Subject<void>();

    constructor(
        private componentFactoryResolver: ComponentFactoryResolver,
        private readonly cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this.formGroup = new FormGroup({});
    }

    ngOnDestroy(): void {
        this.unSubscribe$.next();
        this.unSubscribe$.complete();
    }

    ngAfterViewInit(): void {
        this.loadFilters();
        this._subscribeOnFormControlChanges();
        this._subscribeOnEachFormControl();
        this.cdr.detectChanges();
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
                for (let i = j; i < j + this.tableConfig.pageSize; i++) {
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
