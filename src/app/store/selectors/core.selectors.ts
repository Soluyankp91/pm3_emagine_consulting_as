import { createSelector } from '@ngrx/store';
import { getCoreState } from 'src/app/store/reducers';
import * as fromReducers from 'src/app/store/reducers/core.reducer';

export const getEmployees = createSelector(
  getCoreState,
  fromReducers.getEmployeesState,
);
