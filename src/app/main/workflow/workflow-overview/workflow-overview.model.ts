import { WorkflowSideSections, WorkflowSteps } from "../workflow.model";

export class ProcessSubItemDto {
    id: number;
    name: string;
    displayName: string;
    enumStepValue: number;
    assignedPerson: string;
    isCompleted: boolean;
    isInProgress: boolean;
    canStartSetup: boolean;
}

export class ProcessParentItemDto {
    displayName: string;
    name: string;
    sectionEnumValue: number;
    dateRange: string;
    processSteps: ProcessSubItemDto[];
}

export const StartWorkflowProcessDto: ProcessParentItemDto = {
    displayName: 'Start Workflow',
    name: 'workflowAdd',
    sectionEnumValue: WorkflowSideSections.StartWorkflow,
    dateRange: '02.01.2021 - 31.12.2021',
    processSteps: [
        {
            id: 1,
            name: "StartWorkflowSales",
            displayName: "Sales",
            enumStepValue: WorkflowSteps.Sales,
            assignedPerson: 'Roberto Olberto',
            isCompleted: false,
            isInProgress: false,
            canStartSetup: true,
        },
        {
            id: 2,
            name: "StartWorkflowContracts",
            displayName: "Contracts",
            enumStepValue: WorkflowSteps.Contracts,
            assignedPerson: 'Roberto Olberto',
            isCompleted: false,
            isInProgress: false,
            canStartSetup: false,
        },
        {
            id: 3,
            name: "StartWorkflowFinances",
            displayName: "Finances",
            enumStepValue: WorkflowSteps.Finance,
            assignedPerson: 'Roberto Olberto',
            isCompleted: false,
            isInProgress: false,
            canStartSetup: false,
        }
    ]
};

export const ExtendWorkflowProcessDto: ProcessParentItemDto = {
    displayName: 'Extend Workflow',
    name: 'workflowStartOrExtend',
    sectionEnumValue: WorkflowSideSections.ExtendWorkflow,
    dateRange: '02.01.2021 - 31.12.2021',
    processSteps: [
        {
            id: 1,
            name: "ExtendWorkflowSales",
            displayName: "Sales",
            enumStepValue: WorkflowSteps.Sales,
            assignedPerson: 'Roberto Olberto',
            isCompleted: true,
            isInProgress: false,
            canStartSetup: false,
        },
        {
            id: 2,
            name: "ExtendWorkflowContracts",
            displayName: "Contracts",
            enumStepValue: WorkflowSteps.Contracts,
            assignedPerson: 'Roberto Olberto',
            isCompleted: false,
            isInProgress: true,
            canStartSetup: false,
        }
    ]
};
