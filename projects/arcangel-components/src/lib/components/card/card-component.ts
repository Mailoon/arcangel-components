import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  ChangeDetectionStrategy,
  computed,
} from '@angular/core';
import type {
  TableHeader,
  TableAction,
  TableActionEvent,
  TablePaginationMode,
  TablePaginationLabels,
  TablePaginationChangeEvent,
} from '../table/types';
import { PaginatorComponent } from '../paginator/paginator.component';
import { computeDisplayItems, resolveTotalCount, totalPages } from '../paginator/pagination-helpers';
import { getCompactActionButtonClasses, COMPACT_ACTION_DISABLED_CLASSES } from '../../shared/arc-control-styles';

@Component({
  selector: 'card-component',
  standalone: true,
  imports: [CommonModule, PaginatorComponent],
  templateUrl: './card-component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent {
  @Input() headers: TableHeader[] = [];
  @Input() items: Record<string, unknown>[] = [];
  @Input() actions: TableAction[] = [];
  @Input() actionsPosition: 'start' | 'end' = 'end';
  @Input() emptyMessage = 'No hay datos';
  @Input() customClass = '';

  @Input() showPagination = false;
  @Input() paginationMode: TablePaginationMode = 'client';
  @Input() pageIndex = 0;
  @Input() pageSize = 10;
  @Input() pageSizeOptions: number[] = [5, 10, 25, 50];
  @Input() totalCount?: number;
  @Input() paginationLabels?: TablePaginationLabels;

  @Output() actionClicked = new EventEmitter<TableActionEvent>();
  @Output() paginationChange = new EventEmitter<TablePaginationChangeEvent>();

  readonly visibleHeaders = computed(() =>
    this.headers.filter((h) => !h.hiddenOnCard)
  );

  readonly hasActions = computed(() => (this.actions ?? []).length > 0);

  get resolvedTotalCount(): number {
    if (!this.showPagination) return this.items.length;
    return resolveTotalCount(this.paginationMode, this.items.length, this.totalCount);
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

  getCellValue(item: Record<string, unknown>, key: string): unknown {
    return item[key];
  }

  isActionDisabled(action: TableAction, item: unknown): boolean {
    return action.disabled?.(item) ?? false;
  }

  onActionClick(actionId: string, item: unknown, index: number) {
    const action = this.actions.find((a) => a.id === actionId);
    if (action?.disabled?.(item)) return;
    this.actionClicked.emit({ actionId, item, index });
  }

  readonly actionBtnDisabledClasses = COMPACT_ACTION_DISABLED_CLASSES;

  getActionButtonClasses(variant?: string): string {
    return getCompactActionButtonClasses(variant);
  }
}
