import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  TemplateRef,
  ElementRef,
  inject,
  signal,
  ChangeDetectionStrategy,
  computed,
} from '@angular/core';
import { ButtonComponent } from '../button';
import { placementToPositionClasses, resolveAutoDropdownPlacement } from '../../shared/dropdown-placement.utils';
import {
  getOverlayContainerClasses,
  getOverlayPanelClasses,
  getOverlayItemClasses,
  OVERLAY_DIVIDER_CLASSES,
  OVERLAY_ITEM_LABEL_CLASSES,
  getChevronClasses,
  CHEVRON_PLACEHOLDER_CLASSES,
} from '../../shared/overlay-styles';
import { ArcControlBase } from '../../shared/arc-control.base';

export type DropdownVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger'
  | 'warning'
  | 'success';
export type DropdownSize = 'sm' | 'md' | 'lg';
export type DropdownShape = 'rounded' | 'pill' | 'square';
export type DropdownPlacement =
  | 'bottom-start'
  | 'bottom-end'
  | 'top-start'
  | 'top-end';

export interface DropdownItem {
  label: string;
  value?: unknown;
  disabled?: boolean;
  iconClass?: string;
  iconContent?: string; // Para fuentes de iconos como Material Icons (ej: "home")
  divided?: boolean;
}

@Component({
  selector: 'dropdown-component',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './dropdown-component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DropdownComponent extends ArcControlBase implements OnChanges {
  private readonly elementRef = inject(ElementRef);

  // === INPUT: Basic ===
  @Input() label = '';
  @Input() placeholder = 'Seleccionar...';
  @Input() items: DropdownItem[] = [];
  @Input() square = false;

  // === INPUT: Comportamiento ===
  @Input() closeOnSelect = true;
  @Input() placement: DropdownPlacement = 'bottom-start';
  /** Si es true, al abrir se recalcula la posición (arriba/abajo e inicio/fin) según espacio visible en viewport. */
  @Input() autoFlipPlacement = false;
  /** Oculta el chevron del botón (útil en selects compactos dentro de otro panel). */
  @Input() hideChevron = false;

  // === INPUT: Modelo ===
  @Input() selectedValue: unknown = null;
  @Input() selectedLabel = '';

  // === INPUT: Plantillas ===
  @Input() itemTemplate?: TemplateRef<{ $implicit: DropdownItem }>;

  // === OUTPUT ===
  @Output() itemSelected = new EventEmitter<DropdownItem>();
  @Output() opened = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  // === STATE ===
  readonly isOpen = signal(false);
  readonly focusedIndex = signal(-1);
  /** Colocación efectiva tras auto-flip; null = usar `placement`. */
  private readonly resolvedFlip = signal<DropdownPlacement | null>(null);

  readonly displayLabel = computed(() => {
    if (this.selectedLabel) return this.selectedLabel;
    const sel = this.items.find((i) => i.value === this.selectedValue);
    return sel?.label ?? (this.label || this.placeholder);
  });

  readonly placementClasses = computed(() =>
    placementToPositionClasses(this.resolvedFlip() ?? this.placement)
  );

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['placement'] && !changes['placement'].firstChange) {
      this.resolvedFlip.set(null);
    }
  }

  readonly enabledItems = computed(() =>
    this.items.filter((i) => !i.disabled)
  );

  // === COMPUTED: CSS Classes ===
  readonly containerClasses = computed(() =>
    getOverlayContainerClasses(this.fullWidth, this.isOpen())
  );
  readonly panelBaseClasses = getOverlayPanelClasses();
  readonly dividerClasses = OVERLAY_DIVIDER_CLASSES;
  readonly itemLabelClasses = OVERLAY_ITEM_LABEL_CLASSES;
  readonly chevronPlaceholderClasses = CHEVRON_PLACEHOLDER_CLASSES;
  readonly chevronClasses = computed(() => getChevronClasses(this.isOpen()));

  getItemClasses(item: DropdownItem): string {
    return getOverlayItemClasses({
      disabled: item.disabled,
      focused: this.isItemFocused(item),
      divided: item.divided,
    });
  }

  handleTriggerClick(event: MouseEvent) {
    if (this.disabled) return;
    // Solo actuar si el click fue en el trigger (no propagado desde items del panel)
    const target = event.target as Node;
    if (this.elementRef.nativeElement.querySelector('[data-arc-panel]')?.contains(target)) {
      return;
    }
    this.toggle();
  }

  toggle() {
    const next = !this.isOpen();
    this.isOpen.set(next);
    this.focusedIndex.set(-1);
    if (next) {
      this.resolvedFlip.set(null);
      this.opened.emit();
      if (this.autoFlipPlacement) {
        queueMicrotask(() => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => this.applyAutoFlipPlacement());
          });
        });
      }
    } else {
      this.resolvedFlip.set(null);
      this.closed.emit();
    }
  }

  close() {
    if (this.isOpen()) {
      this.isOpen.set(false);
      this.focusedIndex.set(-1);
      this.resolvedFlip.set(null);
      this.closed.emit();
    }
  }

  private applyAutoFlipPlacement(): void {
    if (!this.isOpen() || !this.autoFlipPlacement) return;
    const host = this.elementRef.nativeElement as HTMLElement;
    const panel = host.querySelector('[data-arc-panel]') as HTMLElement | null;
    if (!panel) return;
    const tr = host.getBoundingClientRect();
    const pr = panel.getBoundingClientRect();
    const next = resolveAutoDropdownPlacement(
      tr,
      pr,
      pr.width || 200,
      pr.height || Math.min(256, this.items.length * 40 + 16),
      window.innerWidth,
      window.innerHeight,
      this.placement
    );
    this.resolvedFlip.set(next);
  }

  handleItemClick(item: DropdownItem, event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (item.disabled) return;
    this.itemSelected.emit(item);
    if (this.closeOnSelect) this.close();
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent) {
    if (!this.isOpen()) return;
    const target = event.target as Node;
    if (this.elementRef.nativeElement.contains(target)) return;
    this.close();
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    if (this.isOpen() && this.autoFlipPlacement) {
      this.applyAutoFlipPlacement();
    }
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (!this.isOpen()) return;
    const enabled = this.enabledItems();

    if (event.key === 'Escape') {
      event.preventDefault();
      this.close();
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      const idx = this.focusedIndex();
      const next = idx < enabled.length - 1 ? idx + 1 : 0;
      this.focusedIndex.set(next);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      const idx = this.focusedIndex();
      const next = idx <= 0 ? enabled.length - 1 : idx - 1;
      this.focusedIndex.set(next);
      return;
    }

    if (event.key === 'Enter' && this.focusedIndex() >= 0) {
      event.preventDefault();
      const item = enabled[this.focusedIndex()];
      if (item) {
        this.itemSelected.emit(item);
        if (this.closeOnSelect) this.close();
      }
      return;
    }
  }

  isItemFocused(item: DropdownItem): boolean {
    const idx = this.focusedIndex();
    if (idx < 0) return false;
    const enabled = this.enabledItems();
    return enabled[idx] === item;
  }
}
