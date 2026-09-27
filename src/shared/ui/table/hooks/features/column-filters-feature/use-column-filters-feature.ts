import { useControllableState } from "@shared/lib/hooks";
import {
  type ColumnDef,
  type ColumnFiltersState,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { useCallback, useMemo, useState } from "react";

import type { ColumnFilterConfig } from "../../../table.types";
import type { TableFeatureOf } from "../types";
import type { TableFiltersConfig } from "./filter-config.types";
import { toColumnFiltersState, toFilterMap } from "./filter-state";
import { mergeFiltersIntoColumns } from "./merge-filters-into-columns";

export interface ColumnFiltersFeatureOptions<TData, TFilter> {
  enabled?: boolean;
  columns: ColumnDef<TData, any>[];
  filters?: TableFiltersConfig<TData, TFilter>;
  columnFilters?: Partial<TFilter>;
  defaultColumnFilters?: Partial<TFilter>;
  onColumnFiltersChange?: (state: Partial<TFilter>) => void;
  manualFiltering?: boolean;
}

export interface ColumnFiltersFeatureResult<TData> {
  /** Колонки с вшитыми `meta.filter` — передавать в `Table` вместо исходных. */
  columns: ColumnDef<TData, any>[];
  feature: TableFeatureOf<TData, "columnFilters">;
}

export const useColumnFiltersFeature = <
  TData,
  TFilter = Record<string, unknown>,
>(
  options: ColumnFiltersFeatureOptions<TData, TFilter>,
): ColumnFiltersFeatureResult<TData> => {
  const {
    enabled = true,
    columns,
    filters,
    columnFilters,
    defaultColumnFilters,
    onColumnFiltersChange,
    manualFiltering,
  } = options;

  const filteredColumns = useMemo(
    () =>
      filters
        ? mergeFiltersIntoColumns<TData>(
            columns,
            filters as Record<string, ColumnFilterConfig | undefined>,
          )
        : columns,
    [columns, filters],
  );

  const [defaultValue] = useState(() =>
    toColumnFiltersState(filteredColumns, defaultColumnFilters),
  );

  const controlledValue = useMemo(
    () =>
      columnFilters !== undefined
        ? toColumnFiltersState(filteredColumns, columnFilters)
        : undefined,
    [filteredColumns, columnFilters],
  );

  const handleChange = useCallback(
    (next: ColumnFiltersState) =>
      onColumnFiltersChange?.(toFilterMap<TFilter>(filteredColumns, next)),
    [filteredColumns, onColumnFiltersChange],
  );

  const [state, setState] = useControllableState<ColumnFiltersState>({
    value: controlledValue,
    defaultValue,
    onChange: handleChange,
  });

  const feature = useMemo<TableFeatureOf<TData, "columnFilters">>(
    () => ({
      kind: "columnFilters",
      state: { columnFilters: state },
      options: {
        enableColumnFilters: enabled,
        onColumnFiltersChange: enabled ? setState : undefined,
        manualFiltering,
        getFilteredRowModel:
          enabled && !manualFiltering
            ? getFilteredRowModel<TData>()
            : undefined,
      },
    }),
    [state, setState, enabled, manualFiltering],
  );

  return useMemo(
    () => ({ columns: filteredColumns, feature }),
    [filteredColumns, feature],
  );
};
