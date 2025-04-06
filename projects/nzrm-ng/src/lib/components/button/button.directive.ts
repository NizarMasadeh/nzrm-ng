import { Directive, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';

type ButtonSeverity = 'primary' | 'secondary' | 'success' | 'info' | 'warn' | 'error';
type ButtonSize = 'sm' | 'md' | 'lg';

@Directive({
    selector: '[nButton]',
    standalone: true,
})
export class ButtonDirective implements OnInit {
    @Input() severity: ButtonSeverity = 'primary';
    @Input() size: ButtonSize = 'md';
    @Input() label: string = '';
    @Input() outlined: boolean = false;
    @Input() rounded: boolean = false;
    @Input() disabled: boolean = false;
    @Input() icon: string = '';
    @Input() iconPos: 'left' | 'right' = 'left';
    @Input() loading: boolean = false;

    constructor(private el: ElementRef, private renderer: Renderer2) { }

    ngOnInit(): void {
        this.applyBaseStyles();

        this.applySeverityStyles();

        this.applySizeStyles();

        if (this.outlined) {
            this.applyOutlinedStyles();
        }

        if (this.rounded) {
            this.applyRoundedStyles();
        }

        if (this.disabled) {
            this.applyDisabledStyles();
        }

        if (this.label) {
            this.addLabel();
        }

        if (this.icon) {
            this.addIcon();
        }

        if (this.loading) {
            this.applyLoadingState();
        }
    }

    private applyBaseStyles(): void {
        const styles = {
            'display': 'inline-flex',
            'align-items': 'center',
            'justify-content': 'center',
            'font-family': 'Inter, sans-serif',
            'font-weight': '500',
            'border': 'none',
            'cursor': 'pointer',
            'transition': 'all 0.2s ease',
            'position': 'relative',
            'overflow': 'hidden',
            'box-shadow': 'var(--shadow-sm)',
            'text-transform': 'none',
            'letter-spacing': '0.3px',
            'border-radius': '6px',
        };

        Object.entries(styles).forEach(([property, value]) => {
            this.renderer.setStyle(this.el.nativeElement, property, value);
        });
    }

    private applySeverityStyles(): void {
        let bgColor: string;
        let textColor: string;
        let hoverBgColor: string;

        switch (this.severity) {
            case 'primary':
                bgColor = 'var(--brand-primary)';
                textColor = '#ffffff';
                hoverBgColor = 'var(--brand-secondary)';
                break;
            case 'secondary':
                bgColor = 'var(--bg-tertiary)';
                textColor = 'var(--text-primary)';
                hoverBgColor = 'var(--bg-secondary)';
                break;
            case 'success':
                bgColor = 'var(--success-color)';
                textColor = '#ffffff';
                hoverBgColor = 'color-mix(in srgb, var(--success-color), #000 10%)';
                break;
            case 'info':
                bgColor = 'var(--info-color)';
                textColor = '#ffffff';
                hoverBgColor = 'color-mix(in srgb, var(--info-color), #000 10%)';
                break;
            case 'warn':
                bgColor = 'var(--warn-color)';
                textColor = '#ffffff';
                hoverBgColor = 'color-mix(in srgb, var(--warn-color), #000 10%)';
                break;
            case 'error':
                bgColor = 'var(--error-color)';
                textColor = '#ffffff';
                hoverBgColor = 'color-mix(in srgb, var(--error-color), #000 10%)';
                break;
            default:
                bgColor = 'var(--brand-primary)';
                textColor = '#ffffff';
                hoverBgColor = 'var(--brand-secondary)';
        }

        this.renderer.setStyle(this.el.nativeElement, 'background-color', bgColor);
        this.renderer.setStyle(this.el.nativeElement, 'color', textColor);

        this.renderer.listen(this.el.nativeElement, 'mouseenter', () => {
            if (!this.disabled) {
                this.renderer.setStyle(this.el.nativeElement, 'background-color', hoverBgColor);
                this.renderer.setStyle(this.el.nativeElement, 'box-shadow', 'var(--shadow-md)');
            }
        });

        this.renderer.listen(this.el.nativeElement, 'mouseleave', () => {
            if (!this.disabled) {
                this.renderer.setStyle(this.el.nativeElement, 'background-color', bgColor);
                this.renderer.setStyle(this.el.nativeElement, 'box-shadow', 'var(--shadow-sm)');
            }
        });
    }

    private applySizeStyles(): void {
        let padding: string;
        let fontSize: string;
        let height: string;

        switch (this.size) {
            case 'sm':
                padding = '0.5rem 0.75rem';
                fontSize = '0.75rem';
                height = '32px';
                break;
            case 'lg':
                padding = '0.75rem 1.5rem';
                fontSize = '1rem';
                height = '48px';
                break;
            case 'md':
            default:
                padding = '0.625rem 1.25rem';
                fontSize = '0.875rem';
                height = '40px';
        }

        this.renderer.setStyle(this.el.nativeElement, 'padding', padding);
        this.renderer.setStyle(this.el.nativeElement, 'font-size', fontSize);
        this.renderer.setStyle(this.el.nativeElement, 'height', height);
    }

    private applyOutlinedStyles(): void {
        let borderColor: string;
        let textColor: string;
        let hoverBgColor: string;

        switch (this.severity) {
            case 'primary':
                borderColor = 'var(--brand-primary)';
                textColor = 'var(--brand-primary)';
                hoverBgColor = 'rgba(123, 104, 238, 0.1)';
                break;
            case 'secondary':
                borderColor = 'var(--border-color)';
                textColor = 'var(--text-primary)';
                hoverBgColor = 'var(--bg-tertiary)';
                break;
            case 'success':
                borderColor = 'var(--success-color)';
                textColor = 'var(--success-color)';
                hoverBgColor = 'rgba(74, 222, 128, 0.1)';
                break;
            case 'info':
                borderColor = 'var(--info-color)';
                textColor = 'var(--info-color)';
                hoverBgColor = 'rgba(96, 165, 250, 0.1)';
                break;
            case 'warn':
                borderColor = 'var(--warn-color)';
                textColor = 'var(--warn-color)';
                hoverBgColor = 'rgba(251, 191, 36, 0.1)';
                break;
            case 'error':
                borderColor = 'var(--error-color)';
                textColor = 'var(--error-color)';
                hoverBgColor = 'rgba(248, 113, 113, 0.1)';
                break;
            default:
                borderColor = 'var(--brand-primary)';
                textColor = 'var(--brand-primary)';
                hoverBgColor = 'rgba(123, 104, 238, 0.1)';
        }

        this.renderer.setStyle(this.el.nativeElement, 'background-color', 'transparent');
        this.renderer.setStyle(this.el.nativeElement, 'border', `1px solid ${borderColor}`);
        this.renderer.setStyle(this.el.nativeElement, 'color', textColor);

        this.renderer.listen(this.el.nativeElement, 'mouseenter', () => {
            if (!this.disabled) {
                this.renderer.setStyle(this.el.nativeElement, 'background-color', hoverBgColor);
            }
        });

        this.renderer.listen(this.el.nativeElement, 'mouseleave', () => {
            if (!this.disabled) {
                this.renderer.setStyle(this.el.nativeElement, 'background-color', 'transparent');
            }
        });
    }

    private applyRoundedStyles(): void {
        this.renderer.setStyle(this.el.nativeElement, 'border-radius', '50px');
    }

    private applyDisabledStyles(): void {
        this.renderer.setProperty(this.el.nativeElement, 'disabled', true);
        this.renderer.setStyle(this.el.nativeElement, 'opacity', '0.6');
        this.renderer.setStyle(this.el.nativeElement, 'cursor', 'not-allowed');
        this.renderer.setStyle(this.el.nativeElement, 'pointer-events', 'none');
    }

    private addLabel(): void {
        const span = this.renderer.createElement('span');
        const text = this.renderer.createText(this.label);
        this.renderer.appendChild(span, text);

        while (this.el.nativeElement.firstChild) {
            this.renderer.removeChild(this.el.nativeElement, this.el.nativeElement.firstChild);
        }

        this.renderer.appendChild(this.el.nativeElement, span);
    }

    private addIcon(): void {
        const iconElement = this.renderer.createElement('i');

        if (this.icon) {
            const iconClasses = this.icon.split(' ');
            iconClasses.forEach(className => {
                if (className) {
                    this.renderer.addClass(iconElement, className);
                }
            });
        }

        if (this.iconPos === 'left') {
            this.renderer.setStyle(iconElement, 'margin-right', '0.5rem');
            this.renderer.insertBefore(this.el.nativeElement, iconElement, this.el.nativeElement.firstChild);
        } else {
            this.renderer.setStyle(iconElement, 'margin-left', '0.5rem');
            this.renderer.appendChild(this.el.nativeElement, iconElement);
        }
    }

    private applyLoadingState(): void {
        const spinner = this.renderer.createElement('span');
        this.renderer.addClass(spinner, 'n-button-spinner');

        this.renderer.setStyle(spinner, 'width', '1em');
        this.renderer.setStyle(spinner, 'height', '1em');
        this.renderer.setStyle(spinner, 'border-radius', '50%');
        this.renderer.setStyle(spinner, 'border', '2px solid currentColor');
        this.renderer.setStyle(spinner, 'border-right-color', 'transparent');
        this.renderer.setStyle(spinner, 'margin-right', '0.5rem');
        this.renderer.setStyle(spinner, 'animation', 'n-button-spin 0.75s linear infinite');

        if (!document.getElementById('n-button-spinner-style')) {
            const style = this.renderer.createElement('style');
            style.id = 'n-button-spinner-style';
            const css = `
        @keyframes n-button-spin {
          to { transform: rotate(360deg); }
        }
      `;
            this.renderer.appendChild(style, this.renderer.createText(css));
            this.renderer.appendChild(document.head, style);
        }

        this.renderer.insertBefore(this.el.nativeElement, spinner, this.el.nativeElement.firstChild);

        this.renderer.setProperty(this.el.nativeElement, 'disabled', true);
        this.renderer.setStyle(this.el.nativeElement, 'cursor', 'wait');
    }
}