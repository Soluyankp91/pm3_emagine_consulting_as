import { FormArray, FormControl, FormGroup } from "@angular/forms";
import { SideNavigationParentItemDto } from "./workflow-extension/workflow-extension.model";

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
export class TopMenuTabsDto {
    name: string;
    displayName: string;
    index: number;
    additionalInfo: string | null;
}

// export const SideMenuTabs: TopMenuTabsDto[] = [
//     {
//         name: 'Workflow',
//         displayName: 'Workflow',
//         index: 1
//     }
// ];

export const TopMenuTabs: TopMenuTabsDto[] = [
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

export enum WorkflowProcessType {
    StartClientPeriod = 1,
    ChangeClientPeriod = 2,
    ExtendClientPeriod = 3,
    StartConsultantPeriod = 4,
    ChangeConsultantPeriod = 5,
    ExtendConsultantPeriod = 6
}

export enum WorkflowSideSections {
    StartWorkflow = 1,
    ExtendWorkflow = 2,
    TerminateWorkflow = 3,
    ChangeWorkflow = 4,
    AddConsultant = 5,
    TerminateConsultant = 6,
    ChangeConsultant = 7,
    ExtendConsultant = 8
}

export enum WorkflowSteps {
    Sales = 1,
    Contracts = 2,
    Finance = 3,
    Sourcing = 4
}

//#region side sections to Add
export const ExtendWorkflowDto: SideNavigationParentItemDto = {
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
            assignedPerson: 'Roberto Olberto',
            menuAnchors: [
                {
                    name: 'Main data',
                    value: 'mainData'
                },
                {
                    name: 'Client data',
                    value: 'clientData'
                },
                {
                    name: 'Consultant data',
                    value: 'consultantData'
                }
            ]
        },
        {
            id: 2,
            name: "ExtendContracts",
            displayName: "Contracts",
            enumStepValue: WorkflowSteps.Contracts,
            isCompleted: false,
            assignedPerson: 'Roberto Olberto',
            menuAnchors: [
                {
                    name: 'Main data',
                    value: 'mainData'
                },
                {
                    name: 'Client data',
                    value: 'clientData'
                },
                {
                    name: 'Consultant data',
                    value: 'consultantData'
                },
                {
                    name: 'Sync & legal contracts',
                    value: 'legalContracts'
                }
            ]
        }
    ]
};

export const ChangeWorkflowDto: SideNavigationParentItemDto = {
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
            assignedPerson: 'Roberto Olberto',
            menuAnchors: [
                {
                    name: 'Main data',
                    value: 'mainData'
                },
                {
                    name: 'Client data',
                    value: 'clientData'
                },
                {
                    name: 'Consultant data',
                    value: 'consultantData'
                }
            ]
        },
        {
            id: 2,
            name: "EditWorkflowContracts",
            displayName: "Contracts",
            enumStepValue: WorkflowSteps.Contracts,
            isCompleted: false,
            assignedPerson: 'Roberto Olberto',
            menuAnchors: [
                {
                    name: 'Main data',
                    value: 'mainData'
                },
                {
                    name: 'Client data',
                    value: 'clientData'
                },
                {
                    name: 'Consultant data',
                    value: 'consultantData'
                },
                {
                    name: 'Sync & legal contracts',
                    value: 'legalContracts'
                }
            ]
        }
    ]
};

export const TerminateWorkflowDto: SideNavigationParentItemDto = {
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
            assignedPerson: 'Roberto Olberto',
            menuAnchors: [
                {
                    name: 'Main data',
                    value: 'mainData'
                },
                {
                    name: 'Client data',
                    value: 'clientData'
                },
                {
                    name: 'Consultant data',
                    value: 'consultantData'
                }
            ]
        },
        {
            id: 2,
            name: "TerminateWorkflowContracts",
            displayName: "Contracts",
            enumStepValue: WorkflowSteps.Contracts,
            isCompleted: false,
            assignedPerson: 'Roberto Olberto',
            menuAnchors: [
                {
                    name: 'Main data',
                    value: 'mainData'
                },
                {
                    name: 'Client data',
                    value: 'clientData'
                },
                {
                    name: 'Consultant data',
                    value: 'consultantData'
                },
                {
                    name: 'Sync & legal contracts',
                    value: 'legalContracts'
                }
            ]
        }
    ]
};


export const AddConsultantDto: SideNavigationParentItemDto = {
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
            assignedPerson: 'Roberto Olberto',
            menuAnchors: [
                {
                    name: 'Main data',
                    value: 'mainData'
                },
                {
                    name: 'Consultant data',
                    value: 'consultantData'
                }
            ]
        },
        {
            id: 2,
            name: "AddConsultantContracts",
            displayName: "Contracts",
            enumStepValue: WorkflowSteps.Contracts,
            isCompleted: false,
            assignedPerson: 'Roberto Olberto',
            menuAnchors: [
                {
                    name: 'Main data',
                    value: 'mainData'
                },
                {
                    name: 'Consultant data',
                    value: 'consultantData'
                },
                {
                    name: 'Sync & legal contracts',
                    value: 'legalContracts'
                }
            ]
        },
        {
            id: 3,
            name: "AddConsultantFinance",
            displayName: "Finance",
            enumStepValue: WorkflowSteps.Finance,
            isCompleted: false,
            assignedPerson: 'Roberto Olberto',
            menuAnchors: []
        }
    ]
};

export const ChangeConsultantDto: SideNavigationParentItemDto = {
    displayName: 'Change Consultant',
    name: 'workflowEdit',
    sectionEnumValue: WorkflowSideSections.ChangeConsultant,
    responsiblePerson: 'Andersen Rasmus2',
    dateRange: '02.01.2021 - 31.12.2021',
    subItems: [
        {
            id: 1,
            name: "ChangeConsultantSales",
            displayName: "Sales",
            enumStepValue: WorkflowSteps.Sales,
            isCompleted: false,
            assignedPerson: 'Roberto Olberto',
            menuAnchors: [
                {
                    name: 'Main data',
                    value: 'mainData'
                },
                {
                    name: 'Consultant data',
                    value: 'consultantData'
                }
            ]
        },
        {
            id: 2,
            name: "ChangeConsultantContracts",
            displayName: "Contracts",
            enumStepValue: WorkflowSteps.Contracts,
            isCompleted: false,
            assignedPerson: 'Roberto Olberto',
            menuAnchors: [
                {
                    name: 'Main data',
                    value: 'mainData'
                },
                {
                    name: 'Consultant data',
                    value: 'consultantData'
                },
                {
                    name: 'Sync & legal contracts',
                    value: 'legalContracts'
                }
            ]
        }
    ]
};

export const ExtendConsultantDto: SideNavigationParentItemDto = {
    displayName: 'Extend Consultant',
    name: 'workflowStartOrExtend',
    sectionEnumValue: WorkflowSideSections.ExtendConsultant,
    responsiblePerson: 'Andersen Rasmus2',
    dateRange: '02.01.2021 - 31.12.2021',
    subItems: [
        {
            id: 1,
            name: "ExtendConsultantSales",
            displayName: "Sales",
            enumStepValue: WorkflowSteps.Sales,
            isCompleted: false,
            assignedPerson: 'Roberto Olberto',
            menuAnchors: [
                {
                    name: 'Main data',
                    value: 'mainData'
                },
                {
                    name: 'Consultant data',
                    value: 'consultantData'
                }
            ]
        },
        {
            id: 2,
            name: "ExtendConsultantContracts",
            displayName: "Contracts",
            enumStepValue: WorkflowSteps.Contracts,
            isCompleted: false,
            assignedPerson: 'Roberto Olberto',
            menuAnchors: [
                {
                    name: 'Main data',
                    value: 'mainData'
                },
                {
                    name: 'Consultant data',
                    value: 'consultantData'
                },
                {
                    name: 'Sync & legal contracts',
                    value: 'legalContracts'
                }
            ]
        }
    ]
};

export const TerminateConsultantDto: SideNavigationParentItemDto = {
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
            assignedPerson: 'Roberto Olberto',
            menuAnchors: [
                {
                    name: 'Main data',
                    value: 'mainData'
                },
                {
                    name: 'Client data',
                    value: 'clientData'
                },
                {
                    name: 'Consultant data',
                    value: 'consultantData'
                }
            ]
        },
        {
            id: 2,
            name: "TerminateConsultantContracts",
            displayName: "Contracts",
            enumStepValue: WorkflowSteps.Contracts,
            isCompleted: false,
            assignedPerson: 'Roberto Olberto',
            menuAnchors: [
                {
                    name: 'Main data',
                    value: 'mainData'
                },
                {
                    name: 'Client data',
                    value: 'clientData'
                },
                {
                    name: 'Consultant data',
                    value: 'consultantData'
                },
                {
                    name: 'Sync & legal contracts',
                    value: 'legalContracts'
                }
            ]
        },
        {
            id: 3,
            name: "TerminateConsultantSourcing",
            displayName: "Sourcing",
            enumStepValue: WorkflowSteps.Sourcing,
            isCompleted: false,
            assignedPerson: 'Roberto Olberto',
            menuAnchors: []
        }
    ]
};

//#endregion side section to add

export enum WorkflowDiallogAction {
    Add = 1,
    Change = 2,
    Extend = 3,
    Terminate = 4
}


// #region hardcoded grid
export enum WorkflowFlag {
    NewSales = 1,
    Extension = 2
}

export const WorkflowList = [
    {
        flag: WorkflowFlag.NewSales,
        id: 'bbba0f8b-3d76-4736-a839-954dc6ca0a13',

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
        flag: WorkflowFlag.NewSales,
        id: 'bbba0f8b-3d76-4736-a839-954dc6ca0a13',
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
        flag: WorkflowFlag.Extension,
        id: 'bbba0f8b-3d76-4736-a839-954dc6ca0a13',
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
        flag: WorkflowFlag.Extension,
        id: 'bbba0f8b-3d76-4736-a839-954dc6ca0a13',
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
        flag: WorkflowFlag.NewSales,
        id: 'bbba0f8b-3d76-4736-a839-954dc6ca0a13',
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
        flag: WorkflowFlag.NewSales,
        id: 'bbba0f8b-3d76-4736-a839-954dc6ca0a13',
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
        flag: WorkflowFlag.Extension,
        id: 'bbba0f8b-3d76-4736-a839-954dc6ca0a13',
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
