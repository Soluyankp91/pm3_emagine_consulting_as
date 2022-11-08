import { EmployeeTenantNotificationItem } from "src/shared/service-proxies/service-proxies";

export class EmployeeNotifications {
    tenantId: number;
    tenantName: string;
    flag: string;
    notifications: EmployeeTenantNotificationItem[];

    constructor(tenantId: number, tenantName: string, flag: string, notifications: EmployeeTenantNotificationItem[]) {
        this.tenantId = tenantId;
        this.tenantName = tenantName;
        this.flag = flag;
        this.notifications = notifications;
    }
}

