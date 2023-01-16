import {
	Component,
	forwardRef,
	Input,
	OnInit,
	ViewEncapsulation,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	ContentChild,
	TemplateRef,
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
export class MultiSelectComponent implements OnInit, ControlValueAccessor {
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

	constructor(private readonly cdr: ChangeDetectorRef) {}

	ngOnInit(): void {
		this.unselectAll();
	}

	toggleSelect(toggledItem: IDropdownItem) {
		toggledItem.selected = !toggledItem.selected;
		const { selected, ...baseItem } = toggledItem;
		if (toggledItem.selected) {
			this.selectedItems.push(baseItem);
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
		if (!preselectedItems || !preselectedItems.length) {
			return;
		}
		optionsToPreselect.forEach((preselectedItem) => {
			let foundedOption = this.options.find((option) => option.id === preselectedItem) as IDropdownItem;
			if (foundedOption) {
				foundedOption.selected = true;
				const { selected, ...baseItem } = foundedOption;
				this.selectedItems.push(baseItem);
			}
		});
	}

	private unselectAll() {
		this._options.forEach((option) => {
			(option as IDropdownItem).selected = false;
		});
	}
}
