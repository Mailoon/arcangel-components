import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  HostBinding,
  Input,
  Output,
  inject,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  getButtonLikeSizeClasses,
  resolveButtonLikeShapeClasses,
  variantUsesLightForeground,
  type ButtonLikeVariant,
} from '../../shared/arc-control-styles';
import { ArcControlBase } from '../../shared/arc-control.base';

/**
 * Modos de posición/comportamiento de la etiqueta respecto al campo:
 * - `outside`  — etiqueta siempre encima del wrapper (predeterminado)
 * - `inline`   — etiqueta a la izquierda del campo en la misma línea
 * - `static`   — etiqueta pegada al borde izquierdo interior del campo
 * - `floating` — etiqueta dentro del campo (como placeholder), sube SOBRE el wrapper al enfocar/tener valor
 * - `overlap`  — etiqueta dentro del campo, sube al borde superior del wrapper (estilo Angular Material)
 */
export type InputLabelMode = 'static' | 'floating' | 'overlap' | 'outside' | 'inline';

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
export class InputComponent extends ArcControlBase implements ControlValueAccessor {
  constructor(private readonly cdr: ChangeDetectorRef) { super(); }
  private readonly elRef = inject(ElementRef);
  private static nextFieldId = 0;
  protected readonly generatedFieldId = `arc-input-${InputComponent.nextFieldId++}`;

  // Variante por defecto distinta al base (outline en lugar de primary)
  @Input() override variant: ButtonLikeVariant = 'outline';

  /** Si se define, reemplaza las clases de redondeo del `shape` (Tailwind u otras). */
  @Input() shapeClass = '';
  /** Texto dentro del &lt;i&gt; izquierdo (ej. nombre de Material Icon). */
  @Input() leftIconContent = '';
  @Input() rightIconContent = '';

  @Input() placeholder = '';
  /** Texto de etiqueta; si está vacío, no se muestra modo etiqueta. */
  @Input() label = '';
  @Input() labelMode: InputLabelMode = 'outside';
  @Input() type: 'text' | 'email' | 'password' | 'search' | 'tel' | 'url' | 'number' = 'text';
  @Input() name = '';
  @Input() inputId = '';
  @Input() autocomplete = '';
  /** Atributo HTML `readonly` del campo. */
  @Input() readOnly = false;
  @Input() maxlength: number | null = null;
  @Input() inputMode?: 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url';

  @Output() blurred = new EventEmitter<FocusEvent>();
  @Output() focused = new EventEmitter<FocusEvent>();

  value = '';
  private cvaDisabled = false;
  private floatingFieldFocused = false;

  @HostBinding('class')
  get hostClasses(): string {
    return this.fullWidth
      ? 'align-middle box-border block w-full max-w-full'
      : 'align-middle box-border inline-block max-w-full';
  }

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  get isDisabled(): boolean {
    return this.disabled || this.cvaDisabled;
  }

  get hasLabel(): boolean {
    return !!this.label?.trim();
  }

  /** Modo overlap (antes "floating"): etiqueta flota sobre el borde, estilo Material. */
  get isOverlap(): boolean {
    return this.hasLabel && this.labelMode === 'overlap';
  }

  /** Modo floating: etiqueta parte dentro y sube completamente por encima del wrapper. */
  get isFloatAbove(): boolean {
    return this.hasLabel && this.labelMode === 'floating';
  }

  /** True cuando la etiqueta debe estar en posición elevada (tiene valor o está enfocado). */
  get floatingLabelIsRaised(): boolean {
    return this.value.trim().length > 0 || this.floatingFieldFocused;
  }

  /**
   * `id` del `<input>` y `for` del `<label>`.
   * Se define si hay `inputId`, o si hay `label` (id generado estable por instancia).
   */
  get resolvedInputId(): string | null {
    const manual = this.inputId?.trim();
    if (manual) return manual;
    return this.hasLabel ? this.generatedFieldId : null;
  }

  get shellWrapperClasses(): string {
    if (this.isOverlap) {
      return [this.wrapperClasses, 'relative items-stretch self-stretch'].join(' ');
    }
    return this.wrapperClasses;
  }

  get wrapperClasses(): string {
    const sizeBlock = getButtonLikeSizeClasses(this.size);
    const shapeBlock = resolveButtonLikeShapeClasses(this.shape, this.shapeClass);
    const crossAlign = this.isOverlap ? 'items-stretch' : 'items-center';

    const defaultRing = !this.borderClass
      ? 'ring-1 ring-gray-300 focus-within:ring-2 focus-within:ring-blue-500/50'
      : '';

    return [
      'box-border max-w-full',
      `inline-flex ${crossAlign} gap-2 overflow-hidden`,
      'transition-[box-shadow,border-color,opacity] duration-200 ease-in-out',
      'outline-none',
      sizeBlock,
      shapeBlock,
      defaultRing,
      this.backgroundClass || '',
      this.textClass || '',
      this.borderClass || '',
      this.resolveHoverClass(),
      this.customClass || '',
      this.fullWidth ? 'w-full' : '',
      this.isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-text',
    ]
      .filter((c) => !!c)
      .join(' ');
  }

  get nativeTitle(): string | null {
    const t = this.tooltip?.trim();
    return t ? t : null;
  }

  get nativeInputClasses(): string {
    const lightOnDark = variantUsesLightForeground(this.variant);
    const placeholder = lightOnDark ? 'placeholder:text-white/55' : 'placeholder:text-gray-400';
    return [
      'box-border min-h-[1.25em]',
      'flex-1 min-w-0 bg-transparent border-0 outline-none',
      'text-inherit',
      placeholder,
      this.isDisabled ? 'cursor-not-allowed' : '',
    ]
      .filter((c) => !!c)
      .join(' ');
  }

  /** Input en modo overlap: padding-top dinámico para dejar espacio a la etiqueta interna. */
  get overlapNativeInputClasses(): string {
    const paddingTop = this.floatingLabelIsRaised ? 'pt-[1.35rem] leading-[1.35]' : 'pt-0';
    return `${this.nativeInputClasses} relative z-[1] w-full min-h-0 self-stretch transition-[padding-top] duration-200 ${paddingTop}`;
  }

  /** Clases del label en modo overlap (varía entre reposo y elevado sobre el borde). */
  get overlapLabelClasses(): string {
    const base =
      'absolute left-0 pointer-events-none z-[2] leading-5 overflow-hidden text-ellipsis whitespace-nowrap max-w-[calc(100%-0.25rem)] transition-[top,transform,opacity] duration-200 ease-in';
    const raised = this.floatingLabelIsRaised;
    const state = raised
      ? 'top-2 translate-y-0 scale-75 origin-top-left opacity-[0.95]'
      : 'top-1/2 -translate-y-1/2 origin-[left_center] text-[inherit] opacity-[0.78]';
    return `${base} ${state}`;
  }

  /**
   * Clases del label en modo floating (sube por encima del wrapper al enfocar).
   * Cuando no está elevado actúa visualmente como placeholder dentro del campo.
   */
  get floatAboveLabelClasses(): string {
    const raised = this.floatingLabelIsRaised;
    return [
      'absolute pointer-events-none',
      'transition-all duration-200 ease-in-out',
      'z-10 leading-5 font-medium overflow-hidden text-ellipsis whitespace-nowrap',
      'max-w-[calc(100%-0.5rem)]',
      raised
        ? 'top-0 left-0 translate-y-0 text-sm opacity-90'
        : 'top-5 left-3 translate-y-1 text-[inherit] text-base opacity-[0.50]',
    ].join(' ');
  }

  /** Clases del label en modo outside. */
  readonly labelOutsideClasses =
    'block mb-[0.35rem] text-sm leading-5 font-medium opacity-90';

  /** Clases del label en modo inline. */
  readonly labelInlineClasses = 'text-sm leading-5 font-medium opacity-90 shrink-0';

  /** Clases del span/label estático (dentro del borde izquierdo). */
  readonly labelStaticClasses =
    'arc-input-label-static shrink-0 self-stretch inline-flex items-center text-sm font-medium leading-5 pr-2 mr-0.5 opacity-90';

  /** Clases del icono (izquierdo o derecho). */
  readonly iconBaseClasses = 'shrink-0 inline-flex items-center justify-center text-[1.125em] leading-none opacity-90';

  /** Ajuste de margen para icono izquierdo. */
  readonly iconLeftClasses = `${this.iconBaseClasses} -mr-0.5`;

  /** Ajuste de margen para icono derecho. */
  readonly iconRightClasses = `${this.iconBaseClasses} -ml-0.5`;

  /** Clases del div anchor en modo overlap (contiene label + input alineados). */
  readonly overlapAnchorClasses =
    'relative box-border flex-1 min-w-0 flex flex-row items-stretch self-stretch min-h-[2.25rem]';

  /** Delega el clic del wrapper al <input> nativo para que el foco vaya al campo de texto. */
  focusNativeInput(): void {
    if (this.isDisabled) return;
    const input = this.elRef.nativeElement.querySelector('input') as HTMLInputElement | null;
    input?.focus();
  }

  onInput(event: Event) {
    const v = (event.target as HTMLInputElement).value;
    this.value = v;
    this.onChange(v);
    this.cdr.markForCheck();
  }

  onBlurFn(ev: FocusEvent) {
    this.floatingFieldFocused = false;
    this.onTouched();
    this.blurred.emit(ev);
    this.cdr.markForCheck();
  }

  onFocusFn(ev: FocusEvent) {
    this.floatingFieldFocused = true;
    this.focused.emit(ev);
    this.cdr.markForCheck();
  }

  writeValue(obj: unknown): void {
    if (obj == null) {
      this.value = '';
    } else {
      this.value = String(obj);
    }
    this.cdr.markForCheck();
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
