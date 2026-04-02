import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, TemplateRef, signal, ChangeDetectionStrategy, OnInit, OnChanges } from '@angular/core';
import type { ButtonLikeShape, ButtonLikeSize, ButtonLikeVariant } from '../../shared/button-like-styles';
import {
  getButtonLikeShapeClasses,
  getButtonLikeSizeClasses,
  getButtonLikeVariantClasses,
} from '../../shared/button-like-styles';

type ButtonVariant = ButtonLikeVariant;
type ButtonSize = ButtonLikeSize;
type ButtonShape = ButtonLikeShape;
type ButtonState = 'default' | 'success' | 'error';

@Component({
  selector: 'button-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button-component.html',
  styleUrls: ['./button-component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent implements OnInit, OnChanges {
  // === INPUT: Basic ===
  @Input() label = 'Button';
  @Input() labelTemplate?: TemplateRef<unknown>;
  @Input() labelTemplateContext?: Record<string, unknown>;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled = false;

  // === INPUT: Variant & Styling ===
  @Input() variant: ButtonVariant = 'primary';
  @Input() shape: ButtonShape = 'rounded';
  @Input() size: ButtonSize = 'md';
  @Input() fullWidth = false;
  @Input() square = false; // icon-only mode

  // === INPUT: Iconos (izquierda/derecha) ===
  @Input() leftIconClass = '';
  @Input() rightIconClass = '';
  @Input() leftIconTemplate?: TemplateRef<unknown>;
  @Input() rightIconTemplate?: TemplateRef<unknown>;
  @Input() loadingIcon?: TemplateRef<unknown>;

  // === INPUT: Personalización avanzada de clases ===
  @Input() backgroundClass = '';
  @Input() textClass = '';
  @Input() borderClass = '';
  @Input() hoverClass = '';
  @Input() customClass = '';

  // === INPUT: Link/Routing ===
  @Input() routerLink?: string | any[];
  @Input() href?: string;
  @Input() target: '_blank' | '_self' | '_parent' | '_top' = '_self';
  @Input() rel = '';

  // === INPUT: Estados & Comportamiento ===
  @Input() loading = false;
  @Input() state: ButtonState = 'default';
  @Input() preventMultipleClicks = false;
  @Input() debounceTime = 0;

  // === INPUT: Accesibilidad ===
  @Input() ariaLabel?: string;
  @Input() ariaDescribedBy?: string;
  @Input() ariaExpanded?: boolean;
  @Input() role = 'button';

  // === INPUT: Animation & UX ===
  @Input() tooltip?: string;
  @Input() transition = 'all 200ms ease-in-out';
  @Input() trackingId?: string; // para analytics

  // === OUTPUT: Eventos ===
  @Output() clicked = new EventEmitter<MouseEvent>();
  @Output() longPress = new EventEmitter<void>();

  // === STATE: Internals ===
  private lastPayload = '';
  private lastClickTime = 0;
  private longPressTimer: ReturnType<typeof setTimeout> | null = null;
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  isLoading = signal(false);
  currentState = signal<ButtonState>('default');

  // === LIFECYCLE ===
  ngOnInit() {
    this.isLoading.set(this.loading);
    this.currentState.set(this.state);
  }

  ngOnChanges() {
    this.isLoading.set(this.loading);
    this.currentState.set(this.state);
  }

  // === COMPUTED: CSS Classes ===
  get buttonClasses(): string {
    const variantClasses = this.getVariantClasses();
    const sizeClasses = this.getSizeClasses();
    const shapeClasses = this.getShapeClasses();
    const stateClasses = this.getStateClasses();
    const disabledClasses = (this.disabled || this.isLoading()) 
      ? 'opacity-50 cursor-not-allowed pointer-events-none' 
      : '';
    const fullWidthClass = this.fullWidth ? 'w-full' : '';
    const squareClass = this.square ? 'aspect-square' : '';

    const hasCustomOverrides =
      this.backgroundClass || this.textClass || this.borderClass || this.hoverClass;

    const hoverClassValue = this.hoverClass
      ? this.hoverClass.trim().startsWith('hover:')
        ? this.hoverClass.trim()
        : `hover:${this.hoverClass.trim()}`
      : '';

    return [
      'inline-flex items-center justify-center gap-2 font-semibold',
      'transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
      variantClasses || '',
      sizeClasses || '',
      shapeClasses || '',
      stateClasses || '',
      this.backgroundClass || '',
      this.textClass || '',
      this.borderClass || '',
      hoverClassValue,
      this.customClass || '',
      this.disabled || hasCustomOverrides ? '' : '',
      disabledClasses,
      fullWidthClass,
      squareClass,
    ]
      .filter((c) => !!c)
      .join(' ');
  }

  get buttonElement(): string {
    return this.href || this.routerLink ? 'a' : 'button';
  }

  // === PRIVATE: Variant/Size/Shape Classes ===
  private getVariantClasses(): string {
    return getButtonLikeVariantClasses(this.variant);
  }

  private getSizeClasses(): string {
    return getButtonLikeSizeClasses(this.size);
  }

  private getShapeClasses(): string {
    return getButtonLikeShapeClasses(this.shape);
  }

  private getStateClasses(): string {
    if (this.currentState() === 'success')
      return 'bg-green-500 hover:bg-green-600';
    if (this.currentState() === 'error')
      return 'bg-red-500 hover:bg-red-600';
    return '';
  }

  // === EVENT HANDLERS ===
  handleMouseDown() {
    if (this.disabled) return;
    this.longPressTimer = setTimeout(() => {
      this.longPress.emit();
    }, 500);
  }

  handleMouseUp() {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
  }

  handleClick(event: MouseEvent) {
    if (this.trackingId) {
      console.log(`[Analytics] Button clicked: ${this.trackingId}`);
    }

    if (this.disabled || this.isLoading()) {
      event.preventDefault();
      return;
    }

    if (this.routerLink) {
      event.preventDefault();
    }

    // Debounce logic
    if (this.debounceTime > 0) {
      const now = Date.now();
      if (now - this.lastClickTime < this.debounceTime) {
        return;
      }
      this.lastClickTime = now;
    }

    if (this.preventMultipleClicks) {
      if (this.lastPayload === 'emitted') {
        return;
      }
      this.lastPayload = 'emitted';
      this.emitClickWithDelay();
      return;
    }

    this.emitClickWithDelay();
  }

  handleKeyDown(event: KeyboardEvent) {
    if (['Enter', ' '].includes(event.key)) {
      event.preventDefault();
      this.handleClick(new MouseEvent('click'));
    }
  }

  private emitClickWithDelay() {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.debounceTimer = setTimeout(() => {
      this.clicked.emit(new MouseEvent('click'));
    }, this.debounceTime);
  }

  // === HELPERS ===
  getAttr(name: string): any {
    return (this as any)[name];
  }
}
