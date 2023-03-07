import { HttpContext, HttpContextToken } from '@angular/common/http';

export const MANUAL_ERROR_HANDLER_ENABLED = new HttpContextToken<boolean>(() => false);

export const httpContextFactory = <T>(token: HttpContextToken<T>, value: T) => {
	return new HttpContext().set(token, value);
};

export const manualErrorHandlerEnabledContextCreator = (value: boolean) =>
	httpContextFactory<boolean>(MANUAL_ERROR_HANDLER_ENABLED, value);
