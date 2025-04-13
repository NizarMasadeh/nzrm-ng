import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DropdownDirective } from './drop-down.directive';
import { DropdownComponent } from './drop-down.component';
import { DropdownManagerService } from './drop-down.service';

@NgModule({
    imports: [CommonModule, DropdownComponent, DropdownDirective],
    exports: [DropdownDirective, DropdownComponent],
    providers: [DropdownManagerService]
})
export class DropdownModule { }