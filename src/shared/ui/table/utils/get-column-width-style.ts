import type { Column } from "@tanstack/react-table";
import type { CSSProperties } from "react";

/**
 * Фиксированная ширина колонки: при resize — текущий размер из состояния,
 * иначе — только явно заданный `size` из определения колонки.
 */
export const getColumnWidthStyle = <TData, TValue>(
  column: Column<TData, TValue>,
  resizable: boolean | undefined,
): CSSProperties | undefined => {
  const width = resizable ? column.getSize() : column.columnDef.size;

  if (width == null) return undefined;

  return { width, minWidth: width, maxWidth: width };
};
