import { SortDirection } from "@angular/material/sort";
import { WorkflowStatus } from "src/shared/service-proxies/service-proxies";

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
    StartPeriod = 1,
    ChangePeriod = 2,
    ExtendPeriod = 3,
    Overview = 4

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

export interface ISelectableIdNameDto {
    id: number;
    name: string;
    selected: boolean;
}

export class SelectableIdNameDto implements ISelectableIdNameDto {
    id: number;
    name: string;
    selected: boolean;
    constructor(data?: ISelectableIdNameDto) {
        this.id = data?.id!;
        this.name = data?.name!;
        this.selected = data?.selected!;
    }
}

export enum SyncStatusIcon {
    'no-sync-icon' = 1,
    'new-sync-needed-icon'= 2,
    'synced-icon' = 3
}

export function getStatusIcon(status: number) {
    switch (status) {
        case WorkflowStatus.Active:
            return 'active-status';
        case WorkflowStatus.Pending:
            return 'pending-status';
        case WorkflowStatus.PendingDataMissing:
            return 'pending-data-missing-status';
        case WorkflowStatus.Finished:
            return 'finished-status';
        default:
            return '';
    }
}

export function getWorkflowStatus(status: number) {
    switch (status) {
        case WorkflowStatus.Active:
            return 'Active workflow';
        case WorkflowStatus.Pending:
            return 'Pending workflow';
        case WorkflowStatus.PendingDataMissing:
            return 'Pending - data missing';
        case WorkflowStatus.Finished:
            return 'Completed workflow';
        default:
            break;
    }
}

export const WorkflowStatusMenuList = [
    {
        id: 1,
        name: 'Pending',
        code: WorkflowStatus.Pending,
        icon: 'pending-status',
        selected: false
    },
    {
        id: 101,
        name: 'Pending - data missing',
        code: WorkflowStatus.PendingDataMissing,
        icon: 'pending-data-missing-status',
        selected: false
    }
];


export type MultiSortList = {
    order: number | null;
    column: string;
    direction: 'asc' | 'desc' | ''
}

export function MapSortingValues(values: { [key: string]: SortDirection }): MultiSortList[] {
    return Object.keys(values).map((k) => {
		return { column: k, order: null, direction: '' };
	});
}

export class WorkflowSourcingCreate {
	public requestId: number;
	public requestConsultantId: number;
	public existingWorkflowId: string | undefined;

	constructor(requestId: number, requestConsultantId: number, existingWorkflowId: string | undefined) {
		this.requestId = requestId;
		this.requestConsultantId = requestConsultantId;
		this.existingWorkflowId = existingWorkflowId;
	}
}

export enum ERateType {
    TimeBased = 1,
    Fixed = 2
}
