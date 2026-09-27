import { cn } from "@shared/lib/utils";
import * as React from "react";

import { stopRowClick } from "../utils/stop-row-click";

export type TableRowActionsProps = React.HTMLAttributes<HTMLDivElement>;

/**
 * Действия в ячейке строки: кнопки справа в ряд. Клик по ним не доходит до
 * строки — `onRowClick` таблицы не срабатывает.
 */
export const TableRowActions = ({
  className,
  onClick,
  ...props
}: TableRowActionsProps) => (
  <div
    className={cn("flex items-center justify-end gap-1", className)}
    onClick={event => {
      stopRowClick(event);
      onClick?.(event);
    }}
    {...props}
  />
);
