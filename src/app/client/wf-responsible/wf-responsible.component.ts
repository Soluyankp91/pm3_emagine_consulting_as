import { Component, Injector } from '@angular/core';
import { OnDestroy, OnInit } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { AppComponentBase } from 'src/shared/app-component-base';
import { merge, Subject } from 'rxjs';
import { takeUntil, debounceTime, switchMap, finalize } from 'rxjs/operators';
import {
	AdminServiceProxy,
	ClientsServiceProxy,
	EmployeeDto,
	LookupServiceProxy,
	StepType,
	UpdateClientWFResponsibleCommand,
} from 'src/shared/service-proxies/service-proxies';
import { CustomValidators } from 'src/shared/utils/custom-validators';
import { ActivatedRoute } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
@Component({
	selector: 'app-wf-responsible',
	styleUrls: ['./wf-responsible.component.scss'],
	templateUrl: './wf-responsible.component.html',
})
export class WfResponsibleComponent extends AppComponentBase implements OnInit, OnDestroy {
	clientId: number;
	contractStepResponsible = new UntypedFormControl(null, CustomValidators.autocompleteValidator(['id']));
	financeStepResponsible = new UntypedFormControl(null, CustomValidators.autocompleteValidator(['id']));
	filteredAccountManagers: EmployeeDto[] = [];
	stepEmployeesDataSource: MatTableDataSource<any> = new MatTableDataSource<any>();
	displayedColumns = ['tenantFlag', 'tenant', 'contractStep', 'financeStep'];
	private _unsubscribe = new Subject();
	constructor(
		injector: Injector,
		private activatedRoute: ActivatedRoute,
		private _lookupService: LookupServiceProxy,
		private _clientService: ClientsServiceProxy,
		private _adminService: AdminServiceProxy
	) {
		super(injector);
		merge(this.financeStepResponsible.valueChanges, this.contractStepResponsible.valueChanges)
			.pipe(
				takeUntil(this._unsubscribe),
				debounceTime(300),
				switchMap((value: any) => {
					let toSend = {
						name: value,
						maxRecordsCount: 1000,
					};
					if (value?.id) {
						toSend.name = value.id ? value.name : value;
					}
					return this._lookupService.employees(toSend.name);
				})
			)
			.subscribe((list: EmployeeDto[]) => {
				if (list.length) {
					this.filteredAccountManagers = list;
				} else {
					this.filteredAccountManagers = [
						new EmployeeDto({ name: 'No managers found', externalId: '', id: undefined }),
					];
				}
			});
	}

	ngOnInit(): void {
		this.activatedRoute.parent!.paramMap.pipe(takeUntil(this._unsubscribe)).subscribe((params) => {
			this.clientId = +params.get('id')!;
			this.getResponsiblePersons();
		});
		this.getWorkflowEmployeeAssignments();
	}

	ngOnDestroy(): void {
		this._unsubscribe.next();
		this._unsubscribe.complete();
	}

	getResponsiblePersons() {
		this.showMainSpinner();
		this._clientService
			.getWFResponsible(this.clientId)
			.pipe(finalize(() => this.hideMainSpinner()))
			.subscribe((result) => {
				this.financeStepResponsible.setValue(result.financeStepResponsibleEmployee, { emitEvent: false });
				this.contractStepResponsible.setValue(result.contractStepResponsibleEmployee, { emitEvent: false });
			});
	}

	setResponsiblePerson() {
		let input = new UpdateClientWFResponsibleCommand();
		input.clientId = this.clientId;
		input.contractStepResponsibleEmployeeId = this.contractStepResponsible.value?.id;
		input.financeStepResponsibleEmployeeId = this.financeStepResponsible.value?.id;
		this._clientService
			.postWFResponsible(input)
			.pipe(finalize(() => this.hideMainSpinner()))
			.subscribe();
	}

	getWorkflowEmployeeAssignments() {
		this.showMainSpinner();
		this._adminService
			.workflowStepEmployeeAssignments()
			.pipe(finalize(() => this.hideMainSpinner()))
			.subscribe((result) => {
				let formattedData = result.map((item) => {
					return {
						tenantFlag: this._mapFlagFromTenantId(item.tenantConfigId!),
						tenantId: item.tenantConfigId,
						tenantName: item.tenantName,
						contractStepResponsible: item.workflowStepEmployeeAssignments?.find(
							(employee) => employee.stepType === StepType.Contract
						)?.responsibleEmployee,
						financeStepResponsible: item.workflowStepEmployeeAssignments?.find(
							(employee) => employee.stepType === StepType.Finance
						)?.responsibleEmployee,
					};
				});
				this.stepEmployeesDataSource = new MatTableDataSource<any>(formattedData);
			});
	}

	private _mapFlagFromTenantId(tenantId: number) {
		switch (tenantId) {
			case 1:
				return 'DK';
			case 2:
				return 'SE';
			case 4:
				return 'PL';
			case 8:
				return 'NL';
			case 10:
				return 'DE';
			case 17:
				return 'NO';
			case 20:
				return 'GB';
			case 25:
				return 'EU';
			case 27:
				return 'FR';
			case 29:
				return 'IN';
			default:
				return '';
		}
	}
}
