import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  TemplateRef,
  ViewChild,
  forwardRef,
  inject,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ButtonComponent } from '../button';
import type {
  DropdownItem,
  DropdownVariant,
  DropdownSize,
  DropdownShape,
  DropdownPlacement,
} from '../dropdown/dropdown-component';

@Component({
  selector: 'searchable-select-component',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './searchable-select.component.html',
  styleUrls: ['./searchable-select.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SearchableSelectComponent),
      multi: true,
    },
  ],
})
export class SearchableSelectComponent implements ControlValueAccessor, OnChanges {
  private readonly elementRef = inject(ElementRef);

  @Input() label = '';
  @Input() placeholder = 'Seleccionar...';
  @Input() items: DropdownItem[] = [];
  @Input() disabled = false;

  @Input() variant: DropdownVariant = 'primary';
  @Input() shape: DropdownShape = 'rounded';
  @Input() size: DropdownSize = 'md';
  @Input() fullWidth = false;
  @Input() square = false;

  @Input() leftIconClass = '';
  @Input() rightIconClass = '';
  @Input() leftIconTemplate?: TemplateRef<unknown>;
  @Input() rightIconTemplate?: TemplateRef<unknown>;

  @Input() backgroundClass = '';
  @Input() textClass = '';
  @Input() borderClass = '';
  @Input() hoverClass = '';
  @Input() customClass = '';

  /**
   * Si no se define: en modo simple cierra al elegir; en `multiple` el panel queda abierto para seguir eligiendo.
   */
  @Input() closeOnSelect?: boolean;
  @Input() placement: DropdownPlacement = 'bottom-start';

  @Input() selectedLabel = '';
  @Input() searchPlaceholder = 'Buscar...';

  /**
   * Si es true, se muestra el campo de búsqueda y el filtrado lo hace el padre
   * escuchando (filterQueryChange). El hijo solo muestra [items] tal cual.
   */
  @Input() filterable = false;

  /** Hay más datos por cargar (lazy load al hacer scroll) */
  @Input() hasMore = false;
  /** El padre está cargando el siguiente lote (evita disparos repetidos de loadMore) */
  @Input() loadingMore = false;
  /** Distancia al fondo del scroll (px) para emitir loadMore */
  @Input() lazyLoadThreshold = 48;

  @Input() ariaLabel?: string;
  @Input() ariaDescribedBy?: string;
  @Input() tooltip?: string;

  @Input() itemTemplate?: TemplateRef<{ $implicit: DropdownItem }>;

  @Input() compareWith?: (a: unknown, b: unknown) => boolean;

  /** Selección múltiple; el valor del control / `selectedValue` es un array de `value`. */
  @Input() multiple = false;

  /** Cuántas etiquetas unir en el botón antes de resumir (solo `multiple`). */
  @Input() maxSummaryLabels = 2;

  /** Texto tras "y N …" en el resumen (ej. "más"). */
  @Input() moreSelectedLabel = 'más';

  @Output() selectionChange = new EventEmitter<DropdownItem>();
  @Output() opened = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();
  /** Texto de búsqueda (tras debounce); el padre actualiza items */
  @Output() filterQueryChange = new EventEmitter<string>();
  /** El usuario llegó al final de la lista visible y hay más datos */
  @Output() loadMore = new EventEmitter<void>();

  @ViewChild('searchInput') searchInputRef?: ElementRef<HTMLInputElement>;
  @ViewChild('listEl') listElRef?: ElementRef<HTMLDivElement>;

  private _selectedValue: unknown = null;

  @Input()
  set selectedValue(v: unknown) {
    this._selectedValue = this.normalizeIncomingSelected(v);
  }
  get selectedValue(): unknown {
    return this._selectedValue;
  }

  get effectiveCloseOnSelect(): boolean {
    if (this.closeOnSelect !== undefined) return this.closeOnSelect;
    return !this.multiple;
  }

  isOpen = false;
  searchQuery = '';
  focusedListIndex = -1;

  private filterDebounceHandle: ReturnType<typeof setTimeout> | null = null;
  private lastLoadMoreEmit = 0;

  private onChange: (value: unknown) => void = () => {};
  private onTouched: () => void = () => {};
  private cvaDisabled = false;

  get isDisabled(): boolean {
    return this.disabled || this.cvaDisabled;
  }

  get placementClasses(): string {
    const map: Record<DropdownPlacement, string> = {
      'bottom-start': 'top-full left-0 mt-1',
      'bottom-end': 'top-full right-0 mt-1',
      'top-start': 'bottom-full left-0 mb-1',
      'top-end': 'bottom-full right-0 mb-1',
    };
    return map[this.placement] ?? map['bottom-start'];
  }

  /** Lista mostrada: siempre la que envía el padre en items */
  get visibleItems(): DropdownItem[] {
    return this.items ?? [];
  }

  valuesEqual(a: unknown, b: unknown): boolean {
    const fn = this.compareWith ?? ((x: unknown, y: unknown) => x === y);
    return fn(a, b);
  }

  /** Valores seleccionados como array (en modo simple 0 o 1 elemento). */
  selectedValuesArray(): unknown[] {
    if (!this.multiple) {
      const v = this._selectedValue;
      if (v === null || v === undefined || v === '') return [];
      return [v];
    }
    if (!Array.isArray(this._selectedValue)) {
      return this._selectedValue == null ? [] : [this._selectedValue];
    }
    return [...this._selectedValue];
  }

  private normalizeIncomingSelected(v: unknown): unknown {
    if (!this.multiple) return v;
    if (v == null) return [];
    return Array.isArray(v) ? [...v] : [v];
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['multiple'] && !changes['multiple'].firstChange) {
      if (this.multiple) {
        this._selectedValue = this.normalizeIncomingSelected(this._selectedValue);
      } else {
        const raw = this._selectedValue;
        if (Array.isArray(raw)) {
          this._selectedValue = raw.length ? raw[0] : null;
        }
      }
    }
  }

  private labelsForSelectedValues(values: unknown[]): string[] {
    const items = this.items ?? [];
    const out: string[] = [];
    for (const val of values) {
      const row = items.find((i) => this.valuesEqual(i.value, val));
      if (row) out.push(row.label);
    }
    return out;
  }

  get displayLabel(): string {
    if (this.selectedLabel) return this.selectedLabel;
    if (!this.multiple) {
      const sel = (this.items ?? []).find((i) => this.valuesEqual(i.value, this._selectedValue));
      return sel?.label ?? (this.label || this.placeholder);
    }
    const values = this.selectedValuesArray();
    if (values.length === 0) return this.label || this.placeholder;
    const labels = this.labelsForSelectedValues(values);
    const max = Math.max(1, this.maxSummaryLabels);
    if (labels.length === 0) {
      return values.length === 1 ? String(values[0]) : `${values.length} seleccionados`;
    }
    if (labels.length <= max) {
      return labels.join(', ');
    }
    const head = labels.slice(0, max);
    const rest = values.length - max;
    return `${head.join(', ')} y ${rest} ${this.moreSelectedLabel}`.trim();
  }

  isItemSelected(item: DropdownItem): boolean {
    if (this.multiple) {
      return this.selectedValuesArray().some((v) => this.valuesEqual(v, item.value));
    }
    return this.valuesEqual(item.value, this._selectedValue);
  }

  writeValue(obj: unknown): void {
    this._selectedValue = this.normalizeIncomingSelected(obj);
  }

  registerOnChange(fn: (value: unknown) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled = isDisabled;
  }

  handleTriggerClick(event: MouseEvent) {
    if (this.isDisabled) return;
    const target = event.target as Node;
    if (this.elementRef.nativeElement.querySelector('.searchable-select-panel')?.contains(target)) {
      return;
    }
    this.toggle();
  }

  toggle() {
    this.isOpen = !this.isOpen;
    this.focusedListIndex = -1;
    if (this.isOpen) {
      this.opened.emit();
      queueMicrotask(() => {
        if (this.filterable) {
          this.searchInputRef?.nativeElement?.focus();
        }
      });
    } else {
      this.closed.emit();
    }
  }

  close() {
    if (this.isOpen) {
      this.isOpen = false;
      this.focusedListIndex = -1;
      this.closed.emit();
      this.onTouched();
    }
  }

  onSearchInput(event: Event) {
    if (!this.filterable) return;
    const v = (event.target as HTMLInputElement).value;
    this.searchQuery = v;
    this.focusedListIndex = -1;
    if (this.filterDebounceHandle) {
      clearTimeout(this.filterDebounceHandle);
    }
    this.filterDebounceHandle = setTimeout(() => {
      this.filterDebounceHandle = null;
      this.filterQueryChange.emit(this.searchQuery.trim());
      queueMicrotask(() => this.scrollListToTop());
    }, 300);
  }

  private scrollListToTop() {
    const el = this.listElRef?.nativeElement;
    if (el) el.scrollTop = 0;
  }

  onListScroll(event: Event) {
    if (!this.hasMore || this.loadingMore) return;
    const el = event.target as HTMLElement;
    const remaining = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (remaining > this.lazyLoadThreshold) return;
    const now = Date.now();
    if (now - this.lastLoadMoreEmit < 400) return;
    this.lastLoadMoreEmit = now;
    this.loadMore.emit();
  }

  selectItem(item: DropdownItem, event?: MouseEvent) {
    event?.preventDefault();
    event?.stopPropagation();
    if (item.disabled) return;
    if (this.multiple) {
      const cur = this.selectedValuesArray();
      const idx = cur.findIndex((v) => this.valuesEqual(v, item.value));
      const next = idx >= 0 ? cur.filter((_, i) => i !== idx) : [...cur, item.value];
      this._selectedValue = next;
      this.selectionChange.emit(item);
      this.onChange(next);
      this.onTouched();
      if (this.effectiveCloseOnSelect) this.close();
    } else {
      this._selectedValue = item.value;
      this.selectionChange.emit(item);
      this.onChange(item.value);
      this.onTouched();
      if (this.effectiveCloseOnSelect) this.close();
    }
  }

  get enabledIndicesInView(): number[] {
    const vis = this.visibleItems;
    const out: number[] = [];
    vis.forEach((item, i) => {
      if (!item.disabled) out.push(i);
    });
    return out;
  }

  moveFocus(delta: 1 | -1) {
    const enabled = this.enabledIndicesInView;
    if (enabled.length === 0) {
      this.focusedListIndex = -1;
      return;
    }
    let idx = enabled.indexOf(this.focusedListIndex);
    if (idx < 0) {
      this.focusedListIndex = delta > 0 ? enabled[0]! : enabled[enabled.length - 1]!;
      return;
    }
    const next = idx + delta;
    if (next < 0) this.focusedListIndex = enabled[enabled.length - 1]!;
    else if (next >= enabled.length) this.focusedListIndex = enabled[0]!;
    else this.focusedListIndex = enabled[next]!;
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent) {
    if (!this.isOpen) return;
    const target = event.target as Node;
    if (this.elementRef.nativeElement.contains(target)) return;
    this.close();
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (!this.isOpen) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      this.close();
      return;
    }

    const tag = (event.target as HTMLElement)?.tagName;
    if (tag === 'INPUT' && event.key !== 'ArrowDown' && event.key !== 'ArrowUp') {
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.moveFocus(1);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.moveFocus(-1);
      return;
    }

    if (event.key === 'Enter' && this.focusedListIndex >= 0) {
      const item = this.visibleItems[this.focusedListIndex];
      if (item && !item.disabled) {
        event.preventDefault();
        this.selectItem(item);
      }
      return;
    }

    if (
      this.multiple &&
      event.key === ' ' &&
      tag !== 'INPUT' &&
      this.focusedListIndex >= 0
    ) {
      const item = this.visibleItems[this.focusedListIndex];
      if (item && !item.disabled) {
        event.preventDefault();
        this.selectItem(item);
      }
    }
  }

  isItemFocused(i: number): boolean {
    return this.focusedListIndex === i;
  }

  onItemMouseEnter(index: number) {
    const item = this.visibleItems[index];
    if (item && !item.disabled) this.focusedListIndex = index;
  }
}
