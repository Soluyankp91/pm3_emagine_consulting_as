import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BiReportsComponent } from './bi-reports.component';
import { BiReportsRoutingModule } from './bi-reports-routing.module';



@NgModule({
  declarations: [
    BiReportsComponent
  ],
  imports: [
    CommonModule,
    BiReportsRoutingModule
  ]
})
export class BiReportsModule { }
