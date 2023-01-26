import { WorkflowStepStatus } from "src/shared/service-proxies/service-proxies";

export enum EStepActionTooltip {
    'Finished' = WorkflowStepStatus.Completed,
    'In progress' = WorkflowStepStatus.Pending,
    'Not yet started' = WorkflowStepStatus.Upcoming
}
