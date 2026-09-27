import { cn } from "@shared/lib/utils";
import * as React from "react";

import { TableContext } from "../table-context";
import { tableCellVariants } from "../table-variants";

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => {
  const { size } = React.useContext(TableContext);

  return (
    <td
      ref={ref}
      className={cn(tableCellVariants({ size }), className)}
      {...props}
    />
  );
});

TableCell.displayName = "TableCell";

export { TableCell };
