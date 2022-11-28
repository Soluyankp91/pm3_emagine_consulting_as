import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
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

@Component({
    selector: 'app-dropdown-autocomplete-single-select',
    templateUrl: './dropdown-autocomplete-single-select.component.html',
    styleUrls: ['./dropdown-autocomplete-single-select.component.scss'],
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
    implements OnInit, ControlValueAccessor, Validator
{
    @Input() options: Item[];
    @Input() labelKey: string = 'name';
    @Input() outputProperty: string = 'id';
    @Input() label: string = 'label';

    @Output() inputEmitter = new EventEmitter<string>();

    context = this;
    matcher = new SingleAutoErrorStateMatcher();
    inputControl = new FormControl(null, [requiredValidator()]);

    constructor() {}

    ngOnInit(): void {
        this._subsribeOnInputControl();
    }
    displayFn(option: Item) {
        return option ? option[this.labelKey] : null;
    }
    onSelect(selectedOption: Item) {
        this.onChange(selectedOption[this.outputProperty]);
    }

    trackByOptionProp(index: number, item: Item) {
        return item[this.labelKey];
    }

    private _subsribeOnInputControl() {
        this.inputControl.valueChanges.pipe().subscribe((input) => {
            if (typeof input === 'object') {
                this.inputEmitter.emit(input[this.labelKey]);
                this.onChange(input[this.outputProperty]);
                return;
            }
            this.inputEmitter.emit(input);
        });
    }

    validate(control: AbstractControl): ValidationErrors | null {
        if (!this.inputControl.invalid) {
            return null;
        }
        return { required: true };
    }

    onChange: any = () => {};
    onTouch: any = () => {};

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
}
