export * from './types';
export {
  resolveTotalCount,
  computeDisplayItems,
  totalPages,
  buildPageButtonList,
} from '../paginator/pagination-helpers';
export * from './table-component';
/** @deprecated Usa `PaginatorComponent` desde `@arcange/components/paginator`. */
export { PaginatorComponent as TablePaginationBarComponent } from '../paginator/paginator.component';
