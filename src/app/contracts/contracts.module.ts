import { AppCommonModule } from './../shared/common/app-common.module';
import { ContractsRoutingModule } from './contracts-routing.module';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContractComponent } from './contract.component';
import { AgreementsComponent } from './agreements/listAndPreviews/agreements.component';
import { ServiceProxyModule } from 'src/shared/service-proxies/service-proxy.module';
import {
	AgreementAttachmentServiceProxy,
	AgreementServiceProxy,
	AgreementTemplateAttachmentServiceProxy,
	AgreementTemplateServiceProxy,
	FileServiceProxy,
	MergeFieldsServiceProxy,
} from 'src/shared/service-proxies/service-proxies';
import { AutoNameComponent } from './shared/components/auto-name/auto-name.component';
import { ConfirmDialogComponent } from './shared/components/popUps/confirm-dialog/confirm-dialog.component';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { MasterTemplatesService } from './master-templates/listAndPreviews/services/master-templates.service';
import { SettingsTabComponent } from './shared/components/settings-tab/settings-tab.component';
import { MasterTemplateFilterHeaderComponent } from './master-templates/listAndPreviews/components/top-filters/top-filters.component';
import { MasterTemplatesComponent } from './master-templates/listAndPreviews/master-templates.component';
import { ClientSpecificTemplatesComponent } from './client-specific-templates/listAndPreviews/client-specific-templates.component';
import { CreateMasterTemplateComponent } from './master-templates/template-editor/settings/settings.component';
import { ContractsService } from './shared/services/contracts.service';
import { CreationComponent } from './client-specific-templates/edit-template/settings/settings.component';
import { FileUploaderComponent } from './shared/components/file-uploader/file-uploader.component';
import { FileSelectorComponent } from './shared/components/file-selector/file-selector.component';
import { NewFileUploaderDirective } from './shared/components/file-uploader/new-file-uploader.directive';
import { TenantsComponent } from './shared/components/tenants/tenants.component';
import { TruncateTextCustomPipe } from './shared/pipes/truncate-text-custom.pipe';
import { MaterialModule } from '../shared/common/material/material.module';
import { ClientTemplatesService } from './client-specific-templates/listAndPreviews/service/client-templates.service';
import { PreviewTabsComponent } from './master-templates/listAndPreviews/components/preview/preview.component';
import { SummaryComponent } from './master-templates/listAndPreviews/components/preview/previewTabs/summary/summary.component';
import { EmptyStringHandlePipe } from './shared/pipes/empty-string-handle.pipe';
import { FormatArrayPipe } from './shared/pipes/format-array.pipe';
import { AttachmentsComponent } from './master-templates/listAndPreviews/components/preview/previewTabs/attachments/attachments.component';
import { LogsComponent } from './master-templates/listAndPreviews/components/preview/previewTabs/logs/logs.component';
import { LinkedClientTemplatesComponent } from './master-templates/listAndPreviews/components/preview/previewTabs/linkedClientTemplates/linked-client-templates.component';
import { CustomTooltipComponent } from './shared/directives/customTooltip/custom-tooltip.component';
import { LinkedAgreementsComponent } from './master-templates/listAndPreviews/components/preview/previewTabs/linkedAgreements/linked-agreements.component';
import { SettingsComponent } from './agreements/template-editor/settings/settings.component';
import { AgreementService } from './agreements/listAndPreviews/services/agreement.service';
import { SignersTableComponent } from './shared/components/signers-table/signers-table.component';
import { ClientTemplatePreviewComponent } from './client-specific-templates/listAndPreviews/preview/client-template-preview.component';
import { AgreementPreviewComponent } from './agreements/listAndPreviews/components/agreement-preview/agreement-preview.component';
import { TableArrayFormatPipe } from './shared/pipes/table-array-format.pipe';
import { AgreementsTopFiltersComponent } from './agreements/listAndPreviews/components/agreements-top-filters/agreements-top-filters.component';
import { EditorComponent } from './shared/editor/editor.component';
import { EditorPreviewComponent } from './shared/editor-preview/editor-preview.component';
import { NotificationDialogComponent } from './shared/components/popUps/notification-dialog/notification-dialog.component';
import { DownloadFilesService } from './shared/services/download-files.service';
import { TemplatePdfPreviewComponent } from './shared/template-pdf-preview/template-pdf-preview.component';
import { StrInitialsPipe } from './shared/pipes/str-initials.pipe';
import { ExtraHttpsService } from './shared/services/extra-https.service';
import { DefaultTemplateComponent } from './shared/components/popUps/default-template/default-template.component';
import { WorkflowInfoDisplayPanelComponent } from './shared/components/workflow-info-display-panel/workflow-info-display-panel.component';
import { ActionDialogComponent } from './shared/components/popUps/action-dialog/action-dialog.component';
import { DefaultFileUploaderComponent } from './shared/components/default-file-uploader/default-file-uploader.component';
import { AgreementLogsComponent } from './shared/components/agreement-logs/agreement-logs.component';
import { OutdatedMergeFieldsComponent } from './shared/components/popUps/outdated-merge-fields/outdated-merge-fields.component';
import { EmptyAndUnknownMfComponent } from './shared/components/popUps/empty-and-unknown-mf/empty-and-unknown-mf.component';
import { ArchiveComponent } from './agreements/archive/archive.component';
import { EmailBodyComponent } from './shared/components/popUps/email-body/email-body.component';

@NgModule({
	declarations: [
		ContractComponent,
		ClientSpecificTemplatesComponent,
		MasterTemplatesComponent,
		AgreementsComponent,
		MasterTemplateFilterHeaderComponent,
		CreateMasterTemplateComponent,
		SettingsTabComponent,
		AutoNameComponent,
		NewFileUploaderDirective,
		CreationComponent,
		ConfirmDialogComponent,
		FileUploaderComponent,
		FileSelectorComponent,
		TenantsComponent,
		TruncateTextCustomPipe,
		PreviewTabsComponent,
		SummaryComponent,
		EmptyStringHandlePipe,
		FormatArrayPipe,
		AttachmentsComponent,
		LogsComponent,
		LinkedClientTemplatesComponent,
		CustomTooltipComponent,
		LinkedAgreementsComponent,
		SettingsComponent,
		SignersTableComponent,
		ClientTemplatePreviewComponent,
		AgreementPreviewComponent,
		TableArrayFormatPipe,
		AgreementsTopFiltersComponent,
		NotificationDialogComponent,
		StrInitialsPipe,
		DefaultTemplateComponent,
		WorkflowInfoDisplayPanelComponent,
		ActionDialogComponent,
		DefaultFileUploaderComponent,
		AgreementLogsComponent,
		OutdatedMergeFieldsComponent,
		EmptyAndUnknownMfComponent,
		ArchiveComponent,
		EmailBodyComponent,
	],
	imports: [
		CommonModule,
		FormsModule,
		ContractsRoutingModule,
		ServiceProxyModule,
		AppCommonModule,
		MaterialModule,

		// Standalone
		EditorComponent,
		EditorPreviewComponent,
		TemplatePdfPreviewComponent,
	],
	providers: [
		ContractsService,
		MasterTemplatesService,
		ClientTemplatesService,
		AgreementService,
		AgreementServiceProxy,
		AgreementTemplateServiceProxy,
		FileServiceProxy,
		AgreementTemplateServiceProxy,
		MergeFieldsServiceProxy,
		AgreementTemplateAttachmentServiceProxy,
		AgreementAttachmentServiceProxy,
		DownloadFilesService,
		ExtraHttpsService,
	],
})
export class ContractsModule {
	constructor(iconRegistry: MatIconRegistry, sanitizer: DomSanitizer) {
		iconRegistry.addSvgIcon('create-icon', sanitizer.bypassSecurityTrustResourceUrl('assets/common/images/create-icon.svg'));

		iconRegistry.addSvgIcon(
			'euro-union-icon',
			sanitizer.bypassSecurityTrustResourceUrl('assets/common/images/euro-union.svg')
		);

		iconRegistry.addSvgIcon(
			'close-button-icon',
			sanitizer.bypassSecurityTrustResourceUrl('assets/common/images/close-button-icon.svg')
		);
		iconRegistry.addSvgIcon(
			'close-button-icon-grey',
			sanitizer.bypassSecurityTrustResourceUrl('assets/common/images/close-button-icon-grey.svg')
		);
		iconRegistry.addSvgIcon('plus-icon', sanitizer.bypassSecurityTrustResourceUrl('assets/common/images/plus-icon.svg'));
		iconRegistry.addSvgIcon(
			'worldwide-icon',
			sanitizer.bypassSecurityTrustResourceUrl('assets/common/images/worldwide-icon.svg')
		);
		iconRegistry.addSvgIcon('cog-icon', sanitizer.bypassSecurityTrustResourceUrl('assets/common/images/cog-icon.svg'));
		iconRegistry.addSvgIcon('editor-icon', sanitizer.bypassSecurityTrustResourceUrl('assets/common/images/editor-icon.svg'));
		iconRegistry.addSvgIcon(
			'chevron-down',
			sanitizer.bypassSecurityTrustResourceUrl('assets/common/images/chevron-down.svg')
		);
		iconRegistry.addSvgIcon('enabled', sanitizer.bypassSecurityTrustResourceUrl('assets/common/images/enabled-icon.svg'));
		iconRegistry.addSvgIcon('disabled', sanitizer.bypassSecurityTrustResourceUrl('assets/common/images/disabled-icon.svg'));
		iconRegistry.addSvgIcon(
			'three-lines',
			sanitizer.bypassSecurityTrustResourceUrl('assets/common/images/three-lines-icon.svg')
		);
		iconRegistry.addSvgIcon(
			'three-hor-dots',
			sanitizer.bypassSecurityTrustResourceUrl('assets/common/images/three-hor-dots.svg')
		);
		iconRegistry.addSvgIcon(
			'dropdown-icon',
			sanitizer.bypassSecurityTrustResourceUrl('assets/common/images/dropdown-icon.svg')
		);
		iconRegistry.addSvgIcon(
			'templates-links',
			sanitizer.bypassSecurityTrustResourceUrl('assets/common/images/templates-links.svg')
		);
		iconRegistry.addSvgIcon(
			'agreement-links',
			sanitizer.bypassSecurityTrustResourceUrl('assets/common/images/agreement-links.svg')
		);
		iconRegistry.addSvgIcon(
			'download-icon',
			sanitizer.bypassSecurityTrustResourceUrl('assets/common/images/download-icon.svg')
		);
		iconRegistry.addSvgIcon(
			'fully-linked',
			sanitizer.bypassSecurityTrustResourceUrl('assets/common/images/fully-linked.svg')
		);
		iconRegistry.addSvgIcon(
			'summary-unlinked',
			sanitizer.bypassSecurityTrustResourceUrl('assets/common/images/summary-unlinked.svg')
		);
		iconRegistry.addSvgIcon(
			'document-unlinked',
			sanitizer.bypassSecurityTrustResourceUrl('assets/common/images/document-unlinked.svg')
		);
		iconRegistry.addSvgIcon(
			'fully-unlinked',
			sanitizer.bypassSecurityTrustResourceUrl('assets/common/images/fully-unlinked.svg')
		);
		iconRegistry.addSvgIcon('right-arrow', sanitizer.bypassSecurityTrustResourceUrl('assets/common/images/right-arrow.svg'));
		iconRegistry.addSvgIcon(
			'approved-icon',
			sanitizer.bypassSecurityTrustResourceUrl('assets/common/images/approved-icon.svg')
		);
		iconRegistry.addSvgIcon(
			'toApprove-icon',
			sanitizer.bypassSecurityTrustResourceUrl('assets/common/images/toApprove-icon.svg')
		);
		iconRegistry.addSvgIcon(
			'not-applicable-icon',
			sanitizer.bypassSecurityTrustResourceUrl('assets/common/images/not-applicable.icon.svg')
		);
		iconRegistry.addSvgIcon(
			'no-items-icon',
			sanitizer.bypassSecurityTrustResourceUrl('assets/common/images/no-items-icon.svg')
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
			'send-via-docusign',
			sanitizer.bypassSecurityTrustResourceUrl('assets/common/images/legal-contracts/send-via-docusign.svg')
		);
		iconRegistry.addSvgIcon(
			'create-docusign-draft',
			sanitizer.bypassSecurityTrustResourceUrl('assets/common/images/legal-contracts/create-docusign-draft.svg')
		);
		iconRegistry.addSvgIcon('asc-arrow', sanitizer.bypassSecurityTrustResourceUrl('assets/common/images/asc-arrow.svg'));
		iconRegistry.addSvgIcon('desc-arrow', sanitizer.bypassSecurityTrustResourceUrl('assets/common/images/desc-arrow.svg'));
		iconRegistry.addSvgIcon(
			'agreement-active-icon',
			sanitizer.bypassSecurityTrustResourceUrl('assets/common/images/agreement-active-icon.svg')
		);
		iconRegistry.addSvgIcon(
			'agreement-active-outdated-icon',
			sanitizer.bypassSecurityTrustResourceUrl('assets/common/images/agreement-active-outdated-icon.svg')
		);
		iconRegistry.addSvgIcon(
			'agreement-inactive-icon',
			sanitizer.bypassSecurityTrustResourceUrl('assets/common/images/agreement-inactive-icon.svg')
		);
		iconRegistry.addSvgIcon(
			'table-edit-icon',
			sanitizer.bypassSecurityTrustResourceUrl('assets/common/images/table-edit-icon.svg')
		);
		iconRegistry.addSvgIcon(
			'duplicate-icon',
			sanitizer.bypassSecurityTrustResourceUrl('assets/common/images/duplicate-icon.svg')
		);
		iconRegistry.addSvgIcon('copy-icon', sanitizer.bypassSecurityTrustResourceUrl('assets/common/images/copy-icon.svg'));

		iconRegistry.addSvgIcon(
			'avatar-placeholder',
			sanitizer.bypassSecurityTrustResourceUrl('assets/common/images/avatar-placeholder.svg')
		);

		iconRegistry.addSvgIcon(
			'send-reminder-icon',
			sanitizer.bypassSecurityTrustResourceUrl('assets/common/images/send-reminder-icon.svg')
		);

		iconRegistry.addSvgIcon(
			'download-agreement-icon',
			sanitizer.bypassSecurityTrustResourceUrl('assets/common/images/download-agreement-icon.svg')
		);
		iconRegistry.addSvgIcon(
			'pdf-download-icon',
			sanitizer.bypassSecurityTrustResourceUrl('assets/common/images/pdf-download-icon.svg')
		);
		iconRegistry.addSvgIcon(
			'doc-download-icon',
			sanitizer.bypassSecurityTrustResourceUrl('assets/common/images/doc-download-icon.svg')
		);
		iconRegistry.addSvgIcon(
			'open-workflow-icon',
			sanitizer.bypassSecurityTrustResourceUrl('assets/common/images/open-workflow-icon.svg')
		);
		iconRegistry.addSvgIcon(
			'table-delete-icon',
			sanitizer.bypassSecurityTrustResourceUrl('assets/common/images/table-delete-icon.svg')
		);
		iconRegistry.addSvgIcon(
			'mat-select-icon',
			sanitizer.bypassSecurityTrustResourceUrl('assets/common/images/mat-select-icon.svg')
		);
		iconRegistry.addSvgIcon(
			'mat-select-invalid-icon',
			sanitizer.bypassSecurityTrustResourceUrl('assets/common/images/mat-select-invalid-icon.svg')
		);
		iconRegistry.addSvgIcon(
			'mat-select-focused-icon',
			sanitizer.bypassSecurityTrustResourceUrl('assets/common/images/mat-select-focused-icon.svg')
		);
		iconRegistry.addSvgIcon(
			'add-signer-icon',
			sanitizer.bypassSecurityTrustResourceUrl('assets/common/images/add-signer-icon.svg')
		);
		iconRegistry.addSvgIcon(
			'empty-table-icon',
			sanitizer.bypassSecurityTrustResourceUrl('assets/common/images/empty-table-icon.svg')
		);
		iconRegistry.addSvgIcon(
			'empty-table-icon',
			sanitizer.bypassSecurityTrustResourceUrl('assets/common/images/empty-table-icon.svg')
		);
		iconRegistry.addSvgIcon('xls', sanitizer.bypassSecurityTrustResourceUrl('assets/common/images/xls-icon.svg'));
		iconRegistry.addSvgIcon('msg', sanitizer.bypassSecurityTrustResourceUrl('assets/common/images/msg-icon.svg'));
		iconRegistry.addSvgIcon('ppt', sanitizer.bypassSecurityTrustResourceUrl('assets/common/images/ppt-icon.svg'));
		iconRegistry.addSvgIcon(
			'no-extension',
			sanitizer.bypassSecurityTrustResourceUrl('assets/common/images/no-extension-icon.svg')
		);
		iconRegistry.addSvgIcon(
			'envelope-email',
			sanitizer.bypassSecurityTrustResourceUrl('assets/common/images/envelope-email-icon.svg')
		);
		iconRegistry.addSvgIcon(
			'envelope-docusign',
			sanitizer.bypassSecurityTrustResourceUrl('assets/common/images/envelope-docusign-icon.svg')
		);
		iconRegistry.addSvgIcon(
			'envelope-other-party',
			sanitizer.bypassSecurityTrustResourceUrl('assets/common/images/envelope-other-party-icon.svg')
		);
		iconRegistry.addSvgIcon(
			'agreement-not-started-yet-icon',
			sanitizer.bypassSecurityTrustResourceUrl('assets/common/images/agreement-not-started-yet-icon.svg')
		);
		iconRegistry.addSvgIcon(
			'information-tip-icon',
			sanitizer.bypassSecurityTrustResourceUrl('assets/common/images/information-tip-icon.svg')
		);
		iconRegistry.addSvgIcon('loop-icon', sanitizer.bypassSecurityTrustResourceUrl('assets/common/images/loop-icon.svg'));
		iconRegistry.addSvgIcon(
			'legal-contract-upload',
			sanitizer.bypassSecurityTrustResourceUrl('assets/common/images/legal-contract-upload.svg')
		);
		iconRegistry.addSvgIcon(
			'reminder-send',
			sanitizer.bypassSecurityTrustResourceUrl('assets/common/images/reminder-send.svg')
		);
		iconRegistry.addSvgIcon(
			'partially-sign',
			sanitizer.bypassSecurityTrustResourceUrl('assets/common/images/partially-sign.svg')
		);
		iconRegistry.addSvgIcon(
			'archive-icon',
			sanitizer.bypassSecurityTrustResourceUrl('assets/common/images/archive-icon.svg')
		);

		iconRegistry.addSvgIcon(
			'action-three-dots',
			sanitizer.bypassSecurityTrustResourceUrl('assets/common/images/action-three-dots.svg')
		);
		iconRegistry.addSvgIcon(
			'deleted-attachment',
			sanitizer.bypassSecurityTrustResourceUrl('assets/common/images/deleted-attachment.svg')
		);
	}
}
