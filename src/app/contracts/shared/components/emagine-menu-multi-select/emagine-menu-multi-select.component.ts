import {
    Component,
    forwardRef,
    Input,
    OnInit,
    ViewEncapsulation,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    ContentChild,
    TemplateRef,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IDropdownItem } from './emagine-menu-multi-select.interfaces';
import { isEqual, uniqBy } from 'lodash';
import { MatMenuTrigger } from '@angular/material/menu';
@Component({
    selector: 'emg-multi-select',
    templateUrl: './emagine-menu-multi-select.component.html',
    styleUrls: ['./emagine-menu-multi-select.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => MultiSelectComponent),
            multi: true,
        },
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class MultiSelectComponent implements OnInit, ControlValueAccessor {
    @Input() set options(options: any[]) {
        this._options = options;
    }
    @Input() displayedProperty: string = 'name';
    @ContentChild('triggerButton') triggerButton: MatMenuTrigger;
    @ContentChild('optionPrefix') optionPrefix: TemplateRef<any>;

    get options() {
        return this._options;
    }

    selectedItems: IDropdownItem[] = [];
    isOpened: boolean = false;
    maxLength: number = 10;
    threeDotsLength: number = 3;

    onChange = (val: any) => {};
    onTouched = (val: any) => {};

    private _options: IDropdownItem[];

    constructor(private readonly cdr: ChangeDetectorRef) {}

    ngOnInit(): void {
        this.unselectAll();
    }

    toggleSelect(toggledItem: IDropdownItem) {
        toggledItem.selected = !toggledItem.selected;
        const { selected, ...baseItem } = toggledItem;
        if (toggledItem.selected) {
            this.selectedItems.push(baseItem);
        } else {
            this.selectedItems = this.selectedItems.filter(
                (i) => !isEqual(i, baseItem)
            );
        }

        this.onChange([...this.selectedItems]);
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    trackByIndex(index: number, item: any) {
        return index;
    }

    writeValue(outer: object[]): void {
        this.selectedItems = [];
        if (outer?.length > 0) {
            this.getUnique(outer).forEach((outerOption) => {
                let foundedOption: IDropdownItem = this._options.find(
                    (option) => {
                        const { selected, ...baseOption } = option;
                        return isEqual(outerOption, baseOption);
                    }
                ) as IDropdownItem;
                this.selectedItems.push(outerOption);
                foundedOption.selected = true;
            });
            this.onChange([...this.selectedItems]);
        }
        this.unselectAll();
        this.cdr.detectChanges();
    }

    private unselectAll() {
        this._options.forEach((option) => {
            (option as IDropdownItem).selected = false;
        });
    }

    private getUnique(items: IDropdownItem[]) {
        return uniqBy(items, (i) => i[this.displayedProperty]);
    }
}
