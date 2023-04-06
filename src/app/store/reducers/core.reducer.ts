import { createReducer, on } from '@ngrx/store';
import { coreError, loadEmployees, loadEmployeesSuccess } from 'src/app/store/actions/core.actions';
import { EmployeeDto } from 'src/shared/service-proxies/service-proxies';

export interface State {
	employees: EmployeeDto[];
	error: any;
}

export const initialState: State = {
	employees: [],
	error: null,
};

export const coreReducer = createReducer(
	initialState,
	on(loadEmployees, (state) => ({ ...state })),
	on(loadEmployeesSuccess, (state, action) => ({
		...state,
		employees: action.employees,
	})),
	on(coreError, (state, action) => ({
		...state,
		error: action.error,
	}))
);

export const getEmployeesState = (state: State) => state.employees;
