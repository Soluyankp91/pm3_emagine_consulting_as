import {
    Component,
    Self,
    ViewEncapsulation,
    OnInit,
    DoCheck,
    Injector,
    TrackByFunction
} from '@angular/core';
import { FormControl, NgControl, Validators } from '@angular/forms';
import { MergeFieldsServiceProxy } from 'src/shared/service-proxies/service-proxies';
import { Subject, Observable, EMPTY } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { AppComponentBase } from 'src/shared/app-component-base';

@Component({
    selector: 'emg-auto-name',
    styleUrls: ['./auto-name.component.scss'],
    templateUrl: './auto-name.component.html',
    encapsulation: ViewEncapsulation.None,
})
export class AutoNameComponent extends AppComponentBase implements OnInit, DoCheck {
    get control() {
        return this.ngControl.control;
    }

    label = 'Auto-name for actual agreements';
    options: string[];

    textControl = new FormControl('');

    retriewTemplate$ = new Subject<void>();

    trackByItem: TrackByFunction<string>;

    textControlBufferValue: string;
    showSample = false;

    private _templatePreview: Observable<string | undefined>;

    constructor(
        private readonly mergeFieldsServiceProxy: MergeFieldsServiceProxy,
        private readonly injector: Injector,
        @Self() private ngControl: NgControl
    ) {
        super(injector);
        ngControl.valueAccessor = this;
        this.trackByItem = this.createTrackByFn('');
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


    private _initOptions() {
        this.mergeFieldsServiceProxy.fields().subscribe((fields: string []) => {
            this.options = fields;
        });
    }

    private _subsribeOnTextControlChanges() {
        this.textControl.valueChanges.subscribe((value: string) => {
            this.onChange(value);
            this.control?.setErrors(this.textControl.errors);
        });
    }

    private _subscribeOnShowSampleToggle() {
        this._templatePreview = this.retriewTemplate$.pipe(
            switchMap(() => {
                this.showSample = !this.showSample;
                if (this.showSample) {
                    this.textControlBufferValue = this.textControl.value;
                    this.textControl.disable({ emitEvent: false });
                    return this.mergeFieldsServiceProxy
                        .templatePreview(this.textControlBufferValue)
                        .pipe(
                            map((v) => v.value),
                            tap((templatePreview: string | undefined) => {
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
        this._templatePreview.subscribe();
    }

    private _initValidators() {
        let validators = [Validators.required];

        this.textControl.setValidators(validators);
        this.textControl.updateValueAndValidity();

        this.control?.setErrors(this.textControl.errors);
    }
}
