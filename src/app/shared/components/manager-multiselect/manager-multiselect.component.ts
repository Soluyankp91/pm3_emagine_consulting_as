import { Component, EventEmitter, Injector, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { debounceTime, map, startWith, takeUntil } from 'rxjs/operators';
import { getEmployees } from 'src/app/store/selectors';
import { SelectableEmployeeDto } from 'src/app/workflow/workflow.model';
import { AppComponentBase } from 'src/shared/app-component-base';
import { EmployeeDto } from 'src/shared/service-proxies/service-proxies';

@Component({
	selector: 'manager-multiselect',
	templateUrl: './manager-multiselect.component.html',
	styleUrls: ['./manager-multiselect.component.scss'],
})
export class ManagerMultiselectComponent extends AppComponentBase implements OnInit, OnDestroy {
	@ViewChild('trigger', { read: MatAutocompleteTrigger }) trigger: MatAutocompleteTrigger;
	@Output() selectionChanged = new EventEmitter<SelectableEmployeeDto[]>();
    @Input() set initialOptions(options: SelectableEmployeeDto[]) {
        this.selectedAccountManagers = options;
        // to filter out already selected employees
        this.accountManagerFilter.updateValueAndValidity();
    }
	selectedAccountManagers: SelectableEmployeeDto[] = [];
	accountManagerFilter = new UntypedFormControl();
	employees$: Observable<EmployeeDto[]>;
	filteredAccountManagers$: Observable<SelectableEmployeeDto[]>;
	isLoading = false;
	private _unsubscribe = new Subject();
	constructor(injector: Injector, private _store: Store) {
		super(injector);
	}

	ngOnInit(): void {
		this.employees$ = this._store.select(getEmployees);
		this.accountManagerFilter.valueChanges
			.pipe(
				takeUntil(this._unsubscribe),
				debounceTime(500),
				startWith(''),
				map((value) => {
					return this._filterEmployees(value ?? '');
				})
			)
			.subscribe((result) => {
				this.filteredAccountManagers$ = result;
				this.isLoading = false;
			});
	}

	ngOnDestroy(): void {
		this._unsubscribe.next();
		this._unsubscribe.complete();
	}

	optionClicked(event: Event, item: SelectableEmployeeDto, list: SelectableEmployeeDto[]) {
		event.stopPropagation();
		this.toggleSelection(item, list);
	}

	toggleSelection(item: SelectableEmployeeDto, list: SelectableEmployeeDto[]) {
		item.selected = !item.selected;
		if (item.selected) {
			if (!list.includes(item)) {
				list.push(item);
			}
		} else {
			const i = list.findIndex((value: any) => value.name === item.name);
			list.splice(i, 1);
		}
		this.selectionChanged.emit(this.selectedAccountManagers);
	}

	onOpenedMenu() {
		setTimeout(() => {
			this.trigger.openPanel();
		}, 200);
	}

	private _filterEmployees(value: string): Observable<SelectableEmployeeDto[]> {
		const filterValue = value.toLowerCase();
		const result = this.employees$.pipe(
			map((response) =>
				response
					.filter((option) => option.name.toLowerCase().includes(filterValue))
					.filter((option) => !this.selectedAccountManagers.map((y) => y.id).includes(option.id))
					.map(item => {
						return new SelectableEmployeeDto({
							id: item.id!,
							name: item.name!,
							externalId: item.externalId!,
							selected: false,
						});
					})
			)
		);
		if (value === '') {
			return this.employees$.pipe(
				map((response) =>
					response
						.filter((x) => !this.selectedAccountManagers.map((y) => y.id).includes(x.id))
						.map(item => {
							return new SelectableEmployeeDto({
								id: item.id!,
								name: item.name!,
								externalId: item.externalId!,
								selected: false,
							});
						})
				)
			);
		} else {
			return result;
		}
	}
}
