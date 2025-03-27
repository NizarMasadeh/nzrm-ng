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

    private tooltipElement: HTMLElement | null = null;

    constructor(
        private el: ElementRef,
        private renderer: Renderer2,
    ) { }

    ngOnInit() {
        this.tooltipElement = this.renderer.createElement("div")
        this.renderer.addClass(this.tooltipElement, "custom-tooltip")

        const textNode = this.renderer.createText(this.tooltipText)
        this.renderer.appendChild(this.tooltipElement, textNode)

        const rect = this.el.nativeElement.getBoundingClientRect()
        this.renderer.setStyle(this.tooltipElement, "top", `${rect.top + window.scrollY - 10}px`)
        this.renderer.setStyle(this.tooltipElement, "left", `${rect.left + window.scrollX + rect.width / 2}px`)
        this.renderer.setStyle(this.tooltipElement, "transform", "translate(-50%, -100%)")

        this.renderer.appendChild(document.body, this.tooltipElement)
    }

    @HostListener('mouseenter')
    @HostListener('touchstart')
    onMouseEnter(): void {
        if (!this.showOnlyIf) return;

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
        this.renderer.setStyle(this.tooltipElement, 'opacity', '1');
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