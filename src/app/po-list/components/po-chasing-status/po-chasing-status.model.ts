import { PurchaseOrderChasingStatus } from "src/shared/service-proxies/service-proxies";

export enum EPOChasingStatusColor {
    '#EF4444' = PurchaseOrderChasingStatus.ActionRequired,
    '#ef4444' = PurchaseOrderChasingStatus.CmNotified,
    '#FB9101' = PurchaseOrderChasingStatus.ClientAndAmNotified,
    '#fB9101' = PurchaseOrderChasingStatus.AmNotified,
    '#Fb9101' = PurchaseOrderChasingStatus.ClientNotified,
    '#A855F7' = PurchaseOrderChasingStatus.PendingOnClientSide,
    '#17A297' = PurchaseOrderChasingStatus.Received,
}
