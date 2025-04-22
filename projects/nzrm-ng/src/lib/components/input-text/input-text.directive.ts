import {
    Directive,
    ElementRef,
    EventEmitter,
    HostListener,
    Input,
    OnInit,
    Output,
    Renderer2
} from '@angular/core';

type InputSize = 'sm' | 'md' | 'lg';
type KeyFilterType = 'int' | 'num' | 'alpha' | 'alphanum' | 'money' | 'blockSpace' | 'hex' | 'email' | 'custom';

@Directive({
    selector: '[nInputText]',
    standalone: true,
    exportAs: 'nInputText'
})
export class InputTextDirective implements OnInit {
    @Input() size: InputSize = 'md';
    @Input() placeholder: string = '';
    @Input() disabled: boolean = false;
    @Input() readonly: boolean = false;
    @Input() maxLength?: number;
    @Input() minLength?: number;
    @Input() keyFilter?: KeyFilterType;
    @Input() blockChars?: string;
    @Input() customRegex?: string;
    @Input() icon?: string;
    @Input() iconPos: 'left' | 'right' = 'left';
    @Input() floatLabel: boolean = true;
    @Input() invalid: boolean = false;
    @Input() helpText?: string;
    @Input() errorText?: string;
    @Input() iconClickable: boolean = false;

    @Output() valueChange = new EventEmitter<string>();
    @Output() focusEvent = new EventEmitter<FocusEvent>();
    @Output() blurEvent = new EventEmitter<FocusEvent>();
    @Output() keydown = new EventEmitter<KeyboardEvent>();
    @Output() keyup = new EventEmitter<KeyboardEvent>();
    @Output() iconClick = new EventEmitter<void>();

    private inputElement!: HTMLInputElement;
    private wrapperElement!: HTMLDivElement;
    private labelElement?: HTMLLabelElement;
    private iconElement?: HTMLElement;
    private helpTextElement?: HTMLElement;
    private errorTextElement?: HTMLElement;
    private isFocused: boolean = false;
    private initialValue: string = '';


    private readonly REGEX = {
        int: /^-?\d*$/,
        num: /^-?\d*\.?\d*$/,
        alpha: /^[a-zA-Z]*$/,
        alphanum: /^[a-zA-Z0-9]*$/,
        hex: /^[0-9a-fA-F]*$/,
        email: /^[a-zA-Z0-9._%+-@]*$/,
        money: /^-?\d*\.?\d{0,2}$/
    };

    constructor(private el: ElementRef, private renderer: Renderer2) { }

    ngOnInit(): void {
        this.setupElements();
        this.applyStyles();
        this.setupEventListeners();

        this.initialValue = this.inputElement.value;
    }

    private setupElements(): void {
        this.inputElement = this.el.nativeElement;

        this.wrapperElement = this.renderer.createElement('div');
        this.renderer.addClass(this.wrapperElement, 'n-input-wrapper');

        if (this.placeholder && this.floatLabel && !this.readonly) {
            this.labelElement = this.renderer.createElement('label');
            this.renderer.addClass(this.labelElement, 'n-input-label');
            const labelText = this.renderer.createText(this.placeholder);
            this.renderer.appendChild(this.labelElement, labelText);
            this.renderer.appendChild(this.wrapperElement, this.labelElement);

            this.renderer.setAttribute(this.inputElement, 'placeholder', '');
        } else if (this.placeholder && !this.readonly) {
            this.renderer.setAttribute(this.inputElement, 'placeholder', this.placeholder);
        } else if (this.readonly) {
            this.renderer.setAttribute(this.inputElement, 'placeholder', '');
        }


        if (this.icon) {
            this.iconElement = this.renderer.createElement('i');
            const iconClasses = this.icon.split(' ');
            iconClasses.forEach(className => {
                if (className) {
                    this.renderer.addClass(this.iconElement!, className);
                }
            });
            this.renderer.addClass(this.iconElement, 'n-input-icon');
            this.renderer.addClass(this.iconElement, `n-input-icon-${this.iconPos}`);
        }

        if (this.helpText) {
            this.helpTextElement = this.renderer.createElement('div');
            this.renderer.addClass(this.helpTextElement, 'n-input-help-text');
            const helpText = this.renderer.createText(this.helpText);
            this.renderer.appendChild(this.helpTextElement, helpText);
        }

        if (this.errorText) {
            this.errorTextElement = this.renderer.createElement('div');
            this.renderer.addClass(this.errorTextElement, 'n-input-error-text');
            const errorText = this.renderer.createText(this.errorText);
            this.renderer.appendChild(this.errorTextElement, errorText);
        }

        const parent = this.renderer.parentNode(this.inputElement);

        if (this.iconElement && this.iconPos === 'left') {
            this.renderer.appendChild(this.wrapperElement, this.iconElement);
        }

        this.renderer.removeChild(parent, this.inputElement);
        this.renderer.appendChild(this.wrapperElement, this.inputElement);

        if (this.iconElement && this.iconPos === 'right') {
            this.renderer.appendChild(this.wrapperElement, this.iconElement);
        }

        this.renderer.appendChild(parent, this.wrapperElement);

        if (this.helpTextElement) {
            this.renderer.appendChild(parent, this.helpTextElement);
        }

        if (this.errorTextElement) {
            this.renderer.appendChild(parent, this.errorTextElement);
        }
    }

    private applyStyles(): void {
        this.renderer.addClass(this.inputElement, 'n-input');

        this.renderer.addClass(this.inputElement, `n-input-${this.size}`);

        if (this.icon) {
            this.renderer.addClass(this.inputElement, `n-input-has-icon-${this.iconPos}`);
        }

        if (this.invalid) {
            this.renderer.addClass(this.inputElement, 'n-input-invalid');
        }

        if (this.disabled) {
            this.renderer.setProperty(this.inputElement, 'disabled', true);
            this.renderer.addClass(this.wrapperElement, 'n-input-wrapper-disabled');
        }

        if (this.readonly) {
            this.renderer.setAttribute(this.inputElement, 'readonly', 'readonly');
            this.renderer.addClass(this.wrapperElement, 'n-input-wrapper-readonly');
            this.renderer.setStyle(this.inputElement, 'cursor', 'default');
            this.renderer.setStyle(this.inputElement, 'user-select', 'none');
            this.renderer.setStyle(this.inputElement, 'background-color', 'var(--bg-tertiary)');
            this.renderer.setStyle(this.inputElement, 'opacity', '0.9');
        }

        if (this.maxLength !== undefined) {
            this.renderer.setAttribute(this.inputElement, 'maxlength', this.maxLength.toString());
        }

        this.applyBaseStyles();
    }

    private applyBaseStyles(): void {
        const wrapperStyles = {
            'position': 'relative',
            'display': 'inline-flex',
            'align-items': 'center',
            'width': 'fit-content',
            'font-family': 'Inter, sans-serif',
            'transition': 'all 0.2s ease',
        };

        Object.entries(wrapperStyles).forEach(([property, value]) => {
            this.renderer.setStyle(this.wrapperElement, property, value);
        });

        const inputStyles = {

            'font-family': 'Inter, sans-serif',
            'background-color': 'var(--bg-secondary)',
            'color': 'var(--text-primary)',
            'border': '1px solid var(--border-color)',
            'border-radius': '6px',
            'transition': 'all 0.2s ease',
            'outline': 'none',
            'box-sizing': 'border-box',
            'max-width': 'fit-content',
            'min-width': '200px'
        };

        Object.entries(inputStyles).forEach(([property, value]) => {
            this.renderer.setStyle(this.inputElement, property, value);
        });

        let padding: string;
        let fontSize: string;
        let height: string;

        switch (this.size) {
            case 'sm':
                padding = this.icon ? (this.iconPos === 'left' ? '0.5rem 0.75rem 0.5rem 2.5rem' : '0.5rem 2.5rem 0.5rem 0.75rem') : '0.5rem 0.75rem';
                fontSize = '0.75rem';
                height = '32px';
                break;
            case 'lg':
                padding = this.icon ? (this.iconPos === 'left' ? '0.75rem 1.5rem 0.75rem 3.5rem' : '0.75rem 3.5rem 0.75rem 1.5rem') : '0.75rem 1.5rem';
                fontSize = '1rem';
                height = '48px';
                break;
            case 'md':
            default:
                padding = this.icon ? (this.iconPos === 'left' ? '0.625rem 1.25rem 0.625rem 3rem' : '0.625rem 3rem 0.625rem 1.25rem') : '0.625rem 1.25rem';
                fontSize = '0.875rem';
                height = '40px';
        }

        this.renderer.setStyle(this.inputElement, 'padding', padding);
        this.renderer.setStyle(this.inputElement, 'font-size', fontSize);
        this.renderer.setStyle(this.inputElement, 'height', height);

        this.addIconStyles();

        if (this.labelElement) {
            const labelStyles = {
                'position': 'absolute',
                'left': this.icon && this.iconPos === 'left' ? (this.size === 'sm' ? '2rem' : (this.size === 'lg' ? '3rem' : '2.5rem')) : (this.size === 'sm' ? '0.75rem' : (this.size === 'lg' ? '1.5rem' : '1.25rem')),
                'top': '50%',
                'transform': 'translateY(-50%)',
                'color': 'var(--text-secondary)',
                'font-size': fontSize,
                'pointer-events': 'none',
                'transition': 'all 0.2s ease',
                'background-color': 'transparent',
                'padding': '0 0.25rem',
            };

            Object.entries(labelStyles).forEach(([property, value]) => {
                this.renderer.setStyle(this.labelElement!, property, value);
            });

            if (this.inputElement.value) {
                this.setLabelFloating(true);
            }
        }

        if (this.helpTextElement) {
            const helpTextStyles = {
                'font-size': '0.75rem',
                'color': 'var(--text-secondary)',
                'margin-top': '0.25rem',
            };

            Object.entries(helpTextStyles).forEach(([property, value]) => {
                this.renderer.setStyle(this.helpTextElement!, property, value);
            });
        }

        if (this.errorTextElement) {
            const errorTextStyles = {
                'font-size': '0.75rem',
                'color': 'var(--error-color)',
                'margin-top': '0.25rem',
                'display': this.invalid ? 'block' : 'none',
            };

            Object.entries(errorTextStyles).forEach(([property, value]) => {
                this.renderer.setStyle(this.errorTextElement!, property, value);
            });
        }

        this.renderer.listen(this.inputElement, 'focus', () => {
            if (!this.readonly && !this.disabled) {
                this.renderer.setStyle(this.inputElement, 'border-color', 'var(--brand-primary)');
                this.renderer.setStyle(this.inputElement, 'box-shadow', '0 0 0 3px rgba(123, 104, 238, 0.15)');

                if (this.labelElement) {
                    this.setLabelFloating(true);
                }

                this.isFocused = true;
            }
        });

        this.renderer.listen(this.inputElement, 'blur', () => {
            this.renderer.setStyle(this.inputElement, 'border-color', this.invalid ? 'var(--error-color)' : 'var(--border-color)');
            this.renderer.setStyle(this.inputElement, 'box-shadow', 'none');

            if (this.labelElement && !this.inputElement.value) {
                this.setLabelFloating(false);
            }

            this.isFocused = false;

            if (this.readonly) {
                this.inputElement.value = this.initialValue;
            }
        });

        if (this.invalid) {
            this.renderer.setStyle(this.inputElement, 'border-color', 'var(--error-color)');

            if (this.errorTextElement) {
                this.renderer.setStyle(this.errorTextElement, 'display', 'block');
            }
        }
    }

    private addIconStyles(): void {
        if (this.iconElement) {
            const iconStyles = {
                'position': 'absolute',
                'color': 'var(--text-secondary)',
                'font-size': this.size === 'sm' ? '0.875rem' : (this.size === 'lg' ? '1.25rem' : '1rem'),
                'pointer-events': this.iconClickable ? 'auto' : 'none',
                'cursor': this.iconClickable ? 'pointer' : 'default',
                'transition': 'all 0.2s ease-in-out',
                'width': '24px',
                'height': '24px',
                'display': 'flex',
                'align-items': 'center',
                'justify-content': 'center',
                'border-radius': '50%',
                'padding': '4px'
            };

            Object.entries(iconStyles).forEach(([property, value]) => {
                this.renderer.setStyle(this.iconElement!, property, value);
            });

            if (this.iconPos === 'left') {
                this.renderer.setStyle(this.iconElement, 'left', this.size === 'sm' ? '0.75rem' : (this.size === 'lg' ? '1.25rem' : '.3rem'));
            } else {
                this.renderer.setStyle(this.iconElement, 'right', this.size === 'sm' ? '0.75rem' : (this.size === 'lg' ? '1.25rem' : '.3rem'));
            }


            if (this.iconClickable) {
                this.renderer.listen(this.iconElement, 'mouseenter', () => {
                    this.renderer.setStyle(this.iconElement, 'color', 'var(--brand-primary)');
                    this.renderer.setStyle(this.iconElement, 'background', 'var(--border-color)');
                });

                this.renderer.listen(this.iconElement, 'mouseleave', () => {
                    this.renderer.setStyle(this.iconElement, 'color', 'var(--text-secondary)');
                    this.renderer.setStyle(this.iconElement, 'background', 'transparent');
                });

                this.renderer.listen(this.iconElement, 'click', (event: Event) => {
                    event.stopPropagation();
                    if (!this.disabled && !this.readonly) {
                        this.iconClick.emit();
                    }
                });
            }
        }
    }

    private setLabelFloating(isFloating: boolean): void {
        if (!this.labelElement) return;

        if (isFloating) {
            const topValue = this.size === 'sm' ? '-0.5rem' : (this.size === 'lg' ? '-0.75rem' : '-0.625rem');
            const fontSize = this.size === 'sm' ? '0.65rem' : (this.size === 'lg' ? '0.75rem' : '0.7rem');

            this.renderer.setStyle(this.labelElement, 'top', '0');
            this.renderer.setStyle(this.labelElement, 'transform', 'translateY(-50%)');
            this.renderer.setStyle(this.labelElement, 'font-size', fontSize);
            this.renderer.setStyle(this.labelElement, 'color', this.isFocused ? 'var(--brand-primary)' : 'var(--text-secondary)');
            this.renderer.setStyle(this.labelElement, 'background-color', 'var(--bg-secondary)');
        } else {
            const fontSize = this.size === 'sm' ? '0.75rem' : (this.size === 'lg' ? '1rem' : '0.875rem');

            this.renderer.setStyle(this.labelElement, 'top', '50%');
            this.renderer.setStyle(this.labelElement, 'transform', 'translateY(-50%)');
            this.renderer.setStyle(this.labelElement, 'font-size', fontSize);
            this.renderer.setStyle(this.labelElement, 'color', 'var(--text-secondary)');
            this.renderer.setStyle(this.labelElement, 'background-color', 'transparent');
        }
    }

    private setupEventListeners(): void {
        this.renderer.listen(this.inputElement, 'input', (event: Event) => {
            const value = (event.target as HTMLInputElement).value;

            if (this.readonly) {
                this.inputElement.value = this.initialValue;
                return;
            }

            this.valueChange.emit(value);
        });

        this.renderer.listen(this.inputElement, 'focus', (event: FocusEvent) => {
            if (!this.readonly && !this.disabled) {
                this.focusEvent.emit(event);
            } else if (this.readonly) {
                this.inputElement.blur();
            }
        });

        this.renderer.listen(this.inputElement, 'blur', (event: FocusEvent) => {
            this.blurEvent.emit(event);

            if (this.readonly) {
                this.inputElement.value = this.initialValue;
            }
        });

        this.renderer.listen(this.inputElement, 'keydown', (event: KeyboardEvent) => {
            if (this.readonly) {
                event.preventDefault();
                return;
            }

            this.keydown.emit(event);
        });

        this.renderer.listen(this.inputElement, 'keyup', (event: KeyboardEvent) => {
            if (!this.readonly) {
                this.keyup.emit(event);
            }
        });

        this.renderer.listen(this.inputElement, 'paste', (event: ClipboardEvent) => {
            if (this.readonly) {
                event.preventDefault();
            }
        });

        this.renderer.listen(this.inputElement, 'cut', (event: ClipboardEvent) => {
            if (this.readonly) {
                event.preventDefault();
            }
        });
    }

    @HostListener('keypress', ['$event'])
    onKeyPress(event: KeyboardEvent): boolean {
        if (this.readonly) {
            event.preventDefault();
            return false;
        }

        if (this.keyFilter) {
            return this.validateKeyFilter(event);
        }

        if (this.blockChars) {
            return !this.blockChars.includes(event.key);
        }

        return true;
    }

    private validateKeyFilter(event: KeyboardEvent): boolean {
        const char = event.key;


        if (event.ctrlKey || event.altKey || event.metaKey ||
            char === 'Backspace' || char === 'Delete' ||
            char === 'ArrowLeft' || char === 'ArrowRight' ||
            char === 'Tab' || char === 'Enter') {
            return true;
        }

        if (this.keyFilter === 'blockSpace' && char === ' ') {
            return false;
        }

        if (this.keyFilter === 'int' ||
            this.keyFilter === 'num' ||
            this.keyFilter === 'alpha' ||
            this.keyFilter === 'alphanum' ||
            this.keyFilter === 'hex' ||
            this.keyFilter === 'email' ||
            this.keyFilter === 'money') {

            const regex = this.REGEX[this.keyFilter];
            const newValue = this.inputElement.value + char;

            if (this.keyFilter === 'money') {
                if (char === '.' && this.inputElement.value.includes('.')) {
                    return false;
                }

                const parts = newValue.split('.');
                if (parts.length > 1 && parts[1].length > 2) {
                    return false;
                }
            }

            return regex.test(newValue);
        }

        if (this.keyFilter === 'custom' && this.customRegex) {
            const regex = new RegExp(this.customRegex);
            return regex.test(char);
        }

        return true;
    }

    public focus(): void {
        if (!this.readonly && !this.disabled) {
            this.inputElement.focus();
        }
    }

    public blur(): void {
        this.inputElement.blur();
    }

    public clear(): void {
        if (!this.readonly) {
            this.inputElement.value = '';
            this.valueChange.emit('');

            if (this.labelElement && !this.isFocused) {
                this.setLabelFloating(false);
            }
        }
    }

    public setValue(value: string): void {
        this.inputElement.value = value;
        this.initialValue = value;
        this.valueChange.emit(value);

        if (this.labelElement) {
            this.setLabelFloating(!!value);
        }
    }

    public getValue(): string {
        return this.inputElement.value;
    }

    public setInvalid(invalid: boolean, errorText?: string): void {
        this.invalid = invalid;

        if (invalid) {
            this.renderer.addClass(this.inputElement, 'n-input-invalid');
            this.renderer.setStyle(this.inputElement, 'border-color', 'var(--error-color)');
        } else {
            this.renderer.removeClass(this.inputElement, 'n-input-invalid');
            this.renderer.setStyle(this.inputElement, 'border-color', this.isFocused ? 'var(--brand-primary)' : 'var(--border-color)');
        }

        if (errorText && this.errorTextElement) {
            while (this.errorTextElement.firstChild) {
                this.renderer.removeChild(this.errorTextElement, this.errorTextElement.firstChild);
            }

            const newErrorText = this.renderer.createText(errorText);
            this.renderer.appendChild(this.errorTextElement, newErrorText);
            this.renderer.setStyle(this.errorTextElement, 'display', invalid ? 'block' : 'none');
        } else if (this.errorTextElement) {
            this.renderer.setStyle(this.errorTextElement, 'display', invalid ? 'block' : 'none');
        }
    }
}
