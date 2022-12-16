import {
    Component,
    Input,
    OnDestroy,
    OnInit,
    EventEmitter,
    Output,
    Self,
    DoCheck,
    ContentChild,
    TemplateRef,
    ChangeDetectorRef,
    OnChanges,
    SimpleChanges,
} from '@angular/core';
import {
    AbstractControl,
    ControlValueAccessor,
    FormControl,
    NgControl,
} from '@angular/forms';
import { SingleAutoErrorStateMatcher } from '../../matchers/customMatcher';
import { Item } from './entities/interfaces';
import { Subject } from 'rxjs';
import { takeUntil, filter, distinctUntilChanged } from 'rxjs/operators';
import { requiredValidator } from '../../validators/customRequireValidator';

@Component({
    selector: 'emg-dropdown-autocomplete-single-select',
    templateUrl: './dropdown-autocomplete-single-select.component.html',
})
export class DropdownAutocompleteSingleSelectComponent
    implements OnInit, OnDestroy, ControlValueAccessor
{
    @Input() options: Item[];
    @Input() labelKey: string = 'name';
    @Input() outputProperty: string = 'id';
    @Input() label: string = 'label';

    @Output() inputEmitter = new EventEmitter<string>();

    @ContentChild('optionTemplate') optionTemplate: TemplateRef<any>;

    get control() {
        return this.ngControl.control as AbstractControl;
    }

    context = this;

    matcher = new SingleAutoErrorStateMatcher();
    inputControl = new FormControl(null);

    selectedItem: Item | null;

    onChange: any = () => {};
    onTouch: any = () => {};

    private _unSubscribe$ = new Subject();

    constructor(
        @Self() private readonly ngControl: NgControl,
        private readonly _cdr: ChangeDetectorRef
    ) {
        ngControl.valueAccessor = this;
    }

    ngOnInit(): void {
        this._subsribeOnInputControl();
        this._initValidators();
    }


    ngDoCheck(): void {
        if (this.control?.touched) {
            this.inputControl.markAsTouched();
            this.inputControl.updateValueAndValidity({
                emitEvent: false,
            });
        }
    }

    ngOnDestroy(): void {
        this._unSubscribe$.next();
        this._unSubscribe$.complete();
    }

    displayFn(option: Item) {
        return option && option[this.labelKey] ? option[this.labelKey] : option;
    }

    onSelect(selectedOption: Item) {
        this.onChange(selectedOption[this.outputProperty]);
        this.selectedItem = selectedOption;
    }

    trackById(index: number, item: Item) {
        return item[this.outputProperty];
    }

    registerOnChange(fn: any) {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouch = fn;
    }

    writeValue(id: string | number | null): void {
        if (!id) {
            this.selectedItem = null;
            this.inputControl.reset(null, { emitEvent: false });
            return;
        }
        let preselectedOption = this.options.find(
            (option) => option[this.outputProperty] == id
        );
        this.selectedItem = preselectedOption as Item;
        this.inputControl.setValue(preselectedOption, {
            emitEvent: false,
            onlySelf: true,
        });
    }

    setDisabledState(isDisabled: boolean): void {
        if (isDisabled) {
            this.inputControl.disable({
                emitEvent: false,
            });
            return;
        }
        this.inputControl.enable();
    }

    onFocusOut() {
        if (this.selectedItem) {
            this.control.setErrors(this.inputControl.errors);
        }
    }

    private _subsribeOnInputControl() {
        this.inputControl.valueChanges
            .pipe(
                takeUntil(this._unSubscribe$),
                distinctUntilChanged(),
                filter((val) => val !== null)
            )
            .subscribe((input) => {
                if (typeof input === 'object') {
                    this.inputEmitter.emit(input[this.labelKey]);
                    return;
                }
                this.inputEmitter.emit(input);
            });
    }

    private _initValidators() {
        let validators = [requiredValidator(this.control)];
        this.inputControl.setValidators(validators);
        this.inputControl.updateValueAndValidity();
    }
}
