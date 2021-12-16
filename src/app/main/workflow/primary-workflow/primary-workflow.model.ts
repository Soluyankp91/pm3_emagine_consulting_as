// export const WorkflowSideNavigation: SideNavigationDto[] = [];

import { SideNavigationParentItemDto } from "../workflow-extension/workflow-extension.model";
import { WorkflowSideSections } from "../workflow.model";

export const WorkflowSideNavigation: SideNavigationParentItemDto[] = [
    {
        displayName: 'Start workflow',
        name: 'workflowStartOrExtend',
        sectionEnumValue: WorkflowSideSections.StartWorkflow,
        responsiblePerson: 'Andersen Rasmus1',
        dateRange: '02.01.2021 - 31.12.2021',
        subItems: [
            {
                id: 1,
                name: "Sales",
                displayName: "Sales",
                isCompleted: false,
                assignedPerson: 'Roberto Olberto'
            },
            {
                id: 2,
                name: "Contracts",
                displayName: "Contracts",
                isCompleted: false,
                assignedPerson: 'Roberto Olberto'
            },
            {
                id: 3,
                name: "Finance",
                displayName: "Finance",
                isCompleted: false,
                assignedPerson: 'Roberto Olberto'
            }
        ]
    }
];

export const ExtendWorkflowDto = {
    displayName: 'Extend workflow',
    name: 'workflowStartOrExtend',
    sectionEnumValue: WorkflowSideSections.ExtendWorkflow,
    responsiblePerson: 'Andersen Rasmus2',
    dateRange: '02.01.2021 - 31.12.2021',
    subItems: [
        {
            id: 1,
            name: "ExtendWorkflowSales",
            displayName: "Sales",
            isCompleted: false,
            assignedPerson: 'Roberto Olberto'
        },
        {
            id: 2,
            name: "ExtendWorkflowContracts",
            displayName: "Contracts",
            isCompleted: false,
            assignedPerson: 'Roberto Olberto'
        }
    ]
};

export const EditWorkflowDto = {
    displayName: 'Edit workflow',
    name: 'workflowStartOrExtend',
    sectionEnumValue: WorkflowSideSections.ChangeWorkflow,
    responsiblePerson: 'Andersen Rasmus2',
    dateRange: '02.01.2021 - 31.12.2021',
    subItems: [
        {
            id: 1,
            name: "EditWorkflowSales",
            displayName: "Sales",
            isCompleted: false,
            assignedPerson: 'Roberto Olberto'
        },
        {
            id: 2,
            name: "EditWorkflowContracts",
            displayName: "Contracts",
            isCompleted: false,
            assignedPerson: 'Roberto Olberto'
        },
        {
            id: 2,
            name: "EditWorkflowFinances",
            displayName: "Finances",
            isCompleted: false,
            assignedPerson: 'Roberto Olberto'
        }
    ]
};

export const TerminateWorkflowDto = {
    displayName: 'Terminate workflow',
    name: 'workflowTerminate',
    sectionEnumValue: WorkflowSideSections.TerminateWorkflow,
    responsiblePerson: 'Andersen Rasmus2',
    dateRange: '02.01.2021 - 31.12.2021',
    subItems: [
        {
            id: 1,
            name: "TerminateWorkflowSales",
            displayName: "Sales",
            isCompleted: false,
            assignedPerson: 'Roberto Olberto'
        },
        {
            id: 2,
            name: "TerminateWorkflowContracts",
            displayName: "Contracts",
            isCompleted: false,
            assignedPerson: 'Roberto Olberto'
        }
    ]
};


export const AddConsultantDto = {
    displayName: 'Add consultant',
    name: 'workflowAdd',
    sectionEnumValue: WorkflowSideSections.AddConsultant,
    responsiblePerson: 'Andersen Rasmus2',
    dateRange: '02.01.2021 - 31.12.2021',
    subItems: [
        {
            id: 1,
            name: "AddConsultantSales",
            displayName: "Sales",
            isCompleted: false,
            assignedPerson: 'Roberto Olberto'
        },
        {
            id: 2,
            name: "AddConsultantContracts",
            displayName: "Contracts",
            isCompleted: false,
            assignedPerson: 'Roberto Olberto'
        },
        {
            id: 3,
            name: "AddConsultantFinance",
            displayName: "Finance",
            isCompleted: false,
            assignedPerson: 'Roberto Olberto'
        }
    ]
};


export const EditConsultantDto = {
    displayName: 'Edit consultant',
    name: 'workflowEdit',
    sectionEnumValue: WorkflowSideSections.ChangeWorkflow,
    responsiblePerson: 'Andersen Rasmus2',
    dateRange: '02.01.2021 - 31.12.2021',
    subItems: [
        {
            id: 1,
            name: "EditConsultantSales",
            displayName: "Sales",
            isCompleted: false,
            assignedPerson: 'Roberto Olberto'
        },
        {
            id: 2,
            name: "EditConsultantContracts",
            displayName: "Contracts",
            isCompleted: false,
            assignedPerson: 'Roberto Olberto'
        },
        {
            id: 3,
            name: "EditConsultantFinance",
            displayName: "Finance",
            isCompleted: false,
            assignedPerson: 'Roberto Olberto'
        }
    ]
};

export const ExtendConsultantDto = {
    displayName: 'Extend consultant',
    name: 'workflowStartOrExtend',
    sectionEnumValue: WorkflowSideSections.TerminateConsultant,
    responsiblePerson: 'Andersen Rasmus2',
    dateRange: '02.01.2021 - 31.12.2021',
    subItems: [
        {
            id: 1,
            name: "ExtendConsultantSales",
            displayName: "Sales",
            isCompleted: false,
            assignedPerson: 'Roberto Olberto'
        },
        {
            id: 2,
            name: "ExtendConsultantContracts",
            displayName: "Contracts",
            isCompleted: false,
            assignedPerson: 'Roberto Olberto'
        }
    ]
};

export const TerminateConsultantDto = {
    displayName: 'Terminate consultant',
    name: 'workflowTerminate',
    sectionEnumValue: WorkflowSideSections.TerminateConsultant,
    responsiblePerson: 'Andersen Rasmus2',
    dateRange: '02.01.2021 - 31.12.2021',
    subItems: [
        {
            id: 1,
            name: "TerminateConsultantSales",
            displayName: "Sales",
            isCompleted: false,
            assignedPerson: 'Roberto Olberto'
        },
        {
            id: 2,
            name: "TerminateConsultantContracts",
            displayName: "Contracts",
            isCompleted: false,
            assignedPerson: 'Roberto Olberto'
        }
    ]
};
