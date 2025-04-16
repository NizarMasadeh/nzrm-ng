import { Directive, ElementRef, HostListener, Input, OnInit, OnDestroy, Renderer2 } from '@angular/core';

export type TooltipSeverity = 'info' | 'success' | 'error' | 'warn' | 'normal';
export type TooltipPosition = 'top' | 'right' | 'bottom' | 'left';

@Directive({
    selector: '[nTooltip]',
    standalone: true,
})
export class TooltipDirective implements OnInit, OnDestroy {
    @Input() tooltipText = '';
    @Input() showOnlyIf = true;
    @Input() sticky = false;
    @Input() severity: TooltipSeverity = 'normal';
    @Input() position: TooltipPosition = 'top';
    @Input() showDelay = 100;
    @Input() hideDelay = 100;
    @Input() maxWidth = '250px';

    private tooltipElement: HTMLElement | null = null;
    private isVisible = false;
    private showTimeoutId: any = null;
    private hideTimeoutId: any = null;

    constructor(
        private el: ElementRef,
        private renderer: Renderer2,
    ) { }

    ngOnInit() {
        this.initializeTooltip();

        if (this.sticky && this.showOnlyIf) {
            setTimeout(() => this.showTooltip(), 0);
        }
    }

    private initializeTooltip(): void {
        if (this.tooltipElement) {
            this.renderer.removeChild(document.body, this.tooltipElement);
        }

        this.tooltipElement = this.renderer.createElement('div');
        this.renderer.addClass(this.tooltipElement, 'n-tooltip');
        this.renderer.addClass(this.tooltipElement, `n-tooltip-${this.position}`);

        if (this.severity !== 'normal') {
            this.renderer.addClass(this.tooltipElement, `n-tooltip-${this.severity}`);
        }

        const contentWrapper = this.renderer.createElement('div');
        this.renderer.addClass(contentWrapper, 'n-tooltip-content');

        if (this.severity !== 'normal') {
            const iconElement = this.renderer.createElement('span');
            this.renderer.addClass(iconElement, 'n-tooltip-icon');

            this.renderer.addClass(iconElement, 'pi');

            switch (this.severity) {
                case 'info':
                    this.renderer.addClass(iconElement, 'pi-info-circle');
                    break;
                case 'success':
                    this.renderer.addClass(iconElement, 'pi-check-circle');
                    break;
                case 'warn':
                    this.renderer.addClass(iconElement, 'pi-exclamation-triangle');
                    break;
                case 'error':
                    this.renderer.addClass(iconElement, 'pi-times-circle');
                    break;
            }

            this.renderer.appendChild(contentWrapper, iconElement);
        }

        const textElement = this.renderer.createElement('span');
        this.renderer.addClass(textElement, 'n-tooltip-text');
        const textNode = this.renderer.createText(this.tooltipText);
        this.renderer.appendChild(textElement, textNode);
        this.renderer.appendChild(contentWrapper, textElement);

        this.renderer.appendChild(this.tooltipElement, contentWrapper);

        this.renderer.setStyle(this.tooltipElement, 'max-width', this.maxWidth);

        this.renderer.setStyle(this.tooltipElement, 'position', 'absolute');
        this.renderer.setStyle(this.tooltipElement, 'z-index', '9999');
        this.renderer.setStyle(this.tooltipElement, 'display', 'none');
        this.renderer.setStyle(this.tooltipElement, 'opacity', '0');

        this.renderer.appendChild(document.body, this.tooltipElement);
    }

    @HostListener('mouseenter')
    onMouseEnter(): void {
        if (!this.showOnlyIf) return;
        this.clearTimeouts();

        this.showTimeoutId = setTimeout(() => {
            this.showTooltip();
        }, this.showDelay);
    }

    @HostListener('focus')
    onFocus(): void {
        if (!this.showOnlyIf) return;
        this.clearTimeouts();

        this.showTimeoutId = setTimeout(() => {
            this.showTooltip();
        }, this.showDelay);
    }

    @HostListener('mouseleave')
    onMouseLeave(): void {
        if (this.tooltipElement && !this.sticky) {
            this.clearTimeouts();

            this.hideTimeoutId = setTimeout(() => {
                this.hideTooltip();
            }, this.hideDelay);
        }
    }

    @HostListener('blur')
    onBlur(): void {
        if (this.tooltipElement && !this.sticky) {
            this.clearTimeouts();

            this.hideTimeoutId = setTimeout(() => {
                this.hideTooltip();
            }, this.hideDelay);
        }
    }

    @HostListener('click')
    onClick(): void {
        if (this.sticky && this.showOnlyIf) {
            if (this.isVisible) {
                this.hideTooltip();
            } else {
                this.showTooltip();
            }
        }
    }

    @HostListener('window:scroll')
    onScroll(): void {
        if (this.tooltipElement && this.showOnlyIf && this.isVisible) {
            this.updateTooltipPosition();
        }
    }

    @HostListener('window:resize')
    onResize(): void {
        if (this.tooltipElement && this.showOnlyIf && this.isVisible) {
            this.updateTooltipPosition();
        }
    }

    private clearTimeouts(): void {
        if (this.showTimeoutId) {
            clearTimeout(this.showTimeoutId);
            this.showTimeoutId = null;
        }

        if (this.hideTimeoutId) {
            clearTimeout(this.hideTimeoutId);
            this.hideTimeoutId = null;
        }
    }

    private showTooltip(): void {
        if (!this.tooltipElement) return;

        this.renderer.setStyle(this.tooltipElement, 'display', 'block');

        this.updateTooltipPosition();

        void this.tooltipElement.offsetHeight;

        this.renderer.setStyle(this.tooltipElement, 'opacity', '1');
        this.isVisible = true;
    }

    private hideTooltip(): void {
        if (!this.tooltipElement) return;

        this.renderer.setStyle(this.tooltipElement, 'opacity', '0');

        // Wait for the transition to complete
        setTimeout(() => {
            if (this.tooltipElement && !this.isVisible) {
                this.renderer.setStyle(this.tooltipElement, 'display', 'none');
            }
        }, 300);

        this.isVisible = false;
    }

    private updateTooltipPosition(): void {
        if (!this.tooltipElement) return;

        const hostRect = this.el.nativeElement.getBoundingClientRect();
        let tooltipRect = this.tooltipElement.getBoundingClientRect();

        if (tooltipRect.width === 0 || tooltipRect.height === 0) {
            const currentDisplay = this.tooltipElement.style.display;
            const currentOpacity = this.tooltipElement.style.opacity;

            this.renderer.setStyle(this.tooltipElement, 'display', 'block');
            this.renderer.setStyle(this.tooltipElement, 'opacity', '0');

            tooltipRect = this.tooltipElement.getBoundingClientRect();

            if (!this.isVisible) {
                this.renderer.setStyle(this.tooltipElement, 'display', currentDisplay);
                this.renderer.setStyle(this.tooltipElement, 'opacity', currentOpacity);
            }
        }

        let top = 0, left = 0;

        switch (this.position) {
            case 'top':
                top = hostRect.top - tooltipRect.height - 8;
                left = hostRect.left + (hostRect.width / 2) - (tooltipRect.width / 2);
                break;
            case 'right':
                top = hostRect.top + (hostRect.height / 2) - (tooltipRect.height / 2);
                left = hostRect.right + 8;
                break;
            case 'bottom':
                top = hostRect.bottom + 8;
                left = hostRect.left + (hostRect.width / 2) - (tooltipRect.width / 2);
                break;
            case 'left':
                top = hostRect.top + (hostRect.height / 2) - (tooltipRect.height / 2);
                left = hostRect.left - tooltipRect.width - 8;
                break;
        }

        this.renderer.setStyle(this.tooltipElement, 'top', `${top + window.pageYOffset}px`);
        this.renderer.setStyle(this.tooltipElement, 'left', `${left + window.pageXOffset}px`);
    }

    ngOnDestroy(): void {
        this.clearTimeouts();

        if (this.tooltipElement) {
            this.renderer.removeChild(document.body, this.tooltipElement);
            this.tooltipElement = null;
        }
    }
}