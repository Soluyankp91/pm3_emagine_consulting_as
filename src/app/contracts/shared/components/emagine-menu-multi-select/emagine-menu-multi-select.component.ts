import {
    Component,
    forwardRef,
    Input,
    OnInit,
    ViewEncapsulation,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    AfterViewInit,
    OnChanges,
    SimpleChanges,
    ContentChildren,
    ContentChild,
    TemplateRef,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IDropdownItem } from './emagine-menu-multi-select.interfaces';
import { cloneDeep, isEqual, uniqBy } from 'lodash';
import { MatMenuTrigger } from '@angular/material/menu';
@Component({
    selector: 'app-multi-select',
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
export class MultiSelectComponent implements OnInit,AfterViewInit, ControlValueAccessor, OnChanges {
    @Input() set options(options: any[]) {
        this._options = options;
    }
    @Input() public displayedProperty: string = 'name';
    @ContentChild('triggerButton') public triggerButton: MatMenuTrigger;
    @ContentChild('optionPrefix') public optionPrefix: TemplateRef<any>;
    /** options that we display in menu*/
    /** since we have reference to option in outerComponent, and we can use them in outer setValue(),
     *  it is better to clone it, because in other way we should also cut 'selected' from outer value
     */
    /** Toggle button label */

    public selectedItems: IDropdownItem[] = [];
    public isOpened: boolean = false;
    public maxLength: number = 10;
    public threeDotsLength: number = 3;
    get options() {
        return this._options;
    }

    private _options: IDropdownItem[];

    constructor(private readonly cdr: ChangeDetectorRef) {}

    ngOnInit(): void {
        this.unselectAll();
    }
    public toggleSelect(toggledItem: IDropdownItem) {
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

    public registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    public registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    public writeValue(outer: object[]): void {
        this.selectedItems = [];
        if (outer?.length > 0) {
            this.unselectAll();
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
            this.cdr.detectChanges();
        } else {
            this.unselectAll();
            this.cdr.detectChanges();
        }
    }
    public ngOnChanges(changes: SimpleChanges): void {
        // console.log(changes);
    }
    private unselectAll() {
        this._options.forEach((option) => {
            (option as IDropdownItem).selected = false;
        });
    }

    private getUnique(items: IDropdownItem[]) {
        return uniqBy(items, (i) => i[this.displayedProperty]);
    }

    private onChange = (val: any) => {};
    private onTouched = (val: any) => {};
    public ngAfterViewInit(): void {
    }
}
