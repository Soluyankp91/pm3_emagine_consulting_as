import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppCommonModule } from '../shared/common/app-common.module';
import { NgxGanttModule } from '@worktile/gantt';
import { WorkflowRoutingModule } from './workflow-routing.module';
import { CreateWorkflowDialogComponent } from './create-workflow-dialog/create-workflow-dialog.component';
import { ExtendWorkflowDialogComponent } from './extend-workflow-dialog/extend-workflow-dialog.component';
import { WorkflowActionsDialogComponent } from './workflow-actions-dialog/workflow-actions-dialog.component';
import { WorkflowChangeDialogComponent } from './workflow-change-dialog/workflow-change-dialog.component';
import { WorkflowConsultantActionsDialogComponent } from './workflow-consultant-actions-dialog/workflow-consultant-actions-dialog.component';
import { AddOrEditProjectLineDialogComponent } from './workflow-contracts/add-or-edit-project-line-dialog/add-or-edit-project-line-dialog.component';
import { WorkflowContractsComponent } from './workflow-contracts/workflow-contracts.component';
import { WorkflowDetailsComponent } from './workflow-details/workflow-details.component';
import { WorkflowFinancesComponent } from './workflow-finances/workflow-finances.component';
import { WorkflowOverviewComponent } from './workflow-overview/workflow-overview.component';
import { WorkflowPeriodComponent } from './workflow-period/workflow-period.component';
import { WorkflowSalesComponent } from './workflow-sales/workflow-sales.component';
import { WorkflowSourcingComponent } from './workflow-sourcing/workflow-sourcing.component';
import { WorkflowComponent } from './workflow.component';

@NgModule({
    declarations: [
        WorkflowComponent,
        WorkflowSalesComponent,
        WorkflowDetailsComponent,
        WorkflowContractsComponent,
        WorkflowOverviewComponent,
        WorkflowFinancesComponent,
        WorkflowChangeDialogComponent,
        ExtendWorkflowDialogComponent,
        WorkflowConsultantActionsDialogComponent,
        WorkflowActionsDialogComponent,
        CreateWorkflowDialogComponent,
        WorkflowSourcingComponent,
        WorkflowPeriodComponent,
        AddOrEditProjectLineDialogComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        WorkflowRoutingModule,
        AppCommonModule,
        NgxGanttModule
    ],
    exports: [],
    providers: [],
})
export class WorkflowModule {}