import type { Row, TableOptions, TableState } from "@tanstack/react-table";
import type { ReactNode } from "react";

export type TableFeatureKind =
  | "sorting"
  | "columnFilters"
  | "globalFilter"
  | "rowSelection"
  | "pagination"
  | "infiniteScroll"
  | "columnVisibility"
  | "columnOrder"
  | "columnPinning"
  | "columnSizing"
  | "expanding"
  | "grouping";

export type TableFeatureOptions<TData> = Partial<
  Omit<TableOptions<TData>, "data" | "columns" | "state">
>;

export interface TableFeatureBase<TData, K extends TableFeatureKind> {
  kind: K;
  state: Partial<TableState>;
  options: TableFeatureOptions<TData>;
}

export type RowSelectionMode = "single" | "multi";

export interface RowSelectionFeatureMeta {
  mode: RowSelectionMode;
}

export interface ExpandingFeatureMeta<TData> {
  renderSubComponent?: (props: { row: Row<TData> }) => ReactNode;
}

export interface PaginationFeatureMeta {
  pageSizeOptions: readonly number[];
}

export interface InfiniteScrollFeatureMeta {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
  rootMargin?: string;
}

/** Результат `use*Feature`: дискриминируется по `kind`, `meta` типизирована по виду. */
export type TableFeatureResult<TData = unknown> =
  | TableFeatureBase<TData, "sorting">
  | TableFeatureBase<TData, "columnFilters">
  | TableFeatureBase<TData, "globalFilter">
  | TableFeatureBase<TData, "columnVisibility">
  | TableFeatureBase<TData, "columnOrder">
  | TableFeatureBase<TData, "columnPinning">
  | TableFeatureBase<TData, "columnSizing">
  | TableFeatureBase<TData, "grouping">
  | (TableFeatureBase<TData, "rowSelection"> & {
      meta: RowSelectionFeatureMeta;
    })
  | (TableFeatureBase<TData, "expanding"> & {
      meta: ExpandingFeatureMeta<TData>;
    })
  | (TableFeatureBase<TData, "pagination"> & { meta: PaginationFeatureMeta })
  | (TableFeatureBase<TData, "infiniteScroll"> & {
      meta: InfiniteScrollFeatureMeta;
    });

export type TableFeatureOf<TData, K extends TableFeatureKind> = Extract<
  TableFeatureResult<TData>,
  { kind: K }
>;
