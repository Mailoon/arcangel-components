import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  forwardRef,
  HostBinding,
  Input,
  Output,
  TemplateRef,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import type { ButtonLikeShape, ButtonLikeSize, ButtonLikeVariant } from '../../shared/button-like-styles';
import {
  getButtonLikeSizeClasses,
  resolveButtonLikeShapeClasses,
} from '../../shared/button-like-styles';

@Component({
  selector: 'input-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './input-component.html',
  styleUrls: ['./input-component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
})
export class InputComponent implements ControlValueAccessor {
  @Input() variant: ButtonLikeVariant = 'outline';
  @Input() shape: ButtonLikeShape = 'rounded';
  /** Si se define, reemplaza las clases de redondeo del `shape` (Tailwind u otras). */
  @Input() shapeClass = '';
  @Input() size: ButtonLikeSize = 'md';
  @Input() fullWidth = false;

  @Input() leftIconClass = '';
  @Input() rightIconClass = '';
  /** Texto dentro del &lt;i&gt; izquierdo (ej. nombre de Material Icon). */
  @Input() leftIconContent = '';
  @Input() rightIconContent = '';
  @Input() leftIconTemplate?: TemplateRef<unknown>;
  @Input() rightIconTemplate?: TemplateRef<unknown>;

  @Input() backgroundClass = '';
  @Input() textClass = '';
  @Input() borderClass = '';
  @Input() hoverClass = '';
  @Input() customClass = '';

  @Input() placeholder = '';
  @Input() type: 'text' | 'email' | 'password' | 'search' | 'tel' | 'url' | 'number' = 'text';
  @Input() name = '';
  @Input() inputId = '';
  @Input() autocomplete = '';
  /** Atributo HTML `readonly` del campo. */
  @Input() readOnly = false;
  @Input() maxlength: number | null = null;
  @Input() inputMode?: 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url';

  @Input() disabled = false;
  @Input() ariaLabel?: string;
  @Input() ariaDescribedBy?: string;
  @Input() tooltip?: string;

  @Output() blurred = new EventEmitter<FocusEvent>();
  @Output() focused = new EventEmitter<FocusEvent>();

  value = '';
  private cvaDisabled = false;

  @HostBinding('class')
  get hostClasses(): string {
    return this.fullWidth ? 'block w-full max-w-full' : 'inline-block max-w-full';
  }

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  get isDisabled(): boolean {
    return this.disabled || this.cvaDisabled;
  }

  get wrapperClasses(): string {
    const sizeBlock = getButtonLikeSizeClasses(this.size);
    const shapeBlock = resolveButtonLikeShapeClasses(this.shape, this.shapeClass);

    const hoverClassValue = this.hoverClass
      ? this.hoverClass.trim().startsWith('hover:')
        ? this.hoverClass.trim()
        : `hover:${this.hoverClass.trim()}`
      : '';

    return [
      'input-component__wrap',
      'inline-flex items-center gap-2 overflow-hidden',
      'transition-all duration-200',
      'outline-none focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2',
      sizeBlock,
      shapeBlock,
      this.backgroundClass || '',
      this.textClass || '',
      this.borderClass || '',
      hoverClassValue,
      this.customClass || '',
      this.fullWidth ? 'w-full' : '',
      this.isDisabled ? 'opacity-50 cursor-not-allowed' : '',
    ]
      .filter((c) => !!c)
      .join(' ');
  }

  get nativeInputClasses(): string {
    const lightOnDark = ['primary', 'danger', 'success', 'warning'].includes(this.variant);
    const placeholder = lightOnDark ? 'placeholder:text-white/55' : 'placeholder:text-gray-400';
    return [
      'input-component__field',
      'flex-1 min-w-0 bg-transparent border-0 outline-none ring-0',
      'text-inherit',
      placeholder,
      this.isDisabled ? 'cursor-not-allowed' : '',
    ]
      .filter((c) => !!c)
      .join(' ');
  }

  onInput(event: Event) {
    const v = (event.target as HTMLInputElement).value;
    this.value = v;
    this.onChange(v);
  }

  onBlurFn(ev: FocusEvent) {
    this.onTouched();
    this.blurred.emit(ev);
  }

  onFocusFn(ev: FocusEvent) {
    this.focused.emit(ev);
  }

  writeValue(obj: unknown): void {
    if (obj == null) {
      this.value = '';
      return;
    }
    this.value = String(obj);
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled = isDisabled;
  }
}
