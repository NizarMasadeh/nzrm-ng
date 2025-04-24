import { Directive, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';

@Directive({
    selector: '[nSkeleton]',
    standalone: true
})
export class SkeletonDirective implements OnInit {
    @Input() width = '100%';
    @Input() height = '1rem';
    @Input() borderRadius = '0.375rem';
    @Input() animation = true;

    constructor(
        private el: ElementRef,
        private renderer: Renderer2
    ) { }

    ngOnInit() {
        this.initializeStyles();
    }

    private initializeStyles(): void {
        const element = this.el.nativeElement;

        this.renderer.setStyle(element, 'display', 'block');
        this.renderer.setStyle(element, 'width', this.width);
        this.renderer.setStyle(element, 'height', this.height);
        this.renderer.setStyle(element, 'border-radius', this.borderRadius);
        this.renderer.setStyle(element, 'background-color', 'var(--bg-tertiary, #313142)');
        this.renderer.setStyle(element, 'position', 'relative');
        this.renderer.setStyle(element, 'overflow', 'hidden');

        if (this.animation) {
            const shimmer = this.renderer.createElement('div');
            this.renderer.addClass(shimmer, 'skeleton-shimmer');
            this.renderer.appendChild(element, shimmer);

            this.renderer.setStyle(shimmer, 'position', 'absolute');
            this.renderer.setStyle(shimmer, 'top', '0');
            this.renderer.setStyle(shimmer, 'left', '0');
            this.renderer.setStyle(shimmer, 'width', '100%');
            this.renderer.setStyle(shimmer, 'height', '100%');
            this.renderer.setStyle(shimmer, 'background', 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.04), transparent)');
            this.renderer.setStyle(shimmer, 'animation', 'shimmer 1.5s infinite');
        }
    }
}