import { cn } from "@shared/lib/utils";
import * as React from "react";

import { TableCell, TableRow } from "./primitives";

export interface TableStatusRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  colSpan: number;
  cellClassName?: string;
}

/** Служебная строка на всю ширину: загрузка, пусто, ошибка, sentinel подгрузки. */
const TableStatusRow = React.forwardRef<
  HTMLTableRowElement,
  TableStatusRowProps
>(({ colSpan, cellClassName, className, children, ...props }, ref) => (
  <TableRow
    ref={ref}
    className={cn("hover:bg-transparent", className)}
    {...props}
  >
    <TableCell colSpan={colSpan} className={cn("p-0", cellClassName)}>
      {children}
    </TableCell>
  </TableRow>
));

TableStatusRow.displayName = "TableStatusRow";

export { TableStatusRow };
