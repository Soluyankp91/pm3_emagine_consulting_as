import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { IDropdownItem } from '../emagine-menu-multi-select/emagine-menu-multi-select.interfaces';
import {
    Component,
    OnInit,
    OnDestroy,
    Input,
    Output,
    EventEmitter,
    ChangeDetectionStrategy,
    forwardRef,
    ChangeDetectorRef,
} from '@angular/core';
import {
    ControlValueAccessor,
    FormControl,
    NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { isEqualWith } from 'lodash';

@Component({
    selector: 'app-dropdown-autocomplete-multiselect',
    templateUrl: './dropdown-autocomplete-multiselect.component.html',
    styleUrls: ['./dropdown-autocomplete-multiselect.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(
                () => DropdownAutocompleteMultiselectComponent
            ),
            multi: true,
        },
    ],
})
export class DropdownAutocompleteMultiselectComponent
    implements OnInit, OnDestroy, ControlValueAccessor
{
    @Input() set options(options: IDropdownItem[]) {
        this.initialOptions = new Set(options);
        this.availableOptions = new Set(options);
        this.isSearchNull = options.length === 0 ? true : false;
    }
    @Output() emitText = new EventEmitter();

    get idsToExclude() {
        return Array.from(this.selectedOptions).map(
            (selectedOption: IDropdownItem) => selectedOption.id
        );
    }
    isSearchNull: boolean;
    selectedAll = false;

    initialOptions: Set<IDropdownItem>;
    availableOptions: Set<IDropdownItem>;
    selectedOptions = new Set<IDropdownItem>();
    inputControl = new FormControl('');

    private unSubscribe$ = new Subject<void>();

    constructor(private cdr: ChangeDetectorRef) {}

    ngOnInit(): void {
        this._subscribeOnTextInput();
    }
    ngOnDestroy(): void {
        this.unSubscribe$.next();
    }
    toggleSelectAll() {
        if (!this.selectedAll) {
            this.availableOptions.forEach((option) => {
                this.selectedOptions.add(option);
            });
            this.availableOptions.clear();
            this._onChangeSelectedOptions();
        } else {
            this.selectedOptions.forEach((option) => {
                if (this.initialOptions.has(option)) {
                    this.availableOptions.add(option);
                }
            });
            this.selectedOptions.clear();
            this.onChange([]);
        }
        this.selectedAll = !this.selectedAll;
    }
    selectCheckBox(option: IDropdownItem) {
        this.selectedOptions.add(option);
        this.availableOptions.delete(option);
        this.selectedAll = this.selectedOptions.size !== 0;
        this._onChangeSelectedOptions();
    }
    unSelectCheckBox(option: IDropdownItem) {
        if (this.initialOptions.has(option)) {
            this.availableOptions.add(option);
        }
        this.selectedOptions.delete(option);
        this.selectedAll = this.selectedOptions.size !== 0;
        this._onChangeSelectedOptions();
    }
    private _onChangeSelectedOptions() {
        this.onChange(
            Array.from(this.selectedOptions).map((selectedOption) => {
                return Object.assign({}, selectedOption);
            })
        );
    }
    trackById(_: number, option: IDropdownItem) {
        return option.id;
    }
    private _subscribeOnTextInput(): void {
        this.inputControl.valueChanges
            .pipe(
                debounceTime(300),
                takeUntil(this.unSubscribe$),
                distinctUntilChanged()
            )
            .subscribe((nameFilter) => {
                this.emitText.emit({
                    nameFilter: nameFilter || '',
                    idsToExclude: this.idsToExclude,
                });
            });
    }
    private onChange = (val: any) => {};
    private onTouched = () => {};
    registerOnChange(fn: any): void {
        this.onChange = fn;
    }
    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }
    writeValue(values: any[]): void {
        this.selectedOptions.clear();
        values?.forEach((setValueOption) => {
            this.initialOptions.forEach((option) => {
                if (setValueOption.id === option.id) {
                    this.selectedOptions.add(option);
                    this.availableOptions.delete(option);
                }
            });
        });
        this.selectedAll = this.selectedOptions.size !== 0;

        this.cdr.detectChanges();
    }
}
