import { PurchaseOrderStatus } from "src/shared/service-proxies/service-proxies";

export enum EPOStatusIcon {
    'po-missing-icon' = PurchaseOrderStatus.Missing,
    'po-active-icon' = PurchaseOrderStatus.Active,
    'po-running-out-icon' = PurchaseOrderStatus.RunningOut,
}

export enum EPOStatusTooltip {
    'Missing' = PurchaseOrderStatus.Missing,
    'Active' = PurchaseOrderStatus.Active,
    'Running out' = PurchaseOrderStatus.RunningOut,
}
