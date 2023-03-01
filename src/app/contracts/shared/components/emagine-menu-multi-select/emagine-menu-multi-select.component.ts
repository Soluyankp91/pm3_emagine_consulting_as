import {
	Component,
	forwardRef,
	Input,
	OnInit,
	ViewEncapsulation,
	ChangeDetectionStrategy,
	ContentChild,
	TemplateRef,
	ChangeDetectorRef,
	AfterContentInit,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IDropdownItem } from './emagine-menu-multi-select.interfaces';
import { cloneDeep, isEqual } from 'lodash';
@Component({
	selector: 'emg-multi-select',
	templateUrl: './emagine-menu-multi-select.component.html',
	styleUrls: ['./emagine-menu-multi-select.component.scss'],
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => MultiSelectComponent),
			multi: true,
		},
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None,
})
export class MultiSelectComponent implements OnInit, AfterContentInit, ControlValueAccessor {
	@Input() idProperty: string | number = 'id';
	@Input() displayedProperty: string = 'name';
	@Input() set options(options: any[]) {
		this._options = cloneDeep(options);
	}
	@ContentChild('triggerButton') triggerButton: TemplateRef<any>;
	@ContentChild('optionPrefix') optionPrefix: TemplateRef<any>;

	get options() {
		return this._options;
	}

	selectedItems: IDropdownItem[] = [];
	isOpened: boolean = false;
	maxLength: number = 10;
	threeDotsLength: number = 3;

	onChange = (val: any) => {};
	onTouched = (val: any) => {};

	private _options: IDropdownItem[];

	constructor(private readonly _cdr: ChangeDetectorRef) {}

	ngOnInit(): void {
		this.unselectAll();
	}

	ngAfterContentInit(): void {
		this._cdr.detectChanges();
	}

	toggleSelect(toggledItem: IDropdownItem) {
		toggledItem.selected = !toggledItem.selected;
		const { selected, ...baseItem } = toggledItem;
		if (toggledItem.selected) {
			this.selectedItems = [...this.selectedItems, baseItem];
		} else {
			this.selectedItems = this.selectedItems.filter((i) => !isEqual(i, baseItem));
		}
	}

	registerOnChange(fn: any): void {
		this.onChange = fn;
	}

	registerOnTouched(fn: any): void {
		this.onTouched = fn;
	}

	trackById(index: number, item: any) {
		return item[this.idProperty];
	}

	onMenuClosed() {
		this.onChange([...this.selectedItems]);
	}

	writeValue(preselectedItems: ({ id: number | string } & { [key: string]: any })[]): void {
		let optionsToPreselect: (string | number)[] = preselectedItems.map((item) => item.id);
		this.selectedItems = [];
		this.unselectAll();
		if (!preselectedItems) {
			return;
		}
		optionsToPreselect.forEach((preselectedItem) => {
			let foundedOption = this.options.find((option) => option.id === preselectedItem) as IDropdownItem;
			if (foundedOption) {
				foundedOption.selected = true;
				const { selected, ...baseItem } = foundedOption;
				this.selectedItems = [...this.selectedItems, baseItem];
			}
		});
		this.options = [...this.options];
		this._cdr.detectChanges();
	}

	private unselectAll() {
		this._options.map((option) => {
			(option as IDropdownItem).selected = false;
			return option;
		});
	}
}
