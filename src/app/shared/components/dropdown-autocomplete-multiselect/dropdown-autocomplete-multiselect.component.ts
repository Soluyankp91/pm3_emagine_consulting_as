import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { BehaviorSubject, Subject } from 'rxjs';
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
	ContentChild,
	TemplateRef,
	ElementRef,
} from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatMenu } from '@angular/material/menu';

@Component({
	selector: 'emg-dropdown-autocomplete-multiselect',
	templateUrl: './dropdown-autocomplete-multiselect.component.html',
	styleUrls: ['dropdown-autocomplete-multiselect.component.scss'],
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
	@Input() optionsLoading: BehaviorSubject<boolean>;

	@Output() emitText = new EventEmitter();

	@ViewChild('trigger', { read: MatAutocompleteTrigger }) trigger: MatAutocompleteTrigger;
	@ViewChild('trigger', { read: ElementRef }) inputRef: ElementRef;

	@ViewChild('menu', { read: MatMenu }) menu: MatMenu;

	@ContentChild('triggerButton', { static: true }) triggerButton: TemplateRef<any>;
	@ContentChild('optionTemplate', { static: true }) optionTemplate: TemplateRef<any>;

	get idsToExclude() {
		return Array.from(this.selectedOptions).map((selectedOption: IDropdownItem) => selectedOption.id);
	}

	isSearchNull: boolean;

	initialOptions: Set<IDropdownItem>;
	availableOptions: Set<IDropdownItem>;
	selectedOptions = new Set<IDropdownItem>();
	inputControl = new FormControl('');

	private unSubscribe$ = new Subject<void>();

	private onChange = (val: any) => {};
	private onTouched = () => {};

	constructor(private _cdr: ChangeDetectorRef) {}

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
		this.inputControl.setValue('');
		values?.forEach((setValueOption) => {
			this.selectedOptions.add(setValueOption);
			this.availableOptions.delete(setValueOption);
		});

		this._cdr.detectChanges();
	}

	selectCheckBox(option: IDropdownItem) {
		option['checked'] = true;
		this.selectedOptions.add(option);
		this._cdr.detectChanges();
	}

	unSelectCheckBox(option: IDropdownItem) {
		option['checked'] = false;
		this.selectedOptions.delete(option);
		if (!this.availableOptions.has(option)) {
			const availableOptions = Array.from(this.availableOptions);
			this.availableOptions.clear();
			this.availableOptions = new Set([option, ...availableOptions]);
		}
		this._cdr.detectChanges();
	}

	openPanel() {
		setTimeout(() => {
			this.trigger.openPanel();
			this.inputRef.nativeElement.focus();
		}, 150);
	}

	menuClosed() {
		this._onChangeSelectedOptions();
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
					filter: nameFilter || '',
					idsToExclude: this.idsToExclude,
				});
			});
	}
}
