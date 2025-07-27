import { Component, Input } from '@angular/core';

import { ThemeService } from '../../services/theme.service';

@Component({
    selector: 'app-theme-toggle',
    standalone: true,
    imports: [],
    template: `
    <button
      class="theme-toggle"
      [class.theme-toggle-small]="size === 'small'"
      [class.theme-toggle-large]="size === 'large'"
      (click)="toggleTheme()"
      [attr.aria-label]="'Toggle ' + (isDarkTheme ? 'light' : 'dark') + ' mode'"
      >
      <div class="theme-toggle-icon">
        @if (isDarkTheme) {
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
        }
        @if (!isDarkTheme) {
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
        }
      </div>
    </button>
    `,
    styles: [`
    .theme-toggle {
      background-color: var(--bg-tertiary);
      color: var(--text-primary);
      border: 1px solid var(--border-color);
      border-radius: 50%;
      cursor: pointer;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      padding: 0;
      box-shadow: var(--shadow-sm);
    }
    
    .theme-toggle:hover {
      box-shadow: var(--shadow-md);
    }
    
    .theme-toggle:active {
      transform: translateY(0);
    }
    
    .theme-toggle-icon {
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .theme-toggle-small {
      width: 32px;
      height: 32px;
    }
    
    .theme-toggle-small .theme-toggle-icon {
      width: 16px;
      height: 16px;
    }
    
    .theme-toggle-large {
      width: 48px;
      height: 48px;
    }
    
    .theme-toggle-large .theme-toggle-icon {
      width: 24px;
      height: 24px;
    }
  `]
})
export class ThemeToggleComponent {
    @Input() size: 'small' | 'medium' | 'large' = 'medium';

    constructor(private themeService: ThemeService) { }

    get isDarkTheme(): boolean {
        return this.themeService.isDarkTheme;
    }

    toggleTheme(): void {
        this.themeService.toggleTheme();
    }
}