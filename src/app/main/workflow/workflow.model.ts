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

export class WorkflowChangeForm extends FormGroup {
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
    additionalInfo: string | null;
}

// export const SideMenuTabs: SideMenuTabsDto[] = [
//     {
//         name: 'Workflow',
//         displayName: 'Workflow',
//         index: 1
//     }
// ];

export const TopMenuTabs: SideMenuTabsDto[] = [
    {
        name: 'Overview',
        displayName: 'Overview',
        index: 0,
        additionalInfo: null
    },
    {
        name: 'Workflow',
        displayName: 'Workflow',
        index: 0,
        additionalInfo: 'New'
    },
    // {
    //     name: 'Extension1',
    //     displayName: 'Extension 1',
    //     index: 0
    // },
    // {
    //     name: 'Extension2',
    //     displayName: 'Extension 2',
    //     index: 1
    // },
    // {
    //     name: 'Contracts',
    //     displayName: 'Contracts',
    //     index:
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

// Workflow progress status

export class WorkflowProgressStatus implements IWorkflowProgressStatus {
    started: boolean | undefined;

    isExtensionAdded: boolean | undefined;
    currentlyActiveExtensionIndex: number | undefined | null;
    numberOfAddedExtensions: number | undefined | null;
    lastSavedExtensionIndex: number | undefined | null;

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
    currentlyActiveSideSection: number | undefined;

    constructor(
        started?: boolean,

        isExtensionAdded?: boolean,
        currentlyActiveExtensionIndex?: number,
        numberOfAddedExtensions?: number,
        lastSavedExtensionIndex?: number,
        isExtensionCompleted?: boolean,
        isExtensionSalesSaved?: boolean,
        isExtensionContractsSaved?: boolean,

        isWorkflowSalesSaved?: boolean,
        isWorkflowContractsSaved?: boolean,
        isWorkflowAccountsSaved?: boolean,
        isPrimaryWorkflowCompleted?: boolean,

        isTerminationAdded?: boolean,
        currentlyActiveSection?: number,
        currentlyActiveStep?: number,
        currentlyActiveSideSection?: number) {
            this.started = started;

            this.isExtensionAdded = isExtensionAdded;
            this.currentlyActiveExtensionIndex = currentlyActiveExtensionIndex;
            this.numberOfAddedExtensions = numberOfAddedExtensions;
            this.lastSavedExtensionIndex = lastSavedExtensionIndex;
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
            this.currentlyActiveSideSection = currentlyActiveSideSection;
    }
}

export interface IWorkflowProgressStatus {
    started: boolean | undefined,

    isExtensionAdded: boolean | undefined;
    currentlyActiveExtensionIndex: number | undefined | null;
    numberOfAddedExtensions: number | undefined | null;
    lastSavedExtensionIndex: number | undefined | null;

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
    currentlyActiveSideSection: number | undefined;
}

export enum WorkflowTopSections {
    Overview = 1,
    Workflow = 2,
    Extension = 3,
    Termination = 4,
    ChangesInWF = 5
}

export enum WorkflowSideSections {
    StartWorkflow = 1,
    ExtendWorkflow = 2,
    TerminateWorkflow = 3,
    ChangeWorkflow = 4,
    AddConsultant = 5,
    TerminateConsultant = 6
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




export const WorkflowList = [
    {
        id: 1,
        client: 'Martha Marikel',
        consultants: [
            { name: 'Martha Marikel' },
            { name: 'John Doe'}
        ],
        salesType: 'T&M',
        deliveryType: 'Offshore',
        startDate: new Date(2021, 4, 2),
        endDate: new Date(2021, 5, 3),
        step: 'Sales',
        openProcess: [null, WorkflowSideSections.StartWorkflow],
        status: 'In progress',
        managers: [1,2],
        isDeleted: false
    },
    {
        id: 11,
        client: 'Martha Marikel',
        consultants: [
            { name: 'Martha Marikel'}
        ],
        salesType: 'T&M',
        deliveryType: 'Nearshore',
        startDate: new Date(2021, 2, 1),
        endDate: new Date(2021, 5, 3),
        step: 'Sales',
        openProcess: [WorkflowSideSections.ExtendWorkflow, null],
        status: 'In progress',
        managers: [1,2],
        isDeleted: false
    },
    {
        id: 123,
        client: 'Martha Marikel',
        consultants: [
            { name: 'Martha Marikel' },
            { name: 'Van Trier Mia' },
            { name: 'Robertsen Oscar'}
        ],
        salesType: 'Managed service',
        deliveryType: 'Managed Service',
        startDate: new Date(2021, 2, 15),
        endDate: new Date(2022, 11, 25),
        step: 'Contracts',
        openProcess: [WorkflowSideSections.TerminateWorkflow],
        status: 'In progress',
        managers: [1,2],
        isDeleted: true
    },
    {
        id: 124,
        client: 'Martha Marikel',
        consultants: [
            { name: 'Martha Marikel' },
            { name: 'Van Trier Mia' },
            { name: 'Robertsen Oscar'}
        ],
        salesType: 'Managed service',
        deliveryType: 'Managed Service',
        startDate: new Date(2021, 2, 15),
        endDate: new Date(2022, 11, 25),
        step: 'Contracts',
        openProcess: [WorkflowSideSections.ChangeWorkflow],
        status: 'In progress',
        managers: [1,2],
        isDeleted: true
    },
    {
        id: 152,
        client: 'Martha Marikel',
        consultants: [
            { name: 'Martha Marikel' },
            { name: 'Van Trier Mia' },
            { name: 'Robertsen Oscar'}
        ],
        salesType: 'Managed service',
        deliveryType: 'Managed Service',
        startDate: new Date(2021, 2, 15),
        endDate: new Date(2022, 11, 25),
        step: 'Contracts',
        openProcess: [WorkflowSideSections.AddConsultant, WorkflowSideSections.ChangeWorkflow],
        status: 'In progress',
        managers: [1,2],
        isDeleted: true
    },
    {
        id: 1212,
        client: 'Martha Marikel',
        consultants: [
            { name: 'Martha Marikel' },
            { name: 'Van Trier Mia' },
            { name: 'Robertsen Oscar'}
        ],
        salesType: 'Managed service',
        deliveryType: 'Managed Service',
        startDate: new Date(2021, 2, 15),
        endDate: new Date(2022, 11, 25),
        step: 'Contracts',
        openProcess: [WorkflowSideSections.TerminateConsultant],
        status: 'In progress',
        managers: [1,2],
        isDeleted: true
    },
    {
        id: 1212,
        client: 'Martha Marikel',
        consultants: [
            { name: 'Martha Marikel' },
            { name: 'Van Trier Mia' },
            { name: 'Robertsen Oscar'}
        ],
        salesType: 'Managed service',
        deliveryType: 'Managed Service',
        startDate: new Date(2021, 2, 15),
        endDate: new Date(2022, 11, 25),
        step: 'Contracts',
        openProcess: null,
        status: 'In progress',
        managers: [1,2],
        isDeleted: true
    }
];
