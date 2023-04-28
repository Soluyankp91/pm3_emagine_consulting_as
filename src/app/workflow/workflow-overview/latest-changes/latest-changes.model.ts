import { HistoryPropertiesDto } from "src/shared/service-proxies/service-proxies";

export interface ILatesChangesPayload {
    workflowId: string,
    entityName: string | undefined,
    propertyName: string | undefined,
    pageNumber: number,
    pageSize: number,
    sort: string
}

export interface ITableData {
    items: HistoryPropertiesDto[] | undefined,
    pageIndex: number,
    totalCount: number,
    pageSize: number,
}
