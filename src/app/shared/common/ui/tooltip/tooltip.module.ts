import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomTooltipComponent } from './custom-tooltip.component';
import { CustomTooltipDirective } from './custom-tooltip.directive';

@NgModule({
  declarations: [
    CustomTooltipComponent,
    CustomTooltipDirective
  ],
  imports: [
    CommonModule
  ],
  exports: [CustomTooltipDirective]
})
export class TooltipModule { }
