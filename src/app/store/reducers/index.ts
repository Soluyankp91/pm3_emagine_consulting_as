import { Action, ActionReducerMap, createFeatureSelector, MetaReducer } from '@ngrx/store';
import { coreReducer, State as CoreState } from 'src/app/store/reducers/core.reducer';
import { environment } from '../../../environments/environment';
import { InjectionToken } from '@angular/core';

export interface State {
	coreState: CoreState;
}

export const ROOT_REDUCERS = new InjectionToken<ActionReducerMap<State, Action>>('Root reducers token', {
	factory: () => ({
		coreState: coreReducer,
	}),
});

export const metaReducers: MetaReducer<State>[] = !environment.production ? [] : [];

export const getCoreState = createFeatureSelector<CoreState>('coreState');
