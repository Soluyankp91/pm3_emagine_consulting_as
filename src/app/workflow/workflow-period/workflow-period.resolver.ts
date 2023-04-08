import { Injectable } from "@angular/core";
import { Resolve, ActivatedRouteSnapshot } from "@angular/router";
import { WorkflowPeriodResolverDto } from "./workflow-period.model";

@Injectable()
export class WorkflowPeriodResolver implements Resolve<WorkflowPeriodResolverDto> {
	constructor() {}
	resolve(route: ActivatedRouteSnapshot): WorkflowPeriodResolverDto {
		let workflowId = route.parent.params['id'];
		let periodId = route.params['periodId'];
		return {
			workflowId: workflowId,
			periodId: periodId,
		};
	}
}
