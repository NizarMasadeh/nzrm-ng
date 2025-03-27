// lib/services/theme.service.ts
import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    private renderer: Renderer2;
    private _isDarkTheme = new BehaviorSubject<boolean>(true);

    // Observable that components can subscribe to
    public isDarkTheme$ = this._isDarkTheme.asObservable();

    constructor(rendererFactory: RendererFactory2) {
        this.renderer = rendererFactory.createRenderer(null, null);

        // Initialize theme from localStorage if available
        const savedTheme = localStorage.getItem('isDarkTheme');
        const initialTheme = savedTheme !== null ? savedTheme === 'true' :
            window.matchMedia('(prefers-color-scheme: dark)').matches;

        this.setTheme(initialTheme);
    }

    public get isDarkTheme(): boolean {
        return this._isDarkTheme.value;
    }

    public setTheme(isDark: boolean): void {
        this._isDarkTheme.next(isDark);
        localStorage.setItem('isDarkTheme', String(isDark));

        if (isDark) {
            this.renderer.addClass(document.documentElement, 'dark-theme');
            this.renderer.removeClass(document.documentElement, 'light-theme');
        } else {
            this.renderer.addClass(document.documentElement, 'light-theme');
            this.renderer.removeClass(document.documentElement, 'dark-theme');
        }
    }

    public toggleTheme(): void {
        this.setTheme(!this.isDarkTheme);
    }
}