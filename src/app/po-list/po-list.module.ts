import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PoListComponent } from './po-list.component';
import { AppCommonModule } from '../shared/common/app-common.module';
import { PurchaseOrdersRoutingModule } from './po-list-routing.module';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material/icon';
import { BulkUpdateDialogComponent } from './components/bulk-update-dialog/bulk-update-dialog.component';



@NgModule({
  declarations: [
    PoListComponent,
    BulkUpdateDialogComponent
  ],
  imports: [
    CommonModule,
    AppCommonModule,
    PurchaseOrdersRoutingModule
  ]
})
export class PoListModule {
    constructor(iconRegistry: MatIconRegistry, sanitizer: DomSanitizer) {
        iconRegistry.addSvgIcon(
            'assign-client-responsible',
            sanitizer.bypassSecurityTrustResourceUrl('assets/common/images/po-list/assign-client-responsible.svg')
        );
        iconRegistry.addSvgIcon(
            'assign-emagine-responsible',
            sanitizer.bypassSecurityTrustResourceUrl('assets/common/images/po-list/assign-emagine-responsible.svg')
        );
        iconRegistry.addSvgIcon(
            'mark-as-completed',
            sanitizer.bypassSecurityTrustResourceUrl('assets/common/images/po-list/mark-as-completed.svg')
        );
        iconRegistry.addSvgIcon(
            'po-missing-icon',
            sanitizer.bypassSecurityTrustResourceUrl('assets/common/images/po-list/po-missing-icon.svg')
        );
        iconRegistry.addSvgIcon(
            'po-active-icon',
            sanitizer.bypassSecurityTrustResourceUrl('assets/common/images/po-list/po-active-icon.svg')
        );
        iconRegistry.addSvgIcon(
            'po-running-out-icon',
            sanitizer.bypassSecurityTrustResourceUrl('assets/common/images/po-list/po-running-out-icon.svg')
        );
        iconRegistry.addSvgIcon(
            'po-note-unread-icon',
            sanitizer.bypassSecurityTrustResourceUrl('assets/common/images/po-list/po-note-unread-icon.svg')
        );
        iconRegistry.addSvgIcon(
            'po-no-note-added-icon',
            sanitizer.bypassSecurityTrustResourceUrl('assets/common/images/po-list/po-no-note-added-icon.svg')
        );
        iconRegistry.addSvgIcon(
            'po-read-note-icon',
            sanitizer.bypassSecurityTrustResourceUrl('assets/common/images/po-list/po-read-note-icon.svg')
        );
        iconRegistry.addSvgIcon(
            'edit-po',
            sanitizer.bypassSecurityTrustResourceUrl('assets/common/images/po-list/edit-po.svg')
        );
        iconRegistry.addSvgIcon(
			'no-results-table',
			sanitizer.bypassSecurityTrustResourceUrl('assets/common/images/po-list/no-results-table.svg')
		);
        iconRegistry.addSvgIcon(
			'filter-icon',
			sanitizer.bypassSecurityTrustResourceUrl('assets/common/images/po-list/filter-icon.svg')
		);
    }

}
