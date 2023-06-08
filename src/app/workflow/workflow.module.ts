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
import { WorkflowComponent } from './workflow.component';
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
import { DocumentsComponent } from './shared/components/wf-documents/wf-documents.component';
import { WorkflowPeriodResolver } from './workflow-period/workflow-period.resolver';
import { AddOrEditPoDialogComponent } from './shared/components/purchase-orders/add-or-edit-po-dialog/add-or-edit-po-dialog.component';
import { PurchaseOrdersComponent } from './shared/components/purchase-orders/purchase-orders.component';
import { LegalContractsComponent } from './workflow-contracts/legal-contracts/legal-contracts.component';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { SendEnvelopeDialogComponent } from './workflow-contracts/legal-contracts/send-envelope-dialog/send-envelope-dialog.component';
import { SignersPreviewDialogComponent } from './workflow-contracts/legal-contracts/signers-preview-dialog/signers-preview-dialog.component';
import { RemoveOrUploadAgrementDialogComponent } from './workflow-contracts/legal-contracts/remove-or-upload-agrement-dialog/remove-or-upload-agrement-dialog.component';
import { CalculatedMarginComponent } from './shared/components/calculated-margin/calculated-margin.component';
import { LatestChangesComponent } from './workflow-overview/latest-changes/latest-changes.component';
import { WorkflowCreateResolver } from './workflow.resolver';
import { LegalContractItemComponent } from './workflow-contracts/legal-contracts/legal-contract-item/legal-contract-item.component';
import { WorkflowHttpService } from './shared/services/workflow-http.service';
import { ManagerTeamComponent } from './shared/components/manager-team/manager-team.component';

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
		DocumentsComponent,
		AddOrEditPoDialogComponent,
		PurchaseOrdersComponent,
		LegalContractsComponent,
		SendEnvelopeDialogComponent,
		SignersPreviewDialogComponent,
		RemoveOrUploadAgrementDialogComponent,
		CalculatedMarginComponent,
		LatestChangesComponent,
		LegalContractItemComponent,
		ManagerTeamComponent,
	],
	imports: [CommonModule, FormsModule, ReactiveFormsModule, WorkflowRoutingModule, AppCommonModule, NgxGanttModule],
	exports: [],
	providers: [WorkflowCreateResolver, WorkflowPeriodResolver, WorkflowHttpService],
})
export class WorkflowModule {
	constructor(iconRegistry: MatIconRegistry, sanitizer: DomSanitizer) {
		iconRegistry.addSvgIcon(
			'agreement-active-icon',
			sanitizer.bypassSecurityTrustResourceUrl('assets/common/images/legal-contracts/agreement-active-icon.svg')
		);
		iconRegistry.addSvgIcon(
			'agreement-active-outdated-icon',
			sanitizer.bypassSecurityTrustResourceUrl('assets/common/images/legal-contracts/agreement-active-outdated-icon.svg')
		);
		iconRegistry.addSvgIcon(
			'agreement-inactive-icon',
			sanitizer.bypassSecurityTrustResourceUrl('assets/common/images/legal-contracts/agreement-inactive-icon.svg')
		);
		iconRegistry.addSvgIcon(
			'via-email-icon',
			sanitizer.bypassSecurityTrustResourceUrl('assets/common/images/legal-contracts/via-email-icon.svg')
		);
		iconRegistry.addSvgIcon(
			'via-docusign-icon',
			sanitizer.bypassSecurityTrustResourceUrl('assets/common/images/legal-contracts/via-docusign-icon.svg')
		);
		iconRegistry.addSvgIcon(
			'via-thirdparty-icon',
			sanitizer.bypassSecurityTrustResourceUrl('assets/common/images/legal-contracts/via-thirdparty-icon.svg')
		);
		iconRegistry.addSvgIcon(
			'download-doc',
			sanitizer.bypassSecurityTrustResourceUrl('assets/common/images/legal-contracts/download-doc.svg')
		);
		iconRegistry.addSvgIcon(
			'download-pdf',
			sanitizer.bypassSecurityTrustResourceUrl('assets/common/images/legal-contracts/download-pdf.svg')
		);
		iconRegistry.addSvgIcon(
			'legal-contract-edit',
			sanitizer.bypassSecurityTrustResourceUrl('assets/common/images/legal-contracts/legal-contract-edit.svg')
		);
		iconRegistry.addSvgIcon(
			'legal-contract-remove',
			sanitizer.bypassSecurityTrustResourceUrl('assets/common/images/legal-contracts/legal-contract-remove.svg')
		);
		iconRegistry.addSvgIcon(
			'legal-contract-upload',
			sanitizer.bypassSecurityTrustResourceUrl('assets/common/images/legal-contracts/legal-contract-upload.svg')
		);
		iconRegistry.addSvgIcon(
			'open-in-docusign',
			sanitizer.bypassSecurityTrustResourceUrl('assets/common/images/legal-contracts/open-in-docusign.svg')
		);
		iconRegistry.addSvgIcon(
			'create-docusign-draft',
			sanitizer.bypassSecurityTrustResourceUrl('assets/common/images/legal-contracts/create-docusign-draft.svg')
		);
		iconRegistry.addSvgIcon(
			'send-via-docusign',
			sanitizer.bypassSecurityTrustResourceUrl('assets/common/images/legal-contracts/send-via-docusign.svg')
		);
		iconRegistry.addSvgIcon(
			'signed',
			sanitizer.bypassSecurityTrustResourceUrl('assets/common/images/legal-contracts/signed.svg')
		);
		iconRegistry.addSvgIcon(
			'reminder-sent',
			sanitizer.bypassSecurityTrustResourceUrl('assets/common/images/legal-contracts/reminder-set.svg')
		);
	}
}
