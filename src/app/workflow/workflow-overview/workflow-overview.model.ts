import { EmployeeDto, StepType, WorkflowProcessType, WorkflowStepStatus } from "src/shared/service-proxies/service-proxies";

export enum EStepActionTooltip {
    'Finished' = WorkflowStepStatus.Completed,
    'In progress' = WorkflowStepStatus.Pending,
    'Not yet started' = WorkflowStepStatus.Upcoming
}

export interface IWFOverviewDocuments {
    id?: number;
    clientPeriodId?: string | undefined;
    workflowTerminationId?: string | undefined;
    workflowProcessType?: WorkflowProcessType;
    stepType?: StepType;
    name?: string | undefined;
    icon?: string | undefined;
    createdBy?: EmployeeDto;
    createdDateUtc?: moment.Moment;
}
