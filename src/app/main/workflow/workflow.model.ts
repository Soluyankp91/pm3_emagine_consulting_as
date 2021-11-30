import { FormArray, FormControl, FormGroup } from "@angular/forms";

export class WorkflowContractsSummaryForm extends FormGroup {
    constructor() {
        super({
            contractData: new FormArray([])
        })

    }
    get contractData() {
        return this.get('contractData') as FormArray;
    }
}

export class WorkflowSalesExtensionForm extends FormGroup {
    constructor() {
        super({
            salesExtension: new FormArray([])
        })

    }
    get salesExtension() {
        return this.get('salesExtension') as FormArray;
    }
}

export class WorkflowExtensionForm extends FormGroup {
    constructor() {
        super({
            // salesExtension: new FormArray([])
            extensionEndDate: new FormControl(null),
            noExtensionEndDate: new FormControl(null),
            workflowInformation: new FormControl(null)
        })

    }
    // get salesExtension() {
    //     return this.get('salesExtension') as FormArray;
    // }
    get extensionEndDate() {
        return this.get('extensionEndDate');
    }
    get noExtensionEndDate() {
        return this.get('noExtensionEndDate');
    }
    get workflowInformation() {
        return this.get('workflowInformation');
    }
}

export class WorkflowTerminationSalesForm extends FormGroup {
    constructor() {
        super({
            cause: new FormControl(null),
            comments: new FormControl(null),
            clientEvaluationConsultant: new FormControl(null),
            clientEvaluationProData: new FormControl(null),
            endDate: new FormControl(null)
        })

    }
    get cause() {
        return this.get('cause');
    }
    get comments() {
        return this.get('comments');
    }
    get clientEvaluationConsultant() {
        return this.get('clientEvaluationConsultant');
    }
    get clientEvaluationProData() {
        return this.get('clientEvaluationProData');
    }
    get endDate() {
        return this.get('endDate');
    }
}

// Sales step data
export class SideMenuTabsDto {
    name: string;
    displayName: string;
    index: number;
}

export const SideMenuTabs: SideMenuTabsDto[] = [
    {
        name: 'Workflow',
        displayName: 'Workflow',
        index: 1
    }
];

export const TopMenuTabs: SideMenuTabsDto[] = [
    {
        name: 'Overview',
        displayName: 'Overview',
        index: 0
    },
    {
        name: 'Workflow',
        displayName: 'Workflow',
        index: 0
    },
    // {
    //     name: 'Extension1',
    //     displayName: 'Extension 1',
    //     index: 1
    // },
    // {
    //     name: 'Extension2',
    //     displayName: 'Extension 2',
    //     index: 2
    // },
    // {
    //     name: 'Contracts',
    //     displayName: 'Contracts',
    //     index: 1
    // },
    // {
    //     name: 'Accounts',
    //     displayName: 'Accounts',
    //     index: 1
    // }
];

export interface IWorkflowNavigationStep {
    id: number;
    name: string;
    displayName: string;
    selected: boolean;
    finished: boolean;
    state: string;
    index: number;
}

export const WorkflowNavigation: IWorkflowNavigationStep[] = [
    {
        id: 1,
        name: 'Sales',
        displayName: 'Sales',
        selected: true,
        finished: false,
        state: '',
        index: 0
    },
    {
        id: 2,
        name: 'Contracts',
        displayName: 'Contracts',
        selected: false,
        finished: false,
        state: '',
        index: 0
    },
    {
        id: 3,
        name: 'Account',
        displayName: 'Account',
        selected: false,
        finished: false,
        state: '',
        index: 0
    },
    {
        id: 9997,
        name: 'Whatsnext',
        displayName: 'What\'s next?',
        selected: false,
        finished: false,
        state: '',
        index: 0
    },
    {
        id: 9998,
        name: 'CVupdate',
        displayName: 'CV update',
        selected: false,
        finished: false,
        state: '',
        index: 0
    },
    {
        id: 9999,
        name: 'ChangeinWFData',
        displayName: 'Change in WF Data',
        selected: false,
        finished: false,
        state: '',
        index: 0
    }
];

export const WorkflowList = [
    {
        id: 1,
        client: 'Martha Marikel',
        supplier: 'Martha Marikel',
        step: 'Sales',
        status: 'In progress',
        type: 'T&M',
        managers: [1,2],
        isDeleted: false
    },
    {
        id: 11,
        client: 'Martha Marikel',
        supplier: 'Martha Marikel',
        step: 'Sales',
        status: 'In progress',
        type: 'T&M',
        managers: [1,2],
        isDeleted: false
    },
    {
        id: 12,
        client: 'Martha Marikel',
        supplier: 'Martha Marikel',
        step: 'Contracts',
        status: 'In progress',
        type: 'Managed service',
        managers: [1,2],
        isDeleted: true
    }
];

// Workflow progress status

export class WorkflowProgressStatus implements IWorkflowProgressStatus {
    started: boolean | undefined;
    isExtensionAdded: boolean | undefined;
    currentlyActiveExtensionIndex: number | undefined;
    isExtensionCompleted: boolean | undefined;
    isExtensionSalesSaved: boolean | undefined;
    isExtensionContractsSaved: boolean | undefined;
    isWorkflowSalesSaved: boolean | undefined;
    isWorkflowContractsSaved: boolean | undefined;
    isWorkflowAccountsSaved: boolean | undefined;
    isPrimaryWorkflowCompleted: boolean | undefined;
    isTerminationAdded: boolean | undefined;
    currentlyActiveSection: number | undefined;
    currentlyActiveStep: number | undefined;

    constructor(
        started?: boolean,
        isExtensionAdded?: boolean,
        currentlyActiveExtensionIndex?: number,
        isExtensionCompleted?: boolean,
        isExtensionSalesSaved?: boolean,
        isExtensionContractsSaved?: boolean,
        isWorkflowSalesSaved?: boolean,
        isWorkflowContractsSaved?: boolean,
        isWorkflowAccountsSaved?: boolean,
        isPrimaryWorkflowCompleted?: boolean,
        isTerminationAdded?: boolean,
        currentlyActiveSection?: number,
        currentlyActiveStep?: number) {
            this.started = started;
            this.isExtensionAdded = isExtensionAdded;
            this.currentlyActiveExtensionIndex = currentlyActiveExtensionIndex;
            this.isExtensionCompleted = isExtensionCompleted;
            this.isExtensionSalesSaved = isExtensionSalesSaved;
            this.isExtensionContractsSaved = isExtensionContractsSaved;
            this.isWorkflowSalesSaved = isWorkflowSalesSaved;
            this.isWorkflowContractsSaved = isWorkflowContractsSaved;
            this.isWorkflowAccountsSaved = isWorkflowAccountsSaved;
            this.isPrimaryWorkflowCompleted = isPrimaryWorkflowCompleted;
            this.isTerminationAdded = isTerminationAdded;
            this.currentlyActiveSection = currentlyActiveSection;
            this.currentlyActiveStep = currentlyActiveStep;
    }
}

export interface IWorkflowProgressStatus {
    started: boolean | undefined,
    isExtensionAdded: boolean | undefined,
    isExtensionCompleted: boolean | undefined,
    isWorkflowSalesSaved: boolean | undefined,
    isPrimaryWorkflowCompleted: boolean | undefined,
    currentlyActiveSection: number | undefined,
    currentlyActiveStep: number | undefined,
}

export enum WorkflowSections {
    Overview = 1,
    Workflow = 2,
    Extension = 3,
    Termination = 4,
    ChangesInWF = 5
}

export enum WorkflowSteps {
    Sales = 1,
    Contracts = 2,
    Finance = 3
}


export const WorkflowStepList = [
    {
        id: 1,
        name: "Sales",
        isCompleted: false
    },
    {
        id: 2,
        name: "Contracts",
        isCompleted: false
    },
    {
        id: 3,
        name: "Finance",
        isCompleted: false
    }
]
