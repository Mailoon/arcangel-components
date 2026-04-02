export interface PaginatorLabels {
  showing?: string;
  of?: string;
  records?: string;
  noRecords?: string;
  perPage?: string;
}

export interface PaginatorChangeEvent {
  pageIndex: number;
  pageSize: number;
}
