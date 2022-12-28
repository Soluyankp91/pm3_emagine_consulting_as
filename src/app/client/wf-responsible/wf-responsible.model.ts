import { WorkflowStepEmployeeAssignmentEmployeeDto } from "src/shared/service-proxies/service-proxies";

export interface IWorkflowAssignees {
    tenantFlag: string;
    tenantId: number;
    tenantName: string;
    contractStepResponsible: WorkflowStepEmployeeAssignmentEmployeeDto | undefined;
    financeStepResponsible: WorkflowStepEmployeeAssignmentEmployeeDto | undefined;
}
