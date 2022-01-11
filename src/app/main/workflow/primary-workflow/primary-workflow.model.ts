// export const WorkflowSideNavigation: SideNavigationDto[] = [];

import { SideNavigationParentItemDto } from "../workflow-extension/workflow-extension.model";
import { WorkflowSideSections, WorkflowSteps } from "../workflow.model";

export const WorkflowSideNavigation: SideNavigationParentItemDto[] = [
    {
        displayName: 'Start Workflow',
        name: 'workflowAdd',
        sectionEnumValue: WorkflowSideSections.StartWorkflow,
        responsiblePerson: 'Andersen Rasmus1',
        dateRange: '02.01.2021 - 31.12.2021',
        subItems: [
            {
                id: 1,
                name: "Sales",
                displayName: "Sales",
                enumStepValue: WorkflowSteps.Sales,
                isCompleted: false,
                assignedPerson: 'Roberto Olberto'
            },
            {
                id: 2,
                name: "Contracts",
                displayName: "Contracts",
                enumStepValue: WorkflowSteps.Contracts,
                isCompleted: false,
                assignedPerson: 'Roberto Olberto'
            },
            {
                id: 3,
                name: "Finance",
                displayName: "Finance",
                enumStepValue: WorkflowSteps.Finance,
                isCompleted: false,
                assignedPerson: 'Roberto Olberto'
            }
        ]
    }
];

export const ExtendWorkflowDto = {
    displayName: 'Extend Workflow',
    name: 'workflowStartOrExtend',
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
        }
    ]
};

export const ChangeWorkflowDto = {
    displayName: 'Change Workflow',
    name: 'workflowEdit',
    sectionEnumValue: WorkflowSideSections.ChangeWorkflow,
    responsiblePerson: 'Andersen Rasmus2',
    dateRange: '02.01.2021 - 31.12.2021',
    subItems: [
        {
            id: 1,
            name: "EditWorkflowSales",
            displayName: "Sales",
            enumStepValue: WorkflowSteps.Sales,
            isCompleted: false,
            assignedPerson: 'Roberto Olberto'
        },
        {
            id: 2,
            name: "EditWorkflowContracts",
            displayName: "Contracts",
            enumStepValue: WorkflowSteps.Contracts,
            isCompleted: false,
            assignedPerson: 'Roberto Olberto'
        }
    ]
};

export const TerminateWorkflowDto = {
    displayName: 'Terminate Workflow',
    name: 'workflowTerminate',
    sectionEnumValue: WorkflowSideSections.TerminateWorkflow,
    responsiblePerson: 'Andersen Rasmus2',
    dateRange: '02.01.2021 - 31.12.2021',
    subItems: [
        {
            id: 1,
            name: "TerminateWorkflowSales",
            displayName: "Sales",
            enumStepValue: WorkflowSteps.Sales,
            isCompleted: false,
            assignedPerson: 'Roberto Olberto'
        },
        {
            id: 2,
            name: "TerminateWorkflowContracts",
            displayName: "Contracts",
            enumStepValue: WorkflowSteps.Contracts,
            isCompleted: false,
            assignedPerson: 'Roberto Olberto'
        }
    ]
};


export const AddConsultantDto = {
    displayName: 'Add Consultant',
    name: 'workflowAdd',
    sectionEnumValue: WorkflowSideSections.AddConsultant,
    responsiblePerson: 'Andersen Rasmus2',
    dateRange: '02.01.2021 - 31.12.2021',
    subItems: [
        {
            id: 1,
            name: "AddConsultantSales",
            displayName: "Sales",
            enumStepValue: WorkflowSteps.Sales,
            isCompleted: false,
            assignedPerson: 'Roberto Olberto'
        },
        {
            id: 2,
            name: "AddConsultantContracts",
            displayName: "Contracts",
            enumStepValue: WorkflowSteps.Contracts,
            isCompleted: false,
            assignedPerson: 'Roberto Olberto'
        },
        {
            id: 3,
            name: "AddConsultantFinance",
            displayName: "Finance",
            enumStepValue: WorkflowSteps.Finance,
            isCompleted: false,
            assignedPerson: 'Roberto Olberto'
        }
    ]
};

export const EditConsultantDto = {
    displayName: 'Edit Consultant',
    name: 'workflowEdit',
    sectionEnumValue: WorkflowSideSections.ChangeWorkflow,
    responsiblePerson: 'Andersen Rasmus2',
    dateRange: '02.01.2021 - 31.12.2021',
    subItems: [
        {
            id: 1,
            name: "EditConsultantSales",
            displayName: "Sales",
            enumStepValue: WorkflowSteps.Sales,
            isCompleted: false,
            assignedPerson: 'Roberto Olberto'
        },
        {
            id: 2,
            name: "EditConsultantContracts",
            displayName: "Contracts",
            enumStepValue: WorkflowSteps.Contracts,
            isCompleted: false,
            assignedPerson: 'Roberto Olberto'
        },
        {
            id: 3,
            name: "EditConsultantFinance",
            displayName: "Finance",
            enumStepValue: WorkflowSteps.Finance,
            isCompleted: false,
            assignedPerson: 'Roberto Olberto'
        }
    ]
};

export const ExtendConsultantDto = {
    displayName: 'Extend Consultant',
    name: 'workflowStartOrExtend',
    sectionEnumValue: WorkflowSideSections.TerminateConsultant,
    responsiblePerson: 'Andersen Rasmus2',
    dateRange: '02.01.2021 - 31.12.2021',
    subItems: [
        {
            id: 1,
            name: "ExtendConsultantSales",
            displayName: "Sales",
            enumStepValue: WorkflowSteps.Sales,
            isCompleted: false,
            assignedPerson: 'Roberto Olberto'
        },
        {
            id: 2,
            name: "ExtendConsultantContracts",
            displayName: "Contracts",
            enumStepValue: WorkflowSteps.Contracts,
            isCompleted: false,
            assignedPerson: 'Roberto Olberto'
        }
    ]
};

export const TerminateConsultantDto = {
    displayName: 'Terminate Consultant',
    name: 'workflowTerminate',
    sectionEnumValue: WorkflowSideSections.TerminateConsultant,
    responsiblePerson: 'Andersen Rasmus2',
    dateRange: '02.01.2021 - 31.12.2021',
    subItems: [
        {
            id: 1,
            name: "TerminateConsultantSales",
            displayName: "Sales",
            enumStepValue: WorkflowSteps.Sales,
            isCompleted: false,
            assignedPerson: 'Roberto Olberto'
        },
        {
            id: 2,
            name: "TerminateConsultantContracts",
            displayName: "Contracts",
            enumStepValue: WorkflowSteps.Contracts,
            isCompleted: false,
            assignedPerson: 'Roberto Olberto'
        }
    ]
};
