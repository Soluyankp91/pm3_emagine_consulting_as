import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppCommonModule } from '../shared/common/app-common.module';
import { NgxGanttModule } from '@worktile/gantt';
import { WorkflowRoutingModule } from './workflow-routing.module';
import { CreateWorkflowDialogComponent } from './create-workflow-dialog/create-workflow-dialog.component';
import { WorkflowActionsDialogComponent } from './workflow-actions-dialog/workflow-actions-dialog.component';
import { WorkflowConsultantActionsDialogComponent } from './workflow-consultant-actions-dialog/workflow-consultant-actions-dialog.component';
import { AddOrEditProjectLineDialogComponent } from './workflow-contracts/add-or-edit-project-line-dialog/add-or-edit-project-line-dialog.component';
import { WorkflowContractsComponent } from './workflow-contracts/workflow-contracts.component';
import { WorkflowDetailsComponent } from './workflow-details/workflow-details.component';
import { WorkflowFinancesComponent } from './workflow-finances/workflow-finances.component';
import { WorkflowOverviewComponent } from './workflow-overview/workflow-overview.component';
import { WorkflowPeriodComponent } from './workflow-period/workflow-period.component';
import { WorkflowSalesComponent } from './workflow-sales/workflow-sales.component';
import { WorkflowSourcingComponent } from './workflow-sourcing/workflow-sourcing.component';
import { WorkflowComponent, WorkflowCreateResolver } from './workflow.component';
import { GanttChartComponent } from './workflow-overview/gantt-chart/gantt-chart.component';
import { WorkflowNotesComponent } from './workflow-notes/workflow-notes.component';
import { RateAndFeesWarningsDialogComponent } from './rate-and-fees-warnings-dialog/rate-and-fees-warnings-dialog.component';
import { MainDataComponent } from './workflow-sales/main-data/main-data.component';
import { ClientDataComponent } from './workflow-sales/client-data/client-data.component';
import { ConsultantDataComponent } from './workflow-sales/consultant-data/consultant-data.component';
import { ContractsConsultantDataComponent } from './workflow-contracts/contracts-consultant-data/contracts-consultant-data.component';
import { ContractsMainDataComponent } from './workflow-contracts/contracts-main-data/contracts-main-data.component';
import { ContractsSyncDataComponent } from './workflow-contracts/contracts-sync-data/contracts-sync-data.component';
import { ContractsClientDataComponent } from './workflow-contracts/contracts-client-data/contracts-client-data.component';
import { ToggleEditModeComponent } from './shared/components/toggle-edit-mode/toggle-edit-mode.component';

@NgModule({
	declarations: [
		WorkflowComponent,
		WorkflowSalesComponent,
		WorkflowDetailsComponent,
		WorkflowContractsComponent,
		WorkflowOverviewComponent,
		WorkflowFinancesComponent,
		WorkflowConsultantActionsDialogComponent,
		WorkflowActionsDialogComponent,
		CreateWorkflowDialogComponent,
		WorkflowSourcingComponent,
		WorkflowPeriodComponent,
		AddOrEditProjectLineDialogComponent,
		GanttChartComponent,
		WorkflowNotesComponent,
		RateAndFeesWarningsDialogComponent,
		MainDataComponent,
		ClientDataComponent,
		ConsultantDataComponent,
		ContractsConsultantDataComponent,
		ContractsMainDataComponent,
		ContractsSyncDataComponent,
		ContractsClientDataComponent,
		ToggleEditModeComponent,
	],
	imports: [CommonModule, FormsModule, ReactiveFormsModule, WorkflowRoutingModule, AppCommonModule, NgxGanttModule],
	exports: [],
	providers: [WorkflowCreateResolver],
})
export class WorkflowModule {}
