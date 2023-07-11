import { NgModule } from '@angular/core';
import { CommonModule, ImageLoaderConfig, IMAGE_LOADER, NgOptimizedImage, provideImgixLoader } from '@angular/common';
import { MaterialModule } from './material/material.module';
import { ErrorDialogComponent } from './errors/error-dialog/error-dialog.component';
import { ErrorDialogService } from './errors/error-dialog.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ConfirmationDialogComponent } from '../components/confirmation-dialog/confirmation-dialog.component';
import { FileUploaderComponent } from '../components/file-uploader/file-uploader.component';
import { FileDragAndDropDirective } from '../components/file-uploader/file-drag-and-drop.directive';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { InternalLookupService } from './internal-lookup.service';
import { ResponsiblePersonComponent } from '../components/responsible-person/responsible-person.component';
import { MomentFormatPipe } from 'src/shared/common/pipes/moment-format.pipe';
import { ShowIfTruncatedDirective } from '../../../shared/common/directives/show-if-truncated.directive';
import { PreventDoubleClickDirective } from 'src/shared/common/directives/prevent-doubleClick.directive';
import { ValidatorComponent } from '../components/validator/validator.component';
import { ReplacePipe } from 'src/shared/common/pipes/replace.pipe';
import { ConsultantInformationComponent } from '../components/consultant-information/consultant-information.component';
import { ExcludeIdsPipe } from 'src/shared/common/pipes/exclude-ids.pipe';
import { ImageFallbackDirective } from 'src/shared/common/directives/image-fallback.directive';
import { ScrollToModule } from '@nicky-lenaers/ngx-scroll-to';
import { DisplayListPipe } from 'src/shared/common/pipes/display-array.pipe';
import { environment } from 'src/environments/environment';
import { ImgUrlPipe } from 'src/shared/common/pipes/image-fallback.pipe';
import { TooltipModule } from './ui/tooltip/tooltip.module';
import { ManagerMultiselectComponent } from '../components/manager-multiselect/manager-multiselect.component';
import { EmgWidgetComponent } from '../components/emg-widget/emg-widget.component';
// temp solution
import { MatGridComponent } from '../components/grid-table/mat-grid.component';
import { AgreementLanguagesFilterComponent } from '../components/grid-table/master-templates/filters/agreement-languages-filter/agreement-filter.component';
import { EmployeesFilterComponent } from '../components/grid-table/master-templates/filters/employees-filter/employees-filter.component';
import { AgreementTypesFilterComponent } from '../components/grid-table/master-templates/filters/agreement-types-filter/agreement-types-filter.component';
import { DeliveryTypesFilterComponent } from '../components/grid-table/master-templates/filters/delivery-types-filter/delivery-types-filter.component';
import { EmploymentTypesFilterComponent } from '../components/grid-table/master-templates/filters/employment-types-filter/employment-types-filter.component';
import { LegalEntitiesFilterComponent } from '../components/grid-table/master-templates/filters/legal-entities-filter/legal-entities-filter.component';
import { RecipientTypesFilterComponent } from '../components/grid-table/master-templates/filters/recipient-types-filter/recipient-types-filter.component';
import { SalesTypesFilterComponent } from '../components/grid-table/master-templates/filters/sales-types-filter/sales-types-filter.component';
import { MatMenuSingleSelectComponent } from '../components/emagine-menu-single-select/emagine-menu-single-select.component';
import { MultiSelectComponent } from '../components/emagine-menu-multi-select/emagine-menu-multi-select.component';
import { DropdownAutocompleteMultiselectComponent } from '../components/dropdown-autocomplete-multiselect/dropdown-autocomplete-multiselect.component';
import { DropdownAutocompleteSingleSelectComponent } from '../components/dropdown-autocomplete-single-select/dropdown-autocomplete-single-select.component';
import { IsEnabledComponent } from '../components/grid-table/master-templates/filters/enabled-filter/is-enabled.component';
import { ApprovalFilterComponent } from '../components/grid-table/client-templates/entities/filters/approval-filter/approval-filter.component';
import { ClientModeFilterComponent } from '../components/grid-table/client-templates/entities/filters/mode-filter/mode-filter.component';
import { SalesManagersFilterComponent } from '../components/grid-table/agreements/filters/sales-managers-filter/sales-managers-filter.component';
import { StatusesFilterComponent } from '../components/grid-table/agreements/filters/statuses-filter/statuses-filter.component';
import { AgreementModeFilterComponent } from '../components/grid-table/agreements/filters/mode-filter/mode-filter.component';
import { EnvelopePathFilterComponent } from '../components/grid-table/agreements/filters/envelope-path-filter/envelope-path-filter.component';
import { ContractManagerFilterComponent } from '../components/grid-table/agreements/filters/contact-manager-filter/contract-manager-filter.component';
import { ClientTemplateModeComponent } from 'src/app/contracts/shared/components/client-mode/client-mode.component';
import { ApprovalComponent } from 'src/app/contracts/shared/components/approval/approval.component';
import { EnabledComponent } from 'src/app/contracts/shared/components/enabled/enabled.component';
import { EnvelopePathComponent } from 'src/app/contracts/shared/components/envelope-path/envelope-path.component';
import { AgreementModeComponent } from 'src/app/contracts/shared/components/agreement-mode/agreement-mode.component';
import { AgreementStatusComponent } from 'src/app/contracts/shared/components/agreement-status/agreement-status.component';
import { CustomTooltipDirective } from 'src/app/contracts/shared/directives/customTooltip/custom-tooltip.directive';
import { EmgTreeMultiselectComponent } from '../components/tree-multiselect/tree-multiselect.component';
import { TenantFlagCellComponent } from '../components/tenant-flag-cell/tenant-flag-cell.component';
import { DivisionsAndTeamsFilterComponent } from '../components/teams-and-divisions/teams-and-divisions-filter.component';
import { PoContractManagerFilterComponent } from '../components/po-table/fitlers/contact-manager-filter/contract-manager-filter.component';
import { PoNoteFilterComponent } from '../components/po-table/fitlers/po-note-filter/po-note-filter.component';
import { PoSalesManagersFilterComponent } from '../components/po-table/fitlers/sales-managers-filter/sales-managers-filter.component';
import { PoCapFilterComponent } from '../components/po-table/fitlers/po-cap-filter/po-cap-filter.component';
import { PoStatusComponent } from '../components/po-status/po-status.component';
import { PoNoteStatusIconComponent } from '../components/po-note-status/po-note-status.component';
import { PoChasingStatusIconComponent } from '../components/po-chasing-status/po-chasing-status.component';

@NgModule({
	declarations: [
		ErrorDialogComponent,
		FileDragAndDropDirective,
		FileUploaderComponent,
		ConfirmationDialogComponent,
		ResponsiblePersonComponent,
		MomentFormatPipe,
		ShowIfTruncatedDirective,
		PreventDoubleClickDirective,
		ValidatorComponent,
		ReplacePipe,
		ConsultantInformationComponent,
		ExcludeIdsPipe,
		ImageFallbackDirective,
		ImgUrlPipe,
		DisplayListPipe,
		ManagerMultiselectComponent,
		EmgWidgetComponent,
		// temp solution
		MatGridComponent,
		AgreementLanguagesFilterComponent,
		EmployeesFilterComponent,
		AgreementTypesFilterComponent,
		DeliveryTypesFilterComponent,
		EmploymentTypesFilterComponent,
		LegalEntitiesFilterComponent,
		RecipientTypesFilterComponent,
		SalesTypesFilterComponent,
		MatMenuSingleSelectComponent,
		MultiSelectComponent,
		DropdownAutocompleteMultiselectComponent,
		DropdownAutocompleteSingleSelectComponent,
		IsEnabledComponent,
		ApprovalFilterComponent,
		ClientModeFilterComponent,
		SalesManagersFilterComponent,
		ContractManagerFilterComponent,
		StatusesFilterComponent,
		AgreementModeFilterComponent,
		EnvelopePathFilterComponent,
		ClientTemplateModeComponent,
		ApprovalComponent,
		EnabledComponent,
		EnvelopePathComponent,
		AgreementModeComponent,
		AgreementStatusComponent,
		CustomTooltipDirective,
        EmgTreeMultiselectComponent,
        TenantFlagCellComponent,
        DivisionsAndTeamsFilterComponent,
        PoContractManagerFilterComponent,
        PoNoteFilterComponent,
        PoSalesManagersFilterComponent,
        PoCapFilterComponent,
        PoStatusComponent,
        PoNoteStatusIconComponent,
        PoChasingStatusIconComponent,
	],
	imports: [
		CommonModule,
		MaterialModule,
		FormsModule,
		ReactiveFormsModule,
		NgScrollbarModule,
		ScrollToModule.forRoot(),
		NgOptimizedImage,
		TooltipModule,
	],
	exports: [
		MaterialModule,
		FormsModule,
		ReactiveFormsModule,
		FileDragAndDropDirective,
		FileUploaderComponent,
		ConfirmationDialogComponent,
		NgScrollbarModule,
		ResponsiblePersonComponent,
		MomentFormatPipe,
		ShowIfTruncatedDirective,
		PreventDoubleClickDirective,
		ValidatorComponent,
		ReplacePipe,
		ConsultantInformationComponent,
		ExcludeIdsPipe,
		ImageFallbackDirective,
		ScrollToModule,
		NgOptimizedImage,
		ImgUrlPipe,
		DisplayListPipe,
		TooltipModule,
		ManagerMultiselectComponent,
		EmgWidgetComponent,
		// temp solution
		MatGridComponent,
		AgreementLanguagesFilterComponent,
		EmployeesFilterComponent,
		AgreementTypesFilterComponent,
		DeliveryTypesFilterComponent,
		EmploymentTypesFilterComponent,
		LegalEntitiesFilterComponent,
		RecipientTypesFilterComponent,
		SalesTypesFilterComponent,
		MatMenuSingleSelectComponent,
		MultiSelectComponent,
		DropdownAutocompleteMultiselectComponent,
		DropdownAutocompleteSingleSelectComponent,
		IsEnabledComponent,
		ApprovalFilterComponent,
		ClientModeFilterComponent,
		SalesManagersFilterComponent,
		ContractManagerFilterComponent,
		StatusesFilterComponent,
		AgreementModeFilterComponent,
		EnvelopePathFilterComponent,
		ClientTemplateModeComponent,
		ApprovalComponent,
		EnabledComponent,
		EnvelopePathComponent,
		AgreementModeComponent,
		AgreementStatusComponent,
		CustomTooltipDirective,
        EmgTreeMultiselectComponent,
        TenantFlagCellComponent,
        DivisionsAndTeamsFilterComponent,
        PoContractManagerFilterComponent,
        PoNoteFilterComponent,
        PoSalesManagersFilterComponent,
        PoCapFilterComponent,
        PoStatusComponent,
        PoNoteStatusIconComponent,
        PoChasingStatusIconComponent,
	],
	providers: [ErrorDialogService, InternalLookupService, provideImgixLoader(`${environment.sharedAssets}`)],
})
export class AppCommonModule {}
