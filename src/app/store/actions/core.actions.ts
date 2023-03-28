import { createAction, props } from '@ngrx/store';
import { EmployeeDto } from 'src/shared/service-proxies/service-proxies';

export const loadEmployees = createAction(
  '[Employees] Load Employees',
);

export const loadEmployeesSuccess = createAction(
  '[Employees] Load Employees Success',
  props<{ employees: EmployeeDto[] }>(),
);

export const coreError = createAction(
  '[Core] Core Error',
  props<{ error: any }>(),
);
