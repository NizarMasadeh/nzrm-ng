import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputTextDirective } from './input-text.directive';

@NgModule({
    declarations: [],
    imports: [CommonModule, InputTextDirective],
    exports: [InputTextDirective]
})
export class InputTextModule { }