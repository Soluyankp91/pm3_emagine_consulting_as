import { WorkflowProcessType } from "src/shared/service-proxies/service-proxies";

export interface ILatesChangesPayload {
    workflowId: string,
    entityName: string | undefined,
    propertyName: string | undefined,
    pageNumber: number,
    pageSize: number,
    sort: string
}

export interface ITableData {
    items: IHistoryItemDto[] | undefined,
    pageIndex: number,
    totalCount: number,
    pageSize: number,
}

export interface IHistoryItemDto {
    actionName?: string | undefined;
    entityName?: string | undefined;
    entityKey?: string | undefined;
    entityTooltip?: string | undefined;
    propertyName?: string | undefined;
    oldValueId?: string | undefined;
    oldValueDisplay?: string | undefined;
    oldValue?: string | undefined;
    newValueId?: string | undefined;
    newValueDisplay?: string | undefined;
    newValue?: string | undefined;
    workflowId?: string | undefined;
    clientPeriodId?: string | undefined;
    clientPeriodDisplayId?: string | undefined;
    clientPeriodTooltip?: string | undefined;
    workflowProcessType?: WorkflowProcessType;
    consultantPeriodId?: string | undefined;
    consultantId?: number | undefined;
    consultantName?: string | undefined;
    consultantExternalId?: string | undefined;
    clientId?: number | undefined;
    occurredAtUtc?: moment.Moment;
    employeeId?: number | undefined;
    employeeName?: string | undefined;
    employeeExternalId?: string | undefined;
}
