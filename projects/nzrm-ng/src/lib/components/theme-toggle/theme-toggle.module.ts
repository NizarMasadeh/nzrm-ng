import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme.service';
import { ThemeToggleComponent } from './theme-toggle.component';

@NgModule({
    imports: [
        CommonModule,
        ThemeToggleComponent
    ],
    exports: [
        ThemeToggleComponent
    ],
    providers: [
        ThemeService
    ]
})
export class ThemeModule { }