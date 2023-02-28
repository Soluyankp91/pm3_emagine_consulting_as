import { ConsultantResultDto, EmployeeDto, StepType, WorkflowProcessType, WorkflowStepStatus } from "src/shared/service-proxies/service-proxies";
import { WorkflowTopSections } from "../workflow.model";

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
    menuAnchors?: StepAnchorDto[];
}

export class StepAnchorDto implements IStepAnchorDto {
    name?: string;
    anchor?: string;
    consultantName?: string;
    subItems?: SubItemDto[];
    anchorsOpened?: boolean;
    constructor(data?: IStepAnchorDto) {
        this.name = data?.name;
        this.anchor = data?.anchor;
        this.consultantName = data?.consultantName;
        this.subItems = data?.subItems;
        this.anchorsOpened = data?.anchorsOpened;
    }
}

export interface IStepAnchorDto {
    name?: string;
    anchor?: string;
    consultantName?: string;
    subItems?: SubItemDto[];
    anchorsOpened?: boolean;
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

export interface IConsultantAnchor {
    employmentType: number;
    name: string;
}

export const EProcessIcon: {[key: number]: string} =  {
    1: 'workflowAdd',
    4: 'workflowAdd',
    2: 'workflowEdit',
    5: 'workflowEdit',
    3: 'workflowStartOrExtend',
    6: 'workflowStartOrExtend',
    7: 'workflowTerminate',
    8: 'workflowTerminate'
}

export const SalesMainDataSections: SubItemDto[] = [
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
    },
    {
        name: 'Documents',
        anchor: 'salesMainDocuments'
    }
];

export const SalesClientDataSections: SubItemDto[] = [
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
        name: 'Frame agreement',
        anchor: 'salesFrameAgreement'
    },
    {
        name: 'Invoicing Number',
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

export const SalesPlaceholderConsultantAnchors: SubItemDto[] = [
    {
        name: 'Employment type',
        anchor: 'salesConsultantEmployment'
    }
];

export const SalesConsultantDataSections: SubItemDto[] = [
    {
        name: 'Employment type',
        anchor: 'salesConsultantEmployment'
    },
    {
        name: 'Contract duration',
        anchor: 'salesConsultantContractDuration'
    },
    {
        name: 'Consultant project',
        anchor: 'salesConsultantProject'
    },
    {
        name: 'Rates and fees',
        anchor: 'salesConsultantRatesFees'
    },
    {
        name: 'Consultant payment',
        anchor: 'salesConsultantPayment'
    },
    {
        name: 'Consultant contract',
        anchor: 'salesConsultantContract'
    },
    {
        name: 'Account manager',
        anchor: 'salesConsultantAccountManager'
    }
];


export const ContractMainDataSections: SubItemDto[] = [
    {
        name: 'Project',
        anchor: 'contractMainProject'
    },
    {
        name: 'Additional data',
        anchor: 'contractAdditionalData'
    },
    {
        name: 'Documents',
        anchor: 'contractDocuments'
    }
];

export const ContractClientDataSections: SubItemDto[] = [
    {
        name: 'Invoicing',
        anchor: 'contractClientInvoicing'
    },
    {
        name: 'Client contract',
        anchor: 'contractClientContract'
    },
    {
        name: 'Frame agreement',
        anchor: 'contractFrameAgreement'
    },
    {
        name: 'Rates and fees',
        anchor: 'contractClientRatesFees'
    }
];

export const ContractPlaceholderConsultantAnchors: SubItemDto[] = [
    {
        name: 'Employment type',
        anchor: 'contractConsultantEmployment'
    }
];

export const ContractConsultantDataSections: SubItemDto[] = [
    {
        name: 'Employemnt type',
        anchor: 'contractConsultantEmployment'
    },
    {
        name: 'Invoicing',
        anchor: 'contractConsultantInvoicing'
    },
    {
        name: 'Contract terms',
        anchor: 'contractConsultantContract'
    },
    {
        name: 'Payment',
        anchor: 'contractConsultantPayment'
    },
    {
        name: 'Rates and fees',
        anchor: 'contractConsultantRatesFees'
    },
    {
        name: 'Project lines',
        anchor: 'contractConsultantProjectLines'
    }
];

export const ContractSyncSections: SubItemDto[] = [
    {
        name: 'Sync',
        anchor: 'contractSyncMain'
    },
    {
        name: 'Client legal contract',
        anchor: 'contractSyncClientLegal'
    },
    {
        name: 'Consultant contract',
        anchor: 'contractSyncConsultantLegal'
    }
];

export const FinanceSections: SubItemDto[] = [
    {
        name: 'Client (debitor)',
        anchor: 'financeClientDebitor'
    },
    {
        name: 'Docuemnts',
        anchor: 'financeDocuments'
    },
    {
        name: 'Consultants',
        anchor: 'financeConsultants'
    }
];


export const SalesTerminationSections: SubItemDto[] = [
    {
        name: 'End of contact',
        anchor: 'salesTerminationEndOfContract'
    },
    {
        name: 'Final evaluation',
        anchor: 'salesTerminationFinalEvaluation'
    },
    {
        name: 'Documents',
        anchor: 'salesTerminationDocuments'
    }
];

export const ContractTerminationSections: SubItemDto[] = [
    {
        name: 'Finish contact in pm',
        anchor: 'contractTerminationFinishContract'
    },
    {
        name: 'Documents',
        anchor: 'contractTerminationDocuments'
    }
];

export class WorkflowPeriodResolverDto {
	workflowId: string;
	periodId: string;
}
