import { Directive, ElementRef, HostListener, Input, OnInit, Renderer2 } from '@angular/core';

@Directive({
    selector: '[nTooltip]',
    standalone: true,
})
export class TooltipDirective implements OnInit {
    @Input() tooltipText = '';
    @Input() showOnlyIf = true;
    @Input() sticky = false;

    private tooltipElement: HTMLElement | null = null;
    private isVisible = false;

    constructor(
        private el: ElementRef,
        private renderer: Renderer2,
    ) { }

    ngOnInit() {
        this.tooltipElement = this.renderer.createElement("div");
        this.renderer.addClass(this.tooltipElement, "custom-tooltip");

        const textNode = this.renderer.createText(this.tooltipText);
        this.renderer.appendChild(this.tooltipElement, textNode);

        const rect = this.el.nativeElement.getBoundingClientRect();
        this.renderer.setStyle(this.tooltipElement, "top", `${rect.top + window.scrollY - 10}px`);
        this.renderer.setStyle(this.tooltipElement, "left", `${rect.left + window.scrollX + rect.width / 2}px`);
        this.renderer.setStyle(this.tooltipElement, "transform", "translate(-50%, -100%)");
        this.renderer.setStyle(this.tooltipElement, "display", "none");

        this.renderer.appendChild(document.body, this.tooltipElement);

        if (this.sticky && this.showOnlyIf) {
            this.showTooltip();
        }
    }

    @HostListener('mouseenter')
    @HostListener('touchstart')
    onMouseEnter(): void {
        if (!this.showOnlyIf) return;
        this.showTooltip();
    }

    @HostListener('mouseleave')
    @HostListener('touchend')
    onMouseLeave(): void {
        if (this.tooltipElement && !this.sticky) {
            this.hideTooltip();
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

    @HostListener('window:resize')
    onResize(): void {
        if (
            this.tooltipElement &&
            this.showOnlyIf &&
            this.isVisible
        ) {
            this.updateTooltipPosition();
        }
    }

    private showTooltip(): void {
        if (!this.tooltipElement) return;

        this.updateTooltipPosition();
        this.renderer.setStyle(this.tooltipElement, 'opacity', '1');
        this.renderer.setStyle(this.tooltipElement, 'display', 'block');
        this.isVisible = true;
    }

    private hideTooltip(): void {
        if (!this.tooltipElement) return;

        this.renderer.setStyle(this.tooltipElement, 'opacity', '0');
        setTimeout(() => {
            if (this.tooltipElement && !this.isVisible) {
                this.renderer.setStyle(this.tooltipElement, 'display', 'none');
            }
        }, 300);
        this.isVisible = false;
    }

    private updateTooltipPosition(): void {
        if (!this.tooltipElement) return;

        const rect = this.el.nativeElement.getBoundingClientRect();
        this.renderer.setStyle(
            this.tooltipElement,
            'top',
            `${rect.top + window.scrollY - 10}px`
        );
        this.renderer.setStyle(
            this.tooltipElement,
            'left',
            `${rect.left + window.scrollX + rect.width / 2}px`
        );
    }

    ngOnDestroy(): void {
        if (this.tooltipElement) {
            this.renderer.removeChild(document.body, this.tooltipElement);
        }
    }
}