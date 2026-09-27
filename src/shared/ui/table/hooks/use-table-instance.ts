import {
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo } from "react";

import { buildExpandColumn, buildSelectionColumn } from "../columns";
import { TABLE_LABELS, type TableLabels } from "../constants";
import type { TableInstanceResult, TableProps } from "../table.types";
import { mergeTableFeatures } from "./features";

export interface UseTableInstanceOptions<TData> extends Pick<
  TableProps<TData>,
  "data" | "columns" | "features" | "size" | "getRowId" | "tableOptions"
> {
  labels?: TableLabels;
}

const NO_FEATURES: never[] = [];

export const useTableInstance = <TData>(
  props: UseTableInstanceOptions<TData>,
): TableInstanceResult<TData> => {
  const {
    data,
    columns,
    features = NO_FEATURES,
    size,
    getRowId,
    tableOptions,
    labels = TABLE_LABELS,
  } = props;

  const merged = useMemo(() => mergeTableFeatures(features), [features]);
  const { byKind } = merged;

  const selectionEnabled = !!byKind.rowSelection?.options.onRowSelectionChange;
  const multiSelect = byKind.rowSelection?.meta.mode === "multi";
  const expandingEnabled = !!byKind.expanding?.options.getExpandedRowModel;
  const resizingEnabled = !!byKind.columnSizing?.options.onColumnSizingChange;
  const pinningEnabled = !!byKind.columnPinning?.options.onColumnPinningChange;
  const sortingEnabled = !!byKind.sorting?.options.onSortingChange;
  const filteringEnabled =
    !!byKind.columnFilters?.options.onColumnFiltersChange ||
    !!byKind.globalFilter?.options.onGlobalFilterChange;
  const groupingEnabled = !!merged.options.getGroupedRowModel;
  const paginationEnabled = !!byKind.pagination?.options.onPaginationChange;
  const renderSubComponent = byKind.expanding?.meta.renderSubComponent;
  const infiniteScroll = byKind.infiniteScroll?.meta;

  const checkboxSize = size === "lg" ? "md" : "sm";

  const effectiveColumns = useMemo(() => {
    const cols = [...columns];

    if (expandingEnabled) cols.unshift(buildExpandColumn<TData>({ labels }));
    if (selectionEnabled) {
      cols.unshift(
        buildSelectionColumn<TData>({
          checkboxSize,
          multi: multiSelect,
          labels,
        }),
      );
    }

    return cols;
  }, [
    columns,
    expandingEnabled,
    selectionEnabled,
    multiSelect,
    checkboxSize,
    labels,
  ]);

  const { state: extraState, ...restTableOptions } = tableOptions ?? {};

  const table = useReactTable<TData>({
    data,
    columns: effectiveColumns,
    getRowId,
    getCoreRowModel: getCoreRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    ...merged.options,
    state: { ...merged.state, ...extraState },
    ...restTableOptions,
  });

  const rows = table.getRowModel().rows;
  const totalColumns = table.getVisibleLeafColumns().length;
  const hasFooter = table
    .getFooterGroups()
    .some(fg => fg.headers.some(h => h.column.columnDef.footer));

  return {
    table,
    rows,
    totalColumns,
    hasFooter,
    sortingEnabled,
    filteringEnabled,
    paginationEnabled,
    resizingEnabled,
    pinningEnabled,
    groupingEnabled,
    selectionEnabled,
    renderSubComponent,
    pageSizeOptions: byKind.pagination?.meta.pageSizeOptions,
    infiniteScroll,
  };
};
