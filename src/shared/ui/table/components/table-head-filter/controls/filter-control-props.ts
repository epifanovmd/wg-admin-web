import type { Column } from "@tanstack/react-table";

/** Контролам нужны только методы фильтра — они не зависят от `TData`. */
export type FilterColumn = Pick<
  Column<unknown, unknown>,
  "getFilterValue" | "setFilterValue" | "getFacetedUniqueValues"
>;

export interface FilterControlProps<TConfig> {
  config: TConfig;
  column: FilterColumn;
}
