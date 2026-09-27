import type { Column } from "@tanstack/react-table";

import type { TableColumnAlign } from "../table.types";

export interface ColumnAlignClasses {
  /** Выравнивание текста в `<td>`. */
  cell: string;
  /** Выравнивание флекс-содержимого заголовка (текст + иконки фильтра/группы). */
  header: string;
}

const ALIGN_CLASSES: Record<TableColumnAlign, ColumnAlignClasses> = {
  left: { cell: "text-left", header: "justify-start" },
  center: { cell: "text-center", header: "justify-center" },
  right: { cell: "text-right", header: "justify-end" },
};

export const getColumnAlign = <TData>(
  column: Column<TData, unknown>,
): ColumnAlignClasses => ALIGN_CLASSES[column.columnDef.meta?.align ?? "left"];
