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

    @Output() valueChange = new EventEmitter<string>();
    @Output() focusEvent = new EventEmitter<FocusEvent>();
    @Output() blurEvent = new EventEmitter<FocusEvent>();
    @Output() keydown = new EventEmitter<KeyboardEvent>();
    @Output() keyup = new EventEmitter<KeyboardEvent>();

    private inputElement!: HTMLInputElement;
    private wrapperElement!: HTMLDivElement;
    private labelElement?: HTMLLabelElement;
    private iconElement?: HTMLElement;
    private helpTextElement?: HTMLElement;
    private errorTextElement?: HTMLElement;
    private isFocused: boolean = false;
    private initialValue: string = '';

    // Regular expressions for key filtering
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

        // Store initial value for readonly mode
        this.initialValue = this.inputElement.value;
    }

    private setupElements(): void {
        // Get the original input element
        this.inputElement = this.el.nativeElement;

        // Create wrapper element
        this.wrapperElement = this.renderer.createElement('div');
        this.renderer.addClass(this.wrapperElement, 'n-input-wrapper');

        // Create label if placeholder is provided and not readonly
        if (this.placeholder && this.floatLabel && !this.readonly) {
            this.labelElement = this.renderer.createElement('label');
            this.renderer.addClass(this.labelElement, 'n-input-label');
            const labelText = this.renderer.createText(this.placeholder);
            this.renderer.appendChild(this.labelElement, labelText);
            this.renderer.appendChild(this.wrapperElement, this.labelElement);

            // Clear placeholder if using float label
            this.renderer.setAttribute(this.inputElement, 'placeholder', '');
        } else if (this.placeholder && !this.readonly) {
            // For non-floating labels, set the placeholder directly
            this.renderer.setAttribute(this.inputElement, 'placeholder', this.placeholder);
        } else if (this.readonly) {
            // For readonly inputs, don't show a placeholder or label
            this.renderer.setAttribute(this.inputElement, 'placeholder', '');
        }

        // Create icon if provided
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

        // Create help text element if provided
        if (this.helpText) {
            this.helpTextElement = this.renderer.createElement('div');
            this.renderer.addClass(this.helpTextElement, 'n-input-help-text');
            const helpText = this.renderer.createText(this.helpText);
            this.renderer.appendChild(this.helpTextElement, helpText);
        }

        // Create error text element if provided
        if (this.errorText) {
            this.errorTextElement = this.renderer.createElement('div');
            this.renderer.addClass(this.errorTextElement, 'n-input-error-text');
            const errorText = this.renderer.createText(this.errorText);
            this.renderer.appendChild(this.errorTextElement, errorText);
        }

        // Set up the DOM structure
        const parent = this.renderer.parentNode(this.inputElement);

        // Add icon before input if position is left
        if (this.iconElement && this.iconPos === 'left') {
            this.renderer.appendChild(this.wrapperElement, this.iconElement);
        }

        // Move input to wrapper
        this.renderer.removeChild(parent, this.inputElement);
        this.renderer.appendChild(this.wrapperElement, this.inputElement);

        // Add icon after input if position is right
        if (this.iconElement && this.iconPos === 'right') {
            this.renderer.appendChild(this.wrapperElement, this.iconElement);
        }

        // Add wrapper to original parent
        this.renderer.appendChild(parent, this.wrapperElement);

        // Add help text after wrapper if provided
        if (this.helpTextElement) {
            this.renderer.appendChild(parent, this.helpTextElement);
        }

        // Add error text after wrapper if provided
        if (this.errorTextElement) {
            this.renderer.appendChild(parent, this.errorTextElement);
        }
    }

    private applyStyles(): void {
        // Add base class to input
        this.renderer.addClass(this.inputElement, 'n-input');

        // Add size class
        this.renderer.addClass(this.inputElement, `n-input-${this.size}`);

        // Add icon position class if icon exists
        if (this.icon) {
            this.renderer.addClass(this.inputElement, `n-input-has-icon-${this.iconPos}`);
        }

        // Add invalid class if needed
        if (this.invalid) {
            this.renderer.addClass(this.inputElement, 'n-input-invalid');
        }

        // Apply disabled state if needed
        if (this.disabled) {
            this.renderer.setProperty(this.inputElement, 'disabled', true);
            this.renderer.addClass(this.wrapperElement, 'n-input-wrapper-disabled');
        }

        // Apply readonly state if needed
        if (this.readonly) {
            // Use setAttribute instead of setProperty for better compatibility
            this.renderer.setAttribute(this.inputElement, 'readonly', 'readonly');
            this.renderer.addClass(this.wrapperElement, 'n-input-wrapper-readonly');
            this.renderer.setStyle(this.inputElement, 'cursor', 'default');
            this.renderer.setStyle(this.inputElement, 'user-select', 'none');
            this.renderer.setStyle(this.inputElement, 'background-color', 'var(--bg-tertiary)');
            this.renderer.setStyle(this.inputElement, 'opacity', '0.9');
        }

        // Apply maxLength if provided
        if (this.maxLength !== undefined) {
            this.renderer.setAttribute(this.inputElement, 'maxlength', this.maxLength.toString());
        }

        // Apply CSS variables and styles
        this.applyBaseStyles();
    }

    private applyBaseStyles(): void {
        // Add styles to wrapper
        const wrapperStyles = {
            'position': 'relative',
            'display': 'inline-flex',
            'align-items': 'center',
            'width': '100%',
            'font-family': 'Inter, sans-serif',
            'transition': 'all 0.2s ease',
        };

        Object.entries(wrapperStyles).forEach(([property, value]) => {
            this.renderer.setStyle(this.wrapperElement, property, value);
        });

        // Add styles to input
        const inputStyles = {
            'width': '100%',
            'font-family': 'Inter, sans-serif',
            'background-color': 'var(--bg-secondary)',
            'color': 'var(--text-primary)',
            'border': '1px solid var(--border-color)',
            'border-radius': '6px',
            'transition': 'all 0.2s ease',
            'outline': 'none',
            'box-sizing': 'border-box',
        };

        Object.entries(inputStyles).forEach(([property, value]) => {
            this.renderer.setStyle(this.inputElement, property, value);
        });

        // Add size-specific styles
        let padding: string;
        let fontSize: string;
        let height: string;

        switch (this.size) {
            case 'sm':
                padding = this.icon ? (this.iconPos === 'left' ? '0.5rem 0.75rem 0.5rem 2rem' : '0.5rem 2rem 0.5rem 0.75rem') : '0.5rem 0.75rem';
                fontSize = '0.75rem';
                height = '32px';
                break;
            case 'lg':
                padding = this.icon ? (this.iconPos === 'left' ? '0.75rem 1.5rem 0.75rem 3rem' : '0.75rem 3rem 0.75rem 1.5rem') : '0.75rem 1.5rem';
                fontSize = '1rem';
                height = '48px';
                break;
            case 'md':
            default:
                padding = this.icon ? (this.iconPos === 'left' ? '0.625rem 1.25rem 0.625rem 2.5rem' : '0.625rem 2.5rem 0.625rem 1.25rem') : '0.625rem 1.25rem';
                fontSize = '0.875rem';
                height = '40px';
        }

        this.renderer.setStyle(this.inputElement, 'padding', padding);
        this.renderer.setStyle(this.inputElement, 'font-size', fontSize);
        this.renderer.setStyle(this.inputElement, 'height', height);

        // Add icon styles if icon exists
        if (this.iconElement) {
            const iconStyles = {
                'position': 'absolute',
                'color': 'var(--text-secondary)',
                'font-size': this.size === 'sm' ? '0.875rem' : (this.size === 'lg' ? '1.25rem' : '1rem'),
                'pointer-events': 'none',
            };

            Object.entries(iconStyles).forEach(([property, value]) => {
                this.renderer.setStyle(this.iconElement!, property, value);
            });

            // Position the icon
            if (this.iconPos === 'left') {
                this.renderer.setStyle(this.iconElement, 'left', this.size === 'sm' ? '0.75rem' : (this.size === 'lg' ? '1.25rem' : '1rem'));
            } else {
                this.renderer.setStyle(this.iconElement, 'right', this.size === 'sm' ? '0.75rem' : (this.size === 'lg' ? '1.25rem' : '1rem'));
            }
        }

        // Add label styles if using float label
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

            // Check if input has value to position label
            if (this.inputElement.value) {
                this.setLabelFloating(true);
            }
        }

        // Add help text styles
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

        // Add error text styles
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

        // Add focus and hover styles
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

            // For readonly inputs, ensure the value hasn't changed
            if (this.readonly) {
                this.inputElement.value = this.initialValue;
            }
        });

        // Set invalid styles if needed
        if (this.invalid) {
            this.renderer.setStyle(this.inputElement, 'border-color', 'var(--error-color)');

            if (this.errorTextElement) {
                this.renderer.setStyle(this.errorTextElement, 'display', 'block');
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
        // Listen for input changes
        this.renderer.listen(this.inputElement, 'input', (event: Event) => {
            const value = (event.target as HTMLInputElement).value;

            // If readonly, prevent changes
            if (this.readonly) {
                this.inputElement.value = this.initialValue;
                return;
            }

            this.valueChange.emit(value);
        });

        // Listen for focus events
        this.renderer.listen(this.inputElement, 'focus', (event: FocusEvent) => {
            if (!this.readonly && !this.disabled) {
                this.focusEvent.emit(event);
            } else if (this.readonly) {
                // Immediately blur for readonly inputs to prevent focus
                this.inputElement.blur();
            }
        });

        // Listen for blur events
        this.renderer.listen(this.inputElement, 'blur', (event: FocusEvent) => {
            this.blurEvent.emit(event);

            // For readonly inputs, ensure the value hasn't changed
            if (this.readonly) {
                this.inputElement.value = this.initialValue;
            }
        });

        // Listen for keydown events
        this.renderer.listen(this.inputElement, 'keydown', (event: KeyboardEvent) => {
            // Prevent typing in readonly inputs
            if (this.readonly) {
                event.preventDefault();
                return;
            }

            this.keydown.emit(event);
        });

        // Listen for keyup events
        this.renderer.listen(this.inputElement, 'keyup', (event: KeyboardEvent) => {
            if (!this.readonly) {
                this.keyup.emit(event);
            }
        });

        // Listen for paste events
        this.renderer.listen(this.inputElement, 'paste', (event: ClipboardEvent) => {
            if (this.readonly) {
                event.preventDefault();
            }
        });

        // Listen for cut events
        this.renderer.listen(this.inputElement, 'cut', (event: ClipboardEvent) => {
            if (this.readonly) {
                event.preventDefault();
            }
        });
    }

    @HostListener('keypress', ['$event'])
    onKeyPress(event: KeyboardEvent): boolean {
        // Prevent keypress in readonly mode
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

        // Allow control keys
        if (event.ctrlKey || event.altKey || event.metaKey ||
            char === 'Backspace' || char === 'Delete' ||
            char === 'ArrowLeft' || char === 'ArrowRight' ||
            char === 'Tab' || char === 'Enter') {
            return true;
        }

        // Block space if needed
        if (this.keyFilter === 'blockSpace' && char === ' ') {
            return false;
        }

        // Check against regex patterns
        if (this.keyFilter === 'int' ||
            this.keyFilter === 'num' ||
            this.keyFilter === 'alpha' ||
            this.keyFilter === 'alphanum' ||
            this.keyFilter === 'hex' ||
            this.keyFilter === 'email' ||
            this.keyFilter === 'money') {

            const regex = this.REGEX[this.keyFilter];
            const newValue = this.inputElement.value + char;

            // Special handling for money format
            if (this.keyFilter === 'money') {
                // Check if adding this character would result in more than 2 decimal places
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

        // Custom regex validation
        if (this.keyFilter === 'custom' && this.customRegex) {
            const regex = new RegExp(this.customRegex);
            return regex.test(char);
        }

        return true;
    }

    // Public methods that can be called from outside
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
        this.initialValue = value; // Update initial value for readonly mode
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
            // Update error text
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