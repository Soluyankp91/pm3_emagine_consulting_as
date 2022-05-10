import { FormArray, FormGroup } from "@angular/forms";

export class NotificationTenantsForm extends FormGroup {
    constructor() {
        super({
            tenants: new FormArray([])
        })

    }
    get tenants() {
        return this.get('tenants') as FormArray;
    }
}

export class EmployeeNotifications {
    tenantId: number;
    notifications: EmployeeNotificationList[];
}

export class EmployeeNotificationList {
    notificationId: number;
    notificationName: string;
    enabled: boolean;
}

export const NotificationResponse: EmployeeNotifications[] = [
    {
        tenantId: 1,
        notifications: [
        {
            notificationId: 1,
            notificationName: "Consultant started",
            enabled: true
        },
        {
            notificationId: 2,
            notificationName: "Consultant extension created",
            enabled: false
        }
        ]
    },
    {
        tenantId: 2,
        notifications: [
        {
            notificationId: 1,
            notificationName: "Consultant started",
            enabled: false
        },
        {
            notificationId: 2,
            notificationName: "Consultant extension created",
            enabled: false
        }
        ]
    },
    {
        tenantId: 4,
        notifications: [
        {
            notificationId: 1,
            notificationName: "Consultant started",
            enabled: true
        },
        {
            notificationId: 2,
            notificationName: "Consultant extension created",
            enabled: false
        }
        ]
    },
    {
        tenantId: 8,
        notifications: [
        {
            notificationId: 1,
            notificationName: "Consultant started",
            enabled: false
        },
        {
            notificationId: 2,
            notificationName: "Consultant extension created",
            enabled: false
        }
        ]
    },
    {
        tenantId: 10,
        notifications: [
        {
            notificationId: 1,
            notificationName: "Consultant started",
            enabled: false
        },
        {
            notificationId: 2,
            notificationName: "Consultant extension created",
            enabled: false
        }
        ]
    },
    {
        tenantId: 17,
        notifications: [
        {
            notificationId: 1,
            notificationName: "Consultant started",
            enabled: false
        },
        {
            notificationId: 2,
            notificationName: "Consultant extension created",
            enabled: false
        }
        ]
    },
    {
        tenantId: 25,
        notifications: [
        {
            notificationId: 1,
            notificationName: "Consultant started",
            enabled: false
        },
        {
            notificationId: 2,
            notificationName: "Consultant extension created",
            enabled: false
        }
        ]
    },
    {
        tenantId: 27,
        notifications: [
        {
            notificationId: 1,
            notificationName: "Consultant started",
            enabled: false
        },
        {
            notificationId: 2,
            notificationName: "Consultant extension created",
            enabled: false
        }
        ]
    }
];