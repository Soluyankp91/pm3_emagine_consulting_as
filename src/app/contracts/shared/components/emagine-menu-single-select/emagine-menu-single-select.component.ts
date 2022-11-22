import { cloneDeep, isArray, isEqual } from 'lodash';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  Component,
  OnInit,
  Input,
  ViewChild,
  ViewEncapsulation,
  forwardRef,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatSelect, MAT_SELECT_CONFIG } from '@angular/material/select';

type IDropdownItem = object & { [key: string]: any; selected?: boolean };

@Component({
  selector: 'app-mat-menu-single-select',
  templateUrl: './emagine-menu-single-select.component.html',
  styleUrls: ['./emagine-menu-single-select.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: MAT_SELECT_CONFIG,
      useValue: { overlayPanelClass: 'mat-menu-single-select-panel' },
    },
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MatMenuSingleSelectComponent),
      multi: true,
    },
  ],
})
export class MatMenuSingleSelectComponent
  implements OnInit, ControlValueAccessor
{
  @Input() public label: string;
  @Input() public set options(items: IDropdownItem[]) {
    this.options_ = cloneDeep(items);
  }
  @Input() public displayedProperty: string = 'name';
  @ViewChild('menubutton', { read: MatMenuTrigger })
  public menu: MatMenuTrigger;
  @ViewChild('myselect') myselect: MatSelect;

  constructor(private cdr: ChangeDetectorRef) {}

  private options_: IDropdownItem[];
  public isOpened: boolean = false;
  public selectedItem: IDropdownItem | null = null;

  public ngOnInit(): void {}

  public onMatMenuOpened() {
    this.myselect.open();
  }

  public onMatSelectClose() {
    this.menu.closeMenu();
  }

  public onSelectionChange(option: IDropdownItem) {
    this.selectedItem = option;
    this.onChange(this.selectedItem);
  }

  public onChange = (arg: any) => {};

  public onTouched = () => {};

  public writeValue(option: any): void {
    if (option && !isArray(option)) {
      this.selectedItem =
        this.options.find(item => {
          return isEqual(option, item);
        }) ?? null;
      this.selectedItem ? null : this.onChange(this.selectedItem);
      this.cdr.detectChanges();
    } else {
      this.selectedItem = null;
      this.cdr.detectChanges();
    }
  }

  public registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  public get options() {
    return this.options_;
  }
}
