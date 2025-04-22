import { Directive, ElementRef, HostListener, Input, OnInit, OnChanges, SimpleChanges, Renderer2 } from '@angular/core';

type ButtonSeverity = 'primary' | 'secondary' | 'success' | 'info' | 'warn' | 'error';
type ButtonSize = 'sm' | 'md' | 'lg';

@Directive({
    selector: '[nButton]',
    standalone: true,
})
export class ButtonDirective implements OnInit, OnChanges {
    @Input() severity: ButtonSeverity = 'primary';
    @Input() size: ButtonSize = 'md';
    @Input() label: string = '';
    @Input() outlined: boolean = false;
    @Input() rounded: boolean = false;
    @Input()
    get disabled(): boolean {
        return this._disabled;
    }
    set disabled(value: boolean) {
        this._disabled = value;
        this.updateDisabledState();
    }
    private _disabled: boolean = false;
    @Input() icon: string = '';
    @Input() iconPos: 'left' | 'right' = 'left';
    @Input()
    set loading(value: boolean) {
        if (value) {
            if (!this.originalLabel) {
                this.originalLabel = this.label;
            }
        } else {
        }
        this._loading = value;
        this.updateDisabledState();
    }
    get loading(): boolean {
        return this._loading;
    }
    private _loading: boolean = false;
    @Input() ripple: boolean = true;

    private loadingSpinner: HTMLElement | null = null;
    private initialMinWidth: string | null = null;
    private originalLabel: string | null = null;

    @HostListener('click', ['$event'])
    onClick(event: MouseEvent): void {
        if (this.disabled || !this.ripple) return;

        this.createRippleEffect(event);
    }

    constructor(private el: ElementRef, private renderer: Renderer2) { }

    ngOnInit(): void {
        this.applyBaseStyles();
        this.applySeverityStyles();
        this.applySizeStyles();

        this.initialMinWidth = this.getMinWidth();

        if (this.outlined) {
            this.applyOutlinedStyles();
        }

        if (this.rounded) {
            this.applyRoundedStyles();
        }

        const isIconOnly = this.icon && !this.label;

        if (isIconOnly) {
            this.applyIconOnlyStyles();
        }

        this.addButtonContent();

        if (this.loading) {
            this.applyLoadingState();
        }

        this.addRippleStyles();

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'disabled') {
                    const nativeDisabled = this.el.nativeElement.hasAttribute('disabled');
                    if (nativeDisabled !== this._disabled) {
                        this._disabled = nativeDisabled;
                        this.updateDisabledState();
                    }
                }
            });
        });

        observer.observe(this.el.nativeElement, {
            attributes: true,
            attributeFilter: ['disabled']
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['loading']) {
            if (changes['loading'].currentValue) {
                this.applyLoadingState();
            } else {
                this.removeLoadingState();
            }
        }
        if (changes['disabled']) {
            this.updateDisabledState();
        }
    }

    private createRippleEffect(event: MouseEvent): void {
        const ripple = this.renderer.createElement('span');
        this.renderer.addClass(ripple, 'n-button-ripple');

        const rect = this.el.nativeElement.getBoundingClientRect();

        const size = Math.max(rect.width, rect.height) * 2;

        this.renderer.setStyle(ripple, 'width', `${size}px`);
        this.renderer.setStyle(ripple, 'height', `${size}px`);

        const x = event.clientX - rect.left - (size / 2);
        const y = event.clientY - rect.top - (size / 2);
        this.renderer.setStyle(ripple, 'left', `${x}px`);
        this.renderer.setStyle(ripple, 'top', `${y}px`);

        this.renderer.appendChild(this.el.nativeElement, ripple);

        setTimeout(() => {
            if (this.el.nativeElement.contains(ripple)) {
                this.renderer.removeChild(this.el.nativeElement, ripple);
            }
        }, 600);
    }

    private addRippleStyles(): void {
        if (!document.getElementById('n-button-ripple-style')) {
            const style = this.renderer.createElement('style');
            style.id = 'n-button-ripple-style';
            const css = `
                .n-button-ripple {
                    position: absolute;
                    border-radius: 50%;
                    background-color: rgba(255, 255, 255, 0.4);
                    transform: scale(0);
                    animation: n-button-ripple-animation 0.6s ease-out;
                    pointer-events: none;
                }
                
                @keyframes n-button-ripple-animation {
                    to {
                        transform: scale(2);
                        opacity: 0;
                    }
                }
            `;
            this.renderer.appendChild(style, this.renderer.createText(css));
            this.renderer.appendChild(document.head, style);
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
            'transition': 'background-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease, width 0.2s ease, padding 0.2s ease, min-width 0.2s ease',
            'position': 'relative',
            'overflow': 'hidden',
            'box-shadow': 'var(--shadow-sm)',
            'text-transform': 'none',
            'letter-spacing': '0.3px',
            'border-radius': '6px',
            'min-width': this.getMinWidth(),
        };

        Object.entries(styles).forEach(([property, value]) => {
            this.renderer.setStyle(this.el.nativeElement, property, value);
        });
    }

    private getMinWidth(): string {
        switch (this.size) {
            case 'sm': return '80px';
            case 'lg': return '120px';
            case 'md':
            default: return '100px';
        }
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

    private updateDisabledState(): void {
        if (this._disabled || this.loading) {
            this.applyDisabledStyles();
        } else {
            this.removeDisabledStyles();
        }
    }

    private applyDisabledStyles(): void {
        this.renderer.setProperty(this.el.nativeElement, 'disabled', true);
        this.renderer.setStyle(this.el.nativeElement, 'opacity', '0.6');
        this.renderer.setStyle(this.el.nativeElement, 'cursor', 'not-allowed');
        this.renderer.setStyle(this.el.nativeElement, 'pointer-events', 'none');
    }

    private removeDisabledStyles(): void {
        this.renderer.removeAttribute(this.el.nativeElement, 'disabled');
        this.renderer.removeStyle(this.el.nativeElement, 'opacity');
        this.renderer.setStyle(this.el.nativeElement, 'cursor', 'pointer');
        this.renderer.removeStyle(this.el.nativeElement, 'pointer-events');
    }

    private applyIconOnlyStyles(): void {
        const size = this.getIconOnlySize();

        this.renderer.setStyle(this.el.nativeElement, 'width', size);
        this.renderer.setStyle(this.el.nativeElement, 'min-width', size);
        this.renderer.setStyle(this.el.nativeElement, 'padding', '0');

        if (this.rounded) {
            this.renderer.setStyle(this.el.nativeElement, 'border-radius', '50%');
        }
    }

    private getIconOnlySize(): string {
        switch (this.size) {
            case 'sm': return '32px';
            case 'lg': return '48px';
            case 'md':
            default: return '40px';
        }
    }

    private addButtonContent(): void {
        while (this.el.nativeElement.firstChild) {
            this.renderer.removeChild(this.el.nativeElement, this.el.nativeElement.firstChild);
        }

        const container = this.renderer.createElement('div');
        this.renderer.setStyle(container, 'display', 'flex');
        this.renderer.setStyle(container, 'align-items', 'center');
        this.renderer.setStyle(container, 'justify-content', 'center');
        this.renderer.setStyle(container, 'width', '100%');
        this.renderer.setStyle(container, 'height', '100%');
        this.renderer.setStyle(container, 'transition', 'all 0.2s ease-in-out');

        if (this.icon && this.label) {
            if (this.iconPos === 'left') {
                const iconEl = this.createIconElement(true);
                const labelEl = this.createLabelElement();
                this.renderer.appendChild(container, iconEl);
                this.renderer.appendChild(container, labelEl);
            } else {
                const labelEl = this.createLabelElement();
                const iconEl = this.createIconElement(false);
                this.renderer.appendChild(container, labelEl);
                this.renderer.appendChild(container, iconEl);
            }
        } else if (this.icon) {
            const iconEl = this.createIconElement(false);
            this.renderer.appendChild(container, iconEl);
        } else if (this.label) {
            const labelEl = this.createLabelElement();
            this.renderer.appendChild(container, labelEl);
        }

        this.renderer.appendChild(this.el.nativeElement, container);
    }

    private createIconElement(isLeftIcon: boolean): HTMLElement {
        const iconElement = this.renderer.createElement('i');

        if (this.icon) {
            const iconClasses = this.icon.split(' ');
            iconClasses.forEach(className => {
                if (className) {
                    this.renderer.addClass(iconElement, className);
                }
            });
        }

        let iconSize: string;
        switch (this.size) {
            case 'sm': iconSize = '0.875rem'; break;
            case 'lg': iconSize = '1.25rem'; break;
            case 'md':
            default: iconSize = '1rem';
        }

        this.renderer.setStyle(iconElement, 'font-size', iconSize);

        if (this.label) {
            if (isLeftIcon) {
                this.renderer.setStyle(iconElement, 'margin-right', '0.5rem');
            } else {
                this.renderer.setStyle(iconElement, 'margin-left', '0.5rem');
            }
        }

        return iconElement;
    }

    private createLabelElement(): HTMLElement {
        const span = this.renderer.createElement('span');
        const text = this.renderer.createText(this.label);
        this.renderer.appendChild(span, text);
        return span;
    }

    private removeLoadingState(): void {
        if (this.loadingSpinner && this.el.nativeElement.contains(this.loadingSpinner)) {
            this.renderer.setStyle(this.loadingSpinner, 'opacity', '0');
            const spinner = this.loadingSpinner;
            setTimeout(() => {
                if (this.el.nativeElement.contains(spinner)) {
                    this.renderer.removeChild(this.el.nativeElement.firstChild, spinner);
                }
            }, 200);
        }

        this.loadingSpinner = null;
        this.renderer.removeAttribute(this.el.nativeElement, 'disabled');
        this.renderer.setStyle(this.el.nativeElement, 'cursor', 'pointer');
        this.renderer.setStyle(this.el.nativeElement, 'min-width', this.initialMinWidth);
    }

    private applyLoadingState(): void {
        const spinner = this.renderer.createElement('span');
        this.renderer.addClass(spinner, 'n-button-spinner');

        this.renderer.setStyle(spinner, 'width', '1em');
        this.renderer.setStyle(spinner, 'height', '1em');
        this.renderer.setStyle(spinner, 'border-radius', '50%');
        this.renderer.setStyle(spinner, 'border', '2px solid currentColor');
        this.renderer.setStyle(spinner, 'border-right-color', 'transparent');
        this.renderer.setStyle(spinner, 'animation', 'n-button-spin 0.75s linear infinite');
        this.renderer.setStyle(spinner, 'opacity', '0');
        this.renderer.setStyle(spinner, 'position', 'relative');

        if (this.label) {
            this.renderer.setStyle(spinner, 'margin-right', '0.5rem');
        }

        if (!document.getElementById('n-button-spinner-style')) {
            const style = this.renderer.createElement('style');
            style.id = 'n-button-spinner-style';
            const css = `
                @keyframes n-button-spin {
                    to { transform: rotate(360deg); }
                }
                .n-button-spinner {
                    opacity: 1 !important;
                    transition: opacity 0.2s ease-in-out;
                }
            `;
            this.renderer.appendChild(style, this.renderer.createText(css));
            this.renderer.appendChild(document.head, style);
        }

        const container = this.el.nativeElement.firstChild;
        if (container) {
            this.renderer.insertBefore(container, spinner, container.firstChild);
        } else {
            this.renderer.appendChild(this.el.nativeElement, spinner);
        }

        spinner.offsetHeight;
        this.renderer.setStyle(spinner, 'opacity', '1');

        this.loadingSpinner = spinner;
        this.renderer.setProperty(this.el.nativeElement, 'disabled', true);
        this.renderer.setStyle(this.el.nativeElement, 'cursor', 'wait');
    }
}
