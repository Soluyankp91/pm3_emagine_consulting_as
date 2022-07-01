import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainOverviewComponent } from './main-overview.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OverviewRoutingModule } from './overview-routing.module';
import { AppCommonModule } from '../shared/common/app-common.module';
import { NgxGanttModule } from '@worktile/gantt';
import { AppGanttFlatComponent } from './gantt-advanced/component/flat.component';
import { AppGanttAdvancedExampleComponent } from './gantt-advanced/gantt-advanced.component';

@NgModule({
    declarations: [
        MainOverviewComponent,
        AppGanttFlatComponent,
        AppGanttAdvancedExampleComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        OverviewRoutingModule,
        AppCommonModule,
        NgxGanttModule
    ],
    exports: [],
    providers: [],
})
export class OverviewModule {}
