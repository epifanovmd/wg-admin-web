import type * as React from "react";

/** Клик по элементу в ячейке не доходит до строки (`onRowClick` таблицы). */
export const stopRowClick = (event: React.SyntheticEvent) =>
  event.stopPropagation();
