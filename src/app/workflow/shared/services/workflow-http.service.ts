import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { NgxSpinnerService } from "ngx-spinner";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { manualErrorHandlerEnabledContextCreator } from "src/shared/service-proxies/http-context-tokens";
import { ClientPeriodContractsDataCommandDto } from "src/shared/service-proxies/service-proxies";

@Injectable()
export class WorkflowHttpService {
	private readonly baseUrl = `${environment.apiUrl}/api`;

	constructor(private _http: HttpClient, private readonly _spinner: NgxSpinnerService) {}

	contractStepComplete(periodId: string, body: ClientPeriodContractsDataCommandDto | undefined): Observable<Object> {
		let url = this.baseUrl + `/ClientPeriod/${periodId}/client-contracts/edit-finish`;
		return this._http
			.request('post', url, {
				body: body,
				context: manualErrorHandlerEnabledContextCreator(true),
			});
	}
}
