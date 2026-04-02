import type { TablePaginationMode } from '../table/types';

export function resolveTotalCount(
  mode: TablePaginationMode,
  itemsLength: number,
  totalCount?: number
): number {
  if (mode === 'client') return itemsLength;
  return totalCount ?? itemsLength;
}

export function computeDisplayItems(
  items: Record<string, unknown>[],
  mode: TablePaginationMode,
  pageIndex: number,
  pageSize: number
): Record<string, unknown>[] {
  if (mode === 'server') return items;
  const start = pageIndex * pageSize;
  return items.slice(start, start + pageSize);
}

export function totalPages(totalCount: number, pageSize: number): number {
  if (pageSize <= 0) return 0;
  if (totalCount === 0) return 1;
  return Math.ceil(totalCount / pageSize);
}

/**
 * Índices de página 0-based y marcadores 'ellipsis'.
 * Si `compactThreshold >= 0` y `pageCount <= compactThreshold`, muestra todas las páginas.
 * Con `compactThreshold < 0` nunca usa ese atajo (útil si el padre ya decidió compacto vs completo).
 * Si no, solo muestra: primera, ventana ±delta alrededor de la actual, y última — con "..." entre saltos.
 */
export function buildPageButtonList(
  pageCount: number,
  pageIndex: number,
  delta = 1,
  compactThreshold = 5
): Array<number | 'ellipsis'> {
  if (pageCount <= 0) return [];
  if (compactThreshold >= 0 && pageCount <= compactThreshold) {
    return Array.from({ length: pageCount }, (_, i) => i);
  }

  const last = pageCount - 1;
  const set = new Set<number>();
  set.add(0);
  set.add(last);
  for (let i = pageIndex - delta; i <= pageIndex + delta; i++) {
    if (i >= 0 && i <= last) set.add(i);
  }

  const sorted = [...set].sort((a, b) => a - b);
  const out: Array<number | 'ellipsis'> = [];
  let prev = -2;
  for (const p of sorted) {
    if (prev >= 0 && p - prev > 1) {
      out.push('ellipsis');
    }
    out.push(p);
    prev = p;
  }
  return out;
}
