import {
    Component,
    Self,
    ViewEncapsulation,
    OnInit,
    DoCheck,
} from '@angular/core';
import { FormControl, NgControl, Validators } from '@angular/forms';
import { MergeFieldsServiceProxy } from 'src/shared/service-proxies/service-proxies';
import { Subject, Observable, EMPTY } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';

@Component({
    selector: 'emg-auto-name',
    styleUrls: ['./auto-name.component.scss'],
    templateUrl: './auto-name.component.html',
    encapsulation: ViewEncapsulation.None,
})
export class AutoNameComponent implements OnInit, DoCheck {
    get control() {
        return this.ngControl.control;
    }

    label = 'Auto-name for actual agreements';
    options: string[];

    textControl = new FormControl('');

    retriewTemplate$ = new Subject<void>();

    private templatePreview$: Observable<string | undefined>;

    textControlBufferValue: string;
    showSample = false;

    constructor(
        private readonly mergeFieldsServiceProxy: MergeFieldsServiceProxy,
        @Self() private ngControl: NgControl
    ) {
        ngControl.valueAccessor = this;
    }

    ngOnInit(): void {
        this._initOptions();
        this._initValidators();
        this._subsribeOnTextControlChanges();
        this._subscribeOnShowSampleToggle();
    }

    ngDoCheck(): void {
        if (this.control?.touched) {
            this.textControl.markAsTouched();
            this.textControl.updateValueAndValidity();
            return;
        }
    }

    writeValue(val: string | null) {
        if (!val) {
            this.showSample = false;
            this.textControl.enable();
            this.textControl.reset('');
            return;
        }
        this.textControl.setValue(val, { emitEvent: false });
    }

    onChange: any = () => {};
    onTouch: any = () => {};

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }
    registerOnTouched(fn: any): void {
        this.onTouch = fn;
    }

    addAutoName(autoName: string) {
        let textControlValue = this.textControl.value;
        this.textControl.setValue(textControlValue + ` {${autoName}} `);
    }

    trackBy(index: number, item: string) {
        return item;
    }

    private _initOptions() {
        this.mergeFieldsServiceProxy.fields().subscribe((fields) => {
            this.options = fields;
        });
    }

    private _subsribeOnTextControlChanges() {
        this.textControl.valueChanges.subscribe((value) => {
            this.onChange(value);
            this.control?.setErrors(this.textControl.errors);
        });
    }

    private _subscribeOnShowSampleToggle() {
        this.templatePreview$ = this.retriewTemplate$.pipe(
            switchMap(() => {
                this.showSample = !this.showSample;
                if (this.showSample) {
                    this.textControlBufferValue = this.textControl.value;
                    this.textControl.disable({ emitEvent: false });
                    return this.mergeFieldsServiceProxy
                        .templatePreview(this.textControlBufferValue)
                        .pipe(
                            map((v) => v.value),
                            tap((templatePreview) => {
                                this.textControl.setValue(templatePreview, {
                                    emitEvent: false,
                                });
                            })
                        );
                }
                this.textControl.enable({ emitEvent: false });
                this.textControl.setValue(this.textControlBufferValue, {
                    emitEvent: false,
                });
                return EMPTY;
            })
        );
        this.templatePreview$.subscribe();
    }

    private _initValidators() {
        let validators = [Validators.required];

        this.textControl.setValidators(validators);
        this.textControl.updateValueAndValidity();

        this.control?.setErrors(this.textControl.errors);
    }
}
