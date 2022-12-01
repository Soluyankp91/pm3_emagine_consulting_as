import {
    Component,
    Input,
    OnDestroy,
    OnInit,
    EventEmitter,
    Output,
} from '@angular/core';
import {
    AbstractControl,
    ControlValueAccessor,
    FormControl,
    NG_VALIDATORS,
    NG_VALUE_ACCESSOR,
    ValidationErrors,
    Validator,
} from '@angular/forms';
import { SingleAutoErrorStateMatcher } from '../../matchers/customMatcher';
import { requiredValidator } from '../../validators/customRequireValidator';
import { Item } from './entities/interfaces';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'emg-dropdown-autocomplete-single-select',
    templateUrl: './dropdown-autocomplete-single-select.component.html',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: DropdownAutocompleteSingleSelectComponent,
            multi: true,
        },
        {
            provide: NG_VALIDATORS,
            useExisting: DropdownAutocompleteSingleSelectComponent,
            multi: true,
        },
    ],
})
export class DropdownAutocompleteSingleSelectComponent
    implements OnInit, OnDestroy, ControlValueAccessor, Validator
{
    @Input() options: Item[];
    @Input() labelKey: string = 'name';
    @Input() outputProperty: string = 'id';
    @Input() label: string = 'label';

    @Output() inputEmitter = new EventEmitter<string>();

    context = this;
    matcher = new SingleAutoErrorStateMatcher();
    inputControl = new FormControl(null, [requiredValidator()]);

    onChange: any = () => {};
    onTouch: any = () => {};

    private _unSubscribe$ = new Subject();

    constructor() {}

    ngOnInit(): void {
        this._subsribeOnInputControl();
    }

    ngOnDestroy(): void {
        this._unSubscribe$.next();
        this._unSubscribe$.complete();
    }

    displayFn(option: Item) {
        return option ? option[this.labelKey] : null;
    }

    onSelect(selectedOption: Item) {
        this.onChange(selectedOption[this.outputProperty]);
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

    writeValue(preselectedItem: Item): void {
        if (preselectedItem === null) {
            this.inputControl.reset(null, { emitEvent: false });
            this.inputControl.markAsPristine();
            return;
        }
        this.inputControl.patchValue(preselectedItem);
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

    validate(control: AbstractControl): ValidationErrors | null {
        if (!this.inputControl.invalid) {
            return null;
        }
        return { required: true };
    }

    private _subsribeOnInputControl() {
        this.inputControl.valueChanges
            .pipe(takeUntil(this._unSubscribe$))
            .subscribe((input) => {
                if (typeof input === 'object') {
                    this.inputEmitter.emit(input[this.labelKey]);
                    this.onChange(input[this.outputProperty]);
                    return;
                }
                this.inputEmitter.emit(input);
            });
    }
}
