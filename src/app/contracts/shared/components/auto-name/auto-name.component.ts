import {
    ChangeDetectorRef,
    Component,
    ElementRef,
    forwardRef,
    OnInit,
    ViewChild,
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
import { forkJoin, Observable } from 'rxjs';
import { mergeMap, tap } from 'rxjs/operators';
import { AgreementNameTemplateServiceProxy } from 'src/shared/service-proxies/service-proxies';
import { REQUIRED_VALIDATION_MESSAGE } from '../../entities/contracts.constants';

export type AutoName = { [key: string]: any } & {
    selected: boolean;
    name: string;
    id: number;
};
export function customAutoNameRequiredValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        return !control.value.length ? { customRequired: true } : null;
    };
}
@Component({
    selector: 'app-auto-name',
    templateUrl: './auto-name.component.html',
    styleUrls: ['./auto-name.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => AutoNameComponent),
            multi: true,
        },
        {
            provide: NG_VALIDATORS,
            useExisting: AutoNameComponent,
            multi: true,
        },
    ],
})
export class AutoNameComponent
    implements OnInit, ControlValueAccessor, Validator
{
    @ViewChild('input') input: ElementRef<HTMLInputElement>;

    sampleData = false;
    optionItems: AutoName[] = [];
    displayedOptionItems: AutoName[] = [];
    selectedOptions: AutoName[] = [];
    autoNameMap = new Map<string, string>();

    requiredValidationMessage = REQUIRED_VALIDATION_MESSAGE;

    matcher = new AutoNameErrorStateMatcher();
    textControl = new FormControl('');
    chipsControl = new FormControl([], [customAutoNameRequiredValidator()]);

    constructor(
        private readonly agreementNameTemplateServiceProxy: AgreementNameTemplateServiceProxy
    ) {}

    ngOnInit(): void {
        this._initFields();
        this._subscribeOnTextChanges();
        this.onChange(this.buildChangesOutput());
    }
    toggleCheckbox(optionItem: AutoName) {
        optionItem.selected = !optionItem.selected;
        if (optionItem.selected) {
            this.selectedOptions.push(optionItem);
            this.chipsControl.setValue(this.selectedOptions);
            this.matcher.matchipsLength = this.selectedOptions.length;
            this.onChange(this.buildChangesOutput());
        } else {
            const foundedIndex = this.selectedOptions.findIndex(
                (option) => optionItem.id === option.id
            );
            this.selectedOptions.splice(foundedIndex, 1);
            this.chipsControl.setValue(this.selectedOptions);
            this.matcher.matchipsLength = this.selectedOptions.length;
            this.onChange(this.buildChangesOutput());
        }
    }
    onShowSampleChanged(checked: boolean) {
        this.sampleData = checked;
        if (this.sampleData) {
            const buildedAutoName = this.buildForAutoName();
            this.textControl.setValue(buildedAutoName);
            this.input.nativeElement.value = buildedAutoName;
            this.textControl.disable();
        } else {
            this.textControl.enable();
            this.textControl.setValue('');
            this.input.nativeElement.value = '';
        }
    }
    private buildForAutoName(): string {
        return this.selectedOptions.reduce((acc, current, index) => {
            if (!index) {
                acc = this.autoNameMap.get(current.name) as string;
            } else {
                acc = acc + ',' + this.autoNameMap.get(current.name);
            }
            return acc;
        }, '');
    }
    private buildChangesOutput(): string {
        return this.selectedOptions
            .reduce((acc, current, index) => {
                if (!index) {
                    acc = current.name;
                } else {
                    acc = acc + ',' + current.name;
                }
                return acc;
            }, '')
            .replace(/,/gm, '} {')
            .replace(/^/, '{')
            .replace(/$/, '}');
    }
    private _setOptionItems(optionsRaw: string[], selected: boolean) {
        return optionsRaw.map((optionName, index) => {
            return {
                name: optionName,
                id: index,
                selected: selected,
            } as AutoName;
        });
    }
    registerOnChange(fn: any): void {
        this.onChange = fn;
    }
    registerOnTouched(fn: any): void {
        this.onTouch = fn;
    }
    validate(control: AbstractControl): ValidationErrors | null {
        if (this.selectedOptions.length) {
            return null;
        }
        return { customRequired: true };
    }
    private _initFields() {
        this.agreementNameTemplateServiceProxy
            .fields()
            .pipe(
                mergeMap((keys) => {
                    this.optionItems = this._setOptionItems(keys, false);
                    this.displayedOptionItems = this.optionItems;
                    return forkJoin(
                        keys.reduce((acc, current) => {
                            acc.push(
                                this.agreementNameTemplateServiceProxy.templatePreview(
                                    '{' + current + '}'
                                )
                            );
                            return acc;
                        }, [] as Observable<string>[])
                    ).pipe(
                        tap((values) => {
                            values.forEach((val, index) => {
                                this.autoNameMap.set(keys[index], val);
                            });
                        })
                    );
                })
            )
            .subscribe();
    }
    private _subscribeOnTextChanges() {
        this.textControl.valueChanges.subscribe((text) => {
            this.displayedOptionItems = this.optionItems.filter(
                (optionItem) => {
                    return optionItem.name.toLowerCase().includes(text);
                }
            );
        });
    }
    private _parseSetValue(val: string) {
        const regExp = new RegExp(/{(.*?)}/gm);
        const autoName: string[] = [];
        let match;
        while ((match = regExp.exec(val)) !== null) {
            autoName.push(match[1]);
        }
        return autoName;
    }
    private _preselectAutoNames(autoName: string[]) {
        this.selectedOptions = autoName.reduce((acc, current) => {
            acc.push(
                this.optionItems.find((existedOption) => {
                    if (existedOption.name === current) {
                        existedOption.selected = true;
                        return true;
                    }
                    return false;
                }) as AutoName
            );
            return acc;
        }, [] as AutoName[]);
    }
    writeValue(val: string): void {
        if (val && val.length) {
            const autoNames = this._parseSetValue(val);
            this._preselectAutoNames(autoNames);
            this.sampleData = true;
            const buildedView = this.buildForAutoName();
            this.displayedOptionItems = this.optionItems;
            this.textControl.setValue(buildedView, { emitEvent: false });
            this.input.nativeElement.value = buildedView;
            this.textControl.disable();
        } else {
            this._preselectAutoNames([]);
            this.textControl.setValue('');
            this.displayedOptionItems = [];
            this.sampleData = false;
            this.textControl.enable();
            this.onChange('');
        }
    }
    onChange: any = () => {};
    onTouch: any = () => {};
}
export class AutoNameErrorStateMatcher implements ErrorStateMatcher {
    constructor() {}
    matchipsLength = 0;
    isErrorState(
        control: FormControl | null,
        form: FormGroupDirective | NgForm | null
    ): boolean {
        return !this.matchipsLength && !!control?.touched;
    }
}
