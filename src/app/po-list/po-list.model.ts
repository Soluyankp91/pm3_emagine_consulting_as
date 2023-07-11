import { AmountWithUnitOrCurrencyDto, ContactDto, EmployeeDto, PurchaseOrderCapDto, PurchaseOrderChasingStatus, PurchaseOrderChasingStatusHistoryDto, PurchaseOrderClientPeriodDto, PurchaseOrderCurrentContextDto, PurchaseOrderDocumentQueryDto, PurchaseOrderNoteStatus, PurchaseOrderQueryDto, PurchaseOrderStatus } from "src/shared/service-proxies/service-proxies";

export enum EPoBotttomActionsType {
    AssignEmaginePOResponsible = 1,
    AssignClientPOResponsible = 2,
    MarkAsCompleted = 3,
}
export interface Actions {
    label: string;
	actionType: EPoBotttomActionsType;
	actionIcon: string;
}

export interface IPoListPayload {
	invoicingEntities?: number[] | undefined;
	responsibleEmployees?: number[] | undefined;
	employeesTeamsAndDivisionsNodes?: number[] | undefined;
	employeesTenants?: number[] | undefined;
	chasingStatuses?: PurchaseOrderChasingStatus[] | undefined;
	statuses?: PurchaseOrderStatus[] | undefined;
	showCompleted?: boolean | undefined;
	search?: string | undefined;
	pageNumber?: number | undefined;
	pageSize?: number | undefined;
	sort?: string | undefined;
}

export interface IGridFilters {
    noteStatusIds?: number[] | undefined;
    chasingStatuses?: PurchaseOrderChasingStatus[] | undefined;
    clientIds?: number[] | undefined;
    clientContactIds?: number[] | undefined;
    consultantIds?: number[] | undefined;
    salesTypeIds?: number[] | undefined;
    deliveryTypeIds?: number[] | undefined;
    capTypeIds?: number[] | undefined;
    unitTypeId?: number | undefined;
    clientRateIds?: number[] | undefined;
    contractManagerIds?: number[] | undefined;
    salesManagerIds?: number[] | undefined;
}

export interface IPOGridData {
    id?: number | undefined;
    number?: string | undefined;
    numberMissingButRequired?: boolean | undefined;
    receiveDate?: moment.Moment | undefined;
    startDate?: moment.Moment | undefined;
    endDate?: moment.Moment | undefined;
    chasingStatus?: PurchaseOrderChasingStatus;
    status?: PurchaseOrderStatus;
    isCompleted?: boolean | undefined;
    capForInvoicing?: PurchaseOrderCapDto;
    notes?: string | undefined;
    isUnread?: boolean;
    notifyCM?: boolean;
    directClientIdReferencingThisPo?: number | undefined;
    directClientNameReferencingThisPo?: string | undefined;
    chasingStatusHistory?: PurchaseOrderChasingStatusHistoryDto[] | undefined;
    purchaseOrderCurrentContextData?: PurchaseOrderCurrentContextDto;
    workflowsIdsReferencingThisPo?: string[] | undefined;
    clientPeriodsReferencingThisPo?: IPOClientPeriodGridData[] | undefined;
    isLinkedToAnyProjectLine?: boolean | undefined;
    salesResponsible?: EmployeeDto;
    contractResponsible?: EmployeeDto;
    clientContactResponsible?: ContactDto;
    noteStatus?: PurchaseOrderNoteStatus;
    createdBy?: EmployeeDto;
    createdOnUtc?: moment.Moment | undefined;
    modifiedBy?: EmployeeDto;
    modifiedOnUtc?: moment.Moment | undefined;
    purchaseOrderDocumentQueryDto?: PurchaseOrderDocumentQueryDto;
    originalPOData: PurchaseOrderQueryDto | undefined;
}

export interface IPOClientPeriodGridData {
    clientPeriodId?: string;
    salesType?: string;
    deliveryType?: string;
    workflowId?: string;
    displayId?: string | undefined;
    consultants?: string[] | undefined;
    clientRate?: string;
    purchaseOrderCapClientCalculatedAmount?: string;
    estimatedUnitsLeft?: string;
    originalClientPeriodData: PurchaseOrderClientPeriodDto | undefined;
}
