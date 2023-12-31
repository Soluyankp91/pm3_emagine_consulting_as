import { Component, Self, ViewEncapsulation, OnInit, DoCheck, Input } from '@angular/core';
import { UntypedFormControl, NgControl } from '@angular/forms';
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
	@Input() showSampleLabel = 'Show sample data';
	@Input() label = 'Auto-name for actual agreements';
	@Input() currentAgreementId;

	get control() {
		return this.ngControl.control;
	}

	options: string[];

	textControl = new UntypedFormControl('');

	retriewTemplate$ = new Subject<void>();

	textControlBufferValue: string;
	showSample = false;

	private _templatePreview: Observable<string | undefined>;

	constructor(private readonly mergeFieldsServiceProxy: MergeFieldsServiceProxy, @Self() private ngControl: NgControl) {
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
			this.textControl.updateValueAndValidity({ emitEvent: false });
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
		//reset checkbox
		if (this.showSample) {
			this.retriewTemplate$.next();
		}
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

	trackByItem(index: number, value: string) {
		return value;
	}

	private _initOptions() {
		this.mergeFieldsServiceProxy.fields().subscribe((fields: string[]) => {
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
					this.textControlBufferValue = this.textControl.value ? this.textControl.value : '';
					this.textControl.disable({ emitEvent: false });
					return this.mergeFieldsServiceProxy.format(this.currentAgreementId, this.textControlBufferValue).pipe(
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
		let validators = [this.control.validator];

		this.textControl.setValidators(validators);
		this.textControl.updateValueAndValidity();

		this.control?.setErrors(this.textControl.errors);
	}
}
