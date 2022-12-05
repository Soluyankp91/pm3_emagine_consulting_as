import {
    Component,
    ElementRef,
    OnInit,
    ViewChild,
    OnDestroy,
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
import { forkJoin, Subject } from 'rxjs';
import { mergeMap, tap, takeUntil, map } from 'rxjs/operators';
import { MergeFieldsServiceProxy } from 'src/shared/service-proxies/service-proxies';
import { AutoNameErrorStateMatcher } from '../../matchers/autoNameErrorMatcher';
import { autoNameRequiredValidator } from '../../validators/autoNameRequireValidator';
import { AutoName } from './auto-name.interfaces';

@Component({
    selector: 'emg-auto-name',
    templateUrl: './auto-name.component.html',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: AutoNameComponent,
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
    implements OnInit, OnDestroy, ControlValueAccessor, Validator
{
    @ViewChild('input') input: ElementRef<HTMLInputElement>;

    sampleData = false;
    dataLoaded$ = new Subject();
    optionItems: AutoName[] = [];
    displayedOptionItems: AutoName[] = [];
    selectedOptions: AutoName[] = [];
    autoNameMap = new Map<string, string>();

    matcher = new AutoNameErrorStateMatcher();
    textControl = new FormControl('');
    chipsControl = new FormControl([], [autoNameRequiredValidator()]);

    onChange: any = () => {};
    onTouch: any = () => {};

    private _unSubscribe$ = new Subject();

    constructor(
        private readonly mergeFieldsServiceProxy: MergeFieldsServiceProxy
    ) {}

    ngOnInit(): void {
        this._initFields();
        this._subscribeOnTextChanges();
        this.onChange(this._buildChangesOutput());
    }

    ngOnDestroy(): void {
        this._unSubscribe$.next();
        this._unSubscribe$.complete();
    }

    toggleCheckbox(optionItem: AutoName) {
        optionItem.selected = !optionItem.selected;
        if (optionItem.selected) {
            this.selectedOptions.push(optionItem);
        } else {
            const foundedIndex = this.selectedOptions.findIndex(
                (option) => optionItem.id === option.id
            );
            this.selectedOptions.splice(foundedIndex, 1);
        }
        this.chipsControl.setValue(this.selectedOptions);
        this.onChange(this._buildChangesOutput());
    }

    onShowSampleChanged(checked: boolean) {
        this.sampleData = checked;
        if (this.sampleData) {
            const buildedAutoName = this._buildAutoName();
            this.textControl.setValue(buildedAutoName);
            this.input.nativeElement.value = buildedAutoName;
            this.textControl.disable();
        } else {
            this.textControl.enable();
            this.textControl.setValue('');
            this.input.nativeElement.value = '';
        }
    }

    trackByOptionName(index: number, item: AutoName) {
        return item.name;
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
        return { required: true };
    }

    writeValue(value: string): void {
        if (value === null) {
            this.chipsControl.markAsPristine();
            if (this.input) {
                this.input.nativeElement.value = '';
            }
            this.textControl.enable();
            this.textControl.setValue('');
            this.displayedOptionItems.forEach(
                (option) => (option.selected = false)
            );
            this.selectedOptions = [];
            this.sampleData = false;
            this.onChange(null);
            return;
        }
        this.dataLoaded$.subscribe(() => {
            this._preselectAutoNames(value);
            this.sampleData = true;
            const buildedView = this._buildAutoName();
            this.displayedOptionItems = this.optionItems;
            console.log(buildedView);
            this.textControl.setValue(buildedView, { emitEvent: false });
            this.input.nativeElement.value = buildedView;
            this.chipsControl.setValue(this.selectedOptions);
            this.textControl.disable();
        });
    }

    private _buildAutoName(): string {
        return this.selectedOptions.reduce((acc, current, index) => {
            if (!index) {
                acc = this.autoNameMap.get(current.name) as string;
            } else {
                acc = acc + ',' + this.autoNameMap.get(current.name);
            }
            return acc;
        }, '');
    }

    private _buildChangesOutput(): string {
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

    private _initFields() {
        this.mergeFieldsServiceProxy
            .fields()
            .pipe(
                takeUntil(this._unSubscribe$),
                mergeMap((keys) => {
                    this.optionItems = this._setOptionItems(keys, false);
                    this.displayedOptionItems = this.optionItems;
                    return forkJoin(
                        keys.map((item: string) =>
                            this.mergeFieldsServiceProxy
                                .templatePreview('{' + item + '}')
                                .pipe(map((i) => i.value))
                        )
                    ).pipe(
                        tap((values) => {
                            console.log(values);
                            values.forEach((val, index) => {
                                this.autoNameMap.set(
                                    keys[index],
                                    val as string
                                );
                            });
                        })
                    );
                })
            )
            .subscribe(() => {
                this.dataLoaded$.next();
            });
    }

    private _subscribeOnTextChanges() {
        this.textControl.valueChanges
            .pipe(takeUntil(this._unSubscribe$))
            .subscribe((text) => {
                this.displayedOptionItems = this.optionItems.filter(
                    (optionItem) => {
                        return optionItem.name.toLowerCase().includes(text);
                    }
                );
            });
    }

    private _preselectAutoNames(val: string) {
        const regExp = new RegExp(/{(.*?)}/gm);
        const autoName: string[] = [];
        let match;
        while ((match = regExp.exec(val)) !== null) {
            autoName.push(match[1]);
        }
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
}
