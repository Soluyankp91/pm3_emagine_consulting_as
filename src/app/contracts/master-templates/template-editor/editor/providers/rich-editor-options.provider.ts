import { FactoryProvider, InjectionToken } from '@angular/core';
import { createOptions, Options } from 'devexpress-richedit';

export const RICH_EDITOR_OPTIONS: InjectionToken<Options> = new InjectionToken('RICH_EDITOR_OPTIONS_INSTANCE');

export const RichEditorOptionsProvider: FactoryProvider = {
	provide: RICH_EDITOR_OPTIONS,
	useFactory: () => {
		let options = createOptions();
		options.unit = 1;
		options.width = 'calc(100vw - 160px)';
		options.height = 'calc(100vh - 240px)';
		return options;
	},
};
