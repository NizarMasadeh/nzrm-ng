import { Directive, ElementRef, HostListener, Input, OnInit, Renderer2 } from '@angular/core';

@Directive({
    selector: '[nDropdown]',
    standalone: true,
    exportAs: 'nDropdown'
})
export class DropdownDirective implements OnInit {
    @Input() appendTo: 'body' | 'self' = 'self';
    @Input() autoClose: boolean = true;

    private isOpen: boolean = false;
    private dropdownMenu: HTMLElement | null = null;
    private clickListener: (() => void) | null = null;

    constructor(private el: ElementRef, private renderer: Renderer2) { }

    ngOnInit(): void {
        this.dropdownMenu = this.el.nativeElement.querySelector('.n-dropdown-menu');

        if (!this.dropdownMenu) {
            console.warn('No dropdown menu found with class .n-dropdown-menu');
            return;
        }

        this.renderer.setStyle(this.dropdownMenu, 'display', 'none');

        if (this.appendTo === 'body') {
            this.renderer.removeChild(this.el.nativeElement, this.dropdownMenu);
            this.renderer.appendChild(document.body, this.dropdownMenu);
        }
    }

    @HostListener('click', ['$event'])
    onClick(event: MouseEvent): void {
        event.stopPropagation();
        this.toggle();
    }

    toggle(): void {
        this.isOpen ? this.close() : this.open();
    }

    open(): void {
        if (this.isOpen || !this.dropdownMenu) return;

        this.isOpen = true;
        this.renderer.setStyle(this.dropdownMenu, 'display', 'block');

        this.updatePosition();

        if (this.autoClose) {
            this.clickListener = this.renderer.listen('document', 'click', () => {
                this.close();
            });
        }
    }

    close(): void {
        if (!this.isOpen || !this.dropdownMenu) return;

        this.isOpen = false;
        this.renderer.setStyle(this.dropdownMenu, 'display', 'none');

        if (this.clickListener) {
            this.clickListener();
            this.clickListener = null;
        }
    }

    private updatePosition(): void {
        if (!this.dropdownMenu) return;

        const triggerRect = this.el.nativeElement.getBoundingClientRect();

        if (this.appendTo === 'body') {
            const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
            const scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft;

            this.renderer.setStyle(this.dropdownMenu, 'position', 'absolute');
            this.renderer.setStyle(this.dropdownMenu, 'top', `${triggerRect.bottom + scrollTop}px`);
            this.renderer.setStyle(this.dropdownMenu, 'left', `${triggerRect.left + scrollLeft}px`);
            this.renderer.setStyle(this.dropdownMenu, 'width', `${triggerRect.width}px`);
            this.renderer.setStyle(this.dropdownMenu, 'z-index', '1000');
        } else {
            this.renderer.setStyle(this.dropdownMenu, 'position', 'absolute');
            this.renderer.setStyle(this.dropdownMenu, 'top', '100%');
            this.renderer.setStyle(this.dropdownMenu, 'left', '0');
            this.renderer.setStyle(this.dropdownMenu, 'width', '100%');
            this.renderer.setStyle(this.dropdownMenu, 'z-index', '1');
        }

        const dropdownRect = this.dropdownMenu.getBoundingClientRect();
        const viewportHeight = window.innerHeight;

        if (dropdownRect.bottom > viewportHeight) {
            if (this.appendTo === 'body') {
                const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
                this.renderer.setStyle(this.dropdownMenu, 'top', `${triggerRect.top + scrollTop - dropdownRect.height}px`);
            } else {
                this.renderer.setStyle(this.dropdownMenu, 'top', 'auto');
                this.renderer.setStyle(this.dropdownMenu, 'bottom', '100%');
            }
        }
    }
}