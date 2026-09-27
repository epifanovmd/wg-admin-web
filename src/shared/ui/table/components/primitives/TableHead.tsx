import { cn } from "@shared/lib/utils";
import * as React from "react";

import { TableContext } from "../table-context";
import { tableHeadVariants } from "../table-variants";

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => {
  const { size } = React.useContext(TableContext);

  return (
    <th
      ref={ref}
      className={cn(tableHeadVariants({ size }), className)}
      {...props}
    />
  );
});

TableHead.displayName = "TableHead";

export { TableHead };
