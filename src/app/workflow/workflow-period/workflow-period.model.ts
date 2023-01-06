import { ConsultantResultDto, EmployeeDto, StepType, WorkflowProcessType, WorkflowStepStatus } from "src/shared/service-proxies/service-proxies";

export class StepWithAnchorsDto {
    typeId?: StepType;
    name?: string | undefined;
    status?: WorkflowStepStatus;
    responsiblePerson?: EmployeeDto;
    actionsPermissionsForCurrentUser?: { [key: string]: boolean; } | undefined;
    menuAnchors?: StepAnchorDto[]
    constructor(data?: IStepWithAnchorsDto) {
        this.typeId = data?.typeId;
        this.name = data?.name;
        this.status = data?.status;
        this.responsiblePerson = data?.responsiblePerson;
        this.actionsPermissionsForCurrentUser = data?.actionsPermissionsForCurrentUser;
        this.menuAnchors = data?.menuAnchors;
    }
}

export interface IStepWithAnchorsDto {
    typeId?: StepType;
    name?: string | undefined;
    status?: WorkflowStepStatus;
    responsiblePerson?: EmployeeDto;
    actionsPermissionsForCurrentUser?: { [key: string]: boolean; } | undefined;
    menuAnchors?: StepAnchorDto[]
}

export class StepAnchorDto implements IStepAnchorDto {
    name?: string;
    anchor?: string;
    consultantName?: string;
    subItems?: SubItemDto[];
    constructor(data?: IStepAnchorDto) {
        this.name = data?.name;
        this.anchor = data?.anchor;
        this.consultantName = data?.consultantName;
        this.subItems = data?.subItems;
    }
}

export interface IStepAnchorDto {
    name?: string;
    anchor?: string;
    consultantName?: string;
    subItems?: SubItemDto[];
}

export class SubItemDto implements ISubItemDto {
    name?: string;
    anchor?: string;
    constructor(data?: IStepAnchorDto) {
        this.name = data?.name;
        this.anchor = data?.anchor;
    }
}

export interface ISubItemDto {
    name?: string;
    anchor?: string;
}

export class WorkflowProcessWithAnchorsDto implements IWorkflowProcessWithAnchorsDto {
    typeId?: WorkflowProcessType;
    name?: string | undefined;
    consultantPeriodId?: string | undefined;
    consultant?: ConsultantResultDto;
    periodStartDate?: moment.Moment | undefined;
    periodEndDate?: moment.Moment | undefined;
    terminationEndDate?: moment.Moment | undefined;
    steps?: StepWithAnchorsDto[] | undefined;
    constructor(data?: IWorkflowProcessWithAnchorsDto) {
        this.typeId = data?.typeId;
        this.name = data?.name;
        this.consultantPeriodId = data?.consultantPeriodId;
        this.consultant = data?.consultant;
        this.periodStartDate = data?.periodStartDate;
        this.periodEndDate = data?.periodEndDate;
        this.terminationEndDate = data?.terminationEndDate;
        this.steps = data?.steps;
    }
}

export interface IWorkflowProcessWithAnchorsDto {
    typeId?: WorkflowProcessType;
    name?: string | undefined;
    consultantPeriodId?: string | undefined;
    consultant?: ConsultantResultDto;
    periodStartDate?: moment.Moment | undefined;
    periodEndDate?: moment.Moment | undefined;
    terminationEndDate?: moment.Moment | undefined;
    steps?: StepWithAnchorsDto[] | undefined;
}

export const MainDataSections: SubItemDto[] = [
    {
        name: 'Project',
        anchor: 'salesMainProject'
    },
    {
        name: 'Invoicing',
        anchor: 'salesMainInvoicing'
    },
    {
        name: 'Account manager',
        anchor: 'salesMainAccountManager'
    }
];

export const ClientDataSections: SubItemDto[] = [
    {
        name: 'Client relation',
        anchor: 'salesClientRelation'
    },
    {
        name: 'Project duration',
        anchor: 'salesClientProjectDuration'
    },
    {
        name: 'Client invoicing',
        anchor: 'salesClientInvoicing'
    },
    {
        name: 'InvoicingNumber',
        anchor: 'salesClientInvoicingNumber'
    },
    {
        name: 'Rates and fees',
        anchor: 'salesClientRatesFees'
    },
    {
        name: 'Client evaluation',
        anchor: 'salesClientEvaluation'
    },
    {
        name: 'Client contract',
        anchor: 'salesClientContract'
    }
];
