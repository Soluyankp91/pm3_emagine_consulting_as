import { EmployeeTenantNotificationItem } from "src/shared/service-proxies/service-proxies";

export class EmployeeNotifications {
    tenantId: number;
    tenantName: string;
    notifications: EmployeeTenantNotificationItem[];

    constructor(tenantId: number, tenantName: string, notifications: EmployeeTenantNotificationItem[]) {
        this.tenantId = tenantId;
        this.tenantName = tenantName;
        this.notifications = notifications;
    }
}

