import { Action, ActionReducerMap, createFeatureSelector, MetaReducer } from '@ngrx/store';
import { coreReducer, State as CoreState } from 'src/app/store/reducers/core.reducer';
import { enumReducer, State as EnumState } from 'src/app/store/reducers/enum.reducer';
import { environment } from '../../../environments/environment';
import { InjectionToken } from '@angular/core';

export interface State {
	coreState: CoreState;
	enumState: EnumState;
}

export const ROOT_REDUCERS = new InjectionToken<ActionReducerMap<State, Action>>('Root reducers token', {
	factory: () => ({
		coreState: coreReducer,
		enumState: enumReducer,
	}),
});

export const metaReducers: MetaReducer<State>[] = !environment.production ? [] : [];

export const getCoreState = createFeatureSelector<CoreState>('coreState');
export const getEnumState = createFeatureSelector<EnumState>('enumState');
