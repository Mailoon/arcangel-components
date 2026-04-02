import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  HostBinding,
  HostListener,
  Input,
  Output,
  TemplateRef,
  inject,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import type { ButtonLikeShape, ButtonLikeSize, ButtonLikeVariant } from '../../shared/button-like-styles';
import {
  getButtonLikeSizeClasses,
  resolveButtonLikeShapeClasses,
} from '../../shared/button-like-styles';
import {
  DropdownComponent,
  type DropdownItem,
  type DropdownPlacement,
  type DropdownShape,
  type DropdownSize,
  type DropdownVariant,
} from '../dropdown/dropdown-component';
import { placementToPositionClasses, resolveAutoDropdownPlacement } from '../../shared/dropdown-placement.utils';
import {
  DEFAULT_MONTH_LABELS_ES,
  DEFAULT_WEEKDAY_LABELS_ES,
  buildCalendarWeeks,
  clampDate,
  compareDateOnly,
  formatISODate,
  orderWeekdayLabels,
  parseISODateLocal,
  toDateInput,
  type DayCell,
} from './date-picker.utils';

let datePickerUid = 0;

@Component({
  selector: 'date-picker-component',
  standalone: true,
  imports: [CommonModule, DropdownComponent],
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatePickerComponent),
      multi: true,
    },
  ],
})
export class DatePickerComponent implements ControlValueAccessor {
  private readonly elementRef = inject(ElementRef);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly instanceId = `dp-${++datePickerUid}`;
  readonly panelId = `${this.instanceId}-panel`;

  @Input() variant: ButtonLikeVariant = 'outline';
  @Input() shape: ButtonLikeShape = 'rounded';
  /** Si se define, reemplaza las clases de redondeo del `shape` (Tailwind u otras). */
  @Input() shapeClass = '';
  @Input() size: ButtonLikeSize = 'md';
  @Input() fullWidth = false;

  @Input() leftIconClass = '';
  @Input() rightIconClass = '';
  @Input() leftIconContent = '';
  @Input() rightIconContent = '';
  @Input() leftIconTemplate?: TemplateRef<unknown>;
  @Input() rightIconTemplate?: TemplateRef<unknown>;

  @Input() backgroundClass = '';
  @Input() textClass = '';
  @Input() borderClass = '';
  @Input() hoverClass = '';
  @Input() customClass = '';

  @Input() placeholder = 'Seleccionar fecha';
  /** Si no hay `rightIconClass` ni `rightIconTemplate`, muestra icono Material `calendar_today`. */
  @Input() showCalendarIcon = true;
  @Input() disabled = false;
  @Input() ariaLabel?: string;
  @Input() ariaDescribedBy?: string;
  @Input() tooltip?: string;

  /** Valor mostrado en el disparador (por defecto DD/MM/AAAA). */
  @Input() displayFormatter?: (iso: string) => string;

  @Input() minDate: string | Date | null = null;
  @Input() maxDate: string | Date | null = null;
  @Input() minYear?: number;
  @Input() maxYear?: number;
  /** 0 = domingo, 1 = lunes (por defecto). */
  @Input() firstDayOfWeek: 0 | 1 = 1;
  @Input() calendarSize: 'sm' | 'md' | 'lg' = 'md';
  @Input() placement: DropdownPlacement = 'bottom-start';
  /** Recoloca el panel del calendario (arriba/abajo) según espacio en pantalla. */
  @Input() autoFlipPlacement = true;
  @Input() monthLabels: string[] = DEFAULT_MONTH_LABELS_ES;
  @Input() weekdayLabels: string[] = DEFAULT_WEEKDAY_LABELS_ES;

  @Output() opened = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  isOpen = false;
  value: string | null = null;
  viewYear = new Date().getFullYear();
  viewMonth0 = new Date().getMonth();
  /** Índice 0–41 en la grilla plana; -1 si no hay foco de teclado en días. */
  focusedCellIndex = -1;

  /** Posición efectiva del panel tras medir viewport (solo si `autoFlipPlacement`). */
  resolvedPanelPlacement: DropdownPlacement | null = null;

  private cvaDisabled = false;
  private onChange: (value: string | null) => void = () => { };
  private onTouched: () => void = () => { };

  @HostBinding('class')
  get hostClasses(): string {
    return this.fullWidth ? 'block w-full max-w-full' : 'inline-block max-w-full';
  }

  get isDisabled(): boolean {
    return this.disabled || this.cvaDisabled;
  }

  get effectiveFirstDow(): 0 | 1 {
    return this.firstDayOfWeek === 0 ? 0 : 1;
  }

  get minBound(): Date | null {
    return toDateInput(this.minDate);
  }

  get maxBound(): Date | null {
    return toDateInput(this.maxDate);
  }

  get resolvedMinYear(): number {
    const m = this.minBound;
    const y = this.minYear ?? (m ? m.getFullYear() : 1920);
    return y;
  }

  get resolvedMaxYear(): number {
    const m = this.maxBound;
    const y = this.maxYear ?? (m ? m.getFullYear() : new Date().getFullYear() + 50);
    return Math.max(y, this.resolvedMinYear);
  }

  get yearOptions(): number[] {
    const out: number[] = [];
    for (let y = this.resolvedMinYear; y <= this.resolvedMaxYear; y++) out.push(y);
    return out;
  }

  get weeks(): DayCell[][] {
    return buildCalendarWeeks(
      this.viewYear,
      this.viewMonth0,
      this.effectiveFirstDow,
      this.minBound,
      this.maxBound
    );
  }

  get flatCells(): DayCell[] {
    return this.weeks.flat();
  }

  get orderedWeekdayLabels(): string[] {
    return orderWeekdayLabels(this.effectiveFirstDow, this.weekdayLabels);
  }

  get panelPositionClasses(): string {
    return placementToPositionClasses(this.resolvedPanelPlacement ?? this.placement);
  }

  get monthDropdownItems(): DropdownItem[] {
    return this.monthLabels.map((label, i) => ({ label, value: i }));
  }

  get yearDropdownItems(): DropdownItem[] {
    return this.yearOptions.map((y) => ({ label: String(y), value: y }));
  }

  get headerDropdownVariant(): DropdownVariant {
    return this.variant as DropdownVariant;
  }

  get headerDropdownSize(): DropdownSize {
    const m: Record<'sm' | 'md' | 'lg', DropdownSize> = { sm: 'sm', md: 'md', lg: 'lg' };
    return m[this.calendarSize] ?? 'md';
  }

  get headerDropdownShape(): DropdownShape {
    const s = this.shape;
    if (s === 'pill' || s === 'square') return s;
    return 'rounded';
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
      'date-picker-component__wrap',
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

  get nativeFieldClasses(): string {
    const lightOnDark = ['primary', 'danger', 'success', 'warning'].includes(this.variant);
    const placeholder = lightOnDark ? 'placeholder:text-white/55' : 'placeholder:text-gray-400';
    return [
      'input-component__field',
      'flex-1 min-w-0 bg-transparent border-0 outline-none ring-0 text-left',
      'text-inherit',
      placeholder,
      this.isDisabled ? 'cursor-not-allowed' : '',
    ]
      .filter((c) => !!c)
      .join(' ');
  }

  get calendarPanelClass(): string {
    const map = {
      sm: 'date-picker-panel--sm',
      md: 'date-picker-panel--md',
      lg: 'date-picker-panel--lg',
    };
    return map[this.calendarSize] ?? map.md;
  }

  get displayLabel(): string {
    if (this.value == null || this.value === '') {
      return this.placeholder;
    }
    if (this.displayFormatter) {
      return this.displayFormatter(this.value);
    }
    const d = parseISODateLocal(this.value);
    if (!d) return this.value;
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return `${dd}/${mm}/${d.getFullYear()}`;
  }

  get showPlaceholderStyle(): boolean {
    return this.value == null || this.value === '';
  }

  isSelectedDate(d: Date): boolean {
    const v = parseISODateLocal(this.value);
    return v != null && compareDateOnly(v, d) === 0;
  }

  cellFlatIndex(row: number, col: number): number {
    return row * 7 + col;
  }

  isFocusedCell(row: number, col: number): boolean {
    return this.focusedCellIndex === this.cellFlatIndex(row, col);
  }

  /**
   * Clic en el disparador (el panel detiene la propagación).
   */
  onRootClick(event: MouseEvent): void {
    if (this.isDisabled) return;
    const target = event.target as Node;
    if (this.elementRef.nativeElement.querySelector('.date-picker-panel')?.contains(target)) {
      return;
    }
    this.toggle();
  }

  onTriggerKeydown(event: KeyboardEvent): void {
    if (this.isDisabled) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.toggle();
    }
  }

  toggle(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.resolvedPanelPlacement = null;
      this.syncViewFromValue();
      this.opened.emit();
      this.focusedCellIndex = this.pickInitialFocusIndex();
      this.cdr.markForCheck();
      queueMicrotask(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            this.updateCalendarPanelPlacement();
            this.focusDayCell(this.focusedCellIndex);
            this.cdr.markForCheck();
          });
        });
      });
    } else {
      this.resolvedPanelPlacement = null;
      this.focusedCellIndex = -1;
      this.closed.emit();
      this.onTouched();
      this.cdr.markForCheck();
    }
  }

  close(): void {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.resolvedPanelPlacement = null;
    this.focusedCellIndex = -1;
    this.closed.emit();
    this.onTouched();
    this.cdr.markForCheck();
  }

  private updateCalendarPanelPlacement(): void {
    if (!this.autoFlipPlacement) {
      this.resolvedPanelPlacement = null;
      return;
    }
    const root = this.elementRef.nativeElement as HTMLElement;
    const panel = root.querySelector('.date-picker-panel') as HTMLElement | null;
    const btn = root.querySelector('.date-picker-component button') as HTMLElement | null;
    if (!panel || !btn) return;
    const tr = btn.getBoundingClientRect();
    const pr = panel.getBoundingClientRect();
    this.resolvedPanelPlacement = resolveAutoDropdownPlacement(
      tr,
      pr,
      pr.width || 280,
      pr.height || 300,
      window.innerWidth,
      window.innerHeight,
      this.placement
    );
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    if (this.isOpen && this.autoFlipPlacement) {
      this.updateCalendarPanelPlacement();
      this.cdr.markForCheck();
    }
  }

  private syncViewFromValue(): void {
    const d = parseISODateLocal(this.value);
    if (d) {
      this.viewYear = d.getFullYear();
      this.viewMonth0 = d.getMonth();
      return;
    }
    const t = new Date();
    this.viewYear = t.getFullYear();
    this.viewMonth0 = t.getMonth();
  }

  private pickInitialFocusIndex(): number {
    const cells = this.flatCells;
    const sel = parseISODateLocal(this.value);
    if (sel && sel.getFullYear() === this.viewYear && sel.getMonth() === this.viewMonth0) {
      const idx = cells.findIndex((c) => c.inMonth && !c.disabled && compareDateOnly(c.date, sel) === 0);
      if (idx >= 0) return idx;
    }
    const first = cells.findIndex((c) => c.inMonth && !c.disabled);
    return first >= 0 ? first : -1;
  }

  onMonthDropdownSelect(item: DropdownItem): void {
    const v = item.value;
    this.viewMonth0 = typeof v === 'number' ? v : Number(v);
    this.focusedCellIndex = this.pickInitialFocusIndex();
    this.cdr.markForCheck();
  }

  onYearDropdownSelect(item: DropdownItem): void {
    const v = item.value;
    this.viewYear = typeof v === 'number' ? v : Number(v);
    this.focusedCellIndex = this.pickInitialFocusIndex();
    this.cdr.markForCheck();
  }

  selectDay(cell: DayCell): void {
    if (!cell.inMonth || cell.disabled) return;
    let d = cell.date;
    const min = this.minBound;
    const max = this.maxBound;
    if (min || max) d = clampDate(d, min, max);
    const iso = formatISODate(d);
    this.value = iso;
    this.onChange(iso);
    this.close();
    this.cdr.markForCheck();
  }

  onDayButtonFocus(row: number, col: number): void {
    this.focusedCellIndex = this.cellFlatIndex(row, col);
    this.cdr.markForCheck();
  }

  onDayKeydown(event: KeyboardEvent, cell: DayCell, flatIndex: number): void {
    if (cell.disabled || !cell.inMonth) return;

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.selectDay(cell);
      return;
    }

    const deltas: Record<string, [number, number]> = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
    };
    const d = deltas[event.key];
    if (!d) return;
    event.preventDefault();
    const next = this.findNextFocusableIndex(flatIndex, d[0], d[1]);
    if (next >= 0) {
      this.focusedCellIndex = next;
      this.cdr.markForCheck();
      queueMicrotask(() => this.focusDayCell(next));
    }
  }

  private findNextFocusableIndex(from: number, dCol: number, dRow: number): number {
    const cells = this.flatCells;
    let row = Math.floor(from / 7);
    let col = from % 7;
    for (let step = 0; step < 48; step++) {
      col += dCol;
      row += dRow;
      if (row < 0 || row > 5 || col < 0 || col > 6) return -1;
      const idx = row * 7 + col;
      const c = cells[idx];
      if (c && c.inMonth && !c.disabled) return idx;
    }
    return -1;
  }

  private focusDayCell(index: number): void {
    if (index < 0) return;
    const root = this.elementRef.nativeElement as HTMLElement;
    const el = root.querySelector(`[data-date-cell="${this.instanceId}-${index}"]`) as HTMLElement | null;
    el?.focus();
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent): void {
    if (!this.isOpen) return;
    const target = event.target as Node;
    if (this.elementRef.nativeElement.contains(target)) return;
    this.close();
  }

  @HostListener('document:keydown', ['$event'])
  handleDocumentKeydown(event: KeyboardEvent): void {
    if (!this.isOpen) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      this.close();
    }
  }

  writeValue(obj: unknown): void {
    if (obj == null || obj === '') {
      this.value = null;
      return;
    }
    const s = String(obj);
    const d = parseISODateLocal(s);
    this.value = d ? formatISODate(d) : null;
  }

  registerOnChange(fn: (value: string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled = isDisabled;
  }
}
