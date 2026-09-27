import type { ReactNode } from "react";

export interface ColumnFilterOption<T = string> {
  value: T;
  label: ReactNode;
}

export interface BaseFilterConfig {
  /** Ключ в объекте фильтров (`onColumnFiltersChange`); по умолчанию — id колонки. */
  queryKey?: string;
  placeholder?: string;
}
