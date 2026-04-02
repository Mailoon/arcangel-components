import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  effect,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  Output,
  viewChild,
} from '@angular/core';
import type { DropdownItem } from '../dropdown/dropdown-component';
import { SearchableSelectComponent } from '../searchable-select/searchable-select.component';
import { buildPageButtonList, totalPages as calcTotalPages } from './pagination-helpers';
import type { PaginatorChangeEvent, PaginatorLabels } from './paginator.types';

/** Ancho aproximado de cada botón numérico + gap (px), alineado con CSS del paginador. */
const SLOT_PX = 34;
/** Espacio reservado para &lt; &gt; y separación. */
const NAV_ARROWS_RESERVE_PX = 96;
/** Slots asumidos antes de la primera medición (evita parpadeo agresivo). */
const DEFAULT_SLOT_BUDGET = 8;

@Component({
  selector: 'paginator-component, table-pagination-bar',
  standalone: true,
  imports: [CommonModule, SearchableSelectComponent],
  templateUrl: './paginator.component.html',
  styleUrls: ['./paginator.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginatorComponent {
  private readonly cdr = inject(ChangeDetectorRef);

  readonly navWrapRef = viewChild<ElementRef<HTMLElement>>('navWrap');

  /** Ancho medido del contenedor de la fila de páginas (ResizeObserver). */
  private navMeasuredWidth = 0;

  @Input() totalCount = 0;
  @Input() pageIndex = 0;
  @Input() pageSize = 10;
  @Input() pageSizeOptions: number[] = [5, 10, 25, 50];
  @Input() labels?: PaginatorLabels;
  @Input() showPageSize = true;
  /**
   * Máximo de páginas vecinas a cada lado de la actual (±delta).
   * El valor real baja automáticamente si el hueco es estrecho; este input limita el techo.
   */
  @Input() siblingDelta = 4;

  @Output() paginationChange = new EventEmitter<PaginatorChangeEvent>();

  constructor() {
    effect((onCleanup) => {
      const el = this.navWrapRef()?.nativeElement;
      if (!el) {
        return;
      }

      const applyWidth = (w: number) => {
        if (Math.abs(w - this.navMeasuredWidth) < 0.5) return;
        this.navMeasuredWidth = w;
        this.cdr.markForCheck();
      };

      applyWidth(el.getBoundingClientRect().width);

      if (typeof ResizeObserver === 'undefined') {
        return;
      }

      const ro = new ResizeObserver((entries) => {
        const w = entries[0]?.contentRect.width ?? 0;
        applyWidth(w);
      });
      ro.observe(el);
      onCleanup(() => ro.disconnect());
    });
  }

  get pageCount(): number {
    return calcTotalPages(this.totalCount, this.pageSize);
  }

  get rangeStart(): number {
    if (this.totalCount === 0) return 0;
    return this.pageIndex * this.pageSize + 1;
  }

  get rangeEnd(): number {
    if (this.totalCount === 0) return 0;
    return Math.min((this.pageIndex + 1) * this.pageSize, this.totalCount);
  }

  /** Cuántos “huecos” de botón caben en la barra de navegación. */
  private slotBudget(): number {
    const w = this.navMeasuredWidth > 0 ? this.navMeasuredWidth : DEFAULT_SLOT_BUDGET * SLOT_PX + NAV_ARROWS_RESERVE_PX;
    const slots = Math.floor((w - NAV_ARROWS_RESERVE_PX) / SLOT_PX);
    return Math.max(4, slots);
  }

  /**
   * Delta efectivo según espacio: más ancho → más vecinos alrededor de la página actual.
   * Heurística: ~2 delta + 3 números base (1, última, ventana) + margen para elipsis.
   */
  private dynamicDeltaFromSlots(slots: number): number {
    const raw = Math.max(0, Math.floor((slots - 5) / 2));
    return Math.min(raw, Math.max(0, this.siblingDelta));
  }

  get pageButtons(): Array<number | 'ellipsis'> {
    const pc = this.pageCount;
    if (pc <= 0) return [];

    const slots = this.slotBudget();

    // Caben todos los números: sin elipsis
    if (pc <= slots) {
      return Array.from({ length: pc }, (_, i) => i);
    }

    const d = this.dynamicDeltaFromSlots(slots);
    return buildPageButtonList(pc, this.pageIndex, d, -1);
  }

  get canPrev(): boolean {
    return this.pageIndex > 0 && this.totalCount > 0;
  }

  get canNext(): boolean {
    const pc = this.pageCount;
    return pc > 0 && this.pageIndex < pc - 1;
  }

  private readonly defaultLabels = {
    showing: 'Mostrando',
    of: 'de',
    records: 'registros',
    noRecords: 'Sin registros',
    perPage: 'Elementos por página',
  };

  mergedLabels(): Required<PaginatorLabels> {
    const d = this.defaultLabels;
    const l = this.labels ?? {};
    return {
      showing: l.showing ?? d.showing,
      of: l.of ?? d.of,
      records: l.records ?? d.records,
      noRecords: l.noRecords ?? d.noRecords,
      perPage: l.perPage ?? d.perPage,
    };
  }

  get pageSizeItems(): DropdownItem[] {
    return this.pageSizeOptions.map((n) => ({ label: String(n), value: n }));
  }

  onPageSizeSelected(item: DropdownItem) {
    const nextSize = Number(item.value);
    if (!Number.isFinite(nextSize) || nextSize <= 0) return;
    this.paginationChange.emit({ pageIndex: 0, pageSize: nextSize });
  }

  goToPage(index: number) {
    const pc = this.pageCount;
    if (index < 0 || index >= pc) return;
    this.paginationChange.emit({ pageIndex: index, pageSize: this.pageSize });
  }

  prev() {
    if (!this.canPrev) return;
    this.paginationChange.emit({
      pageIndex: this.pageIndex - 1,
      pageSize: this.pageSize,
    });
  }

  next() {
    if (!this.canNext) return;
    this.paginationChange.emit({
      pageIndex: this.pageIndex + 1,
      pageSize: this.pageSize,
    });
  }

  displayPageOneBased(idx: number): number {
    return idx + 1;
  }
}
