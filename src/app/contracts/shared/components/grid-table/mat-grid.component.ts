import { startWith } from 'rxjs/operators';
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
} from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { pairwise } from 'rxjs/operators';
import { FormGroup } from '@angular/forms';
import { Cell, IFilter, TableConfig } from './mat-grid.interfaces';
import * as moment from 'moment';
import { DateCellComponent } from './master-templates/cells/date-cell/date-cell.component';

@Component({
    selector: 'app-mat-grid',
    templateUrl: './mat-grid.component.html',
    styleUrls: ['./mat-grid.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatGridComponent implements OnInit, AfterViewInit {
    @ViewChildren('filterContainer', { read: ViewContainerRef })
    children: QueryList<ViewContainerRef>;
    @ViewChildren('cell_', { read: ViewContainerRef })
    cells_: QueryList<ViewContainerRef>;
    @Input() displayedColumns: string[];
    @Input() tableConfig: TableConfig;
    @Input() cells: Cell[];

    @Output() sortChange = new EventEmitter<Sort>();
    @Output() pageChange = new EventEmitter<PageEvent>();
    @Output() formControlChange = new EventEmitter();
    @Output() tableRow = new EventEmitter<{ [key: string]: any }>();

    formGroup: FormGroup;

    matChips: string[] = [];
    constructor(
        private componentFactoryResolver: ComponentFactoryResolver,
        private readonly cdr: ChangeDetectorRef
    ) {}
    ngOnInit(): void {
        this.formGroup = new FormGroup({});
    }
    ngAfterViewInit(): void {
        this.loadFilters();
        this._subscribeOnFormControlChanges();
        this._subscribeOnEachFormControl();
        this.cdr.detectChanges();
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
                        (component as ComponentRef<IFilter>).instance.fc
                    );
                }
            });
        console.log(this.cells_, this.tableConfig);

        this.tableConfig.items.forEach((item, index) => {
            const factory =
                this.componentFactoryResolver.resolveComponentFactory(
                    DateCellComponent
                );
            const component = this.cells_
                .get(45 + index)
                ?.createComponent(factory);
            component!.instance.date = moment(
                item[this.displayedColumns[9]]['_d']
            ).format('DD/MM/YYYY');
            component?.instance.emitTest.subscribe((data) => {
                console.log(data);
            });
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
        this.formGroup.valueChanges.subscribe((value) => {
            this.formControlChange.emit(value);
        });
    }
    private _subscribeOnEachFormControl() {
        Object.keys(this.formGroup.controls).forEach((controlName) => {
            this.formGroup.controls[controlName].valueChanges
                .pipe(
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
