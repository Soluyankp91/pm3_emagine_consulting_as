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

