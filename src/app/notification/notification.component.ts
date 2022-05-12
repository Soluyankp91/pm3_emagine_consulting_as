import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { EmployeeNotificationServiceProxy, EnumEntityTypeDto } from 'src/shared/service-proxies/service-proxies';
import { InternalLookupService } from '../shared/common/internal-lookup.service';
import { EmployeeNotificationList, EmployeeNotifications, NotificationResponse, NotificationTenantsForm } from './notification.model';

@Component({
    selector: 'app-notification',
    templateUrl: './notification.component.html',
    styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit {
    tenantList: EnumEntityTypeDto[] = [];
    notificationTenantsForm: NotificationTenantsForm;
    tenantWithNotifications = NotificationResponse;
    constructor(
        private _internalLookupService: InternalLookupService,
        private _fb: FormBuilder,
        private _notificationService: EmployeeNotificationServiceProxy
    ) {
        this.notificationTenantsForm = new NotificationTenantsForm();
    }

    ngOnInit(): void {
        // this.getTenants();
        // this.getNotifications();
    }

    getNotifications() {
        this._notificationService.enabledNotifications()
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                console.log(result);
            })
    }

    getTenants() {
        this._internalLookupService.getTenants()
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.tenantList = result;
                this.tenantList.forEach(tenant => {
                    this.addTenantToForm(tenant);
                });
            });
    }

    addTenantToForm(tenant: EnumEntityTypeDto) {
        const form = this._fb.group({
            tenantMasterCheckbox: new FormControl(false),
            tenantId: new FormControl(tenant.id),
            tenantName: new FormControl(tenant.name),
            consultantNotifications: this._fb.group({
                ConsultantStart: new FormControl(false),
                ConsultantExtension: new FormControl(false),
            }),
        });
        this.notificationTenantsForm.tenants.push(form);
    }

    allChecked(tenantId: number) {
        const tenant = this.tenantWithNotifications.find(x => x.tenantId === tenantId)!;
        return tenant.notifications.every(x => x.enabled);
    }
    
    someChecked(tenantId: number) {
        const tenant = this.tenantWithNotifications.find(x => x.tenantId === tenantId)!;
        return tenant?.notifications.filter(x => x.enabled).length > 0 && !tenant.notifications.every(x => x.enabled);
    }

    checkAll(value: boolean, tenantId: number) {
        const tenant = this.tenantWithNotifications.find(x => x.tenantId === tenantId);
        tenant?.notifications.forEach(x => {
            x.enabled = value
            if (value) {
                this.addNotification(x.notificationId, tenantId);
            } else {
                this.deleteNotification(x.notificationId, tenantId);
            }
        });
    }

    changeEmployeeNotification(isChecked: boolean, notification: EmployeeNotificationList, tenantId: number) {
        notification.enabled = isChecked;
        if (isChecked) {
            this.addNotification(notification.notificationId, tenantId);
        } else {
            this.deleteNotification(notification.notificationId, tenantId);
        }
    }

    addNotification(notificationId: number, tenantId: number) {
        this._notificationService.addNotification(notificationId, tenantId)
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                console.log(result);
            })
    }

    deleteNotification(notificationId: number, tenantId: number) {
        this._notificationService.removeNotification(notificationId, tenantId)
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                console.log(result);
            })
    }

}
