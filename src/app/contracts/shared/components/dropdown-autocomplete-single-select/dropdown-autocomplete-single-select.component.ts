import {
    Component,
    Input,
    OnChanges,
    OnInit,
    SimpleChanges,
    EventEmitter,
    ChangeDetectionStrategy,
    Output,
    ChangeDetectorRef,
    forwardRef,
} from '@angular/core';
import {
    AbstractControl,
    ControlValueAccessor,
    FormControl,
    FormGroupDirective,
    NgForm,
    NG_VALIDATORS,
    NG_VALUE_ACCESSOR,
    ValidationErrors,
    Validator,
    ValidatorFn,
} from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { isEmpty } from 'lodash';
import { REQUIRED_VALIDATION_MESSAGE } from '../../entities/contracts.constants';
import { SingleAutoErrorStateMatcher } from './entities/customMatcher';
import { customRequiredValidator } from './entities/customRequireValidator';
import { Item } from './entities/interfaces';

@Component({
    selector: 'app-dropdown-autocomplete-single-select',
    templateUrl: './dropdown-autocomplete-single-select.component.html',
    styleUrls: ['./dropdown-autocomplete-single-select.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(
                () => DropdownAutocompleteSingleSelectComponent
            ),
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
    implements OnInit, OnChanges, ControlValueAccessor, Validator
{
    @Input() options: Item[] = [];
    @Input() displayedProperty: string = 'name';
    @Input() outputProperty: string = 'id';
    @Input() label: string = 'label';

    @Output() inputEmitter = new EventEmitter<string>();

    matcher = new SingleAutoErrorStateMatcher();
    inputControl = new FormControl('', [customRequiredValidator()]);
    optionSelected = false;

    requiredValidationMessage = REQUIRED_VALIDATION_MESSAGE;
    constructor(private readonly cdr: ChangeDetectorRef) {}

    ngOnInit(): void {
        this._subsribeOnInputControl();
        this.inputControl.setErrors({ customRequired: true });
    }
    ngOnChanges(changes: SimpleChanges): void {
        if (changes['options']) {
            this.cdr.detectChanges();
        }
    }
    displayFn(option: Item) {
        if (option) {
            return option[this.displayedProperty];
        }
    }
    onSelect(selectedOption: Item) {
        this.optionSelected = true;
        this.onChange(selectedOption[this.outputProperty]);
    }

    trackByOptionProp(index: number, item: Item) {
        return index;
    }

    private _subsribeOnInputControl() {
        this.inputControl.valueChanges.subscribe((input) => {
            this.optionSelected = false;
            this.inputEmitter.emit(input);
            if (input[this.outputProperty]) {
                this.onChange(input[this.outputProperty]);
            }
        });
    }

    validate(control: AbstractControl): ValidationErrors | null {
        if (this.optionSelected) {
            return null;
        }
        return { customRequired: true };
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
        if (isEmpty(preselectedItem)) {
            this.inputControl.setValue('', { emitEvent: false });
            this.onChange('');
            this.inputControl.markAsPristine();
            this.inputControl.markAsUntouched();
            this.inputControl.updateValueAndValidity();
            return;
        }
        this.optionSelected = true;
        this.inputControl.setValue(preselectedItem, { emitEvent: false });
        this.onChange(preselectedItem[this.outputProperty]);
    }
}
