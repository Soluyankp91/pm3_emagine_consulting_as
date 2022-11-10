import { FormArray, FormControl, FormGroup } from "@angular/forms";
import { MatDialogConfig } from "@angular/material/dialog";
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
    stepSpecificPermissions: { [key: string]: boolean } | undefined;

    currentlyActiveSection: number | undefined;
    currentlyActiveStep: number | undefined;
    currentlyActiveSideSection: number | undefined;
    currentlyActivePeriodId: string | undefined;

    constructor(
        started?: boolean,
        currentStepIsCompleted?: boolean,
        currentStepIsForcefullyEditing?: boolean,
        stepSpecificPermissions?: { [key: string]: boolean } | undefined,
        currentlyActiveSection?: number,
        currentlyActiveStep?: number,
        currentlyActiveSideSection?: number,
        currentlyActivePeriodId?: string) {
            this.started = started;

            this.currentStepIsCompleted = currentStepIsCompleted;
            this.currentStepIsForcefullyEditing = currentStepIsForcefullyEditing;
            this.stepSpecificPermissions = stepSpecificPermissions;
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

export interface ISelectableEmployeeDto {
    id: number | string;
    name: string;
    externalId: string;
    selected: boolean;
}

export class SelectableEmployeeDto implements ISelectableEmployeeDto {
    id: number | string;
    name: string;
    externalId: string;
    selected: boolean;
    constructor(data?: ISelectableEmployeeDto) {
        this.id = data?.id!;
        this.name = data?.name!;
        this.externalId = data?.externalId!;
        this.selected = data?.selected!;
    }
}

export enum EmploymentTypes {
    FreelanceConsultant = 1,
    SupplierConsultant = 2,
    TemporaryWorker = 3,
    ProjectEmployee = 4,
    InternalEmployee = 5,
    Nearshore = 6,
    VMSOrReferred = 7,
    EConsultant = 8,
    CivilLawConsultant = 9,
    FeeOnly = 10,
    Recruitment = 11
}

export const StepTypes = [
    {
        id: 0,
        name: 'All'
    },
    {
        id: 1,
        name: 'Sales'
    },
    {
        id: 2,
        name: 'Contract'
    },
    {
        id: 3,
        name: 'Finance'
    },
    {
        id: 4,
        name: 'Sourcing'
    }
];

export const DialogConfig: MatDialogConfig = {
    minWidth: '450px',
    minHeight: '180px',
    height: 'auto',
    width: 'auto',
    backdropClass: 'backdrop-modal--wrapper',
    autoFocus: false,
    panelClass: 'confirmation-modal'
}
