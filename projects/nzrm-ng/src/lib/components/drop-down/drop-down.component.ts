import {
  ChangeDetectorRef,
  Component,
  ContentChild,
  ElementRef,
  EventEmitter,
  forwardRef,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output,
  Renderer2,
  TemplateRef,
  ViewChild,
  inject,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DropdownManagerService } from './drop-down.service';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { AnimationEvent } from '@angular/animations';

@Component({
  selector: 'n-dropdown',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DropdownComponent),
      multi: true
    }
  ],
  templateUrl: './drop-down.component.html',
  styleUrl: './drop-down.component.scss',
  animations: [
    trigger('dropdownAnimation', [
      state('void', style({
        opacity: 0,
        transform: 'translateY(-10px)'
      })),
      state('visible', style({
        opacity: 1,
        transform: 'translateY(0)'
      })),
      transition('void => visible', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('200ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ]),
      transition('visible => void', [
        animate('200ms cubic-bezier(0.4, 0.0, 0.2, 1)',
          style({ opacity: 0, transform: 'translateY(-10px)' }))
      ])
    ]),
    trigger('ripple', [
      transition(':enter', [
        style({ transform: 'scale(0)', opacity: 0.5 }),
        animate('600ms cubic-bezier(0.4, 0, 0.2, 1)',
          style({ transform: 'scale(4)', opacity: 0 }))
      ])
    ])
  ]
})
export class DropdownComponent implements OnInit, OnDestroy, OnChanges, ControlValueAccessor {
  @Input() options: any[] = [];
  @Input() optionLabel: string = 'label';
  @Input() optionValue: string = '';
  @Input() optionDisabled: string = 'disabled';
  @Input() placeholder: string = 'Select an option';
  @Input() disabled: boolean = false;
  @Input() readonly: boolean = false;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() icon?: string;
  @Input() iconPos: 'left' | 'right' = 'left';
  @Input() multiSelect: boolean = false;
  @Input() floatLabel: boolean = true;
  @Input() invalid: boolean = false;
  @Input() helpText?: string;
  @Input() errorText?: string;
  @Input() filterable: boolean = false;
  @Input() filterPlaceholder: string = 'Search...';
  @Input() emptyMessage: string = 'No results found';
  @Input() appendTo: 'body' | 'self' = 'self';
  @Input() maxSelectedLabels: number = 3;
  @Input() showClear: boolean = false;
  @Input() showToggleAll: boolean = false;
  @Input() autoClose: boolean = true;
  @Input() animationDuration: number = 250;

  @Output() onChange = new EventEmitter<any>();
  @Output() onFocus = new EventEmitter<any>();
  @Output() onBlur = new EventEmitter<any>();
  @Output() onShow = new EventEmitter<any>();
  @Output() onHide = new EventEmitter<any>();
  @Output() onFilter = new EventEmitter<string>();
  @Output() onClear = new EventEmitter<any>();

  @ViewChild('dropdownTrigger') dropdownTrigger!: ElementRef;
  @ViewChild('dropdownPanel') dropdownPanel!: ElementRef;
  @ViewChild('filterInput') filterInput!: ElementRef;

  @ContentChild('itemTemplate') itemTemplate!: TemplateRef<any>;
  @ContentChild('chipTemplate') chipTemplate!: TemplateRef<any>;
  @ContentChild('selectedItemTemplate') selectedItemTemplate!: TemplateRef<any>;
  @ContentChild('headerTemplate') headerTemplate!: TemplateRef<any>;
  @ContentChild('footerTemplate') footerTemplate!: TemplateRef<any>;
  @ContentChild('emptyTemplate') emptyTemplate!: TemplateRef<any>;

  isOpen: boolean = false;
  selectedItems: any[] = [];
  filteredItems: any[] = [];
  filterValue: string = '';
  focused: boolean = false;
  uniqueId: string = uuidv4();
  hasValue: boolean = false;
  isAnimating: boolean = false;

  private dropdownManager = inject(DropdownManagerService);
  private destroy$ = new Subject<void>();
  private subscription: Subscription | null = null;

  private onChangeCallback: any = () => { };
  private onTouched: any = () => { };

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.filteredItems = [...this.options];
    this.initStyles();

    this.subscription = this.dropdownManager.dropdownClose$
      .pipe(takeUntil(this.destroy$))
      .subscribe(id => {
        if (id === this.uniqueId && this.isOpen) {
          this.hideDropdown();
        }
      });

    this.hasValue = this.selectedItems.length > 0;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['disabled'] && changes['disabled'].currentValue === true && this.isOpen) {
      this.hideDropdown();
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();

    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    if (this.documentClickListener) {
      this.documentClickListener();
      this.documentClickListener = null;
    }
  }

  writeValue(value: any): void {
    if (value === null || value === undefined) {
      this.selectedItems = [];
    } else if (this.multiSelect && Array.isArray(value)) {
      this.selectedItems = value;
    } else if (!this.multiSelect) {
      this.selectedItems = value ? [value] : [];
    }
    this.hasValue = this.selectedItems.length > 0;
    this.cd.markForCheck();
  }

  registerOnChange(fn: any): void {
    this.onChangeCallback = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;

    if (isDisabled && this.isOpen) {
      this.hideDropdown();
    }

    this.cd.markForCheck();
  }

  toggleDropdown(event: MouseEvent) {
    if (this.disabled || this.readonly || this.isAnimating) return;

    event.preventDefault();
    event.stopPropagation();

    if (this.isOpen) {
      this.hideDropdown();
    } else {
      this.showDropdown();
    }
  }

  showDropdown() {
    if (this.disabled || this.readonly || this.isOpen || this.isAnimating) return;

    this.dropdownManager.registerOpenDropdown(this.uniqueId);
    this.isOpen = true;
    this.onShow.emit();

    requestAnimationFrame(() => {
      this.positionPanel();
    });

    if (this.autoClose) {
      this.documentClickListener = this.renderer.listen('document', 'click', this.onDocumentClick);
    }

    if (this.filterable && this.filterInput) {
      setTimeout(() => this.filterInput.nativeElement.focus());
    }
  }


  private documentClickListener: Function | null = null;

  hideDropdown() {
    if (!this.isOpen || this.isAnimating) return;

    this.isOpen = false;
    if (this.documentClickListener) {
      this.documentClickListener();
      this.documentClickListener = null;
    }

    if (this.filterable) {
      this.filterValue = '';
      this.filteredItems = [...this.options];
    }

    this.onHide.emit();
    this.onTouched();
    this.dropdownManager.closeDropdown(this.uniqueId);

    this.cd.markForCheck();
  }

  onDocumentClick = (event: MouseEvent) => {
    if (!this.isOpen) return;

    const target = event.target as HTMLElement;
    const dropdownEl = this.el.nativeElement;
    const dropdownPanel = this.dropdownPanel?.nativeElement;

    if (!dropdownEl.contains(target) && !dropdownPanel?.contains(target)) {
      event.preventDefault();
      event.stopPropagation();
      this.hideDropdown();
    }
  }

  positionPanel() {
    if (!this.dropdownPanel || !this.dropdownTrigger) return;

    const panel = this.dropdownPanel.nativeElement;
    const trigger = this.dropdownTrigger.nativeElement;
    const triggerRect = trigger.getBoundingClientRect();

    this.renderer.setStyle(panel, 'width', `${triggerRect.width}px`);

    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - triggerRect.bottom;
    const panelHeight = panel.offsetHeight;

    if (spaceBelow < panelHeight && triggerRect.top > panelHeight) {
      this.renderer.setStyle(panel, 'top', 'auto');
      this.renderer.setStyle(panel, 'bottom', '100%');
      this.renderer.setStyle(panel, 'margin-bottom', '5px');
      this.renderer.addClass(panel, 'n-dropdown-panel-above');

      this.renderer.setStyle(panel, 'transform', 'translateY(10px)');
    } else {
      this.renderer.setStyle(panel, 'top', '100%');
      this.renderer.setStyle(panel, 'bottom', 'auto');
      this.renderer.setStyle(panel, 'margin-top', '5px');
      this.renderer.removeClass(panel, 'n-dropdown-panel-above');

      this.renderer.setStyle(panel, 'transform', 'translateY(-10px)');
    }
  }

  onItemClick(event: MouseEvent, item: any) {
    event.stopPropagation();

    if (this.isItemDisabled(item)) return;

    if (this.multiSelect) {
      this.toggleItemSelection(item);

      if (this.filterable && this.filterInput) {
        this.filterInput.nativeElement.focus();
      }
    } else {
      this.selectSingleItem(item);
      this.hideDropdown();
    }
  }

  toggleItemSelection(item: any) {
    const index = this.findSelectedItemIndex(item);

    if (index !== -1) {
      this.selectedItems.splice(index, 1);
    } else {
      this.selectedItems.push(item);
    }

    this.hasValue = this.selectedItems.length > 0;
    this.emitChangeEvent();
  }

  selectSingleItem(item: any) {
    this.selectedItems = [item];
    this.hasValue = true;
    this.emitChangeEvent();
  }

  removeItem(event: MouseEvent, item: any) {
    event.stopPropagation();

    const index = this.findSelectedItemIndex(item);
    if (index !== -1) {
      this.selectedItems.splice(index, 1);
      this.hasValue = this.selectedItems.length > 0;
      this.emitChangeEvent();
    }
  }

  findSelectedItemIndex(item: any): number {
    if (this.optionValue) {
      return this.selectedItems.findIndex(
        selectedItem => selectedItem[this.optionValue] === item[this.optionValue]
      );
    }

    return this.selectedItems.indexOf(item);
  }

  isSelected(item: any): boolean {
    return this.findSelectedItemIndex(item) !== -1;
  }

  isItemDisabled(item: any): boolean {
    if (this.optionDisabled) {
      return item[this.optionDisabled] === true;
    }
    return false;
  }

  getItemLabel(item: any): string {
    if (this.optionLabel) {
      return item[this.optionLabel] || '';
    }
    return item.toString();
  }

  onFilterChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.filterValue = value;

    if (value.trim() === '') {
      this.filteredItems = [...this.options];
    } else {
      this.filteredItems = this.options.filter(item => {
        const label = this.getItemLabel(item).toLowerCase();
        return label.includes(value.toLowerCase());
      });
    }

    this.onFilter.emit(value);
  }

  clear(event: MouseEvent) {
    event.stopPropagation();

    this.selectedItems = [];
    this.hasValue = false;
    this.emitChangeEvent();
    this.onClear.emit();
  }

  toggleAll() {
    if (this.allSelected()) {
      this.selectedItems = [];
      this.hasValue = false;
    } else {
      this.selectedItems = [...this.options.filter(item => !this.isItemDisabled(item))];
      this.hasValue = this.selectedItems.length > 0;
    }

    this.emitChangeEvent();
  }

  allSelected(): boolean {
    const selectableItems = this.options.filter(item => !this.isItemDisabled(item));
    return selectableItems.length > 0 && selectableItems.length === this.selectedItems.length;
  }

  emitChangeEvent() {
    const value = this.multiSelect ? this.selectedItems : (this.selectedItems[0] || null);
    this.onChange.emit(value);
    this.onChangeCallback(value);
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (this.disabled || this.readonly) return;

    switch (event.key) {
      case 'Enter':
      case ' ':
        if (!this.isOpen) {
          this.showDropdown();
          event.preventDefault();
        }
        break;
      case 'Escape':
        if (this.isOpen) {
          this.hideDropdown();
          event.preventDefault();
        }
        break;
      case 'Tab':
        if (this.isOpen) {
          this.hideDropdown();
        }
        break;
      case 'ArrowDown':
        if (!this.isOpen) {
          this.showDropdown();
          event.preventDefault();
        }
        break;
    }
  }

  initStyles() {
    if (!document.getElementById('n-dropdown-styles')) {
      const style = document.createElement('style');
      style.id = 'n-dropdown-styles';
      style.textContent = `
        .n-dropdown-wrapper {
            position: relative !important;
            display: inline-flex !important;
            align-items: center !important;
            width: 100% !important;
            font-family: 'Inter', sans-serif !important;
            transition: all 0.2s ease !important;
        }
  
        .n-dropdown-panel {
          position: absolute !important;
          left: 0 !important;
          background-color: var(--bg-secondary) !important;
          border: 1px solid var(--border-color) !important;
          border-radius: 6px !important;
          box-shadow: var(--shadow-md) !important;
          z-index: 1000 !important;
          max-height: 250px !important;
          overflow: hidden !important;
          display: none !important;
          flex-direction: column !important;
          will-change: transform, opacity !important;
        }
  
        .n-dropdown-trigger {
            display: flex !important;
            align-items: center !important;
            width: 100% !important;
            background-color: var(--bg-secondary) !important;
            color: var(--text-primary) !important;
            border: 1px solid var(--border-color) !important;
            border-radius: 6px !important;
            cursor: pointer !important;
            transition: all 0.2s ease !important;
            position: relative !important;
            overflow: hidden !important;
            box-sizing: border-box !important;
        }
  
        .n-dropdown-trigger:hover {
            border-color: var(--brand-primary) !important;
        }
  
        .n-dropdown-trigger-open {
            border-color: var(--brand-primary) !important;
            box-shadow: 0 0 0 3px rgba(123, 104, 238, 0.15) !important;
        }
  
        .n-dropdown-sm {
            padding: 0.5rem 0.75rem !important;
            font-size: 0.75rem !important;
            height: 32px !important;
        }
  
        .n-dropdown-md {
            padding: 0.625rem 1.25rem !important;
            font-size: 0.875rem !important;
            height: 40px !important;
        }
  
        .n-dropdown-lg {
            padding: 0.75rem 1.5rem !important;
            font-size: 1rem !important;
            height: 48px !important;
        }
  
        .n-dropdown-has-icon-left {
            padding-left: 2.5rem !important;
        }
  
        .n-dropdown-has-icon-right {
            padding-right: 2.5rem !important;
        }
  
        .n-dropdown-icon {
            position: absolute !important;
            color: var(--text-secondary) !important;
            pointer-events: none !important;
        }
  
        .n-dropdown-icon-left {
            left: 1rem !important;
        }
  
        .n-dropdown-icon-right {
            right: 1rem !important;
        }
  
        .n-dropdown-arrow {
            position: absolute !important;
            right: 1rem !important;
            width: 0 !important;
            height: 0 !important;
            border-left: 5px solid transparent !important;
            border-right: 5px solid transparent !important;
            border-top: 5px solid var(--text-secondary) !important;
            transition: transform 0.2s ease !important;
        }
  
        .n-dropdown-arrow-up {
            transform: rotate(180deg) !important;
        }
  
        .n-dropdown-value-container {
            flex: 1 !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            white-space: nowrap !important;
        }
  
        .n-dropdown-placeholder {
            color: var(--text-secondary) !important;
            opacity: 0.8 !important;
        }
  
        .n-dropdown-selected-item {
            color: var(--text-primary) !important;
        }
  
        .n-dropdown-selected-items {
            display: flex !important;
            flex-wrap: wrap !important;
            gap: 4px !important;
        }
  
        .n-dropdown-chip {
            display: inline-flex !important;
            align-items: center !important;
            background-color: var(--bg-tertiary) !important;
            border-radius: 4px !important;
            padding: 2px 6px !important;
            font-size: 0.75rem !important;
            max-width: 100% !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            white-space: nowrap !important;
        }
  
        .n-dropdown-chip-remove {
            margin-left: 4px !important;
            cursor: pointer !important;
            font-size: 1rem !important;
            line-height: 0.75 !important;
        }
  
        .n-dropdown-panel-open {
            display: flex !important;
        }
  
        .n-dropdown-filter-container {
            padding: 0.75rem !important;
            border-bottom: 1px solid var(--border-color) !important;
        }
  
        .n-dropdown-filter {
            padding: 0.625rem 0.875rem !important;
            border: 1px solid var(--border-color) !important;
            border-radius: 4px !important;
            background-color: var(--bg-tertiary) !important;
            color: var(--text-primary) !important;
            font-size: 0.875rem !important;
            outline: none !important;
            transition: all 0.2s ease !important;
            font-family: 'Inter', sans-serif !important;
        }
  
        .n-dropdown-filter:focus {
            border-color: var(--brand-primary) !important;
            box-shadow: 0 0 0 2px rgba(123, 104, 238, 0.1) !important;
        }
  
        .n-dropdown-filter::placeholder {
            color: var(--text-secondary) !important;
            opacity: 0.7 !important;
        }
  
        .n-dropdown-items-wrapper {
            overflow-y: auto !important;
            max-height: 200px !important;
            scrollbar-width: thin !important;
            scrollbar-color: var(--border-color) transparent !important;
        }
  
        .n-dropdown-items-wrapper::-webkit-scrollbar {
            width: 6px !important;
        }
  
        .n-dropdown-items-wrapper::-webkit-scrollbar-track {
            background: transparent !important;
        }
  
        .n-dropdown-items-wrapper::-webkit-scrollbar-thumb {
            background-color: var(--border-color) !important;
            border-radius: 6px !important;
        }
  
        .n-dropdown-items-empty {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            padding: 1rem !important;
        }
  
        .n-dropdown-empty-message {
            color: var(--text-secondary) !important;
            font-style: italic !important;
            text-align: center !important;
            padding: 1rem !important;
        }
  
        .n-dropdown-item {
            display: flex !important;
            align-items: center !important;
            padding: 0.625rem 1rem !important;
            cursor: pointer !important;
            transition: background-color 0.15s ease !important, color 0.15s ease !important;
            position: relative !important;
            overflow: hidden !important;
        }
  
        .n-dropdown-item:hover {
            background-color: var(--bg-tertiary) !important;
        }
  
        .n-dropdown-item-selected {
            background-color: rgba(123, 104, 238, 0.1) !important;
            color: var(--brand-primary) !important;
            font-weight: 500 !important;
        }
  
        .n-dropdown-item-selected:hover {
            background-color: rgba(123, 104, 238, 0.15) !important;
        }
  
        .n-dropdown-wrapper-disabled {
            opacity: 0.6 !important;
            pointer-events: none !important;
        }
  
        .n-dropdown-item-disabled {
            opacity: 0.5 !important;
            cursor: not-allowed !important;
            color: var(--text-secondary) !important;
            background-color: transparent !important;
        }
  
        .n-dropdown-item-disabled:hover {
            background-color: transparent !important;
        }
  
        .n-dropdown-checkbox {
            display: flex !important;
            align-items: center !important;
            margin-right: 0.75rem !important;
        }
  
        .n-dropdown-checkbox-box {
            width: 16px !important;
            height: 16px !important;
            border: 1px solid var(--border-color) !important;
            border-radius: 3px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            transition: all 0.2s ease !important;
        }
  
        .n-dropdown-checkbox-checked {
            background-color: var(--brand-primary) !important;
            border-color: var(--brand-primary) !important;
        }
  
        .n-dropdown-checkbox-icon {
            color: white !important;
            font-size: 0.75rem !important;
            line-height: 1 !important;
        }
  
        .n-dropdown-help-text {
            font-size: 0.75rem !important;
            color: var(--text-secondary) !important;
            margin-top: 0.25rem !important;
        }
  
        .n-dropdown-error-text {
            font-size: 0.75rem !important;
            color: var(--error-color) !important;
            margin-top: 0.25rem !important;
        }
  
        .n-dropdown-invalid {
            border-color: var(--error-color) !important;
        }
  
        .n-dropdown-wrapper-disabled .n-dropdown-trigger {
            background-color: var(--bg-tertiary) !important;
            border-color: var(--border-color) !important;
            cursor: not-allowed !important;
        }
  
        .n-dropdown-wrapper-readonly .n-dropdown-trigger {
            background-color: var(--bg-tertiary) !important;
            opacity: 0.9 !important;
            cursor: default !important;
        }
  
        .n-dropdown-ripple {
            position: absolute !important;
            border-radius: 50% !important;
            background-color: rgba(255, 255, 255, 0.3) !important;
            transform: scale(0) !important;
            animation: n-dropdown-ripple-animation 0.6s linear !important;
            pointer-events: none !important;
        }
  
        @keyframes n-dropdown-ripple-animation {
            to {
                transform: scale(4) !important;
                opacity: 0 !important;
            }
        }
      `;
      document.head.appendChild(style);
    }
  }


  addRippleEffect(event: MouseEvent, element: HTMLElement | null) {
    if (!element || this.isItemDisabled(element)) return;

    const ripple = this.renderer.createElement('span');
    this.renderer.addClass(ripple, 'n-dropdown-ripple');

    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - (size / 2);
    const y = event.clientY - rect.top - (size / 2);

    this.renderer.setStyle(ripple, 'width', `${size}px`);
    this.renderer.setStyle(ripple, 'height', `${size}px`);
    this.renderer.setStyle(ripple, 'left', `${x}px`);
    this.renderer.setStyle(ripple, 'top', `${y}px`);

    this.renderer.appendChild(element, ripple);

    setTimeout(() => {
      if (element.contains(ripple)) {
        this.renderer.removeChild(element, ripple);
      }
    }, 600);
  }

  onAnimationStart(event: AnimationEvent) {
    this.isAnimating = true;
    this.cd.detectChanges();
  }

  onAnimationDone(event: AnimationEvent) {
    this.isAnimating = false;
    this.cd.detectChanges();
  }
}
