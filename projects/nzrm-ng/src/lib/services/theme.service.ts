import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type Theme = 'dark' | 'light';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    private renderer: Renderer2;
    private _currentTheme = new BehaviorSubject<Theme>('dark');

    // Observable that components can subscribe to
    public currentTheme$ = this._currentTheme.asObservable();

    constructor(rendererFactory: RendererFactory2) {
        this.renderer = rendererFactory.createRenderer(null, null);

        // Initialize theme from localStorage if available
        const savedTheme = localStorage.getItem('theme') as Theme;
        if (savedTheme) {
            this.setTheme(savedTheme);
        } else {
            // Use system preference as fallback
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            this.setTheme(prefersDark ? 'dark' : 'light');
        }
    }

    public get currentTheme(): Theme {
        return this._currentTheme.value;
    }

    public setTheme(theme: Theme): void {
        this._currentTheme.next(theme);
        localStorage.setItem('theme', theme);

        if (theme === 'light') {
            this.renderer.addClass(document.body, 'light-theme');
        } else {
            this.renderer.removeClass(document.body, 'light-theme');
        }
    }

    public toggleTheme(): void {
        const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }
}