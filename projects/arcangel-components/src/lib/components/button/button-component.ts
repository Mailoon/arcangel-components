import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, TemplateRef, signal, ChangeDetectionStrategy, OnInit, OnChanges } from '@angular/core';
import {
  getButtonLikeShapeClasses,
  getButtonLikeSizeClasses,
  getButtonLikeVariantClasses,
} from '../../shared/arc-control-styles';
import { ArcControlBase } from '../../shared/arc-control.base';

type ButtonState = 'default' | 'success' | 'error';

@Component({
  selector: 'button-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button-component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent extends ArcControlBase implements OnInit, OnChanges {
  // === INPUT: Basic ===
  @Input() label = 'Button';
  @Input() labelTemplate?: TemplateRef<unknown>;
  @Input() labelTemplateContext?: Record<string, unknown>;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() square = false; // icon-only mode
  @Input() loadingIcon?: TemplateRef<unknown>;

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

  // === INPUT: Accesibilidad (específicos de button) ===
  @Input() ariaExpanded?: boolean;
  @Input() role = 'button';

  // === INPUT: Animation & UX ===
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

    return [
      'inline-flex items-center justify-center gap-2 font-semibold',
      'border-0 cursor-pointer no-underline relative',
      'transition-all duration-200',
      'focus:outline-none focus-visible:outline-offset-2',
      variantClasses || '',
      sizeClasses || '',
      shapeClasses || '',
      stateClasses || '',
      this.backgroundClass || '',
      this.textClass || '',
      this.borderClass || '',
      this.resolveHoverClass(),
      this.customClass || '',
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
      return 'bg-[#0d9488] text-white';
    if (this.currentState() === 'error')
      return 'bg-orange-500 text-white';
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
