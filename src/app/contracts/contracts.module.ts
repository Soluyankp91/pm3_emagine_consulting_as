import { AppCommonModule } from './../shared/common/app-common.module';
import { ContractsRoutingModule } from './contracts-routing.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContractComponent } from './contract.component';
import { AgreementsComponent } from './agreements/listAndPreviews/agreements.component';
import { ServiceProxyModule } from 'src/shared/service-proxies/service-proxy.module';
import { MatGridComponent } from './shared/components/grid-table/mat-grid.component';
import { AgreementLanguagesFilterComponent } from './shared/components/grid-table/master-templates/filters/agreement-languages-filter/agreement-filter.component';
import {
	AgreementServiceProxy,
	AgreementTemplateAttachmentServiceProxy,
	AgreementTemplateServiceProxy,
	FileServiceProxy,
	MergeFieldsServiceProxy,
} from 'src/shared/service-proxies/service-proxies';
import { EmployeesFilterComponent } from './shared/components/grid-table/master-templates/filters/employees-filter/employees-filter.component';
import { AgreementTypesFilterComponent } from './shared/components/grid-table/master-templates/filters/agreement-types-filter/agreement-types-filter.component';
import { DeliveryTypesFilterComponent } from './shared/components/grid-table/master-templates/filters/delivery-types-filter/delivery-types-filter/delivery-types-filter.component';
import { EmploymentTypesFilterComponent } from './shared/components/grid-table/master-templates/filters/employment-types-filter/employment-types-filter/employment-types-filter.component';
import { LegalEntitiesFilterComponent } from './shared/components/grid-table/master-templates/filters/legal-entities-filter/legal-entities-filter/legal-entities-filter.component';
import { RecipientTypesFilterComponent } from './shared/components/grid-table/master-templates/filters/recipient-types-filter/recipient-types-filter/recipient-types-filter.component';
import { SalesTypesFilterComponent } from './shared/components/grid-table/master-templates/filters/sales-types-filter/sales-types-filter.component';
import { AutoNameComponent } from './shared/components/auto-name/auto-name.component';
import { MatMenuSingleSelectComponent } from './shared/components/emagine-menu-single-select/emagine-menu-single-select.component';
import { MultiSelectComponent } from './shared/components/emagine-menu-multi-select/emagine-menu-multi-select.component';
import { CustomTooltipDirective } from './shared/directives/customTooltip/custom-tooltip.directive';
import { DropdownAutocompleteMultiselectComponent } from './shared/components/dropdown-autocomplete-multiselect/dropdown-autocomplete-multiselect.component';
import { DropdownAutocompleteSingleSelectComponent } from './shared/components/dropdown-autocomplete-single-select/dropdown-autocomplete-single-select.component';
import { ConfirmDialogComponent } from './shared/components/popUps/confirm-dialog/confirm-dialog.component';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { MasterTemplatesService } from './master-templates/listAndPreviews/services/master-templates.service';
import { MasterTemplateCreationComponent } from './master-templates/template-editor/template-editor.component';
import { EditorComponent } from './master-templates/template-editor/editor/editor.component';
import { MasterTemplateFilterHeaderComponent } from './master-templates/listAndPreviews/components/top-filters/top-filters.component';
import { MasterTemplatesComponent } from './master-templates/listAndPreviews/master-templates.component';
import { ClientSpecificTemplatesComponent } from './client-specific-templates/listAndPreviews/client-specific-templates.component';
import { CreateMasterTemplateComponent } from './master-templates/template-editor/settings/settings.component';
import { ContractsService } from './shared/services/contracts.service';
import { ClientSpecificComponent } from './client-specific-templates/edit-template/client-specific.component';
import { CreationComponent } from './client-specific-templates/edit-template/settings/settings.component';
import { FileUploaderComponent } from './shared/components/file-uploader/file-uploader.component';
import { FileSelectorComponent } from './shared/components/file-selector/file-selector.component';
import { NewFileUploaderDirective } from './shared/components/file-uploader/new-file-uploader.directive';
import { CreationTitleService } from './shared/services/creation-title.service';
import { TenantsComponent } from './shared/components/tenants/tenants.component';
import { IsEnabledComponent } from './shared/components/grid-table/master-templates/filters/enabled-filter/is-enabled/is-enabled.component';
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
import { ModeComponent } from './shared/components/mode/mode.component';
import { CustomTooltipComponent } from './shared/directives/customTooltip/custom-tooltip.component';
import { LinkedAgreementsComponent } from './master-templates/listAndPreviews/components/preview/previewTabs/linkedAgreements/linked-agreements.component';
import { AgreementStatusComponent } from './shared/components/agreement-status/agreement-status.component';
import { ApprovalComponent } from './shared/components/approval/approval.component';
import { EnabledComponent } from './shared/components/enabled/enabled.component';
import { ApprovalFilterComponent } from './shared/components/grid-table/client-templates/entities/filters/approval-filter/approval-filter.component';
import { ModeFilterComponent } from './shared/components/grid-table/client-templates/entities/filters/mode-filter/mode-filter.component';
import { CompareComponent } from './master-templates/template-editor/editor/components/compare/compare.component';
import { SettingsComponent } from './agreements/template-editor/settings/settings.component';
@NgModule({
	declarations: [
		ContractComponent,
		ClientSpecificTemplatesComponent,
		MasterTemplatesComponent,
		AgreementsComponent,
		MatGridComponent,
		EmployeesFilterComponent,
		AgreementLanguagesFilterComponent,
		AgreementTypesFilterComponent,
		DeliveryTypesFilterComponent,
		EmploymentTypesFilterComponent,
		LegalEntitiesFilterComponent,
		RecipientTypesFilterComponent,
		SalesTypesFilterComponent,
		MasterTemplateFilterHeaderComponent,
		CreateMasterTemplateComponent,
		MasterTemplateCreationComponent,
		AutoNameComponent,
		MatMenuSingleSelectComponent,
		MultiSelectComponent,
		CustomTooltipDirective,
		DropdownAutocompleteMultiselectComponent,
		NewFileUploaderDirective,
		CreationComponent,
		ClientSpecificComponent,
		DropdownAutocompleteSingleSelectComponent,
		ConfirmDialogComponent,
		FileUploaderComponent,
		FileSelectorComponent,
		TenantsComponent,
		IsEnabledComponent,
		TruncateTextCustomPipe,
		PreviewTabsComponent,
		SummaryComponent,
		EmptyStringHandlePipe,
		FormatArrayPipe,
		AttachmentsComponent,
		LogsComponent,
		LinkedClientTemplatesComponent,
		ModeComponent,
		CustomTooltipComponent,
		LinkedAgreementsComponent,
		AgreementStatusComponent,
		ApprovalComponent,
		EnabledComponent,
		ApprovalFilterComponent,
		ModeFilterComponent,
		CompareComponent,
		SettingsComponent,
	],
	imports: [
		CommonModule,
		ContractsRoutingModule,
		ServiceProxyModule,
		AppCommonModule,
		MaterialModule,

		// Standalone
		EditorComponent,
	],
	providers: [
		ContractsService,
		MasterTemplatesService,
		ClientTemplatesService,
		AgreementTemplateServiceProxy,
		FileServiceProxy,
		AgreementTemplateServiceProxy,
		AgreementServiceProxy,
		MergeFieldsServiceProxy,
		AgreementTemplateAttachmentServiceProxy,
		CreationTitleService,
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
		iconRegistry.addSvgIcon('asc-arrow', sanitizer.bypassSecurityTrustResourceUrl('assets/common/images/asc-arrow.svg'));
		iconRegistry.addSvgIcon('desc-arrow', sanitizer.bypassSecurityTrustResourceUrl('assets/common/images/desc-arrow.svg'));
	}
}
