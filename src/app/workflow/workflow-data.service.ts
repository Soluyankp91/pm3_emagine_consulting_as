import { EventEmitter, Injectable } from '@angular/core';
import { ConsultantResultDto } from 'src/shared/service-proxies/service-proxies';
import { WorkflowProgressStatus } from './workflow.model';

@Injectable({
    providedIn: 'root'
})
export class WorkflowDataService {
    workflowProgress: WorkflowProgressStatus = new WorkflowProgressStatus();

    workflowSideSectionAdded = new EventEmitter<boolean>();
    // Start Clinet period
    startClientPeriodSalesSaved = new EventEmitter<boolean>();
    startClientPeriodContractsSaved = new EventEmitter<boolean>();
    startClientPeriodFinanceSaved = new EventEmitter<boolean>();

    // Consultant start, extend and change periods
    consultantStartChangeOrExtendSalesSaved = new EventEmitter<boolean>();
    consultantStartChangeOrExtendContractsSaved = new EventEmitter<boolean>();
    consultantStartChangeOrExtendFinanceSaved = new EventEmitter<boolean>();

    // Change consultant period

    //Termination
    consultantTerminationSalesSaved = new EventEmitter<boolean>();
    workflowTerminationSalesSaved = new EventEmitter<boolean>();
    workflowConsultantTerminationContractsSaved = new EventEmitter<boolean>();
    workflowTerminationContractsSaved = new EventEmitter<boolean>();
    workflowConsultantTerminationSourcingSaved = new EventEmitter<boolean>();
    workflowTerminationSourcingSaved = new EventEmitter<boolean>();

    workflowSideSectionChanged = new EventEmitter<{consultant?: ConsultantResultDto | undefined,  consultantPeriodId?: string | undefined}>();
    workflowSideSectionUpdated = new EventEmitter<{isStatusUpdate: boolean}>();
    workflowTopSectionUpdated = new EventEmitter<any>();

    consultantsAddedToStep = new EventEmitter<{stepType: number, processTypeId: number, consultantNames: string[]}>();

    cancelForceEdit =  new EventEmitter<any>();
    constructor() { }

    updateWorkflowProgressStatus(status: Partial<WorkflowProgressStatus>) {
        for (const update in status) {
            const key = update as keyof WorkflowProgressStatus;
            if (status[key] !== null && status[key] !== undefined) {
                (this.workflowProgress[key] as any) = status[key];
            }
        }
    }

    get getWorkflowProgress() {
        return this.workflowProgress;
    }
}
