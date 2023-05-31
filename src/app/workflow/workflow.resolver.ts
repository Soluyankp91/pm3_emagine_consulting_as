import { Injectable } from '@angular/core';
import {
  Router, Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { WorkflowAlreadyExistsDto, WorkflowServiceProxy } from 'src/shared/service-proxies/service-proxies';
import { WorkflowSourcingCreate } from './workflow.model';

@Injectable({
  providedIn: 'root'
})
export class WorkflowCreateResolver implements Resolve<WorkflowSourcingCreate> {
	constructor(private _workflowService: WorkflowServiceProxy) {}

	resolve(route: ActivatedRouteSnapshot): Observable<WorkflowSourcingCreate> {
		let requestId = route.queryParams['requestId'];
		let requestConsultantId = route.queryParams['requestConsultantId'];
		return this._workflowService.workflowExists(requestConsultantId).pipe(
			map((value: WorkflowAlreadyExistsDto) => {
				return {
					requestId: requestId,
					requestConsultantId: requestConsultantId,
					existingWorkflowId: value?.existingWorkflowId,
				};
			})
		);
	}
}
