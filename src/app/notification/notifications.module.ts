import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppCommonModule } from '../shared/common/app-common.module';
import { NgxGanttModule } from '@worktile/gantt';
import { NotificationRoutingModule } from './notifications-routing.module';
import { NotificationComponent } from './notification.component';

@NgModule({
    declarations: [
        NotificationComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        NotificationRoutingModule,
        AppCommonModule,
        NgxGanttModule
    ],
    exports: [],
    providers: [],
})
export class NotificationsModule {}