import { cloneDeep, isArray, isEqual } from 'lodash';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
    Component,
    Input,
    ViewChild,
    ViewEncapsulation,
    forwardRef,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
} from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatSelect, MAT_SELECT_CONFIG } from '@angular/material/select';

type IDropdownItem = object & { [key: string]: any; selected?: boolean };

@Component({
    selector: 'emg-mat-menu-single-select',
    templateUrl: './emagine-menu-single-select.component.html',
    styleUrls: ['./emagine-menu-single-select.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: MAT_SELECT_CONFIG,
            useValue: { overlayPanelClass: 'mat-menu-single-select-panel' },
        },
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => MatMenuSingleSelectComponent),
            multi: true,
        },
    ],
})
export class MatMenuSingleSelectComponent
    implements ControlValueAccessor
{
    @Input() idProperty: string | number = 'id';
    @Input() label: string;
    @Input() set options(items: IDropdownItem[]) {
        this.options_ = cloneDeep(items);
    }
    @Input() displayedProperty: string = 'name';
    @ViewChild('menubutton', { read: MatMenuTrigger })
    menu: MatMenuTrigger;
    @ViewChild('myselect') myselect: MatSelect;

    get options() {
        return this.options_;
    }

    constructor(private cdr: ChangeDetectorRef) {}

    isOpened: boolean = false;
    selectedItem: IDropdownItem | null = null;

    private options_: IDropdownItem[];

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    trackById(index: number, item: IDropdownItem) {
        return item[this.idProperty];
    }
    onMatMenuOpened() {
        this.myselect.open();
    }

    onMatSelectClose() {
        this.menu.closeMenu();
    }

    onSelectionChange(option: IDropdownItem) {
        this.selectedItem = option;
        this.onChange(this.selectedItem);
    }

    onChange = (arg: any) => {};

    onTouched = () => {};

    writeValue(option: any): void {
        if (option && !isArray(option)) {
            this.selectedItem =
                this.options.find((item) => {
                    return isEqual(option, item);
                }) ?? null;
            this.selectedItem ? null : this.onChange(this.selectedItem);
        } else {
            this.selectedItem = null;
        }
        this.cdr.detectChanges();
    }
}
