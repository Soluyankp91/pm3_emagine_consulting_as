import { FactoryProvider, InjectionToken } from '@angular/core';
import { createOptions, Options } from 'devexpress-richedit';

export const RICH_EDITOR_OPTIONS: InjectionToken<Options> = new InjectionToken('RICH_EDITOR_OPTIONS_INSTANCE');

export const RichEditorOptionsProvider: FactoryProvider = {
	provide: RICH_EDITOR_OPTIONS,
	useFactory: () => {
		let options = createOptions();
		options.unit = 1;
		options.width = '100%';
		options.height = 'calc(100vh - 220px)';

		options.mailMerge.viewMergedData = true;
		options.confirmOnLosingChanges.enabled = false;
		return options;
	},
};
