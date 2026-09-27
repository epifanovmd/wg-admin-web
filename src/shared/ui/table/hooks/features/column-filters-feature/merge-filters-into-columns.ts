import type { ColumnDef } from "@tanstack/react-table";

import type { ColumnFilterConfig } from "../../../table.types";
import { getColumnDefId } from "../column-id";

export const mergeFiltersIntoColumns = <TData>(
  columns: ColumnDef<TData, any>[],
  filters: Record<string, ColumnFilterConfig | undefined>,
): ColumnDef<TData, any>[] =>
  columns.map(column => {
    const id = getColumnDefId(column);
    const filter = id ? filters[id] : undefined;

    return filter ? { ...column, meta: { ...column.meta, filter } } : column;
  });
