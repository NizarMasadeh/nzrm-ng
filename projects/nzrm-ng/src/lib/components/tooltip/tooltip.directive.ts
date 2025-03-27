import {
    Directive,
    ElementRef,
    HostListener,
    Input,
    OnInit,
    Renderer2,
} from '@angular/core';

@Directive({
    selector: '[nTooltip]',
    standalone: true,
})
export class TooltipDirective implements OnInit {
    @Input() tooltipText = '';
    @Input() showOnlyIf = true;
    @Input() tooltipBackgroundColor: string = '';
    @Input() tooltipTextColor: string = '';
    @Input() tooltipArrowColor: string = '';

    private tooltipElement: HTMLElement | null = null;

    constructor(
        private el: ElementRef,
        private renderer: Renderer2,
    ) { }

    ngOnInit() {
        this.tooltipElement = this.renderer.createElement('div');
        this.renderer.addClass(this.tooltipElement, 'custom-tooltip');
        this.renderer.setStyle(this.tooltipElement, 'position', 'absolute');
        this.applyTooltipStyles();

        const arrow = this.renderer.createElement('div');
        this.renderer.setStyle(arrow, 'position', 'absolute');
        this.renderer.setStyle(arrow, 'width', '0');
        this.renderer.setStyle(arrow, 'height', '0');
        this.renderer.setStyle(arrow, 'border-left', '6px solid transparent');
        this.renderer.setStyle(arrow, 'border-right', '6px solid transparent');
        this.renderer.setStyle(
            arrow,
            'border-top',
            `6px solid ${this.tooltipArrowColor || 'rgba(26, 35, 126, 0.9)'}`
        );
        this.renderer.setStyle(arrow, 'bottom', '-6px');
        this.renderer.setStyle(arrow, 'left', '50%');
        this.renderer.setStyle(arrow, 'transform', 'translateX(-50%)');

        this.renderer.appendChild(this.tooltipElement, arrow);

        const textNode = this.renderer.createText(this.tooltipText);
        this.renderer.appendChild(this.tooltipElement, textNode);

        this.positionTooltip();
        this.renderer.appendChild(document.body, this.tooltipElement);
    }

    private applyTooltipStyles() {
        const backgroundColor = this.tooltipBackgroundColor || 'rgba(26, 35, 126, 0.9)';
        const textColor = this.tooltipTextColor || '#fff';
        const arrowColor = this.tooltipArrowColor || backgroundColor;
        this.renderer.setAttribute(this.tooltipElement, 'style', `
        background-color: ${backgroundColor};
        color: ${textColor};
        padding: 8px 12px;
        border-radius: 4px;
        font-size: 14px;
        position: absolute;
        z-index: 1000;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.3s;
        white-space: nowrap;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
      `);
        this.renderer.setAttribute(this.tooltipElement, 'style', `
        &::after {
          content: '';
          position: absolute;
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 6px solid ${arrowColor};
          bottom: -6px;
          left: 50%;
          transform: translateX(-50%);
        }
      `);
    }

    private positionTooltip() {
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
        this.renderer.setStyle(
            this.tooltipElement,
            'transform',
            'translate(-50%, -100%)'
        );
    }

    @HostListener('mouseenter')
    @HostListener('touchstart')
    onMouseEnter(): void {
        if (!this.showOnlyIf) return;
        this.positionTooltip();
        if (this.tooltipElement) {
            this.renderer.setStyle(this.tooltipElement, 'opacity', '1');
        }
    }

    @HostListener('mouseleave')
    @HostListener('touchend')
    onMouseLeave(): void {
        if (this.tooltipElement) {
            this.renderer.setStyle(this.tooltipElement, 'opacity', '0');
        }
    }

    @HostListener('window:resize')
    onResize(): void {
        if (
            this.tooltipElement &&
            this.showOnlyIf &&
            window.getComputedStyle(this.tooltipElement).opacity !== '0'
        ) {
            this.onMouseEnter();
        }
    }

    ngOnDestroy(): void {
        if (this.tooltipElement) {
            this.renderer.removeChild(document.body, this.tooltipElement);
        }
    }
}
