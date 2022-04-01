import { EventEmitter, Injectable } from '@angular/core';
import { WorkflowProgressStatus } from './workflow.model';

@Injectable({
    providedIn: 'root'
})
export class WorkflowDataService {
    workflowProgress: WorkflowProgressStatus = new WorkflowProgressStatus();

    workflowSalesSaved = new EventEmitter<boolean>();
    workflowSideSectionAdded = new EventEmitter<boolean>();

    //Termination
    workflowConsultantTerminationSalesSaved = new EventEmitter<boolean>();
    workflowTerminationSalesSaved = new EventEmitter<boolean>();
    workflowConsultantTerminationContractsSaved = new EventEmitter<boolean>();
    workflowTerminationContractsSaved = new EventEmitter<boolean>();
    workflowConsultantTerminationSourcingSaved = new EventEmitter<boolean>();
    workflowTerminationSourcingSaved = new EventEmitter<boolean>();
    workflowConsultantTerminationSalesCompleted = new EventEmitter<boolean>();
    workflowTerminationSalesCompleted = new EventEmitter<boolean>();
    workflowConsultantTerminationContractsCompleted = new EventEmitter<boolean>();
    workflowTerminationContractsCompleted = new EventEmitter<boolean>();
    workflowConsultantTerminationSourcingCompleted = new EventEmitter<boolean>();
    workflowTerminationSourcingCompleted = new EventEmitter<boolean>();

    workflowSideSectionChanged = new EventEmitter<boolean>();

    constructor() { }

    updateWorkflowProgressStatus(status: Partial<WorkflowProgressStatus>) {
        for (const update in status) {
            const key = update as keyof WorkflowProgressStatus;
            if (status[key] !== null && status[key] !== undefined) {
                (this.workflowProgress[key] as any) = status[key];
            }
        }
        console.log(this.workflowProgress);
    }

    get getWorkflowProgress() {
        return this.workflowProgress;
    }
}
