import { WorkflowSideSections } from "../workflow.model";

export class SideNavigationSubItemDto {
    id: number;
    name: string;
    displayName: string;
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

export const AddConsultantDto = {
    displayName: 'Add workflow',
    name: 'workflowAdd',
    sectionEnumValue: WorkflowSideSections.AddConsultant,
    responsiblePerson: 'Andersen Rasmus2',
    dateRange: '02.01.2021 - 31.12.2021',
    subItems: [
        {
            id: 1,
            name: "AddSales",
            displayName: "Sales",
            isCompleted: false,
            assignedPerson: 'Roberto Olberto'
        },
        {
            id: 2,
            name: "AddContracts",
            displayName: "Contracts",
            isCompleted: false,
            assignedPerson: 'Roberto Olberto'
        },
        {
            id: 3,
            name: "AddFinance",
            displayName: "Finance",
            isCompleted: false,
            assignedPerson: 'Roberto Olberto'
        }
    ]
};

export const ExtendWorkflowDto = {
    displayName: 'Add workflow',
    name: 'workflowAdd',
    sectionEnumValue: WorkflowSideSections.ExtendWorkflow,
    responsiblePerson: 'Andersen Rasmus2',
    dateRange: '02.01.2021 - 31.12.2021',
    subItems: [
        {
            id: 1,
            name: "AddSales",
            displayName: "Sales",
            isCompleted: false,
            assignedPerson: 'Roberto Olberto'
        },
        {
            id: 2,
            name: "AddContracts",
            displayName: "Contracts",
            isCompleted: false,
            assignedPerson: 'Roberto Olberto'
        },
        {
            id: 3,
            name: "AddFinance",
            displayName: "Finance",
            isCompleted: false,
            assignedPerson: 'Roberto Olberto'
        }
    ]
};
