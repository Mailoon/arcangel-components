import { TemplateRef } from '@angular/core';

export interface TableHeader {
  key: string;
  label: string;
  hiddenOnCard?: boolean;
  sortable?: boolean;
}

export interface TableAction {
  id: string;
  label?: string;
  iconClass?: string;
  iconContent?: string;
  iconTemplate?: TemplateRef<unknown>;
  position?: 'start' | 'end';
  disabled?: (item: unknown) => boolean;
  tooltip?: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
}

export interface TableActionEvent {
  actionId: string;
  item: unknown;
  index: number;
}

export type TablePaginationMode = 'client' | 'server';

export type { PaginatorLabels as TablePaginationLabels, PaginatorChangeEvent as TablePaginationChangeEvent } from '../paginator/paginator.types';
