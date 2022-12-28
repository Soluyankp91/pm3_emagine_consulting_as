import { Component, Injector, OnInit } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { AppComponentBase } from 'src/shared/app-component-base';
import { MapFlagFromTenantId, MapTenantNameFromId } from 'src/shared/helpers/tenantHelper';
import { EmployeeNotificationServiceProxy, EmployeeTenantNotificationItem, EnumEntityTypeDto } from 'src/shared/service-proxies/service-proxies';
import { EmployeeNotifications } from './notification.model';

@Component({
    selector: 'app-notification',
    templateUrl: './notification.component.html',
    styleUrls: ['./notification.component.scss']
})
export class NotificationComponent extends AppComponentBase implements OnInit {
    tenantWithNotifications: EmployeeNotifications[] = [];
    constructor(
        injector: Injector,
        private _notificationService: EmployeeNotificationServiceProxy
    ) {
        super(injector);
    }

    ngOnInit(): void {
        this.getNotifications();
    }

    getNotifications() {
        this.showMainSpinner();
        this._notificationService.enabledNotifications()
            .pipe(finalize(() => {
                this.hideMainSpinner();
            }))
            .subscribe(result => {
                this.tenantWithNotifications = result.map(x => {
                    return new EmployeeNotifications(x.tenantId!, MapTenantNameFromId(x.tenantId!), MapFlagFromTenantId(x.tenantId!), x.notifications!);
                });
            })
    }

    tenantTrackBy(index: number, item: EmployeeNotifications) {
        return item.tenantId;
    }

    notificationTrackBy(index: number, item: EmployeeTenantNotificationItem) {
        return item.notificationId;
    }

    allChecked(tenantId: number) {
        const tenant = this.tenantWithNotifications.find(x => x.tenantId === tenantId)!;
        return tenant?.notifications?.every(x => x.enabled) ?? false;
    }

    someChecked(tenantId: number) {
        const tenant = this.tenantWithNotifications.find(x => x.tenantId === tenantId)!;
        return tenant?.notifications?.filter(x => x.enabled).length! > 0 && !tenant.notifications?.every(x => x.enabled);
    }

    checkAll(value: boolean, tenantId: number) {
        const tenant = this.tenantWithNotifications.find(x => x.tenantId === tenantId);
        tenant?.notifications?.forEach(x => {
            x.enabled = value
            if (value) {
                this.addNotification(x.notificationId!, tenantId);
            } else {
                this.deleteNotification(x.notificationId!, tenantId);
            }
        });
    }

    changeEmployeeNotification(isChecked: boolean, notification: EmployeeTenantNotificationItem, tenantId: number | undefined) {
        notification.enabled = isChecked;
        if (isChecked) {
            this.addNotification(notification.notificationId!, tenantId);
        } else {
            this.deleteNotification(notification.notificationId!, tenantId);
        }
    }

    addNotification(notificationId: number, tenantId: number | undefined) {
        this._notificationService.addNotification(notificationId, tenantId)
            .pipe(finalize(() => {}))
            .subscribe();
    }

    deleteNotification(notificationId: number, tenantId: number | undefined) {
        this._notificationService.removeNotification(notificationId, tenantId)
            .pipe(finalize(() => {}))
            .subscribe();
    }

}
