import { AppCommonModule } from './../shared/common/app-common.module';
import { ContractsRoutingModule } from './contracts-routing.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContractComponent } from './contract.component';
import { AgreementsComponent } from './agreements/agreements.component';
import { ServiceProxyModule } from 'src/shared/service-proxies/service-proxy.module';
import { MatGridComponent } from './shared/components/grid-table/mat-grid.component';
import { AgreementLanguagesFilterComponent } from './shared/components/grid-table/master-templates/filters/agreement-languages-filter/agreement-filter.component';
import {
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
import { CreationTitleService } from './master-templates/template-editor/creation-title.service';
import { TenantsComponent } from './shared/components/tenants/tenants.component';

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
        EditorComponent,
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
    ],
    imports: [
        CommonModule,
        ContractsRoutingModule,
        ServiceProxyModule,
        AppCommonModule,
    ],
    providers: [
        ContractsService,
        MasterTemplatesService,
        AgreementTemplateServiceProxy,
        FileServiceProxy,
        AgreementTemplateServiceProxy,
        MergeFieldsServiceProxy,
        AgreementTemplateAttachmentServiceProxy,
        CreationTitleService,
    ],
})
export class ContractsModule {
    constructor(iconRegistry: MatIconRegistry, sanitizer: DomSanitizer) {
        iconRegistry.addSvgIcon(
            'create-icon',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/create-icon.svg'
            )
        );

        iconRegistry.addSvgIcon(
            'euro-union-icon',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/euro-union.svg'
            )
        );

        iconRegistry.addSvgIcon(
            'close-button-icon',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/close-button-icon.svg'
            )
        );
        iconRegistry.addSvgIcon(
            'plus-icon',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/plus-icon.svg'
            )
        );
        iconRegistry.addSvgIcon(
            'worldwide-icon',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/worldwide-icon.svg'
            )
        );
        iconRegistry.addSvgIcon(
            'cog-icon',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/cog-icon.svg'
            )
        );
        iconRegistry.addSvgIcon(
            'editor-icon',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/editor-icon.svg'
            )
        );
        iconRegistry.addSvgIcon(
            'chevron-down',
            sanitizer.bypassSecurityTrustResourceUrl(
                'assets/common/images/chevron-down.svg'
            )
        )
    }
}
