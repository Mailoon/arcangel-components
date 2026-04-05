import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CardComponent } from '../card';
import { PaginatorComponent } from '../paginator/paginator.component';
import { computeDisplayItems, resolveTotalCount, totalPages } from '../paginator/pagination-helpers';
import { TableComponent } from '../table';
import type {
  TableHeader,
  TableAction,
  TableActionEvent,
  TablePaginationMode,
  TablePaginationLabels,
  TablePaginationChangeEvent,
} from '../table/types';

@Component({
  selector: 'table-responsive-component',
  standalone: true,
  imports: [CommonModule, TableComponent, CardComponent, PaginatorComponent],
  templateUrl: './table-responsive-component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableResponsiveComponent {
  @Input() headers: TableHeader[] = [];
  @Input() items: Record<string, unknown>[] = [];
  @Input() actions: TableAction[] = [];
  @Input() actionsPosition: 'start' | 'end' = 'end';
  @Input() emptyMessage = 'No hay datos';
  @Input() striped = false;
  @Input() customClass = '';
  @Input() breakpoint: 'sm' | 'md' | 'lg' = 'md';

  @Input() showPagination = false;
  @Input() paginationMode: TablePaginationMode = 'client';
  @Input() pageIndex = 0;
  @Input() pageSize = 10;
  @Input() pageSizeOptions: number[] = [5, 10, 25, 50];
  @Input() totalCount?: number;
  @Input() paginationLabels?: TablePaginationLabels;

  @Output() actionClicked = new EventEmitter<TableActionEvent>();
  @Output() paginationChange = new EventEmitter<TablePaginationChangeEvent>();

  get resolvedTotalCount(): number {
    if (!this.showPagination) return this.items.length;
    return resolveTotalCount(this.paginationMode, this.items.length, this.totalCount);
  }

  /** Clases de visibilidad para la vista tabla (desktop) según breakpoint. */
  get desktopViewClasses(): string {
    const map: Record<'sm' | 'md' | 'lg', string> = {
      sm: 'hidden sm:block',
      md: 'hidden md:block',
      lg: 'hidden lg:block',
    };
    return map[this.breakpoint];
  }

  /** Clases de visibilidad para la vista card (mobile) según breakpoint. */
  get mobileViewClasses(): string {
    const map: Record<'sm' | 'md' | 'lg', string> = {
      sm: 'block sm:hidden',
      md: 'block md:hidden',
      lg: 'block lg:hidden',
    };
    return map[this.breakpoint];
  }

  get effectivePageIndex(): number {
    if (!this.showPagination) return 0;
    const tc = this.resolvedTotalCount;
    const tp = totalPages(tc, this.pageSize);
    if (tp <= 0) return 0;
    return Math.min(Math.max(0, this.pageIndex), tp - 1);
  }

  get displayItems(): Record<string, unknown>[] {
    if (!this.showPagination) return this.items;
    return computeDisplayItems(
      this.items,
      this.paginationMode,
      this.effectivePageIndex,
      this.pageSize
    );
  }
}
