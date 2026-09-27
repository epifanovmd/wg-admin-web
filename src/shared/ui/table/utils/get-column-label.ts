import type { Column } from "@tanstack/react-table";

/** Имя колонки для aria-label и списка видимости: `meta.label` → строковый `header` → `id`. */
export const getColumnLabel = <TData, TValue>(
  column: Column<TData, TValue>,
): string => {
  const { header, meta } = column.columnDef;

  if (meta?.label) return meta.label;
  if (typeof header === "string") return header;

  return column.id;
};
