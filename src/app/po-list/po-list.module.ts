import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PoListComponent } from './po-list.component';
import { AppCommonModule } from '../shared/common/app-common.module';
import { PurchaseOrdersRoutingModule } from './po-list-routing.module';



@NgModule({
  declarations: [
    PoListComponent
  ],
  imports: [
    CommonModule,
    AppCommonModule,
    PurchaseOrdersRoutingModule
  ]
})
export class PoListModule { }
