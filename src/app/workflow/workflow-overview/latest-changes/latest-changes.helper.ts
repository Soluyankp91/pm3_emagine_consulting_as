import { HistoryPropertiesDto } from "src/shared/service-proxies/service-proxies";
import { IHistoryItemDto } from "./latest-changes.model";

export function MapLatestChanges(list: HistoryPropertiesDto[]): IHistoryItemDto[] {
    return list.map((item) => {
        return {
            actionName: item.actionName,
            entityName: MapEntityName(item.entityName, item.entityKey),
            entityKey: JSON.stringify(item.entityKey),
            entityTooltip: MapEntityName(item.entityName, item.entityKey, true),
            propertyName: item.propertyName,
            oldValueId: item.oldValueId,
            oldValueDisplay: item.oldValueDisplay,
            oldValue: MapChangedValue(item.oldValueDisplay, item.oldValueId),
            newValueId: item.newValueId,
            newValueDisplay: item.newValueDisplay,
            newValue: MapChangedValue(item.newValueDisplay, item.newValueId),
            workflowId: item.workflowId,
            clientPeriodId: item.clientPeriodId,
            clientPeriodDisplayId: item.clientPeriodDisplayId,
            clientPeriodTooltip: item.clientPeriodTooltip,
            workflowProcessType: item.workflowProcessType,
            consultantPeriodId: item.consultantPeriodId,
            consultantId: item.consultantId,
            consultantName: item.consultantName,
            consultantExternalId: item.consultantExternalId,
            clientId: item.clientId,
            occurredAtUtc: item.occurredAtUtc,
            employeeId: item.employeeId,
            employeeName: item.employeeName,
            employeeExternalId: item.employeeExternalId,
        } as IHistoryItemDto;
    });
}

export function MapEntityName(
    entityName: string,
    entityKey: { [key: string]: string } | undefined,
    isTooltip: boolean = false
): string {
    let result = '';
    let entityKeys: string[] = [];
    result = entityName;
    Object.keys(entityKey).forEach((key) => {
        entityKeys.push(isTooltip ? `${key}: ${entityKey[key]}` : entityKey[key]);
    });
    result += ` (${entityKeys.filter(Boolean).join(', ')})`;
    return result;
}

export function MapChangedValue(valueDisplay: string, valueId: string) {
    let result = valueDisplay;
    if (valueDisplay !== valueId) {
        result += ` (Id: ${valueId})`;
    }
    return result;
}
