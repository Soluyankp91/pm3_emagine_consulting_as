import { Component, EventEmitter, Injector, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatMenuTrigger } from '@angular/material/menu';
import { Observable, Subject, of } from 'rxjs';
import { debounceTime, finalize, map, startWith, takeUntil } from 'rxjs/operators';
import { WorkflowDataService } from 'src/app/workflow/workflow-data.service';
import { AppComponentBase } from 'src/shared/app-component-base';
import {
	ClientPeriodServiceProxy,
	ConsultantPeriodServiceProxy,
	EmployeeDto,
	WorkflowProcessType,
	WorkflowServiceProxy,
} from 'src/shared/service-proxies/service-proxies';
import { EManagerStatusIcon, EManagerStatusTooltip, ManagerStatus } from './manager-search.model';
import { Store } from '@ngrx/store';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { getResponsiblePersons } from 'src/app/store/selectors';

@Component({
	selector: 'app-manager-search',
	templateUrl: './manager-search.component.html',
	styleUrls: ['./manager-search.component.scss'],
})
export class ManagerSearchComponent extends AppComponentBase implements OnInit, OnDestroy {
	@ViewChild(MatMenuTrigger) managerSearchMenu: MatMenuTrigger;
	@ViewChild('trigger', { read: MatAutocompleteTrigger }) trigger: MatAutocompleteTrigger;
	@Input() formFieldLabel: string;
	@Input() managerSearchType: number;
	@Input() managerStatus: number;
	@Input() readonly: boolean;
	@Input() responsiblePerson: EmployeeDto;
	@Input() periodType: number;
	@Input() periodId: string;
	@Input() consultantPeriodId: string;
	@Input() stepType: number;
	@Input() workflowId: string;
	@Input() isFakeActiveStep: boolean;
	@Input() width: number;
	@Input() height: number;

	@Output() managerSelected: EventEmitter<number> = new EventEmitter<number>();

	managerStatuses = ManagerStatus;

	managerStatusIcon = EManagerStatusIcon;
	eManagerStatusTooltip = EManagerStatusTooltip;

	managerFilter = new UntypedFormControl('');
	filteredManagers: any[] = [];
	employees$: Observable<EmployeeDto[]>;
	filteredAccountManagers$: Observable<EmployeeDto[]>;
	private _unsubscribe = new Subject();
	constructor(
		injector: Injector,
		private _clientPeriodService: ClientPeriodServiceProxy,
		private _consultantPeriodService: ConsultantPeriodServiceProxy,
		private _workflowService: WorkflowServiceProxy,
		private _workflowDataService: WorkflowDataService,
		private _store: Store
	) {
		super(injector);
	}

	ngOnInit(): void {
		this.employees$ = this._store.select(getResponsiblePersons);
	}

	ngOnDestroy(): void {
		this._unsubscribe.next();
		this._unsubscribe.complete();
	}

	onOpenedMenu() {
		this._subscribtion$();
		setTimeout(() => {
			this.trigger.openPanel();
		}, 200);
	}

	selectOption(event: Event, option: EmployeeDto) {
		event.stopPropagation();
		this.managerSelected.emit(option.id);
		if (this.isFakeActiveStep !== null && this.isFakeActiveStep !== undefined) {
			this._updateSalesAccountManager(option);
		} else {
			switch (this.periodType) {
				case WorkflowProcessType.StartClientPeriod:
				case WorkflowProcessType.ExtendClientPeriod:
				case WorkflowProcessType.ChangeClientPeriod:
					this._changeResponsibleForClientPeriodStep(option);
					break;
				case WorkflowProcessType.TerminateWorkflow:
					this._changeResponsibleWorkflowTerminationStep(option);
					break;
				case WorkflowProcessType.StartConsultantPeriod:
				case WorkflowProcessType.ChangeConsultantPeriod:
				case WorkflowProcessType.ExtendConsultantPeriod:
					this._changeResponsibleForConsultantPeriodStep(option);
					break;
				case WorkflowProcessType.TerminateConsultant:
					this._changeResponsibleConsultantTerminationStep(option);
					break;
			}
		}
		this.managerSearchMenu.closeMenu();
	}

	private _changeResponsibleForClientPeriodStep(responsiblePerson: EmployeeDto) {
		this.showMainSpinner();
		this._clientPeriodService
			.stepResponsible(this.periodId, this.stepType, responsiblePerson.id)
			.pipe(finalize(() => this.hideMainSpinner()))
			.subscribe(() => {
				this.responsiblePerson = responsiblePerson;
				this._workflowDataService.workflowSideSectionUpdated.emit({ isStatusUpdate: true });
			});
	}

	private _changeResponsibleForConsultantPeriodStep(responsiblePerson: EmployeeDto) {
		this.showMainSpinner();
		this._consultantPeriodService
			.stepResponsible2(this.consultantPeriodId, this.stepType, responsiblePerson.id)
			.pipe(finalize(() => this.hideMainSpinner()))
			.subscribe(() => {
				this.responsiblePerson = responsiblePerson;
				this._workflowDataService.workflowSideSectionUpdated.emit({ isStatusUpdate: true });
			});
	}

	private _changeResponsibleWorkflowTerminationStep(responsiblePerson: EmployeeDto) {
		this.showMainSpinner();
		this._workflowService
			.terminationStepResponsible(this.workflowId, this.stepType, responsiblePerson.id)
			.pipe(finalize(() => this.hideMainSpinner()))
			.subscribe(() => {
				this.responsiblePerson = responsiblePerson;
				this._workflowDataService.workflowSideSectionUpdated.emit({ isStatusUpdate: true });
			});
	}

	private _changeResponsibleConsultantTerminationStep(responsiblePerson: EmployeeDto) {
		this.showMainSpinner();
		this._workflowService
			.terminationConsultantStepResponsible(this.stepType, this.workflowId, this.consultantPeriodId, responsiblePerson.id)
			.pipe(finalize(() => this.hideMainSpinner()))
			.subscribe(() => {
				this.responsiblePerson = responsiblePerson;
				this._workflowDataService.workflowSideSectionUpdated.emit({ isStatusUpdate: true });
			});
	}

	private _updateSalesAccountManager(responsiblePerson: EmployeeDto) {
		this.showMainSpinner();
		this._clientPeriodService
			.salesAccountManager(this.periodId, responsiblePerson.id)
			.pipe(finalize(() => this.hideMainSpinner()))
			.subscribe(() => {
				this.responsiblePerson = responsiblePerson;
				this._workflowDataService.workflowOverviewUpdated.emit(true);
			});
	}

	private _filterEmployees(value: string): Observable<EmployeeDto[]> {
		const filterValue = value.toLowerCase();
		const result = this.employees$.pipe(
			map((response) => response.filter((option) => option.name.toLowerCase().includes(filterValue)).slice(0, 100))
		);
		if (value === '') {
			return this.employees$.pipe(
				map((employees) => employees.filter((emp) => emp.id !== this.responsiblePerson.id).slice(0, 100))
			);
		} else {
			return result;
		}
	}

	private _subscribtion$() {
		this.managerFilter.valueChanges
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
			});
	}
}
