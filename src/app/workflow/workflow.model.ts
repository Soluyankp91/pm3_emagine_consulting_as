import { FormArray, FormControl, FormGroup } from "@angular/forms";
import { EnumEntityTypeDto, WorkflowProcessType } from "src/shared/service-proxies/service-proxies";

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

    currentStepIsCompleted: boolean | undefined;
    currentStepIsForcefullyEditing: boolean | undefined;

    currentlyActiveSection: number | undefined;
    currentlyActiveStep: number | undefined;
    currentlyActiveSideSection: number | undefined;
    currentlyActivePeriodId: string | undefined;

    constructor(
        started?: boolean,
        currentStepIsCompleted?: boolean,
        currentStepIsForcefullyEditing?: boolean,
        currentlyActiveSection?: number,
        currentlyActiveStep?: number,
        currentlyActiveSideSection?: number,
        currentlyActivePeriodId?: string) {
            this.started = started;

            this.currentStepIsCompleted = currentStepIsCompleted;
            this.currentStepIsForcefullyEditing = currentStepIsForcefullyEditing;

            this.currentlyActiveSection = currentlyActiveSection;
            this.currentlyActiveStep = currentlyActiveStep;
            this.currentlyActiveSideSection = currentlyActiveSideSection;
            this.currentlyActivePeriodId = currentlyActivePeriodId;
    }
}

export interface IWorkflowProgressStatus {
    started: boolean | undefined,

    currentlyActiveSection: number | undefined;
    currentlyActiveStep: number | undefined;
    currentlyActiveSideSection: number | undefined;
}

export enum WorkflowTopSections {
    Overview = 1,
    StartPeriod = 2,
    ExtendPeriod = 3,
    ChangePeriod = 5
}

export enum WorkflowSteps {
    Sales = 1,
    Contracts = 2,
    Finance = 3,
    Sourcing = 4
}

export enum WorkflowDiallogAction {
    AddConsultant = 1,
    Change = 2,
    Extend = 3,
    Terminate = 4
}

export enum ProjectLineDiallogMode {
    Create = 1,
    Edit = 2
}

// #region hardcoded grid
export enum WorkflowFlag {
    NewSales = 1,
    Extension = 2
}

export const WorkflowList = [
    {
        flag: WorkflowFlag.NewSales,
        id: 'bb028a73-4a3c-4088-9722-53511b30c0f5',

        client: 'new WF',
        consultants: [
            { name: 'Martha Marikel' },
            { name: 'John Doe'}
        ],
        salesType: 'T&M',
        deliveryType: 'Offshore',
        startDate: new Date(2021, 4, 2),
        endDate: new Date(2021, 5, 3),
        step: 'Sales',
        openProcess: [null, WorkflowProcessType.StartClientPeriod],
        status: 'In progress',
        managers: [1,2],
        isDeleted: false
    },
    {
        flag: WorkflowFlag.NewSales,
        id: '37c3da55-1242-4940-ba42-f990712be7b1',

        client: 'completed WF',
        consultants: [
            { name: 'Martha Marikel' },
            { name: 'John Doe'}
        ],
        salesType: 'T&M',
        deliveryType: 'Offshore',
        startDate: new Date(2021, 4, 2),
        endDate: new Date(2021, 5, 3),
        step: 'Sales',
        openProcess: [null, WorkflowProcessType.StartClientPeriod],
        status: 'In progress',
        managers: [1,2],
        isDeleted: false
    },
    {
        flag: WorkflowFlag.NewSales,
        id: 'B54D53F1-3514-48F8-98FA-0523B5AE1F14',

        client: 'many extensions',
        consultants: [
            { name: 'Martha Marikel' },
            { name: 'John Doe'}
        ],
        salesType: 'T&M',
        deliveryType: 'Offshore',
        startDate: new Date(2021, 4, 2),
        endDate: new Date(2021, 5, 3),
        step: 'Sales',
        openProcess: [null, WorkflowProcessType.StartClientPeriod],
        status: 'In progress',
        managers: [1,2],
        isDeleted: false
    },
    {
        flag: WorkflowFlag.NewSales,
        id: 'E469E5E0-E0D8-425B-8FEF-47CC6148C319',
        client: 'start + 2 extend',
        consultants: [
            { name: 'Martha Marikel'}
        ],
        salesType: 'T&M',
        deliveryType: 'Nearshore',
        startDate: new Date(2021, 2, 1),
        endDate: new Date(2021, 5, 3),
        step: 'Sales',
        openProcess: [WorkflowProcessType.ExtendClientPeriod, null],
        status: 'In progress',
        managers: [1,2],
        isDeleted: false
    },
    {
        flag: WorkflowFlag.Extension,
        id: 'FFDBABC6-B7A9-4169-8C03-023063EB3E3C',
        client: 'Terminated wf test',
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
        openProcess: [WorkflowProcessType.TerminateWorkflow],
        status: 'In progress',
        managers: [1,2],
        isDeleted: true
    },
    {
        flag: WorkflowFlag.Extension,
        id: '71A3D92E-7A51-4B49-A702-02877B34144B',
        client: 'terminated test2',
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
        openProcess: [WorkflowProcessType.ChangeClientPeriod],
        status: 'In progress',
        managers: [1,2],
        isDeleted: true
    },
    {
        flag: WorkflowFlag.NewSales,
        id: 'da2a75fe-2607-42de-a129-b341d927e45f',
        client: 'My WF',
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
        openProcess: [WorkflowProcessType.StartConsultantPeriod, WorkflowProcessType.ChangeClientPeriod],
        status: 'In progress',
        managers: [1,2],
        isDeleted: true
    },
    {
        flag: WorkflowFlag.NewSales,
        id: 'b5cd880a-c94e-4dee-a5b0-de7184582a31',
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
        openProcess: [WorkflowProcessType.TerminateConsultant],
        status: 'In progress',
        managers: [1,2],
        isDeleted: true
    },
    {
        flag: WorkflowFlag.Extension,
        id: 'b5cd880a-c94e-4dee-a5b0-de7184582a31',
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

// #endrefion hardcoded grid
