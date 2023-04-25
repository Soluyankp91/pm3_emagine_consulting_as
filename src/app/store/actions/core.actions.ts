import { createAction, props } from '@ngrx/store';
import { EmployeeDto } from 'src/shared/service-proxies/service-proxies';

export const loadEmployees = createAction('[Employees] Load Employees');
export const loadResponsiblePersons = createAction('[Employees] Load Responsible Persons');
export const loadEmployeesSuccess = createAction('[Employees] Load Employees Success', props<{ employees: EmployeeDto[] }>());
export const loadResponsiblePersonsSuccess = createAction(
	'[Employees] Load Responsible Persons Success',
	props<{ responsiblePersons: EmployeeDto[] }>()
);

export const coreError = createAction('[Core] Core Error', props<{ error: any }>());
