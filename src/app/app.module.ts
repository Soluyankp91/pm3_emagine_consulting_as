import { NgModule } from '@angular/core';
import { BrowserModule, DomSanitizer } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppCommonModule } from './shared/common/app-common.module';
import { MatIconRegistry } from '@angular/material/icon';
import { HttpClientModule } from '@angular/common/http';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MainOverviewComponent } from './main-overview/main-overview.component';
import { ClientListComponent } from './client-list/client-list.component';
import { SourcingShortcutComponent } from './sourcing-shortcut/sourcing-shortcut.component';
import { WorkflowComponent } from './workflow/workflow.component';
import { StatisticsComponent } from './statistics/statistics.component';
import { TimeTrackingComponent } from './time-tracking/time-tracking.component';
import { EvaluationComponent } from './evaluation/evaluation.component';
import { InvoicingComponent } from './invoicing/invoicing.component';
import { ContractsComponent } from './contracts/contracts.component';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    MainOverviewComponent,
    ClientListComponent,
    SourcingShortcutComponent,
    WorkflowComponent,
    StatisticsComponent,
    TimeTrackingComponent,
    EvaluationComponent,
    InvoicingComponent,
    ContractsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppCommonModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(iconRegistry: MatIconRegistry, sanitizer: DomSanitizer) {
    // MENU ICONS REGISRTY
    iconRegistry.addSvgIcon(
        'evaluation-menu',
        sanitizer.bypassSecurityTrustResourceUrl(
            'assets/common/images/menu/achievement-menu.svg'
        )
    );

    iconRegistry.addSvgIcon(
        'contracts-menu',
        sanitizer.bypassSecurityTrustResourceUrl(
            'assets/common/images/menu/agreement-menu.svg'
        )
    );

    iconRegistry.addSvgIcon(
      'dashboard-menu',
      sanitizer.bypassSecurityTrustResourceUrl(
          'assets/common/images/menu/dashboard-menu.svg'
      )
    );

    iconRegistry.addSvgIcon(
      'overview-menu',
      sanitizer.bypassSecurityTrustResourceUrl(
          'assets/common/images/menu/list-menu.svg'
      )
    );

    iconRegistry.addSvgIcon(
      'time-tracking-menu',
      sanitizer.bypassSecurityTrustResourceUrl(
          'assets/common/images/menu/location-menu.svg'
      )
    );

    iconRegistry.addSvgIcon(
      'invoicing-menu',
      sanitizer.bypassSecurityTrustResourceUrl(
          'assets/common/images/menu/reports-menu.svg'
      )
    );

    iconRegistry.addSvgIcon(
      'sourcing-shortcut-menu',
      sanitizer.bypassSecurityTrustResourceUrl(
          'assets/common/images/menu/script-menu.svg'
      )
    );

    iconRegistry.addSvgIcon(
      'statistic-menu',
      sanitizer.bypassSecurityTrustResourceUrl(
          'assets/common/images/menu/statistic-menu.svg'
      )
    );

    iconRegistry.addSvgIcon(
      'client-list-menu',
      sanitizer.bypassSecurityTrustResourceUrl(
          'assets/common/images/menu/users-menu.svg'
      )
    );

    iconRegistry.addSvgIcon(
      'workflow-menu',
      sanitizer.bypassSecurityTrustResourceUrl(
          'assets/common/images/menu/value-chain-menu.svg'
      )
    );
  }
}
