import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonDirective } from './button.directive';

@NgModule({
    imports: [ButtonDirective, CommonModule],
    exports: [ButtonDirective]
})
export class ButtonModule { }