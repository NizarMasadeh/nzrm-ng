import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkeletonDirective } from './skeleton.directive';

@NgModule({
  imports: [
    CommonModule,
    SkeletonDirective
  ],
  exports: [
    SkeletonDirective
  ]
})
export class SkeletonModule { }
