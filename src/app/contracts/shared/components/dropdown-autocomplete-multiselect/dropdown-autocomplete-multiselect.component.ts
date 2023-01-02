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
	ViewChild,
} from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';

@Component({
	selector: 'emg-dropdown-autocomplete-multiselect',
	templateUrl: './dropdown-autocomplete-multiselect.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => DropdownAutocompleteMultiselectComponent),
			multi: true,
		},
	],
})
export class DropdownAutocompleteMultiselectComponent implements OnInit, OnDestroy, ControlValueAccessor {
	@Input() set options(options: IDropdownItem[]) {
		this.initialOptions = new Set(options);
		this.availableOptions = new Set(options);
		this.isSearchNull = options.length === 0 ? true : false;
	}

	@Input() label: string;

	@Input() idProperty: string | number = 'id';

	@Output() emitText = new EventEmitter();

	@ViewChild('trigger', { read: MatAutocompleteTrigger }) trigger: MatAutocompleteTrigger;

	get idsToExclude() {
		return Array.from(this.selectedOptions).map((selectedOption: IDropdownItem) => selectedOption.id);
	}

	isSearchNull: boolean;
	selectedAll = false;

	initialOptions: Set<IDropdownItem>;
	availableOptions: Set<IDropdownItem>;
	selectedOptions = new Set<IDropdownItem>();
	inputControl = new FormControl('');

	private unSubscribe$ = new Subject<void>();

	private onChange = (val: any) => {};
	private onTouched = () => {};

	constructor(private cdr: ChangeDetectorRef) {}

	ngOnInit(): void {
		this._subscribeOnTextInput();
	}

	ngOnDestroy(): void {
		this.unSubscribe$.next();
		this.unSubscribe$.complete();
	}

	registerOnChange(fn: any): void {
		this.onChange = fn;
	}

	registerOnTouched(fn: any): void {
		this.onTouched = fn;
	}

	trackById(_: number, option: IDropdownItem) {
		return option[this.idProperty];
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

	toggleSelectAll() {
		if (!this.selectedAll) {
			this.availableOptions.forEach((option) => {
				this.selectedOptions.add(option);
			});
			this.availableOptions.clear();
		} else {
			this.selectedOptions.forEach((option) => {
				if (this.initialOptions.has(option)) {
					this.availableOptions.add(option);
				}
			});
			this.selectedOptions.clear();
		}
		this.selectedAll = !this.selectedAll;
	}

	selectCheckBox(option: IDropdownItem) {
		this.selectedOptions.add(option);
		this.availableOptions.delete(option);
		this._checkSelectionStatus();
	}

	unSelectCheckBox(option: IDropdownItem) {
		if (this.initialOptions.has(option)) {
			this.availableOptions.add(option);
		}
		this.selectedOptions.delete(option);
		this._checkSelectionStatus();
	}

	openPanel() {
		setTimeout(() => {
			this.trigger.openPanel();
		}, 100);
	}

	menuClosed() {
		this._onChangeSelectedOptions();
	}

	private _checkSelectionStatus() {
		this.selectedAll = this.selectedOptions.size !== 0;
	}

	private _onChangeSelectedOptions() {
		this.onChange(
			Array.from(this.selectedOptions).map((selectedOption) => {
				return Object.assign({}, selectedOption);
			})
		);
	}

	private _subscribeOnTextInput(): void {
		this.inputControl.valueChanges
			.pipe(debounceTime(300), takeUntil(this.unSubscribe$), distinctUntilChanged())
			.subscribe((nameFilter) => {
				this.emitText.emit({
					nameFilter: nameFilter || '',
					idsToExclude: this.idsToExclude,
				});
			});
	}
}
