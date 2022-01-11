import { WorkflowSideSections, WorkflowSteps } from "../workflow.model";

export class SideNavigationSubItemDto {
    id: number;
    name: string;
    displayName: string;
    enumStepValue: number;
    isCompleted: boolean;
    assignedPerson: string;
}

export class SideNavigationParentItemDto {
    displayName: string;
    name: string;
    sectionEnumValue: number;
    responsiblePerson: string;
    dateRange: string;
    subItems: SideNavigationSubItemDto[];
}

export class SideNavigationDto {
    name: string;
    index: number;
    sideNav: SideNavigationParentItemDto[];
}

export const ExtensionSideNavigation: SideNavigationDto[] = [];

export const AddConsultantDto: SideNavigationParentItemDto = {
    displayName: 'Add Consultant',
    name: 'workflowAdd',
    sectionEnumValue: WorkflowSideSections.AddConsultant,
    responsiblePerson: 'Andersen Rasmus2',
    dateRange: '02.01.2021 - 31.12.2021',
    subItems: [
        {
            id: 1,
            name: "AddSales",
            displayName: "Sales",
            enumStepValue: WorkflowSteps.Sales,
            isCompleted: false,
            assignedPerson: 'Roberto Olberto'
        },
        {
            id: 2,
            name: "AddContracts",
            displayName: "Contracts",
            enumStepValue: WorkflowSteps.Contracts,
            isCompleted: false,
            assignedPerson: 'Roberto Olberto'
        },
        {
            id: 3,
            name: "AddFinance",
            displayName: "Finance",
            enumStepValue: WorkflowSteps.Finance,
            isCompleted: false,
            assignedPerson: 'Roberto Olberto'
        }
    ]
};

export const ExtendWorkflowDto = {
    displayName: 'Extend workflow',
    name: 'workflowAdd',
    sectionEnumValue: WorkflowSideSections.ExtendWorkflow,
    responsiblePerson: 'Andersen Rasmus2',
    dateRange: '02.01.2021 - 31.12.2021',
    subItems: [
        {
            id: 1,
            name: "ExtendSales",
            displayName: "Sales",
            enumStepValue: WorkflowSteps.Sales,
            isCompleted: false,
            assignedPerson: 'Roberto Olberto'
        },
        {
            id: 2,
            name: "ExtendContracts",
            displayName: "Contracts",
            enumStepValue: WorkflowSteps.Contracts,
            isCompleted: false,
            assignedPerson: 'Roberto Olberto'
        },
        {
            id: 3,
            name: "ExtendFinance",
            displayName: "Finance",
            enumStepValue: WorkflowSteps.Finance,
            isCompleted: false,
            assignedPerson: 'Roberto Olberto'
        }
    ]
};
