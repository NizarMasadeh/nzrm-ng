import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TooltipDirective } from './tooltip.directive';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    TooltipDirective
  ],
  exports: [
    TooltipDirective
  ]
})
export class TooltipModule { }
