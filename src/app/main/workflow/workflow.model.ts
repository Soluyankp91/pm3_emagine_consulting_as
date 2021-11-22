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
    // get extensionEndDate() {
    //     return this.get('extensionEndDate');
    // }
    // get noExtensionEndDate() {
    //     return this.get('noExtensionEndDate');
    // }
    // get workflowInformation() {
    //     return this.get('workflowInformation');
    // }
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

export const SaleTypes = [
    {
        id: 1,
        name: 'T&M'
    },
    {
        id: 2,
        name: 'Referred'
    },
    {
        id: 3,
        name: 'Managed Service'
    },
    {
        id: 4,
        name: 'Fee Only'
    },
    {
        id: 5,
        name: 'Recruitment'
    }
];

export const DeliveryTypes = [
    {
        id: 1,
        name: 'Managed Service'
    },
    {
        id: 2,
        name: 'Normal'
    },
    {
        id: 3,
        name: 'Offshore'
    },
    {
        id: 4,
        name: 'Nearshore'
    }
];

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
        index: 1
    },
    {
        name: 'Sales',
        displayName: 'Sales',
        index: 1
    },
    {
        name: 'Consultants',
        displayName: 'Consultants',
        index: 1
    },
    {
        name: 'Contracts',
        displayName: 'Contracts',
        index: 1
    },
    {
        name: 'Accounts',
        displayName: 'Accounts',
        index: 1
    }
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
        id: '6a3e6877-c26a-45e7-8a3d-21b7f002d66c',
        client: 'Martha Marikel',
        supplier: 'Martha Marikel',
        step: 'Sales',
        status: 'In progress',
        type: 'T&M',
        managers: [1,2],
        isDeleted: false
    },
    {
        id: '1112',
        client: 'Martha Marikel',
        supplier: 'Martha Marikel',
        step: 'Sales',
        status: 'In progress',
        type: 'T&M',
        managers: [1,2],
        isDeleted: false
    },
    {
        id: '1113',
        client: 'Martha Marikel',
        supplier: 'Martha Marikel',
        step: 'Contracts',
        status: 'In progress',
        type: 'Managed service',
        managers: [1,2],
        isDeleted: true
    }
];
