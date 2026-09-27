import type { ColumnDef, ColumnFiltersState } from "@tanstack/react-table";

import type { ColumnFilterConfig } from "../../../table.types";
import { getColumnDefId } from "../column-id";

const getQueryKey = (column: ColumnDef<any, any>): string | undefined => {
  const filter = column.meta?.filter as ColumnFilterConfig | undefined;

  return filter?.queryKey ?? getColumnDefId(column);
};

export const toColumnFiltersState = <T>(
  columns: ColumnDef<any, any>[],
  map: Partial<T> | undefined,
): ColumnFiltersState => {
  if (!map) return [];

  const state: ColumnFiltersState = [];

  for (const column of columns) {
    const id = getColumnDefId(column);
    const queryKey = getQueryKey(column);

    if (!id || !queryKey) continue;

    const value = (map as Record<string, unknown>)[queryKey];

    if (value !== undefined && value !== null) state.push({ id, value });
  }

  return state;
};

export const toFilterMap = <T>(
  columns: ColumnDef<any, any>[],
  filters: ColumnFiltersState,
): Partial<T> => {
  const map: Record<string, unknown> = {};

  for (const filter of filters) {
    if (filter.value === undefined) continue;

    const column = columns.find(c => getColumnDefId(c) === filter.id);
    const queryKey = (column && getQueryKey(column)) ?? filter.id;

    map[queryKey] = filter.value;
  }

  return map as Partial<T>;
};
