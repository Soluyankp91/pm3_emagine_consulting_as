import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { NgxSpinnerService } from 'ngx-spinner';
import { Observable, of, throwError } from 'rxjs';
import { ErrorDialogService } from 'src/app/shared/common/errors/error-dialog.service';
import { environment } from 'src/environments/environment';
import { manualErrorHandlerEnabledContextCreator } from 'src/shared/service-proxies/http-context-tokens';
import { ClientPeriodContractsDataCommandDto } from 'src/shared/service-proxies/service-proxies';

@Injectable()
export class WorkflowHttpService {
	private readonly baseUrl = `${environment.apiUrl}/api`;

	constructor(
		private _http: HttpClient,
		private readonly _spinner: NgxSpinnerService,
		private readonly _authService: MsalService,
		private readonly _router: Router,
		private _zone: NgZone,
		private readonly _errorDialogService: ErrorDialogService
	) {}

	contractStepComplete(periodId: string, body: ClientPeriodContractsDataCommandDto | undefined): Observable<Object> {
		let url = this.baseUrl + `/ClientPeriod/${periodId}/client-contracts/edit-finish`;
		return this._http.request('post', url, {
			body: body,
			context: manualErrorHandlerEnabledContextCreator(true),
		});
	}

	handleError(error: HttpErrorResponse) {
		let message = '';
		let header = '';
		let handled = false;
		switch (error.status) {
			case 400: // Bad request
				message = error.error?.error?.message?.length ? error.error?.error?.message : 'Invalid input';
				header = 'Bad request!';
				handled = true;
				this.showDialog(message, header);
				return throwError(error);
			case 401: //login
				header = 'Current user did not login to the application!';
				message = 'You will be redirected to login page.';
				handled = true;
				this._authService.logout();
				this._router.navigate(['/login']);
				break;
			case 403: //forbidden
				header = 'Access is forbidden';
				message = 'You will be redirected to login page.';
				this._router.navigateByUrl('/login');
				handled = true;
				break;
			case 500: //internal server error
				header = 'Internal server error';
				message = 'Status code: 500';
				this.showDialog(message, header);
				handled = true;
		}
		if (handled) {
			return of(error);
		} else {
			header = 'Error';
			message = 'Unexpected unhandled error';
			this.showDialog(message, header);
			return throwError(error);
		}
	}
	showDialog(errorMessage: string, header: string) {
		this._zone.run(() => this._errorDialogService.openDialog(errorMessage, header));
	}
}
